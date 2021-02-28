"use strict"

// Import packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');


// Configure packages
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/hello', (req, res) => {
  res.render('pages/index');
})

app.get('/searches/new', (req, res) => {
  // console.log(req.query);
  res.render('pages/searches/new');
});

app.post('/searches', handleAPIData);



//handlers function
function handleAPIData(req, res) {
  let arrayOfObjects = [];

  // To check what the user entered
  let searchQuery = checkQuery(req);
 
  
  let query = {
    q : searchQuery
  }
  console.log(query);
  try {
  const url = `https://www.googleapis.com/books/v1/volumes`;
  superagent.get(url).query(query)
    .then(data => {
      let apiData = data.body.items;
      
      apiData.forEach(data => {
        arrayOfObjects.push(new Book (data));
      });

      res.render('pages/searches/show', { booksResults : arrayOfObjects});
    })
    .catch(error => {
      console.log('Error reading from API', error);
    })
  } catch {
    console.log('error from try and catch');
  }

}

function checkQuery(req) {
  let formInput = req.body;
  if(formInput.q.includes("+")) {
    let q = formInput.q.split("+")[0];
    let name = formInput.q.split("+")[1];
    return q+"+in"+formInput.searchBy+":"+name;
  } else {
    return formInput.q+"+in"+formInput.searchBy;
  }
}

// constructors
function Book(bookData) {
  if(bookData.volumeInfo.imageLinks === undefined) {
    let imageLinks = {thumbnail: `https://i.imgur.com/J5LVHEL.jpg`}
    var modifiedImg = bookData.volumeInfo = imageLinks;
  } else {
    var modifiedImg = bookData.volumeInfo.imageLinks.thumbnail.split(":")[1];
  }
  
  this.img = `https:${modifiedImg}`;
  this.bookTitle = bookData.volumeInfo.title || "NA";
  this.authorNames = bookData.volumeInfo.authors || "NA";
  this.description = bookData.volumeInfo.description || "NA";
}



app.listen(PORT, () => {
  console.log(`THE SERVER IS LISTENING TO PORT ${PORT}`);
})