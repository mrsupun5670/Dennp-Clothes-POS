// DEBUG VERSION - Replace lines 1887-1892 in SalesPage.tsx with this:

// Open Windows system print dialog using PowerShell
console.log('🖨️ Step 1: Attempting to open print dialog...');
console.log('📁 File path:', filePath);

const command = new Command('powershell', [
  '-Command',
  `Start-Process -FilePath "${filePath}" -Verb Print`
]);

console.log('⚙️ Step 2: Executing PowerShell command...');
const output = await command.execute();
console.log('✅ Step 3: Command executed');
console.log('📊 Exit code:', output.code);
console.log('📝 Stdout:', output.stdout);
console.log('❌ Stderr:', output.stderr);

// INSTRUCTIONS:
// 1. Replace lines 1887-1892 in handleSimplePrint with the code above
// 2. Click Print button
// 3. Open browser console (F12)
// 4. Check the console logs to see where it fails
// 5. Share the console output with me
