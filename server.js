var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;

var db = require("./models");

var app = express();

app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("views"));
app.use(express.static("views/pic.jpg"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", function(req, res) {
  res.render("home");
});
app.get("/saved", function(req, res) {
  res.render("saved");
});

// mongoose.connect("mongodb://localhost/scraper", {
//   useNewUrlParser: true
// });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.connect(MONGODB_URI);

app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com/").then(function(response) {
    // Load the body of the HTML into cheerio
    var $ = cheerio.load(response.data);

    var results = [];

    $("ul.e1n8kpyg1").each(function(i, element) {
      var title = $(element)
        .parent()
        .parent()
        .parent()
        .parent()
        .find("div.esl82me3")
        .children("h2.esl82me2")
        .text();
      var sum = $(element)
        .children("li")
        .first()
        .text();
      var link = $(element)
        .parent()
        .attr("href");

      if (link !== undefined)
        results.push({
          title: title,
          link: link,
          sum: sum
        });
      console.log(results);
      db.Article.create(results)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    res.send("Scrape Complete");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
app.get("/savedarticles", function(req, res) {
  db.Article.find({ saved: true })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id }, { saved: true })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id, saved: true },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/savedarticles/:id", function(req, res) {
  console.log(req.params);
  db.Article.findByIdAndRemove({ _id: req.params.id }).then(function(dbNote) {
    res.json(dbNote);
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
