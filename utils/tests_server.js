const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = 'localhost';
const port = 8080;
const dirname = './public';

// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
const server = http.createServer((req, res) => {
  // Generate file path
  let filePath = dirname + req.url;
  if (req.url === '/') {
    filePath = `${dirname}/index.html`;
  }
  // Get MIME type from file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
  };
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (!error) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    } else {
      res.writeHead(500);
      res.end();
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
