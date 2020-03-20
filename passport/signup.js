var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var User = require('../app/models/user');

module.exports = function(passport){
	
	passport.use('signup', new LocalStrategy({
    	usernameField: 'email',
    	passwordField: 'password',
    	passReqToCallback : true },
 	function (req, password, username, done) {
    	findOrCreateUser = function() {
    	console.log('req.body.username:'+req.body.username);
    	console.log('username:'+username);
    	console.log('password:'+password);
    	var tmp = username;
    	username = password;
    	password = tmp; 
    	
      // find a user in Mongo with provided username
      User.findOne({'email':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          
          return done(null, false,{message: 'User Already Exists'});
          
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = req.body.username;
          newUser.password = createHash(password);
          newUser.email = username;
          //newUser.firstName = req.param('firstName');
          //newUser.lastName = req.param('lastName');
 
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
 				// render the page and pass in any flash data if it exists
        		//res.render('profile.ejs', { message: req.flash('loginMessage') });             
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
);

   // Generates hash using bCrypt
   var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}

}