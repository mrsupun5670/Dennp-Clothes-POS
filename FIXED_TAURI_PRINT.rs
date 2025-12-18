// FIXED main.rs print_invoice function
// Replace the print_invoice function in src-tauri/src/main.rs (lines 90-122) with this:

#[tauri::command]
fn print_invoice(html_content: String, invoice_number: String) -> Result<String, String> {
  #[cfg(target_os = "windows")]
  {
    use std::fs;
    use std::env;
    
    // Create temp directory
    let temp_dir = env::temp_dir().join("dennp_pos_invoices");
    fs::create_dir_all(&temp_dir)
      .map_err(|e| format!("Failed to create temp directory: {}", e))?;
    
    // Save HTML to temp file
    let html_file = temp_dir.join(format!("invoice_{}.html", invoice_number));
    fs::write(&html_file, &html_content)
      .map_err(|e| format!("Failed to write HTML file: {}", e))?;
    
    // Print using default browser (opens print dialog)
    // This ensures correct orientation and sizing
    let output = Command::new("cmd.exe")
      .args(&["/C", "start", "", html_file.to_str().unwrap()])
      .output()
      .map_err(|e| format!("Failed to open file: {}", e))?;
    
    // Clean up temp file after delay
    std::thread::spawn(move || {
      std::thread::sleep(std::time::Duration::from_secs(10));
      let _ = fs::remove_file(&html_file);
    });
    
    if output.status.success() {
      Ok(serde_json::json!({
        "success": true,
        "message": "Invoice opened for printing"
      }).to_string())
    } else {
      Err(format!("Failed to open invoice: {}", String::from_utf8_lossy(&output.stderr)))
    }
  }
  
  #[cfg(not(target_os = "windows"))]
  {
    Err("Printing is only supported on Windows".to_string())
  }
}

// IMPORTANT: After updating this file, you MUST rebuild the Tauri app:
// 1. Stop the running app (Ctrl+C in terminal)
// 2. Run: npm run tauri build
// 3. Or for dev: npm run tauri dev
