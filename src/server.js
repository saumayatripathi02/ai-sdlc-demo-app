import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import invoiceRoutes from './api/invoiceRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(invoiceRoutes);
app.use(express.static(publicDir));

app.get('/', (_request, response) => {
  response.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(5000, () => {
  console.log('Invoice approval app listening on http://localhost:5000');
});
