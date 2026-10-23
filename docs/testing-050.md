# 0.1.50 testing

All 173 automated regression tests passed, along with package checks. Deployment confirmed version 0.1.50 and PM2 online after the update script.

Regression tests cover PDF page ranges, limits, line reconstruction, item snapshot isolation, retained effect changes, reset ownership/document IDs and active costs, and compendium browser drops reaching the created actor's embedded items. The importer template compiles.

Headless Microsoft Edge successfully ran the actual bundled PDF.js and Tesseract.js workers against page 214 of the user's rules PDF through a local HTTP server: native text returned 2,156 characters and forced OCR returned 2,085. No external OCR service was used. OCR output includes decorative-page recognition noise; users must review extracted text. This checks the browser libraries, not Foundry integration.

Interactive Foundry checks remain: use both importer tabs to extract a selected PDF page, review and preview it, cancel reading, drag items from the compendium browser into manual creation, remove one, and verify the remaining items/effects on the created World Being. Automatic OCR uses pages with fewer than 30 non-space extracted characters; Force OCR is available for garbled embedded text. Recognition is English; complex columns and game symbols may require manual corrections.
