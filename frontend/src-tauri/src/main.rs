#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;

fn main() {
  tauri::Builder::default()
    .setup(|_app| {
      // Initialize app
      println!("Dennep Clothes POS Desktop App initialized");

      // Log platform info
      #[cfg(target_os = "macos")]
      println!("Running on macOS");

      #[cfg(target_os = "windows")]
      {
        println!("Running on Windows");
        
        // Auto-start backend server in hidden mode
        println!("Starting backend server...");
        let backend_script = r"C:\Program Files\Dennp Clothes POS\start-backend-hidden.vbs";
        
        match Command::new("wscript.exe")
          .arg(backend_script)
          .spawn() {
            Ok(_) => println!("Backend server started successfully"),
            Err(e) => eprintln!("Failed to start backend server: {}", e),
          }
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // POS Commands
      get_orders,
      create_order,
      get_products,
      get_inventory,
      update_inventory,
      print_invoice,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// POS System Commands

#[tauri::command]
fn get_orders() -> String {
  // TODO: Connect to database
  serde_json::json!({
    "orders": []
  })
  .to_string()
}

#[tauri::command]
fn create_order(customer_name: String, _items: Vec<String>) -> String {
  // TODO: Save to database
  serde_json::json!({
    "success": true,
    "order_id": 1001,
    "message": format!("Order created for {}", customer_name)
  })
  .to_string()
}

#[tauri::command]
fn get_products() -> String {
  // TODO: Connect to database
  serde_json::json!({
    "products": []
  })
  .to_string()
}

#[tauri::command]
fn get_inventory() -> String {
  // TODO: Connect to database
  serde_json::json!({
    "inventory": []
  })
  .to_string()
}

#[tauri::command]
fn update_inventory(product_id: i32, _quantity: i32) -> String {
  // TODO: Update database
  serde_json::json!({
    "success": true,
    "message": format!("Inventory updated for product {}", product_id)
  })
  .to_string()
}

#[tauri::command]
fn print_invoice(image_path: String) -> Result<String, String> {
  #[cfg(target_os = "windows")]
  {
    use std::path::Path;
    
    // Verify the image file exists
    if !Path::new(&image_path).exists() {
      return Err(format!("Image file not found: {}", image_path));
    }
    
    // Print using mspaint with /pt flag (print to default printer)
    // /pt prints the file and closes mspaint automatically
    let output = Command::new("mspaint.exe")
      .args(&["/pt", &image_path])
      .output()
      .map_err(|e| format!("Failed to execute print command: {}", e))?;
    
    if output.status.success() {
      Ok(serde_json::json!({
        "success": true,
        "message": "Invoice sent to printer"
      }).to_string())
    } else {
      Err(format!("Print command failed: {}", String::from_utf8_lossy(&output.stderr)))
    }
  }
  
  #[cfg(not(target_os = "windows"))]
  {
    Err("Silent printing is only supported on Windows".to_string())
  }
}
