const fs = require('fs');
const path = require('path');

// Files to convert
const filesToConvert = [
  'src/pages/AnalyticsPage.tsx',
  'src/pages/BankAccountsPage.tsx',
  'src/pages/CustomersPage.tsx',
  'src/pages/InventoryPage.tsx',
  'src/pages/OrdersPage.tsx',
  'src/pages/PaymentsPage.tsx',
  'src/pages/ProductsPage.tsx',
  'src/pages/SalesPage.tsx',
];

function convertTypeScriptToJavaScript(content) {
  let converted = content;

  // Remove interface declarations
  converted = converted.replace(/interface\s+\w+\s*\{[^}]*\}/gs, '');

  // Remove type declarations
  converted = converted.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

  // Remove function return type annotations
  converted = converted.replace(/(\w+\s*\([^)]*\))\s*:\s*\w+(\s*=>)/g, '$1$2');

  // Remove variable type annotations
  converted = converted.replace(/:\s*(string|number|boolean|any|\w+\[\]|\{[^}]+\})/g, '');

  // Remove React.FC type annotations
  converted = converted.replace(/:\s*React\.FC(<[^>]+>)?/g, '');

  // Remove generic type parameters in useState, useMemo, etc.
  converted = converted.replace(/(useState|useMemo|useCallback|useEffect)<([^>]+)>/g, '$1');

  // Remove as type assertions
  converted = converted.replace(/\s+as\s+\w+/g, '');

  // Change .tsx imports to .jsx
  converted = converted.replace(/from\s+['"](.*)\.tsx['"]/g, 'from \'$1.jsx\'');

  // Clean up multiple empty lines
  converted = converted.replace(/\n\s*\n\s*\n/g, '\n\n');

  return converted;
}

// Process each file
filesToConvert.forEach(file => {
  const fullPath = path.join(__dirname, 'frontend', file);
  const outputPath = fullPath.replace('.tsx', '.jsx');

  try {
    console.log(`Converting ${file}...`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const converted = convertTypeScriptToJavaScript(content);
    fs.writeFileSync(outputPath, converted, 'utf8');
    console.log(`✓ Created ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${file}:`, error.message);
  }
});

console.log('\nConversion complete!');
console.log('\nNote: Please review the converted files manually to ensure:');
console.log('1. All type annotations are removed');
console.log('2. Functionality is preserved');
console.log('3. No syntax errors were introduced');
