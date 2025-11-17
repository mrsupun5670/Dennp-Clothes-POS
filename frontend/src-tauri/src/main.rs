#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      // Initialize app
      println!("Dennep Clothes POS Desktop App initialized");
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // POS Commands
      get_orders,
      create_order,
      get_products,
      get_inventory,
      update_inventory,
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
fn create_order(customer_name: String, items: Vec<String>) -> String {
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
fn update_inventory(product_id: i32, quantity: i32) -> String {
  // TODO: Update database
  serde_json::json!({
    "success": true,
    "message": format!("Inventory updated for product {}", product_id)
  })
  .to_string()
}
