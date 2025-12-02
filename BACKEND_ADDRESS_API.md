# Backend Address API Integration

## Overview
The backend now fully supports saving and updating delivery address details for orders. The existing `PUT /api/orders/:id` endpoint handles all address fields automatically.

## API Endpoint

### Update Order Address
**Endpoint:** `PUT /api/orders/:id`

**URL Parameters:**
- `id` - Order ID to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "shop_id": 1,
  "recipient_name": "Ahmed Hassan",
  "recipient_phone": "+94 77X XXX XXX",
  "recipient_phone1": "+94 70X XXX XXX",
  "delivery_line1": "123, Galle Road",
  "delivery_line2": "Apartment 5B",
  "delivery_city": "Colombo",
  "delivery_district": "Colombo",
  "delivery_province": "Western Province",
  "delivery_postal_code": "00600"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Order not found or no changes made"
}
```

## Address Fields

All address fields are stored as VARCHAR (text) without IDs, as required:

| Field | Type | Max Length | Required | Notes |
|-------|------|-----------|----------|-------|
| recipient_name | VARCHAR | 255 | Yes | Customer name |
| recipient_phone | VARCHAR | 20 | Yes | Primary phone number |
| recipient_phone1 | VARCHAR | 20 | No | Alternative phone number |
| delivery_line1 | VARCHAR | 255 | Yes | Street address |
| delivery_line2 | VARCHAR | 255 | No | Apartment/Unit number |
| delivery_city | VARCHAR | 100 | Yes | City name |
| delivery_district | VARCHAR | 100 | Yes | District name (from dropdown) |
| delivery_province | VARCHAR | 100 | Yes | Province name (from dropdown) |
| delivery_postal_code | VARCHAR | 10 | Yes | 5-digit postal code |

## Implementation Details

### Frontend (OrdersPage.tsx)
- `handleSaveAddress()` function validates all required fields
- Sends PUT request to `/api/orders/:id` with address data
- Shows success/error messages to user
- Refetches orders after successful save

### Backend
- **Controller:** `OrderController.updateOrder()` 
  - Already supports passing through all address fields via `Object.assign()`
  - No additional changes needed

- **Model:** `Order.updateOrder()`
  - Added all address fields to `updateableFields` array
  - Dynamically builds SQL UPDATE query
  - Validates shop ownership before updating

## Database Integration

The orders table includes these columns for address storage:
```sql
ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN recipient_phone1 VARCHAR(20);
ALTER TABLE orders ADD COLUMN delivery_line1 VARCHAR(255);
ALTER TABLE orders ADD COLUMN delivery_line2 VARCHAR(255);
ALTER TABLE orders ADD COLUMN delivery_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN delivery_district VARCHAR(100);
ALTER TABLE orders ADD COLUMN delivery_province VARCHAR(100);
ALTER TABLE orders ADD COLUMN delivery_postal_code VARCHAR(10);
```

## Usage Examples

### cURL Example
```bash
curl -X PUT http://localhost:3001/api/orders/123 \
  -H "Content-Type: application/json" \
  -d '{
    "shop_id": 1,
    "recipient_name": "John Doe",
    "recipient_phone": "+94 771234567",
    "delivery_line1": "456 Main Street",
    "delivery_city": "Colombo",
    "delivery_district": "Colombo",
    "delivery_province": "Western Province",
    "delivery_postal_code": "00600"
  }'
```

### Frontend JavaScript Example
```javascript
const updateOrderAddress = async (orderId, shopId, addressData) => {
  const response = await fetch(`/api/orders/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shop_id: shopId,
      ...addressData
    })
  });
  
  return await response.json();
};
```

## Error Handling

**Missing shop_id:**
```json
{
  "success": false,
  "error": "Missing required field: shop_id"
}
```

**Order not found:**
```json
{
  "success": false,
  "error": "Order not found or no changes made"
}
```

**Server error:**
```json
{
  "success": false,
  "error": "Failed to update order",
  "details": "error message"
}
```

## Notes

- The endpoint is already fully functional and integrated
- District/Province names are stored as text, not IDs
- Updates are tracked with `updated_at` timestamp
- Shop ownership is verified before updating
- All fields are optional except `shop_id` (but form validation requires address fields)

