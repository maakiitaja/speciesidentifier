// load up the user model
var User            = require('./models/user');
var Compendium            = require('./models/compendium');
var Insect           = require('./models/insect');
var fs = require('fs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var multer = require('multer');
var im = require('imagemagick');

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
		 				
				newInsect.translations=[];
				console.log("writing translations");
				for (var j = 0; j < insect['names'].length; j++) {
				
					newInsect.translations.push({"language": insect['names'][j].language, 
						"name": insect['names'][j].name});							
				}
				console.log('newinsect translations: '+newInsect.translations);				
				newInsect.userId = "1"; // default
				newInsect.latinName=insect['LatinName'];
				newInsect.legs=insect['Legs'];
				newInsect.territory=insect['Territory'];
				newInsect.primaryColor=insect['PrimaryColor'];
				newInsect.secondaryColor=insect['SecondaryColor'];
				newInsect.wiki=insect['Wiki'];
				newInsect.images = [];
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
		 			console.log(JSON.parse(JSON.stringify(newInsect)));
		 			console.log(newInsect.translations[0].name);
		 			console.log(newInsect.latinName);
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
				if (compendium== null) {
					res.send(null);
				} else {
	    		    	
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
				}
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

/* Load user's uploaded insects */
app.get('/uploadList', function(req, res) {
	console.log('userId: '+req.query.userId);
	Insect.find({'userId': req.query.userId}).exec(function (err, insects) {
    	if (err) {
			console.log(err);
		} 
    		    		
		console.log('found insects: '+insects);
		res.send(insects);    	
    });	
})

/* Load an insect */
app.get('/insect/load', function(req, res) {
	Insect.find({'userId': req.query.userId}).exec(function(err, results) {
		if (err) throw err;
		console.log("results: "+results);
		insect = results;
		res.send(results);
	});
});

/* Upload or modify insect */
app.post('/insect/insert', upload.array('userPhotos', 10), function(req, res) {
	console.log("uploading or modifying insect");
	console.log("isupload: "+req.body.isUpload);
	console.log("insectId: "+req.body.insectId);
	console.log('userId:' +req.user.id);
	

	var isUpload = req.body.isUpload;
	var handleUpload = function(req, res, insect) {
		if (req.files.length> 1 ) {
			console.log("image2: "+req.files[1]);
		}

		console.log("wiki: "+req.body.wiki);
		insect.latinName=req.body.latinName;
		insect.legs=req.body.legs;
		insect.primaryColor=req.body.primaryColor;
		insect.secondaryColor=req.body.secondaryColor;
		insect.wiki=req.body.wiki;
		insect.category=req.body.category;
		insect.userId=req.user.id;
		console.log('insect.translations: '+insect.translations);
	
		if (isUpload) {
			console.log('adding new translations');
			console.log(insect);
			insect.translations = [];
			insect.translations.push({"language": "en", "name": req.body.enName});
			insect.translations.push({"language": "fi", "name": req.body.fiName});
		} else {
			console.log('updating names.');
			console.log('insect.translations[0]: '+insect.translations[0]);
			console.log('insect.translations[0].name: '+insect.translations[0].name);
			insect.translations[0].name = req.body.enName;
			insect.translations[1].name = req.body.fiName;		
		}
		console.log('insect.translations: '+insect.translations);
		console.log('insect.translations[0]: '+insect.translations[0]);
		console.log('insect.translations[0].name: '+insect.translations[0].name);
		
		console.log('read body variables.');
	
		if (req.body.imageLinks) {
			console.log("imagelinks: "+req.body.imageLinks);
			var imageUrls = req.body.imageLinks.split(',');	
		
			for (var ind in imageUrls)		
				insect.images.push(imageUrls[ind]);
		}
		console.log('creating thumb picture');
		// thumb picture
		for (var i = 0; i< req.files.length; i++) {
			var file = req.files[i];
			console.log("destination: "+file.destination+file.filename);
			im.resize({
  				srcPath: file.destination+file.filename,
  				dstPath: file.destination+file.filename+"_thumb.jpg",
  				width:   150,
  				height: 150
			}, function(err, stdout, stderr) {
  			if (err) throw err;
  				console.log('resized file: '+file.filename);
			});		
		}
		
 		if (isUpload == '1') {
 			console.log('saving insect');
 			insect.save(function (err) {
 				if (err) throw err;
 				console.log('Insect saved');
 				console.log('insect: '+insect);
 				res.redirect("/#/main");
 			});
 		}	else {
 			console.log("updating insect")
 			var update = {"wiki": insect.wiki,
				"category": insect.category,
				"primaryColor": insect.primaryColor,
				"secondaryColor": insect.secondaryColor,
				"legs": insect.legs,
				"images": insect.images,
				"latinName": insect.latinName,
				"imageLinks": insect.imageLinks,
				"translations": insect.translations };
 			var conditions = {"_id": insect._id};
 			var options = { multi: true } ;
 			var callback = function callback (err, numAffected) {
  				// numAffected is the number of updated documents
  				if (err) throw err;
  				console.log("insect updated");
  				res.redirect("/#/main");
			};
			
			 Insect.update(conditions, update, options, callback);
		}
	}
	
		if (isUpload == '0') {
			console.log('modifying insect');
			/* Modify */
			Insect.find({'_id': req.body.insectId}).exec(function(err, results) {
				if (err) throw err;
				var insect = results[0];
			
			console.log(insect);
			
			console.log('removing selected images');
			/* Remove selected images */		
			console.log('insect.images:'+insect.images);
			var removedPhotoInd =0;
			console.log("images.length: "+insect.images.length);
			var imagesLength = insect.images.length;
			for (var i = 0; i < imagesLength; i++) {
				var ind = i - removedPhotoInd;
				var photo = insect.images[ind];
				console.log("photo: "+photo);
				console.log("photo in body: "+req.body[photo]);
				
				if (req.body[photo]) {
					console.log('removing photo: '+photo);
							
					insect.images.splice(ind,1);
					removedPhotoInd++;
					console.log('insect\'s images: '+insect.images);		
				}
				
			}
		
			console.log("adding new images ");
			// add possible new images
			for (var i = 0; i< req.files.length; i++) {
				console.log("req.files: "+req.files[i].originalname);
				/* check duplicates */
				var isDuplicate = false;
				for (var j = 0; j < insect.images.length; j++) {
					if (insect.images[j] == req.files[i].originalname) 
						isDuplicate = true;
				}
				if (!isDuplicate)
					insect.images.push('images/'+req.files[i].originalname);
				else 
					console.log("found duplicate: "+req.files[i].originalname);	
			}	
			handleUpload(req, res, insect);
		});
		
	} else {
		console.log('uploading insect');
		var insect = new Insect();
		insect.images = [];
		for (var ind in req.files) {
			console.log("file ind: "+ind);
			console.log("req.files[ind].originalname"+req.files[ind].originalname);
			insect.images.push('images/'+req.files[ind].originalname);	
		}	
		handleUpload(req,res, insect);
	}
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
        res.render('login.ejs', { message: req.flash('error') }); 
    });
    
    // process the login form
    app.post('/login', passport.authenticate('login', {
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
        res.render('signup.ejs', { message: req.flash('error') });
    }); //

    // process the signup form
    app.post('/signup', passport.authenticate('signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

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