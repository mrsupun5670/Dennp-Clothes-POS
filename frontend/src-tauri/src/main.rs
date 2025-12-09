#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
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
      println!("Running on Windows");

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
fn print_invoice(html_content: String, invoice_number: String) -> Result<String, String> {
  #[cfg(target_os = "windows")]
  {
    use std::env;
    
    // Create temp directory for invoice
    let temp_dir = env::temp_dir();
    let file_path = temp_dir.join(format!("invoice_{}.html", invoice_number));
    
    // Write HTML to temp file
    fs::write(&file_path, &html_content)
      .map_err(|e| format!("Failed to write HTML file: {}", e))?;
    
    // Print using PowerShell with default printer
    let output = Command::new("powershell")
      .args(&[
        "-Command",
        &format!(
          "Start-Process -FilePath '{}' -Verb Print -WindowStyle Hidden",
          file_path.display()
        )
      ])
      .output()
      .map_err(|e| format!("Failed to execute print command: {}", e))?;
    
    // Clean up temp file after a delay (give time for printing)
    std::thread::spawn(move || {
      std::thread::sleep(std::time::Duration::from_secs(5));
      let _ = fs::remove_file(&file_path);
    });
    
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
