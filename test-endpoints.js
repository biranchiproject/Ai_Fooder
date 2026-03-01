const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testAll() {
    console.log('Testing CSAO API...');
    try {
        const csao = await makeRequest('/api/recommendations', 'POST', { cart_item_ids: [1, 2] });
        console.log('CSAO Response:', csao.statusCode, csao.data.substring(0, 100));
    } catch (e) { console.error('CSAO error:', e.message); }

    console.log('Testing category filter...');
    try {
        const filter = await makeRequest('/api/category/pizza');
        console.log('Filter Response:', filter.statusCode, filter.data.substring(0, 100));
    } catch (e) { console.error('Filter error:', e.message); }
}

testAll();
