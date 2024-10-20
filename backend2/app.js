const express = require('express');
const app = express();
const port = 3000;
const router = require('./routes');
// Use the built-in body-parser middleware to parse the request body
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use(express.json());
app.use('/api', router);

app.get('/', (req, res) => 
{
  
  res.send('BAM');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});