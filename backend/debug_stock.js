
async function checkApi() {
  try {
    console.log('Fetching products...');
    const response = await fetch('http://localhost:3002/api/products?shop_id=1');
    const data = await response.json();
    
    if (data && data.data) {
      const products = data.data;
      console.log(`Found ${products.length} products`);
      
      if (products.length > 0) {
        const p = products[0];
        console.log('First product sample:');
        console.log(`ID: ${p.product_id}`);
        console.log(`Name: ${p.product_name}`);
        console.log(`Stock Total: ${p.stock}`);
        console.log('Stock Details:', JSON.stringify(p.stockDetails, null, 2));
        
        // Check for product "T-1005" specifically if possible, or any with stock
        const pWithStock = products.find(p => p.stockDetails && p.stockDetails.length > 0);
        if (pWithStock) {
           console.log('\nFound product with stock details:');
           console.log(`ID: ${pWithStock.product_id}`);
           console.log('Stock Details:', JSON.stringify(pWithStock.stockDetails, null, 2));
        } else {
           console.log('\nWARNING: No products found with stockDetails array populated!');
        }
      }
    } else {
      console.log('Invalid response structure:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkApi();
