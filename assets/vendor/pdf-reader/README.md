# Bundled PDF and OCR libraries

Versions are recorded in versions.json. Distributed browser builds are copied without modification from npm packages pdfjs-dist, tesseract.js, tesseract.js-core and @tesseract.js-data/eng. PDF.js, Tesseract.js and core license notices accompany their files; English trained data originates from https://github.com/naptha/tessdata (npm package metadata declares MIT).

PDF.js: https://github.com/mozilla/pdf.js
Tesseract.js: https://github.com/naptha/tesseract.js
Core: https://github.com/naptha/tesseract.js-core

PDF rendering, text extraction and English OCR run in the user's browser. Worker, WebAssembly, font and language assets are served from this system; no document is sent to an external OCR service. The portable LSTM core is selected explicitly for browser compatibility.
