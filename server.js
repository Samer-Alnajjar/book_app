"use strict"

// Import packages
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


// Configure packages
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
const client = new pg.Client(process.env.DATABASE_URL);

// routes
// app.get('/hello', (req, res) => {
//   res.render('pages/index');
// })

app.get('/searches/new', (req, res) => {
  // console.log(req.query);
  res.render('pages/searches/new');
});

app.post('/searches', handleAPIData);

app.get("/", checkDB)

app.get('/books/:id', viewDetails)

// app.post('/books'. storeToDB);


app.get("*", (req, res) => {
  res.render("pages/error");
})



//handlers function



function checkDB(req, res) {

  let selectQ = `select * from book;`;

  client.query(selectQ).then((data) => {

    res.render('pages/index', {
      book_data: data.rows,
      counter: data.rowCount
    });
  }).catch(error => {
    console.log('error while getting data from book table ..', error);
  });
}

function viewDetails(req, res) {

  let id = req.params.id;
  let selectQ = `select * from book where id = $1;`;
  let saveValue = [id];

  client.query(selectQ, saveValue).then((data) => {

    res.render('pages/books/show',{book:data.rows[0]});

  }).catch(error => {
      console.log('error no details', error);
    });

}

function storeToDB(req, res) {
  console.log(req.body);
}

function handleAPIData(req, res) {
  let arrayOfObjects = [];

  // To check what the user entered
  let searchQuery = checkQuery(req);


  let query = {
    q: searchQuery
  }
  console.log(query);
  try {
    const url = `https://www.googleapis.com/books/v1/volumes`;
    superagent.get(url).query(query)
      .then(data => {
        let apiData = data.body.items;

        apiData.forEach(data => {
          arrayOfObjects.push(new Book(data));
        });

        res.render('pages/searches/show', { booksResults: arrayOfObjects });
      })
      .catch(error => {
        console.log('Error reading from API', error);
        res.render("pages/error");
      })
  } catch {
    console.log('error from try and catch');
    res.render("pages/error");
  }

}

function checkQuery(req) {
  let formInput = req.body;
  if (formInput.q.includes("+")) {
    let q = formInput.q.split("+")[0];
    let name = formInput.q.split("+")[1];
    return q + "+in" + formInput.searchBy + ":" + name;
  } else {
    return formInput.q + "+in" + formInput.searchBy;
  }
}

// constructors
function Book(bookData) {
  if (bookData.volumeInfo.imageLinks === undefined) {
    let imageLinks = { thumbnail: `https://i.imgur.com/J5LVHEL.jpg` }
    var modifiedImg = bookData.volumeInfo = imageLinks;
  } else {
    var modifiedImg = bookData.volumeInfo.imageLinks.thumbnail.split(":")[1];
  }

  this.img = `https:${modifiedImg}`;
  this.bookTitle = bookData.volumeInfo.title || "NA";
  this.authorNames = bookData.volumeInfo.authors || "NA";
  this.description = bookData.volumeInfo.description || "NA";
}


client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`THE SERVER IS LISTENING TO PORT ${PORT}`);
  })
}).catch(error => {
  console.log('Error while connecting to the DB ..', error);
});
