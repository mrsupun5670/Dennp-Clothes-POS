console.log('=== STOCK PAGE DATA TEST ===');
console.log('Testing API endpoint directly...');

fetch('http://localhost:3002/api/products?shop_id=1')
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
    if (data.success && data.data && data.data.length > 0) {
      const firstProduct = data.data[0];
      console.log('First Product:', firstProduct);
      console.log('Has stockDetails?', !!firstProduct.stockDetails);
      console.log('StockDetails length:', firstProduct.stockDetails?.length || 0);
      if (firstProduct.stockDetails && firstProduct.stockDetails.length > 0) {
        console.log('First stock detail:', firstProduct.stockDetails[0]);
      }
    }
  })
  .catch(err => console.error('Error:', err));
