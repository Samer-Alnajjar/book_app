"use strict"

// Import packages
const express = require('express');
const cors = require('cors');


// Configure packages
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// routes
app.get('/hello', (req, res) => {
  res.render('pages/index');
})

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});



app.listen(PORT, () => {
  console.log(`THE SERVER IS LISTENING TO PORT ${PORT}`);
})