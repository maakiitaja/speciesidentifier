// load up the user model
var User            = require('./models/user');
var Compendium            = require('./models/compendium');
var Insect           = require('./models/insect');
var fs = require('fs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var multer = require('multer');
var im = require('imagemagick');
var LocalStrategy = require('passport-local').Strategy;

var storage	=	multer.diskStorage({
  destination: function (req, file, callback) {
  		console.log("destination: "+__dirname+"/public/images/");
   	callback(null, __dirname+'/public/images/');
  },
  
  filename: function (req, file, callback) {
  	 console.log("renaming file.");
  	 console.log("file name: "+file.originalname);
    callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage});

function fileFilter (req, file, cb) {
	/*
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  cb(null, 0);

  // To accept the file pass `true`, like so:
  cb(null, 1);

  // You can always pass an error if something goes wrong:
  cb(new Error('I don\'t have a clue!'))
*/
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


// img path
var imgPath = __dirname+'/public/images/Carabus nemoralis lehtokiitäjäinen tv20130514_009.jpg';

// example schema
var schema = new Schema({
    img: { data: Buffer, contentType: String }
});

// our model
var A = mongoose.model('A', schema);

// app/routes.js
module.exports = function(app, passport) {

	app.get('/image-test', function(req, res) {

		 // empty the collection
	    A.remove(function (err) {
		    if (err) throw err;
		
		    console.error('removed old docs');
		
		    // store an img in binary in mongo
		    var a = new A;
		    a.img.data = fs.readFileSync(imgPath);
		    a.img.contentType = 'image/png';
		    a.save(function (err, a) {
		      if (err) throw err;
		
		      console.error('saved img to mongo');
				A.findById(a, function (err, doc) {
		          if (err) return next(err);
		          res.contentType(doc.img.contentType);
		          res.send(doc.img.data);
		      });
		   });
		});
	});

	
// file and photos upload
app.post('/populate_db', upload.fields([{ name: 'db', maxCount: 1 }, { name: 'userPhotos', maxCount: 100 }]), function(req, res) {
	req.files['db'][0].filename;
	fs.readFile(req.files['db'][0].destination+req.files['db'][0].filename, 'utf8', function (err, data) {
	
		
		 var insects = JSON.parse(data);
		 var i = 0;
		 console.log('insects.length: '+ insects.length);
			 
		 for (var i=0; i<insects.length; i++) {
		 	console.log(insects[i]);
    		for (var name in insects[i]) {
        		console.log("Item name: "+name);
        		console.log("Prop: "+insects[i][name]);
        		
        	}
    	}	 
	 
	
		// empty the collection
	 	Insect.remove(function (err) {
	    	 if (err) throw err;
			 for (var i=0; i< insects.length; i++) {
		 		var insect = insects[i]; 
	
		
				
		 		var newInsect = new Insect();
		 		
			
				newInsect.names=[];
				for (var j = 0; j < insect['names'].length; j++) {
					var translation={};
					translation.name=insect['names'][j].name;
					translation.language=insect['names'][j].language;
					newInsect.names.push(translation);							
				}				
				
					
				newInsect.latinName=insect['LatinName'];
				newInsect.legs=insect['Legs'];
				newInsect.territory=insect['Territory'];
				newInsect.primaryColor=insect['PrimaryColor'];
				newInsect.secondaryColor=insect['SecondaryColor'];
				newInsect.wiki=insect['Wiki'];
				newInsect.images.push(insect['Image']);
				newInsect.category=insect['Category'];
				
		 		
		 		console.log('newInsect: '+newInsect);
		 		newInsect.save(function (err) {
		 			if (err) throw err;
		 			console.log('Insect saved');
		 		});
		 		
	     }
 	 });  		 
	 
	 
    // thumb picture
	for (var i = 0; i< req.files['userPhotos'].length; i++) {
		var file = req.files['userPhotos'][i];
		console.log("destination: "+file.destination+file.filename);
		im.resize({
  			srcPath: file.destination+file.filename,
  			dstPath: file.destination+file.filename+"_thumb.jpg",
  			width:   100,
  			height: 100
		}, function(err, stdout, stderr) {
  		if (err) throw err;
  			console.log('resized file: '+file.filename);
		});		
	}
	 res.redirect('/#/main');
});
});


app.get('/populate_db', function(req, res) {
	 console.log('populate_db');

	 console.log('reading insects json');
	 var dburl;
	 var insects;
	 fs.readFile(__dirname+'/public/insects/insects.json', 'utf8', function (err, data) {
	
		
		 var insects = JSON.parse(data);
		 var i = 0;
		 console.log('insects.length: '+ insects.length);
		 var insectLength = insects.length;	 
		 for (var i=0; i < insectLength; i++) {
		 	console.log(insects[i]);
    		for (var name in insects[i]) {
        		console.log("Item name: "+name);
        		console.log("Prop: "+insects[i][name]);
        		
        	}
    	}	 
	 
	
		// empty the collection
	 	Insect.remove(function (err) {
	    	 if (err) throw err;
			 for (var i=0; i< insects.length; i++) {
		 		var insect = insects[i]; 
	
		 		var newInsect = new Insect();
		 				
				newInsect.names=[];
				for (var j = 0; j < insect['names'].length; j++) {
					var translation={};
					translation.name=insect['names'][j].name;
					translation.language=insect['names'][j].language;
					newInsect.names.push(translation);							
				}				
				
				newInsect.latinName=insect['LatinName'];
				newInsect.legs=insect['Legs'];
				newInsect.territory=insect['Territory'];
				newInsect.primaryColor=insect['PrimaryColor'];
				newInsect.secondaryColor=insect['SecondaryColor'];
				newInsect.wiki=insect['Wiki'];
				var images = insect['Images'].split(',');
				for (var ind in images) {
					console.log('image name: '+images[ind]);
					newInsect.images.push(images[ind]);	
				}
				
				
				newInsect.category=insect['Category'];
			
		 		console.log('newInsect: '+newInsect);
		 		newInsect.save(function (err) {
		 			if (err) throw err;
		 			console.log('Insect saved');
		 		});
				
				//thumb picture
				for (var ind in images) {
					console.log('image name: '+images[ind]);
					im.resize({
  						srcPath: __dirname+"/public/"+images[ind],
  						dstPath: __dirname+"/public/"+images[ind]+"_thumb.jpg",
  						width:   150,
  						height: 150
					}, function(err, stdout, stderr) {
  					if (err) throw err;
  						console.log('resized file: '+__dirname+"/public/"+insect['Images']);
					});
				}			 		
	     }
 	 });  		 
	 
	 console.log("dirname: "+__dirname);
    // thumb picture
	/*for (var i = 0; i< insectLength; i++) {
		var file = insects[i];
		console.log("destination: "+__dirname+"/public/"+file['Image']);
		im.resize({
  			srcPath: __dirname+"/public/"+file['Image'],
  			dstPath: __dirname+"/public/"+file['Image']+"_thumb.jpg",
  			width:   100,
  			height: 100
		}, function(err, stdout, stderr) {
  		if (err) throw err;
  			console.log('resized file: '+__dirname+"/public/"+file['Image']);
		});		
	}*/
	 res.redirect('/#/main');
	  	
 });	
});

app.get('/insect/search', function (req, res) {
	
	var primaryColor = req.query.primaryColor;	
	var secondaryColor = req.query.secondaryColor;
	var category =req.query.category;
	var legs = req.query.legs;
	console.log('primaryColor: '+req.query.primaryColor+' ,secondaryColor: '+req.query.secondaryColor+', legs:'+req.query.legs);
	var query = Insect.find();
	if (req.query.category) {
		query.where('category').equals(category);	
	}	
	if (req.query.primaryColor) {
		query.where('primaryColor').equals(primaryColor);	
	}	
	if (req.query.secondaryColor) {
		query.where('secondaryColor').equals(secondaryColor);	
	}	
	if (req.query.legs) {
		query.where('legs').equals(legs);	
	}	
	
	console.log("searching");
		
	query.exec(function(err, insects) {
		if (err) throw err;
		console.log(insects);
		console.log(JSON.stringify(insects));
		res.send(insects);
	});
	
}); 
 
 app.get('/insect/list', function(req, res) {
	 
	 	Insect.find({}, function (err, insects) {
    		if (err) {
				console.log(err);
			} 
    		    		
			console.log('found insects: '+insects);
			res.send(insects);    	
    	});
    	
 });
 
 
 app.get('/collection/list', function(req, res) {
	 	if (req.isAuthenticated()) {
		 	Compendium.findOne({'_user': req.user.id}, function (err, compendium) {
	    		if (err) {
					console.log(err);
				} 
	    		    	
				console.log('found compendium: '+compendium);
				console.log("insects in compendium: "+JSON.stringify(compendium.insects));
				// find the insects
				var ids=compendium.insects;
				console.log("ids: "+ids);			                             

				Insect.find().where('_id').in(ids).sort('category').exec(function(err, results) {
					if (err) throw err;
					console.log("results: "+results);
					res.send(results);
				});
			
    		});
    	}
    		
 });

app.get("/collection/remove", function (req, res) {

	console.log("searching user's compendium");
	Compendium.findOne({'_user': req.user.id}, function(err, compendium) {
		compendium.insects=[];
		console.log("saving compendium");
		compendium.save(function (err) {
			console.log("compendium:"+compendium);
			console.log('saved compendium. ');
			res.redirect('#/main');		
		});	
	});
}); 


/* Upload insect */
app.post('/insect/populate', upload.array('userPhotos', 100), function(req, res) {
	// thumb picture
	for (var i = 0; i< req.files.length; i++) {
		var file = req.files[i];
		console.log("destination: "+file.destination+file.filename);
		im.resize({
  			srcPath: file.destination+file.filename,
  			dstPath: file.destination+file.filename+"_thumb.jpg",
  			width:   100,
  			height: 100
		}, function(err, stdout, stderr) {
  		if (err) throw err;
  			console.log('resized file: '+file.filename);
		});		
	}
	res.redirect('#/main');
});

/* Upload insect */
app.post('/insect/insert', upload.array('userPhotos', 10), function(req, res) {
	console.log("uploading insect");
	var newInsect = new Insect();
	
	console.log("image: "+req.files[0]);
	if (req.files.length>1) {
		console.log("image2: "+req.files[1]);
		
	}
	for (var ind in req.files) {
		console.log("file ind: "+ind);
		newInsect.images.push('images/'+req.files[ind].originalname);	
	}
	//console.log("image name: "+req.file.originalname);

	console.log("wiki: "+req.body.wiki);
	newInsect.latinName=req.body.latinName;
	newInsect.legs=req.body.legs;
	newInsect.territory=req.body.territory;
	newInsect.primaryColor=req.body.primaryColor;
	newInsect.secondaryColor=req.body.secondaryColor;
	newInsect.wiki=req.body.wiki;
	
	var translations=[];
	translations.push({"language": "en", "name": req.body.enName});
	translations.push({"language": "fi", "name": req.body.fiName});
	newInsect.names=translations;
	
	if (req.body.imageLinks) {
		console.log("imagelinks: "+req.body.imageLinks);
		var imageUrls = req.body.imageLinks.split(',');	
		
		for (var ind in imageUrls)		
			newInsect.images.push(imageUrls[ind]);
	}
	newInsect.category=req.body.category;
		
	// thumb picture
	for (var i = 0; i< req.files.length; i++) {
		var file = req.files[i];
		console.log("destination: "+file.destination+file.filename);
		im.resize({
  			srcPath: file.destination+file.filename,
  			dstPath: file.destination+file.filename+"_thumb.jpg",
  			width:   100,
  			height: 100
		}, function(err, stdout, stderr) {
  		if (err) throw err;
  			console.log('resized file: '+file.filename);
		});		
	}
	
		
 	console.log('newInsect: '+newInsect);
 	newInsect.save(function (err) {
 		if (err) throw err;
 		console.log('Insect saved');
 		res.redirect("/#/main");
 	});	

});

 

 
 app.get('/collection/insert', function(req, res) {
		console.log('searching user by email');
		console.log('user: '+req.user);
		console.log('user\'s email: '+req.user.local.email);
		User.findOne({ 'local.email' :  req.user.local.email}, function(err, user) {
			console.log('found user\'s email');		
  			if (err) {
  			 console.log(err);
  			}
  			// find the user's collection
  			console.log('user: '+req.user.id);
  			
  			console.log('insectId: '+req.query.insectId);
  			Compendium.findOne({'_user': req.user.id}, function(err, compendium) {
  				console.log('found a user\'s compendium');
  				if (compendium) {
  					console.log('updating a collection');
					compendium.insects.push(req.query.insectId);
					console.log('updated compendium: '+compendium);
					compendium.save(function (err) {
						if (err) throw err;
						console.log('updated compendium item');
					});				
				}
				else {

					// create a new collection
					console.log('creating a new collection');
					var newCompendium = new Compendium();
					newCompendium._user = req.user.id;
					console.log('newCompendium.insects: '+newCompendium.insects);
					newCompendium.insects.push(req.query.insectId); 
					//newCompendium.insects.push(req.params.insectId);
					//newCompendium._user=req.user.id;
					console.log('newCompendium: '+newCompendium);
					newCompendium.save(function (err) {
						if (err) throw err;
						console.log('saved compendium item');
					});
					
				}
				res.send(req.user);
				/*
			  Compendium.find({}, function(err, compendiums) {
 				if (err) throw err;
 					console.log('compendiums: '+compendiums);
 					res.send(compendiums);
 				});*/
			});
			console.log('after searching a user\'s collection');
			
 		});
 		
 	});
	 
	app.get('/currentUser', function(req, res) {
		if (req.isAuthenticated()) {
			
			var _user = {};
			_user = req.user;
			console.log('current user: '+req.user);
			res.send(_user);
		}
		else 
			res.send(null);
	});


	
	 // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
    	  res.sendFile('index.html');
    });
	 // a full list of insects    
    app.get('/user/list', function(req, res) {
    	// get all the insects
    	
    	var email = 'mauri.f@suomi.fi';
    	console.log("before database record is created");
    	
    	var insectCollection= new Insect();
    	console.log("after database record creation");
    	
    	Insect.find({}, function (err, insects) {
    		if (err) {
				console.log(err);
			} 
    		    		
			console.log('found insects: '+insects);    	
    	});
    	User.findOne({ 'local.email' :  email }, function(err, user) {
		//user.find({}, function(err, insects) {
  			if (err) {
  			 console.log(err);
  			}
			// object of all the users
			console.log('found user: '+user);
			res.send(user);  
		}); //
			
			
    }); //


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    }); //
    
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/#/main', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    })); //

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    }); //

    // process the signup form
    /*app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));*/ //
    
    passport.use('signup', new LocalStrategy({
    	passReqToCallback : true },
  	 		function (req, email, password, username, done) {
    	findOrCreateUser = function() {
    	console.log('email:'+email);
    	console.log('req.email:'+req.email);
      // find a user in Mongo with provided username
      User.findOne({'email':email},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          //res.render('signup.ejs', {});
          return done(null, false, 
			             
            req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.email = req.param('email');
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

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        }); //
    }); //

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

}