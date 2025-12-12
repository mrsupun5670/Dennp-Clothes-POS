const http = require('http');

function fetchUrl(path) {
    const url = `http://localhost:3002${path}?shop_id=1`;
    console.log(`Fetching from: ${url}`);

    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`--- Response from ${path} ---`);
        try {
          const json = JSON.parse(data);
          if (json.success && json.data) {
            const products = json.data;
            console.log(`Fetched ${products.length} products.`);
            
            // Find a product that should have stock (e.g., '1001')
            const p = products.find(p => p.product_id === '1001');
            if (p) {
              console.log('Product 1001 structure:');
              console.log(JSON.stringify(p, null, 2));
            } else if (products.length > 0) {
              console.log('Product 1001 not found. Dumping first product:');
              console.log(JSON.stringify(products[0], null, 2));
            } else {
                console.log('No products returned.');
            }
          } else {
            console.log('API returned error or invalid format.');
            if (data.length < 500) console.log('Raw data:', data);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e.message);
          if (data.length < 500) console.log('Raw data:', data);
        }
      });

    }).on('error', (err) => {
      console.error('Error: ' + err.message);
    });
}

fetchUrl('/api/products');
fetchUrl('/api/v1/products');
