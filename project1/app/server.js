var passport = require('./config/passport-config.js')();
var app = require("./config/express-config.js")();
var dbHelper = require("./db-helper.js")();
var fsHelper = require("./fs-helper.js")();
var jade = require("jade");
var multer = require('multer');

app.all("*", function(req, res, next){
  var username = req.session.username;
  if((req.url === "/login" && req.method === "POST") ||
      username){
    next();
  } else {
    res.render('index');
    }
});

app.get('/', function(req, res){
    res.redirect('/home');
});

app.post('/login', passport.authenticate('login'),
  function(req, res){
    var username = req.body.username;
    req.session.username = username;
    req.session.loggedIn = true;
    res.redirect('/home');
});

app.get('/home', function(req, res) {
  var username = req.session.username;
  res.render('user-home', {'username': username});
});

app.post('/register', passport.authenticate('signup'),
  function(req, res){
    res.redirect('/');
});

app.get('/register', function(req, res){
  res.render('register');
});

app.get('/logout', function(req, res) {
  req.session.username = "";
  req.logout();
  res.redirect('/');
});

app.get("/profile", function(req, res){
  var username = req.session.username;
  dbHelper.getArtOfUser(username, res);
});

app.get("/thumbnails:range", function(req, res){
  var range = req.params.range.match(/[0-9]/g);
  dbHelper.getGalleryData(range, res);
});

app.get("/thumbnails/:username:range", function(req, res){
  var range = req.params.range.match(/[0-9]/g);
  var username = req.params.username;
  dbHelper.getGalleryData(range, res, username);
});

app.get("/art:id", function(req, res){
  var id = req.params.id.substring(1);
  var username = req.session.username;
  dbHelper.getArtPieceData(id, username, res);
});

app.get("/comments:id", function(req, res){
  var id = req.params.id.substring(1);
  dbHelper.getCommentsForArtPiece(id, res);  
});

app.get("/like:id", function(req, res){
  var id = req.params.id.substring(1);
  dbHelper.likeArtPiece(id, res);
});

//collection/doc/subcollection:doc
app.post('/arts/:artId/comments/', function(req, res){
  var id = req.params.id.substring(1);
  var username = req.session.username;
  var comment = req.body.commentText;
  dbHelper.createComment(id, username, comment, res);  
});

app.get("/add-art", function(req, res){
  var html = jade.renderFile("views/add-art.jade");
  res.send(html);
});

app.post("/add-art", function(req, res){
  var imgName = req.files.image.originalname;
  var imgPath = req.files.image.path;
  var artData = {
    name: req.body.name,
    artist: req.session.username,
    img: imgName,
    isReal: req.body.isReal,
    descr: req.body.descr
  };

  fsHelper.saveImage(imgName, imgPath, res);
  dbHelper.addArt(artData, res);
});


var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
