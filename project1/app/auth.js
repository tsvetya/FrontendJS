var User = require('./user.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var encr = require('./encr.js')();
var mongoose = require('mongoose');
var dbConfig = require('./db-config.js');

mongoose.connection.on("open", function(){
  console.log("mongodb is connected");
});

mongoose.connect(dbConfig.url);

// current test data: 
// username: a, password: a, email: a
module.exports = function() {
  passport.use('login', new LocalStrategy({
    passReqToCallback : true
  }, loginAction));

  passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  }, registerAction));

  passport.serializeUser(function(user, done){
    done(null, user._id);
  });
 
  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  return passport;
};

var loginAction = function(req, username, password, done){ 
  mongoose.connection.db.collection('user', 
    User.findOne({ 'username' :  username }, 
      function(err, user) {
        if (err) {
          console.log("Some error!");
          return done(err);
        }
        // Username does not exist
        if (!user){
            console.log('User Not Found with username '+ username);
            return done(null, false, req.flash('message', 'User Not found.'));                 
        }
        // User exists but password is wrong
        if (!encr.compare(user.password, password)){
            console.log('Invalid Password');
            return done(null, false, req.flash('message', 'Invalid Password'));
        }
        console.log("User is found!");
        return done(null, user);
      }
    )
  );
}

var createUser = function(username, password, req){
  var newUser = new User();
  newUser.username = username;
  newUser.password = encr.createHash(password);
  newUser.email = req.param('email');
  newUser.firstName = req.param('firstName');
  newUser.lastName = req.param('lastName');

  newUser.save(function(err){
    if (err){
      console.log('Error in Saving user: '+err);  
      throw err;  
    }
    console.log('User Registration succesful');    
    return done(null, newUser);
  });
}

var findOrCreateUser = function(){
  User.findOne({'username': username}, function(err, user){
    if (err){
      console.log('Error in SignUp: '+ err);
      return done(err);
    }
    if (user){
      console.log('User already exists');
      return done(null, false, 
         req.flash('message', 'User Already Exists'));
    } else{
      createUser(username, password, req);
    }
  });
}

var registerAction = function(req, username, password, done){
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
}