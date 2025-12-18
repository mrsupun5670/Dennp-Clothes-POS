// BEST SOLUTION: Save image and open the folder
// Replace lines 1887-1892 with this:

// Save successful - now open the folder containing the invoice
console.log('✅ Invoice saved:', fileName);
console.log('📁 Opening folder:', invoicesPath);

// Open the folder in Windows Explorer
const command = new Command('explorer', [invoicesPath]);
await command.execute();

setMessage({
  type: "success",
  text: `✅ Invoice saved! Folder opened - Right-click the image to print.`
});

// This way:
// 1. Invoice is saved ✅
// 2. Folder opens automatically ✅
// 3. User can see the file ✅
// 4. User right-clicks → Print ✅
// 5. Windows print dialog opens ✅
// 
// Much more reliable than trying to programmatically open print dialog!
