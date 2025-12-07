const path = require('path');
const express = require('express');
const expressStaticGzip = require('express-static-gzip');

const app = express();

// Serve the build with Brotli/gzip-precompressed files if available
const assetsDir = path.join(__dirname);

// Ensure .br/.gz requests have Content-Encoding and the right Content-Type
app.use((req, res, next) => {
  if (req.path.endsWith('.br') || req.path.endsWith('.gz')) {
    const isBr = req.path.endsWith('.br');
    const uncompressedPath = req.path.replace(/\.br$|\.gz$/, '');
    const ext = path.extname(uncompressedPath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.wasm') contentType = 'application/wasm';
    else if (ext === '.data') contentType = 'application/octet-stream';
    else if (ext === '.mem') contentType = 'application/octet-stream';
    else if (ext === '.json') contentType = 'application/json';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Encoding', isBr ? 'br' : 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    // Set a sensible cache header for local testing
    res.setHeader('Cache-Control', 'public, max-age=0');
  }
  next();
});

app.use('/', expressStaticGzip(assetsDir, {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  setHeaders: (res, filePath) => {
    // Content-Type for known Unity files
    if (filePath.endsWith('.wasm.br') || filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    } else if (filePath.endsWith('.js.br') || filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.data.br') || filePath.endsWith('.data')) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    // If setHeaders is called, ensure Vary header is set; don't rely on file extension
    if (!res.getHeader('Vary')) {
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
}));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
