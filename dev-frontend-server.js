const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve('frontend');
const port = 4200;

http.createServer((req, res) => {
    let safePath = path.normalize(decodeURI(req.url.split('?')[0]));
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    const filePath = path.join(root, safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.json': 'application/json'
        };
        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
    }
}).listen(port, () => {
    console.log('Frontend HTTP server listening on http://localhost:' + port + ' (Serving from /frontend)');
});
