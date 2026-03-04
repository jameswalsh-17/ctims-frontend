const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist/ctims-frontend/browser')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/ctims-frontend/browser/index.html'));
});

app.listen(port, () => {
  console.log(`Frontend serving on port ${port}`);
});
