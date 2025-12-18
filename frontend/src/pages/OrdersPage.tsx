import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Command } from "@tauri-apps/api/shell";
import { writeTextFile, createDir } from "@tauri-apps/api/fs";
import { join, documentDir } from "@tauri-apps/api/path";
import html2canvas from "html2canvas";
import { useQuery } from "../hooks/useQuery";
import { useShop } from "../context/ShopContext";
import { API_URL } from "../config/api";
import { printContent, generateOrdersHTML, saveAsPDF } from "../utils/exportUtils";
import { parsePaymentAmount } from "../utils/paymentUtils";
import InvoicePrint from "../components/InvoicePrint";
import BankPaymentModal, { BankPaymentData } from "../components/BankPaymentModal";

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  sold_price: number;
  total_price: number;
  color_id?: number;
  size_id?: number;
  color_name?: string;
  size_name?: string;
}

// Grouped order items with cost breakdowns
interface GroupedOrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  total_quantity: number;
  product_cost: number;
  print_cost: number;
  sewing_cost: number;
  extra_cost: number;
  total_product_cost: number;
  total_print_cost: number;
  total_sewing_cost: number;
  total_extra_cost: number;
  total_cost: number;
  total_sold: number;
  profit: number;
}

interface Order {
  order_id: number;
  order_number: string;
  customer_id: number | null;
  total_items: number;
  total_amount: number;
  final_amount: number;
  advance_paid: number;
  balance_due: number;
  payment_status: "unpaid" | "partial" | "fully_paid";
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  notes?: string | null;
  order_date: string;
  created_at?: string;
  updated_at?: string;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_phone1?: string;
  customer_mobile?: string;
  delivery_line1?: string;
  delivery_line2?: string;
  delivery_city?: string;
  delivery_district?: string;
  delivery_province?: string;
  delivery_postal_code?: string;
  tracking_number?: string | null;
  delivery_charge?: number;
  items?: OrderItem[];
}

// Province to Districts mapping for Sri Lanka
const PROVINCE_DISTRICTS: { [key: string]: string[] } = {
  "Western Province": ["Colombo", "Gampaha", "Kalutara"],
  "Central Province": ["Kandy", "Matara", "Nuwara Eliya"],
  "Southern Province": ["Matara", "Galle", "Hambantota"],
  "Eastern Province": ["Batticaloa", "Ampara", "Trincomalee"],
  "Northern Province": ["Jaffna", "Mullaitivu", "Vavuniya"],
  "North Western Province": ["Kurunegala", "Puttalam"],
  "North Central Province": ["Anuradhapura", "Polonnaruwa"],
  "Uva Province": ["Badulla", "Monaragala"],
  "Sabaragamuwa Province": ["Ratnapura", "Kegalle"],
};

// Utility function to print receipt with proper print dialog
const printReceipt = async (orderId: number) => {
  try {
    const receiptElement = document.getElementById(`receipt-${orderId}`);
    if (!receiptElement) {
      alert("Receipt not loaded. Please click 'Show Receipt' first.");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print receipt");
      return;
    }

    // Write the HTML content
    const receiptHTML = receiptElement.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt Print</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            * { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${receiptHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error("Error printing receipt:", error);
    alert("Failed to print receipt. Please try again.");
  }
};


// Utility function to export receipt as image
const exportReceiptAsImage = async (
  orderId: number,
  customerMobile: string,
  format: "png" | "jpg"
) => {
  try {
    const receiptElement = document.getElementById(`receipt-${orderId}`);
    if (!receiptElement) {
      alert("Receipt not loaded. Please click 'Show Receipt' first.");
      return;
    }

    // Dynamic import html2canvas
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(receiptElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `${customerMobile}_${orderId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(
      `Receipt saved as ${customerMobile}_${orderId}.${format}\nCheck your Downloads folder.`
    );
  } catch (error) {
    console.error("Error exporting receipt:", error);
    alert("Failed to export receipt. Please try again.");
  }
};

const OrdersPage: React.FC = () => {
  const { shopId } = useShop();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"advance" | "balance">(
    "balance"
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "bank"
  >("cash");
  const [bankPaymentData, setBankPaymentData] = useState<BankPaymentData | null>(null);
  const [showBankPaymentModal, setShowBankPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Receipt HTML state
  const [receiptHTML, setReceiptHTML] = useState<string>("");

  // Order items loading state
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [orderItems, setOrderItems] = useState<GroupedOrderItem[]>([]);

  // Order payments state - stores payment_method from payments table
  const [orderPayments, setOrderPayments] = useState<{ [orderId: number]: string }>({});

  // Delivery status update state
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Address details state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientPhone1, setRecipientPhone1] = useState("");
  const [deliveryLine1, setDeliveryLine1] = useState("");
  const [deliveryLine2, setDeliveryLine2] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");

  // Note editing state
  const [orderNote, setOrderNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState("");

  const {
    data: orders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<Order[]>(
    ["orders", selectedStatus, shopId],
    async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      const url = `${API_URL}/orders?shop_id=${shopId}&status=${selectedStatus}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Failed to fetch orders");
      }
    },
    { enabled: shopId !== null }
  );

  // Fetch payment methods for all orders from payments table
  // OPTIMIZATION: Commented out to prevent excessive API requests
  // This was making individual API calls for every order on page load
  // TODO: Move payment_method to main orders response or create bulk endpoint
  /*
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!orders || orders.length === 0) return;

      const paymentMap: { [orderId: number]: string } = {};

      for (const order of orders) {
        try {
          const response = await fetch(`${API_URL}/orders/${order.order_id}/payments`);
          const result = await response.json();

          if (result.success && result.data && result.data.length > 0) {
            // Get the payment method from the first payment (or combine if multiple)
            const paymentMethods = result.data.map((p: any) => p.payment_method);
            const uniqueMethods = [...new Set(paymentMethods)];
            paymentMap[order.order_id] = uniqueMethods.join(", ");
          } else {
            paymentMap[order.order_id] = "Not specified";
          }
        } catch (error) {
          console.error(`Error fetching payments for order ${order.order_id}:`, error);
          paymentMap[order.order_id] = "Error";
        }
      }

      setOrderPayments(paymentMap);
    };

    fetchPaymentMethods();
  }, [orders]);
  */

  // Extract payment methods from orders (now included in API response)
  useEffect(() => {
    if (orders && orders.length > 0) {
      const paymentMap: { [orderId: number]: string } = {};
      orders.forEach((order: any) => {
        // Handle null/undefined payment_method to prevent NaN
        const pm = order.payment_method;
        paymentMap[order.order_id] = (pm && pm !== 'null' && String(pm).trim()) || 'Not specified';
      });
      setOrderPayments(paymentMap);
    }
  }, [orders]);

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    let result = [...(orders || [])];

    // Search by customer ID, customer name, or order number
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          (order.recipient_name &&
            order.recipient_name.toLowerCase().includes(query)) ||
          (order.customer_id && order.customer_id.toString().includes(query)) ||
          order.order_number.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedStatus, searchQuery, orders]);

  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce(
    (sum, order) => sum + parseFloat(String(order.total_amount)),
    0
  );

  const selectedOrder = orders?.find(
    (order) => order.order_id === selectedOrderId
  );

  // Fetch order items when modal opens
  useEffect(() => {
    console.log("Selected Order:", selectedOrder);
    if (selectedOrderId && showOrderModal && !shopId) {
      return; // Don't fetch if no shopId
    }

    if (selectedOrderId && showOrderModal) {
      const fetchOrderItems = async () => {
        setIsLoadingItems(true);
        try {
          // Fetch GROUPED order items with cost breakdowns
          const response = await fetch(
            `${API_URL}/orders/${selectedOrderId}/items-grouped`
          );
          const result = await response.json();
          if (result.success && result.data) {
            setOrderItems(result.data);
          } else {
            setOrderItems([]);
          }
        } catch (error) {
          console.error("Error fetching grouped order items:", error);
          setOrderItems([]);
        } finally {
          setIsLoadingItems(false);
        }
      };
      fetchOrderItems();
    }
  }, [selectedOrderId, showOrderModal, shopId]);

  const printBill = async (order: Order) => {
    try {
      // Fetch complete order with ungrouped items
      const orderResponse = await fetch(`${API_URL}/orders/${order.order_id}?shop_id=${shopId}`);
      
      if (!orderResponse.ok) {
        alert("❌ Could not fetch order details. Cannot print bill.");
        return;
      }
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success || !orderResult.data) {
        alert("❌ Order not found. Cannot print bill.");
        return;
      }
      
      const fullOrder = orderResult.data;
      const printItems = fullOrder.items || [];
      
      if (printItems.length === 0) {
        alert("❌ Order items not found. Cannot print bill.");
        return;
      }

      const paymentMethod = orderPayments[order.order_id] || "other";
      const validPaymentMethods = ["cash", "card", "online", "bank", "other"];
      const paymentMethodValue = validPaymentMethods.includes(paymentMethod)
        ? (paymentMethod as "cash" | "card" | "online" | "bank" | "other")
        : "other";

      const invoiceData = {
        ...fullOrder,
        payment_method: paymentMethodValue,
        items: printItems,
      };

      const printContainer = document.createElement("div");
      printContainer.style.position = "fixed";
      printContainer.style.left = "-9999px";
      printContainer.style.width = "210mm";
      printContainer.style.background = "white";
      document.body.appendChild(printContainer);

      const root = ReactDOM.createRoot(printContainer);
      root.render(React.createElement(InvoicePrint, { order: invoiceData }));

      setTimeout(async () => {
        try {
          const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: 794,
            windowWidth: 794,
          });

          const rotatedCanvas = document.createElement('canvas');
          rotatedCanvas.width = canvas.height;
          rotatedCanvas.height = canvas.width;
          const ctx = rotatedCanvas.getContext('2d');
          if (ctx) {
            ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          }

          const { documentDir } = await import("@tauri-apps/api/path");
          const { createDir, writeBinaryFile, removeFile } = await import("@tauri-apps/api/fs");
          const { join } = await import("@tauri-apps/api/path");

          const documentDirPath = await documentDir();
          const tempPath = await join(documentDirPath, "Dennep Pos Documents", "Temp");
          await createDir(tempPath, { recursive: true });

          const tempFileName = `print-temp-${fullOrder.order_number}-${Date.now()}.png`;
          const tempFilePath = await join(tempPath, tempFileName);

          await new Promise<void>((resolve, reject) => {
            rotatedCanvas.toBlob(async (blob) => {
              if (!blob) {
                reject(new Error("Failed to generate image"));
                return;
              }

              try {
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                await writeBinaryFile(tempFilePath, uint8Array);
                resolve();
              } catch (error) {
                reject(error);
              }
            }, "image/png");
          });

          const command = new Command('cmd', ['/c', 'mspaint', '/pt', tempFilePath]);
          await command.execute();

          setTimeout(async () => {
            try {
              await removeFile(tempFilePath);
            } catch (e) {
              console.log('Could not delete temp file:', e);
            }
          }, 5000);

          alert(`✅ Invoice ${fullOrder.order_number} sent to printer!`);
        } catch (error) {
          console.error('Print error:', error);
          alert(`Failed to print: ${error}`);
        } finally {
          document.body.removeChild(printContainer);
        }
      }, 1000);
    } catch (error) {
      console.error("Error preparing for print:", error);
      alert(`Failed to prepare bill: ${error}`);
    }
  };

  // Export invoice as image
  const exportInvoiceAsImage = async (order: Order) => {
    try {
      // Fetch complete order with ungrouped items (SAME AS PRINT)
      const orderResponse = await fetch(`${API_URL}/orders/${order.order_id}?shop_id=${shopId}`);
      
      if (!orderResponse.ok) {
        alert("❌ Could not fetch order details. Cannot export.");
        return;
      }
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success || !orderResult.data) {
        alert("❌ Order not found. Cannot export.");
        return;
      }
      
      const fullOrder = orderResult.data;
      const exportItems = fullOrder.items || [];
      
      if (exportItems.length === 0) {
        alert("❌ Order items not found. Cannot export.");
        return;
      }

      const paymentMethod = orderPayments[order.order_id] || "other";
      const validPaymentMethods = ["cash", "card", "online", "bank", "other"];
      const paymentMethodValue = validPaymentMethods.includes(paymentMethod)
        ? (paymentMethod as "cash" | "card" | "online" | "bank" | "other")
        : "other";

      const invoiceData = {
        ...fullOrder,
        payment_method: paymentMethodValue,
        items: exportItems,
      };

      // Create a temporary container for rendering
      const printContainer = document.createElement("div");
      printContainer.style.position = "fixed";
      printContainer.style.left = "-9999px";
      printContainer.style.width = "210mm"; // A4 width
      printContainer.style.background = "white";
      document.body.appendChild(printContainer);

      const root = ReactDOM.createRoot(printContainer);
      root.render(React.createElement(InvoicePrint, { order: invoiceData }));

      // Wait for rendering to complete
      setTimeout(async () => {
        try {
          // Convert to canvas
          const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: 794, // A4 width in pixels at 96 DPI
            windowWidth: 794,
          });

          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            if (!blob) {
              alert("Failed to generate image");
              document.body.removeChild(printContainer);
              return;
            }

            try {
              // Save to Documents folder
              const documentDirPath = await documentDir();
              const invoicesPath = await join(documentDirPath, "Dennep Pos Documents", "Invoices");
              await createDir(invoicesPath, { recursive: true });

              const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
              const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-");
              const fileName = `invoice-${order.order_number}-${timestamp}_${time}.png`;
              const filePath = await join(invoicesPath, fileName);

              // Convert blob to array buffer
              const arrayBuffer = await blob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);

              // Write file using Tauri API
              await writeTextFile(filePath, ""); // Create file first
              const { writeBinaryFile } = await import("@tauri-apps/api/fs");
              await writeBinaryFile(filePath, uint8Array);

              alert(`✅ Invoice saved as image!\nLocation: ${invoicesPath}\\${fileName}`);
            } catch (error) {
              console.error("Error saving image:", error);
              alert("Failed to save invoice as image.");
            } finally {
              document.body.removeChild(printContainer);
            }
          }, "image/png");
        } catch (error) {
          console.error("Error generating image:", error);
          alert("Failed to generate invoice image.");
          document.body.removeChild(printContainer);
        }
      }, 1000);
    } catch (error) {
      console.error("Error preparing invoice for export:", error);
      alert("Failed to prepare invoice for export.");
    }
  };

  // Fetch receipt HTML when showing receipt
  useEffect(() => {
    if (selectedOrderId && showReceiptPreview) {
      const fetchReceipt = async () => {
        try {
          const response = await fetch(
            `${API_URL}/orders/${selectedOrderId}/receipt`
          );
          const result = await response.json();
          if (result.success) {
            setReceiptHTML(result.data.html);
          } else {
            alert("Failed to load receipt");
          }
        } catch (error) {
          console.error("Error fetching receipt:", error);
          alert("Error loading receipt");
        }
      };
      fetchReceipt();
    }
  }, [selectedOrderId, showReceiptPreview]);

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrderId(order.order_id);
    setPaymentAmount("");
    setPaymentType("balance");
    setPaymentMethod("cash");
    setPaymentMessage("");
    setShowReceiptPreview(false);
    setOrderNote(order.notes || "");
    setIsEditingNote(false);
    setNoteMessage("");
    setShowOrderModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setShowReceiptPreview(false);
    setShowAddressModal(false);
    setSelectedOrderId(null);
    setPaymentAmount("");
    setPaymentMessage("");
    setReceiptHTML("");
    setOrderItems([]);
    setTrackingNumber("");
    setStatusMessage("");
    setRecipientName("");
    setRecipientPhone("");
    setRecipientPhone1("");
    setDeliveryLine1("");
    setDeliveryLine2("");
    setDeliveryCity("");
    setDeliveryDistrict("");
    setDeliveryProvince("Sri Lanka");
    setDeliveryPostalCode("");
    setAddressMessage("");
  };


  const handleStatusUpdate = async (newStatus: "processing" | "shipped" | "delivered") => {
    if (!selectedOrderId || !shopId || !selectedOrder) return;

    // Validate requirements for shipped status
    if (newStatus === "shipped") {
      // Check 1: Payment must be fully paid - use balance_due and payment_status from database
      const balanceDue = parseFloat(String(selectedOrder.balance_due)) || 0;
      const isFullyPaid = selectedOrder.payment_status === 'fully_paid';

      if (balanceDue > 0 || !isFullyPaid) {
        setStatusMessage(`❌ Cannot ship order. Balance due: Rs. ${balanceDue.toFixed(2)}, Payment status: ${selectedOrder.payment_status}`);
        return;
      }

      // Check 2: Tracking number must be provided
      if (!trackingNumber.trim()) {
        setStatusMessage("❌ Please enter a tracking number");
        return;
      }

      // Check 3: Address must be complete in database
      const hasCompleteAddress =
        selectedOrder.delivery_line1 &&
        selectedOrder.delivery_city &&
        selectedOrder.delivery_district &&
        selectedOrder.delivery_province &&
        selectedOrder.delivery_postal_code;

      if (!hasCompleteAddress) {
        setStatusMessage("❌ Complete delivery address is required (Line 1, City, District, Province, Postal Code)");
        return;
      }
    }

    setIsUpdatingStatus(true);
    setStatusMessage("");

    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          order_status: newStatus,
          tracking_number: newStatus === "shipped" ? trackingNumber : undefined,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatusMessage(`✅ Order status updated to ${newStatus}!`);
        setTrackingNumber("");
        setTimeout(() => {
          refetchOrders();
          // Refresh selected order
          const updatedOrder = orders?.find(o => o.order_id === selectedOrderId);
          if (updatedOrder) {
            // Update state to reflect changes
          }
        }, 1000);
      } else {
        setStatusMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setStatusMessage("❌ Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenAddressModal = () => {
    if (selectedOrder) {
      setRecipientName(selectedOrder.recipient_name || "");
      setRecipientPhone(selectedOrder.recipient_phone || "");
      setRecipientPhone1(selectedOrder.recipient_phone1 || "");
      setDeliveryLine1(selectedOrder.delivery_line1 || "");
      setDeliveryLine2(selectedOrder.delivery_line2 || "");
      setDeliveryCity(selectedOrder.delivery_city || "");
      setDeliveryDistrict(selectedOrder.delivery_district || "");
      setDeliveryProvince(selectedOrder.delivery_province || "");
      setDeliveryPostalCode(selectedOrder.delivery_postal_code || "");
      setDeliveryCharge(String(selectedOrder.delivery_charge || ""));
      setAddressMessage("");
      setShowAddressModal(true);
    }
  };

  const handleSaveAddress = async () => {
    if (!selectedOrderId || !shopId) return;

    // Validate required fields
    if (!recipientName.trim()) {
      setAddressMessage("❌ Please enter recipient name");
      return;
    }
    if (!recipientPhone.trim()) {
      setAddressMessage("❌ Please enter phone number");
      return;
    }
    if (!deliveryLine1.trim()) {
      setAddressMessage("❌ Please enter delivery address");
      return;
    }
    if (!deliveryProvince.trim()) {
      setAddressMessage("❌ Please select province");
      return;
    }
    if (!deliveryDistrict.trim()) {
      setAddressMessage("❌ Please select district");
      return;
    }
    if (!deliveryCity.trim()) {
      setAddressMessage("❌ Please enter city");
      return;
    }
    if (!deliveryPostalCode.trim()) {
      setAddressMessage("❌ Please enter postal code");
      return;
    }

    setIsUpdatingAddress(true);
    setAddressMessage("");

    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          recipient_phone1: recipientPhone1 || null,
          delivery_line1: deliveryLine1,
          delivery_line2: deliveryLine2 || null,
          delivery_city: deliveryCity,
          delivery_district: deliveryDistrict,
          delivery_province: deliveryProvince,
          delivery_postal_code: deliveryPostalCode,
          delivery_charge: deliveryCharge ? parseFloat(deliveryCharge) : 0,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAddressMessage("✅ Address and delivery charge saved successfully!");
        setTimeout(() => {
          setShowAddressModal(false);
          refetchOrders();
        }, 1000);
      } else {
        setAddressMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setAddressMessage("❌ Failed to save address");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedOrderId || !shopId) return;

    setIsUpdatingNote(true);
    setNoteMessage("");

    try {
      const response = await fetch(`${API_URL}/orders/${selectedOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: shopId,
          notes: orderNote.trim() || null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setNoteMessage("✅ Note saved successfully!");
        setIsEditingNote(false);
        setTimeout(() => {
          refetchOrders();
          setNoteMessage("");
        }, 1500);
      } else {
        setNoteMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      setNoteMessage("❌ Failed to save note");
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedOrderId || !paymentAmount) {
      setPaymentMessage("❌ Please enter a payment amount");
      return;
    }

    // If bank payment is selected but no bank details provided, show error
    if (paymentMethod === "bank" && !bankPaymentData) {
      setPaymentMessage("❌ Please provide bank payment details");
      setShowBankPaymentModal(true);
      return;
    }

    const amount = parsePaymentAmount(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentMessage("❌ Please enter a valid amount");
      return;
    }

    // Calculate actual balance due including delivery charges
    const actualBalanceDue = selectedOrder ? (() => {
      const totalAmount = parsePaymentAmount(String(selectedOrder.total_amount));
      const deliveryCharge = parsePaymentAmount(String(selectedOrder.delivery_charge));
      const advancePaid = parsePaymentAmount(String(selectedOrder.advance_paid));
      return Math.max(0, totalAmount + deliveryCharge - advancePaid);
    })() : 0;

    if (amount > actualBalanceDue) {
      setPaymentMessage(
        `❌ Amount cannot exceed balance due (Rs. ${actualBalanceDue.toFixed(2)})`
      );
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage("");

    try {
      const paymentPayload: any = {
        shop_id: shopId,
        amount_paid: amount,
        payment_type: paymentType,
        payment_method: paymentMethod === "bank"
          ? (bankPaymentData?.isOnlineTransfer ? "online_transfer" : "bank_deposit")
          : "cash",
      };

      // Add bank details if bank payment
      if (paymentMethod === "bank" && bankPaymentData) {
        paymentPayload.bank_name = bankPaymentData.bank;
        paymentPayload.branch_name = bankPaymentData.branch || null;
        paymentPayload.bank_account_id = bankPaymentData.bankAccountId;
        paymentPayload.transaction_id = bankPaymentData.receiptNumber;
      }

      const response = await fetch(
        `${API_URL}/orders/${selectedOrderId}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        }
      );


      const result = await response.json();
    if (result.success) {
      setPaymentMessage(
        `✅ Payment of Rs. ${amount.toFixed(2)} recorded successfully!`
      );
      setPaymentAmount("");
      setBankPaymentData(null);
      
      // Refetch orders list to update the main table and modal
      await refetchOrders();
      
      // Small delay to ensure React state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // The selectedOrder will automatically update since it's derived from orders array
    } else {
      setPaymentMessage(`❌ Error: ${result.error}`);
    }
    } catch (error) {
      console.error("Error recording payment:", error);
      setPaymentMessage("❌ Failed to record payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleEditOrder = async () => {
    if (!selectedOrder || !shopId) return;

    try {
      // Fetch complete order with items and details
      const orderResponse = await fetch(
        `${API_URL}/orders/${selectedOrder.order_id}?shop_id=${shopId}`
      );
      const orderData = await orderResponse.json();
      const order = orderData.data || selectedOrder;
      const orderItems = order.items || [];

      // Store order data for editing in SalesPage
      sessionStorage.setItem(
        "orderToEdit",
        JSON.stringify({
          orderId: selectedOrder.order_id,
          orderNumber: selectedOrder.order_number,
          customerId: selectedOrder.customer_id,
          customerName: selectedOrder.recipient_name || selectedOrder.customer_id,
          customerMobile: selectedOrder.customer_mobile,
          items: orderItems.map((item: any) => ({
            product_id: item.product_id,
            productId: item.product_id,
            productName: item.product_name,
            quantity: Number(item.quantity) || 0,
            price: Number(item.sold_price) || 0,
            soldPrice: Number(item.sold_price) || 0,
            size: item.size_name || "N/A",
            sizeId: item.size_id,
            color: item.color_name || "N/A",
            colorId: item.color_id,
            productCost: Number(item.product_cost) || 0,
            printCost: Number(item.print_cost) || 0,
          })),
          totalAmount: Number(selectedOrder.total_amount) || 0,
          totalPaid: Number(selectedOrder.advance_paid) || 0,
          balanceDue: Number(selectedOrder.balance_due) || 0,
          deliveryCharge: Number(selectedOrder.delivery_charge) || 0,
          orderStatus: selectedOrder.order_status,
          paymentMethod: orderPayments[selectedOrder.order_id] || "Not specified",
          orderDate: selectedOrder.order_date,
          orderNotes: selectedOrder.notes,
        })
      );

      // Close modal and navigate to sales
      handleCloseModal();
      sessionStorage.setItem("navigateToSales", "true");
    } catch (error) {
      console.error("Error loading order details:", error);
      alert("Failed to load order details");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/50 text-yellow-400";
      case "processing":
        return "bg-blue-900/50 text-blue-400";
      case "shipped":
        return "bg-purple-900/50 text-purple-400";
      case "delivered":
        return "bg-green-900/50 text-green-400";
      default:
        return "bg-gray-700/50 text-gray-400";
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "unpaid":
        return "bg-red-900/50 text-red-400";
      case "partial":
        return "bg-yellow-900/50 text-yellow-400";
      case "fully_paid":
        return "bg-green-900/50 text-green-400";
      default:
        return "bg-gray-700/50 text-gray-400";
    }
  };

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-4">
        <p className="text-gray-400 text-lg">Loading orders...</p>
        <p className="text-gray-500 text-sm">
          Shop ID: {shopId} | Status: {selectedStatus}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Compact Header - Row 1: Main Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <h1 className="text-2xl font-bold text-red-500">Orders</h1>
          <span className="text-sm font-semibold text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
            {totalOrders}
          </span>
        </div>
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-600/50 rounded-lg px-4 py-2 flex-shrink-0">
          <p className="text-xs text-green-300 font-semibold">Total Value</p>
          <p className="text-lg font-bold text-green-400">Rs. {totalValue.toFixed(2)}</p>
        </div>
        <button
          onClick={() => {
            const html = generateOrdersHTML(filteredOrders);
            printContent(html, 'Orders Report');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
        >
          🖨️ Print
        </button>
        <input
          type="text"
          placeholder="🔍 Search by customer, order number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-700 border-2 border-red-600/30 text-white placeholder-gray-500 rounded-lg focus:border-red-500 focus:outline-none text-sm"
        />
      </div>

      {/* Compact Header - Row 2: Status Filter Chips */}
      <div className="flex gap-2">
        {[
          {
            value: "pending",
            label: "Pending",
            color: "bg-yellow-600 hover:bg-yellow-700",
          },
          {
            value: "processing",
            label: "Processing",
            color: "bg-blue-600 hover:bg-blue-700",
          },
          {
            value: "shipped",
            label: "Shipped",
            color: "bg-purple-600 hover:bg-purple-700",
          },
          {
            value: "delivered",
            label: "Delivered",
            color: "bg-green-600 hover:bg-green-700",
          },
          {
            value: "all",
            label: "All Orders",
            color: "bg-gray-600 hover:bg-gray-700",
          },
        ].map((status) => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            className={`px-4 py-2 rounded-full font-semibold text-white transition-all ${
              selectedStatus === status.value
                ? `${status.color} ring-2 ring-offset-2 ring-offset-gray-800`
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders Table - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-sm">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 bg-gray-700/80 border-b-2 border-red-600 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Customer ID
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Order Date
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Order Total (Rs.)
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Delivery (Rs.)
                </th>
                <th className="px-6 py-3 text-right font-semibold text-red-400">
                  Final Amount (Rs.)
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-red-400">
                  Tracking Number
                </th>
              </tr>
            </thead>

            {/* Table Body - Scrollable Rows */}
            <tbody className="divide-y divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    onClick={() => setSelectedOrderId(order.order_id)}
                    onDoubleClick={() => handleOpenOrderDetails(order)}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedOrderId === order.order_id
                        ? "bg-red-900/40 border-l-4 border-l-red-600"
                        : "hover:bg-gray-700/30 border-l-4 border-l-transparent"
                    }`}
                    title="Double-click to open details"
                  >
                    <td className="px-6 py-4 text-gray-200 font-medium font-mono">
                      IN{order.order_number}
                    </td>
                    <td className="px-6 py-4 text-gray-200 font-mono">
                      {order.customer_id || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {order.customer_mobile}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      <div>{new Date(order.updated_at || order.order_date).toLocaleDateString()}</div>
                      <div className="text-gray-500">{new Date(order.updated_at || order.order_date).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-green-400 font-semibold">
                      {parseFloat(String(order.total_amount)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-yellow-400">
                      {parseFloat(String(order.delivery_charge || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-400 font-bold">
                      {parseFloat(String(order.final_amount || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                          order.order_status
                        )}`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadgeColor(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status.replace("_", " ")}
                        </span>
                        {(() => {
                          // Use balance_due from database (already calculated by backend)
                          const balanceDue = parseFloat(String(order.balance_due)) || 0;

                          if (balanceDue > 0) {
                            return (
                              <span className="text-red-400 text-xs font-bold">
                                Due: Rs. {balanceDue.toFixed(2)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {order.tracking_number ? (
                        <span className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs font-mono">
                          {order.tracking_number}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No orders found for this status
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-red-200 text-sm mt-1">
                  Order #{selectedOrder.order_number}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Customer & Order Information
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Customer ID
                    </p>
                    <p className="text-gray-200 font-medium text-base font-mono">
                      {selectedOrder.customer_id || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Mobile
                    </p>
                    <p className="text-gray-200 font-medium text-base">
                      {selectedOrder.customer_mobile}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Last Updated
                    </p>
                    <p className="text-gray-200 font-medium text-sm">
                      {new Date(selectedOrder.updated_at || selectedOrder.order_date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(selectedOrder.updated_at || selectedOrder.order_date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-semibold mb-1">
                      Payment Method
                    </p>
                    <p className="text-gray-200 font-medium text-base capitalize">
                      {orderPayments[selectedOrder.order_id] || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Order Items
                </h3>
                <div className="bg-gray-700/30 border border-gray-700 rounded-lg overflow-hidden">
                  {isLoadingItems ? (
                    <div className="p-6 text-center text-gray-400">
                      Loading order items...
                    </div>
                  ) : orderItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      No items found for this order
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-700/50 border-b border-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-300 font-semibold">
                              Product
                            </th>
                            <th className="px-4 py-3 text-center text-gray-300 font-semibold">
                              Qty
                            </th>
                            <th className="px-4 py-3 text-right text-gray-300 font-semibold">
                              Unit Price (Rs.)
                            </th>
                            <th className="px-4 py-3 text-right text-gray-300 font-semibold">
                              Total (Rs.)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {orderItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-3 text-gray-200">
                                {item.product_name}
                              </td>
                              <td className="px-4 py-3 text-center text-gray-300">
                                {item.total_quantity}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-400">
                                {parseFloat(String(item.unit_price || 0)).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right text-red-400 font-semibold">
                                {parseFloat(String(item.total_sold || 0)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-gray-700/50 font-semibold">
                            <td colSpan={3} className="px-4 py-3 text-right">
                              Subtotal:
                            </td>
                            <td className="px-4 py-3 text-right text-red-400">
                              Rs.{" "}
                              {parseFloat(
                                String(selectedOrder.total_amount)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary & Payment Section - NOW POSITIONED AFTER ITEMS */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Order Summary & Payment
                </h3>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-600">
                    <p className="text-gray-300">Order Subtotal:</p>
                    <p className="text-gray-100 font-semibold">
                      Rs.{" "}
                      {parseFloat(String(selectedOrder.total_amount)).toFixed(
                        2
                      )}
                    </p>
                  </div>

                  {/* Delivery Charge */}
                  {selectedOrder.delivery_charge ? (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-600">
                      <p className="text-gray-300">Delivery Charge:</p>
                      <p className="text-gray-100 font-semibold">
                        Rs.{" "}
                        {parseFloat(
                          String(selectedOrder.delivery_charge)
                        ).toFixed(2)}
                      </p>
                    </div>
                  ) : null}

                  {/* Grand Total */}
                  <div className="flex justify-between items-center pb-3 border-b border-gray-600 bg-gray-700/50 rounded p-2">
                    <p className="text-red-400 font-bold text-lg">
                      Grand Total (Amount Due):
                    </p>
                    <p className="text-red-400 font-bold text-xl">
                      Rs.{" "}
                      {(
                        parseFloat(String(selectedOrder.total_amount)) +
                        (parseFloat(String(selectedOrder.delivery_charge)) || 0)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="grid grid-cols-2 gap-4 py-3">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-1">
                        Advance Paid
                      </p>
                      <p className="text-green-400 font-bold text-lg">
                        Rs.{" "}
                        {parseFloat(String(selectedOrder.advance_paid)).toFixed(
                          2
                        )}
                      </p>
                    </div>
                    <div>
                      {(() => {
                        // Use balance_due from database
                        const balanceDue = parseFloat(String(selectedOrder.balance_due)) || 0;

                        return (
                          <>
                            <p className="text-xs text-gray-400 font-semibold mb-1">
                              Balance Due
                            </p>
                            <p className={`font-bold text-lg ${balanceDue > 0 ? "text-red-400" : "text-green-400"}`}>
                              Rs. {balanceDue.toFixed(2)}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Outstanding Balance Warning */}
                  {(() => {
                    // Use balance_due from database for warning
                    const balanceDue = parseFloat(String(selectedOrder.balance_due)) || 0;

                    if (balanceDue > 0) {
                      return (
                        <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mt-3">
                          <div className="flex items-center gap-3">
                            <div className="text-red-400 text-2xl">⚠️</div>
                            <div>
                              <p className="text-red-400 font-bold text-sm">
                                PAYMENT PENDING
                              </p>
                              <p className="text-red-300 text-xs mt-1">
                                Rs. {balanceDue.toFixed(2)} must be paid before printing bill or marking as shipped
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Payment Status */}
                  <div className="pt-2 border-t border-gray-600">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getPaymentStatusBadgeColor(
                        selectedOrder.payment_status
                      )}`}
                    >
                      {selectedOrder.payment_status
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Recording Section */}
              {selectedOrder.order_status !== "cancelled" && selectedOrder.balance_due > 0 && (
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-bold text-red-400 mb-4">
                    💰 Record Payment
                  </h3>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-4">
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Payment Method
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setPaymentMethod("cash");
                            setBankPaymentData(null);
                          }}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                            paymentMethod === "cash"
                              ? "bg-green-600 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          💵 Cash
                        </button>
                        <button
                          onClick={() => {
                            setPaymentMethod("bank");
                            setShowBankPaymentModal(true);
                          }}
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                            paymentMethod === "bank"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                          }`}
                        >
                          🏦 Bank
                        </button>
                      </div>
                    </div>

                    {/* Bank Payment Details Display */}
                    {paymentMethod === "bank" && bankPaymentData && (
                      <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3">
                        <p className="text-blue-300 text-sm font-semibold mb-2">
                          Bank Payment Details
                        </p>
                        <div className="text-xs text-gray-300 space-y-1">
                          <p>Bank: {bankPaymentData.bank}</p>
                          <p>Type: {bankPaymentData.isOnlineTransfer ? "Online Transfer" : "Bank Deposit"}</p>
                          {bankPaymentData.branch && <p>Branch: {bankPaymentData.branch}</p>}
                          <p>Receipt: {bankPaymentData.receiptNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Amount Input */}
                    {paymentMethod === "cash" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Payment Amount (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter payment amount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded-lg focus:border-green-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Balance Due: Rs. {(() => {
                            const totalAmount = parseFloat(String(selectedOrder.total_amount)) || 0;
                            const deliveryCharge = parseFloat(String(selectedOrder.delivery_charge)) || 0;
                            const advancePaid = parseFloat(String(selectedOrder.advance_paid)) || 0;
                            return Math.max(0, totalAmount + deliveryCharge - advancePaid).toFixed(2);
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Payment Message */}
                    {paymentMessage && (
                      <p className={`text-sm font-semibold ${paymentMessage.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                        {paymentMessage}
                      </p>
                    )}

                    {/* Record Payment Button */}
                    <button
                      onClick={handleRecordPayment}
                      disabled={isProcessingPayment || (paymentMethod === "cash" && !paymentAmount)}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                        isProcessingPayment || (paymentMethod === "cash" && !paymentAmount)
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {isProcessingPayment ? "⏳ Processing..." : "💰 Record Payment"}
                    </button>
                  </div>
                </div>
              )}

              {/* Order Notes Section */}
              <div className="border-t border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-red-400">
                    Order Notes
                  </h3>
                  {!isEditingNote && (
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
                    >
                      {orderNote ? "✏️ Edit Note" : "➕ Add Note"}
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="space-y-3">
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Enter order notes (e.g., special instructions, delivery preferences...)"
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                    />

                    {noteMessage && (
                      <p className={`text-sm font-semibold ${noteMessage.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                        {noteMessage}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveNote}
                        disabled={isUpdatingNote}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                          isUpdatingNote
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {isUpdatingNote ? "⏳ Saving..." : "💾 Save Note"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingNote(false);
                          setOrderNote(selectedOrder.notes || "");
                          setNoteMessage("");
                        }}
                        disabled={isUpdatingNote}
                        className="flex-1 py-2 rounded-lg font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {orderNote && orderNote.trim() !== "" ? (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">📝</span>
                          <p className="text-gray-200 text-sm whitespace-pre-wrap flex-1">
                            {orderNote}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                        <p className="text-gray-400 text-sm italic text-center">
                          No notes added yet. Click "Add Note" to add special instructions.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Delivery Status Section */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Delivery Status
                </h3>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-4">
                  {/* Current Status Display */}
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-2">
                      Current Status
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${getStatusBadgeColor(
                      selectedOrder.order_status
                    )}`}>
                      {selectedOrder.order_status.toUpperCase()}
                    </span>
                  </div>

                  {/* Status Update Controls */}
                  {selectedOrder.order_status !== "delivered" && selectedOrder.order_status !== "cancelled" && (
                    <div className="space-y-3">
                      {/* Pending -> Processing */}
                      {selectedOrder.order_status === "pending" && (
                        <button
                          onClick={() => handleStatusUpdate("processing")}
                          disabled={isUpdatingStatus}
                          className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                            isUpdatingStatus
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isUpdatingStatus ? "⏳ Updating..." : "📦 Mark as Processing"}
                        </button>
                      )}

                      {/* Processing -> Shipped */}
                      {selectedOrder.order_status === "processing" && (
                        <>
                          <div>
                            <label className="text-xs text-gray-400 font-semibold block mb-2">
                              Tracking Number *
                            </label>
                            <input
                              type="text"
                              placeholder="Enter tracking number (e.g., TRACK123456)"
                              value={trackingNumber}
                              onChange={(e) => setTrackingNumber(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleStatusUpdate("shipped")}
                            disabled={isUpdatingStatus || !trackingNumber.trim()}
                            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                              isUpdatingStatus || !trackingNumber.trim()
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {isUpdatingStatus ? "⏳ Updating..." : "🚚 Mark as Shipped"}
                          </button>
                        </>
                      )}

                      {/* Shipped -> Delivered */}
                      {selectedOrder.order_status === "shipped" && (
                        <>
                          <div>
                            <p className="text-xs text-gray-400 font-semibold mb-2">
                              Tracking Number
                            </p>
                            <p className="bg-gray-600 px-3 py-2 rounded-lg text-gray-100 font-mono text-sm">
                              {selectedOrder.tracking_number || "N/A"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleStatusUpdate("delivered")}
                            disabled={isUpdatingStatus}
                            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                              isUpdatingStatus
                                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {isUpdatingStatus ? "⏳ Updating..." : "✅ Mark as Delivered"}
                          </button>
                        </>
                      )}

                      {/* Status Message */}
                      {statusMessage && (
                        <p className={`text-sm font-semibold ${statusMessage.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                          {statusMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Delivered Status - Read Only */}
                  {selectedOrder.order_status === "delivered" && (
                    <div>
                      <p className="text-xs text-gray-400 font-semibold mb-2">
                        Tracking Number
                      </p>
                      <p className="bg-gray-600 px-3 py-2 rounded-lg text-gray-100 font-mono text-sm">
                        {selectedOrder.tracking_number || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Order delivered - No further updates available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address & Delivery Details Section */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Address & Delivery Details
                </h3>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  {/* Address Display */}
                  {selectedOrder.delivery_line1 ? (
                    <div className="space-y-4">
                      {/* Recipient Details (Left) and Address Details (Right) in 2 columns */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left Column - Recipient Details */}
                        <div>
                          <p className="text-xs text-gray-400 font-semibold mb-2">
                            📦 Recipient Information
                          </p>
                          <p className="text-gray-200 text-sm leading-relaxed">
                            <span className="font-medium">{selectedOrder.recipient_name || "N/A"}</span>
                            <br />
                            <span className="text-gray-300">📱 {selectedOrder.recipient_phone || "N/A"}</span>
                            {selectedOrder.recipient_phone1 && (
                              <>
                                <br />
                                <span className="text-gray-300">📱 {selectedOrder.recipient_phone1}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Right Column - Address Details */}
                        <div>
                          <p className="text-xs text-gray-400 font-semibold mb-2">
                            📍 Delivery Address
                          </p>
                          <p className="text-gray-200 text-sm leading-relaxed">
                            <span>
                              {selectedOrder.delivery_line1}
                              {selectedOrder.delivery_line2 && `, ${selectedOrder.delivery_line2}`}
                            </span>
                            <br />
                            <span>
                              {selectedOrder.delivery_city}
                              {selectedOrder.delivery_district && `, ${selectedOrder.delivery_district}`}
                            </span>
                            <br />
                            <span>
                              {selectedOrder.delivery_province}
                              {selectedOrder.delivery_postal_code && ` - ${selectedOrder.delivery_postal_code}`}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Edit Button - Full Width Below */}
                      <button
                        onClick={handleOpenAddressModal}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-2"
                      >
                        ✏️ Edit Address
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-gray-400 mb-4">
                        📍 No delivery address added yet
                      </p>
                      <button
                        onClick={handleOpenAddressModal}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        + Add Delivery Address
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700 flex-wrap">
                {/* Edit Order - Only for Pending and Processing */}
                {(selectedOrder.order_status === "pending" ||
                  selectedOrder.order_status === "processing") && (
                  <button
                    onClick={handleEditOrder}
                    className="flex-1 min-w-[150px] bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    ✏️ Edit Order
                  </button>
                )}

                {/* Print Receipt Button - Only for Shipped and Delivered */}
                {selectedOrder.order_status === "shipped" && (
                  <button
                    onClick={() => printBill(selectedOrder)}
                    className="flex-1 min-w-[150px] bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    🖨️ Print Bill
                  </button>
                )}

                {selectedOrder.order_status === "delivered" && (
                  <button
                    onClick={() => printReceipt(selectedOrder.order_id)}
                    disabled={!receiptHTML}
                    className={`flex-1 min-w-[150px] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      !receiptHTML
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    🖨️ Print Bill
                  </button>
                )}

                {/* Print Bill Button - Only for Processing */}
                {selectedOrder.order_status === "processing" && (
                  <button
                    onClick={() => printBill(selectedOrder)}
                    className="flex-1 min-w-[150px] bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    🖨️ Print Bill
                  </button>
                )}

                {/* Export as Image Button */}
                <button
                  onClick={() => exportInvoiceAsImage(selectedOrder)}
                  className="flex-1 min-w-[150px] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  📸 Export as Image
                </button>

                {/* Close Button */}
                <button
                  onClick={handleCloseModal}
                  className="flex-1 min-w-[150px] bg-gray-700 text-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {showAddressModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-2xl border-2 border-red-600 w-full max-w-2xl my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 border-b border-red-600 flex justify-between items-center sticky top-0 z-20">
              <div>
                <h2 className="text-2xl font-bold">📍 Address & Delivery Details</h2>
                <p className="text-red-200 text-sm mt-1">Order #{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-white hover:text-red-200 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Recipient Information */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Recipient Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Enter recipient name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        Primary Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="+94 77X XXX XXX"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        Alternative Phone Number
                      </label>
                      <input
                        type="tel"
                        value={recipientPhone1}
                        onChange={(e) => setRecipientPhone1(e.target.value)}
                        placeholder="+94 70X XXX XXX (Optional)"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-4">
                  Delivery Address
                </h3>
                <div className="space-y-4">
                  {/* Address Line 1 - Full width */}
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-2">
                      Address Line 1 (Street) *
                    </label>
                    <input
                      type="text"
                      value={deliveryLine1}
                      onChange={(e) => setDeliveryLine1(e.target.value)}
                      placeholder="123, Galle Road"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Address Line 2 - Full width */}
                  <div>
                    <label className="text-xs text-gray-400 font-semibold block mb-2">
                      Address Line 2 (Apt/Unit)
                    </label>
                    <input
                      type="text"
                      value={deliveryLine2}
                      onChange={(e) => setDeliveryLine2(e.target.value)}
                      placeholder="Apartment 5B (Optional)"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Province & District in same row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        Province *
                      </label>
                      <select
                        value={deliveryProvince}
                        onChange={(e) => setDeliveryProvince(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-red-500 focus:outline-none"
                      >
                        <option value="">Select Province</option>
                        <option value="Western Province">Western Province</option>
                        <option value="Central Province">Central Province</option>
                        <option value="Southern Province">Southern Province</option>
                        <option value="Eastern Province">Eastern Province</option>
                        <option value="Northern Province">Northern Province</option>
                        <option value="North Western Province">North Western Province</option>
                        <option value="North Central Province">North Central Province</option>
                        <option value="Uva Province">Uva Province</option>
                        <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        District *
                      </label>
                      <select
                        value={deliveryDistrict}
                        onChange={(e) => setDeliveryDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:border-red-500 focus:outline-none"
                        disabled={!deliveryProvince}
                      >
                        <option value="">
                          {deliveryProvince ? "Select District" : "Select Province First"}
                        </option>
                        {deliveryProvince &&
                          PROVINCE_DISTRICTS[deliveryProvince]?.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* City & Postal Code in same row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        placeholder="Colombo"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-semibold block mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={deliveryPostalCode}
                        onChange={(e) => setDeliveryPostalCode(e.target.value)}
                        placeholder="00600"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Delivery Charge Input */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-red-400 mb-2">
                      Delivery Charge (Rs.)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter delivery charge (e.g., 150)"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-white placeholder-gray-400 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Leave blank or 0 for no delivery charge
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {addressMessage && (
                <p className={`text-sm font-semibold text-center p-3 rounded-lg ${
                  addressMessage.includes("✅")
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                }`}>
                  {addressMessage}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700 flex-wrap">
                <button
                  onClick={handleSaveAddress}
                  disabled={isUpdatingAddress}
                  className={`flex-1 min-w-[150px] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isUpdatingAddress
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isUpdatingAddress ? "⏳ Saving..." : "💾 Save Address"}
                </button>

                <button
                  onClick={() => {
                    setRecipientName("");
                    setRecipientPhone("");
                    setRecipientPhone1("");
                    setDeliveryLine1("");
                    setDeliveryLine2("");
                    setDeliveryCity("");
                    setDeliveryDistrict("");
                    setDeliveryProvince("");
                    setDeliveryPostalCode("");
                    setDeliveryCharge("");
                  }}
                  className="flex-1 min-w-[150px] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  🔄 Clear Form
                </button>

                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 min-w-[150px] py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptPreview && selectedOrder && receiptHTML && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full my-8">
            <div
              id={`receipt-${selectedOrder.order_id}`}
              dangerouslySetInnerHTML={{ __html: receiptHTML }}
              className="p-8"
            />
          </div>
        </div>
      )}

      {/* Bank Payment Modal */}
      {showBankPaymentModal && (
        <BankPaymentModal
          isOpen={showBankPaymentModal}
          onClose={() => setShowBankPaymentModal(false)}
          onSave={(data) => {
            setBankPaymentData(data);
            setPaymentAmount(data.paidAmount);
            setShowBankPaymentModal(false);
          }}
          totalAmount={selectedOrder ? (() => {
            const totalAmount = parseFloat(String(selectedOrder.total_amount)) || 0;
            const deliveryCharge = parseFloat(String(selectedOrder.delivery_charge)) || 0;
            const advancePaid = parseFloat(String(selectedOrder.advance_paid)) || 0;
            return Math.max(0, totalAmount + deliveryCharge - advancePaid);
          })() : 0}
          isEditingOrder={true}
        />
      )}
    </div>
  );
};

export default OrdersPage;
