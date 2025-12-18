// SOLUTION: Save Normal Image, Print Rotated Image
// Replace the rotation section in handleSimplePrint (lines 1865-1910) with this:

// Save NORMAL (non-rotated) canvas to file
await new Promise<void>((resolve, reject) => {
  canvas.toBlob(async (blob) => {
    if (!blob) {
      reject(new Error("Failed to generate image"));
      return;
    }

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await writeBinaryFile(filePath, uint8Array);
      console.log(`✅ Invoice saved (normal portrait): ${fileName}`);
      resolve();
    } catch (error) {
      console.error("Error saving image:", error);
      reject(error);
    }
  }, "image/png");
});

// Create ROTATED version for printing ONLY
const rotatedCanvas = document.createElement('canvas');
rotatedCanvas.width = canvas.height;
rotatedCanvas.height = canvas.width;
const ctx = rotatedCanvas.getContext('2d');
if (ctx) {
  ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  ctx.rotate(90 * Math.PI / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
}

// Save rotated version to temp file for printing
const rotatedFileName = `invoice-${orderNumber}-${timestamp}_${time}-PRINT.png`;
const rotatedFilePath = await join(invoicesPath, rotatedFileName);

await new Promise<void>((resolve, reject) => {
  rotatedCanvas.toBlob(async (blob) => {
    if (!blob) {
      reject(new Error("Failed to generate rotated image"));
      return;
    }

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await writeBinaryFile(rotatedFilePath, uint8Array);
      console.log(`✅ Rotated version created for printing`);
      resolve();
    } catch (error) {
      console.error("Error saving rotated image:", error);
      reject(error);
    }
  }, "image/png");
});

// Print the ROTATED version
console.log('🖨️ Printing rotated version...');
const command = new Command('cmd', [
  '/c',
  'mspaint',
  '/pt',
  rotatedFilePath
]);

await command.execute();
console.log('✅ Print sent to printer');

// RESULT:
// - Saved file: Normal portrait (invoice-ORD001-2025-12-17_16-30-45.png)
// - Print file: Rotated landscape (invoice-ORD001-2025-12-17_16-30-45-PRINT.png)
// - Printer receives rotated version, prints correctly!

// Do the same for handlePrintAndExport function (around line 2010-2050)
