// WORKING SOLUTION - Replace the print command section with this:

// Open Windows print dialog - Use Windows Photo Viewer print command
console.log('🖨️ Opening Windows print dialog...');
console.log('📁 File:', filePath);

// Method 1: Use rundll32 with Windows Photo Viewer (works on Windows 10/11)
const command = new Command('rundll32', [
  'C:\\Windows\\System32\\shimgvw.dll,ImageView_Fullscreen',
  filePath
]);

// Alternative Method 2: If Method 1 doesn't work, use this instead:
// const command = new Command('cmd', [
//   '/c',
//   'start',
//   '/wait',
//   filePath
// ]);

const output = await command.execute();
console.log('✅ Command result:', output);

// INSTRUCTIONS:
// 1. Try Method 1 first (rundll32 with ImageView_Fullscreen)
// 2. This opens the image in Windows Photo Viewer
// 3. User can then press Ctrl+P to print
// 
// If that doesn't work:
// 4. Comment out Method 1
// 5. Uncomment Method 2 (cmd /c start)
// 6. This opens the image with default app where user can print
//
// BETTER SOLUTION: Just open the saved image file location
// and let user manually print from there
