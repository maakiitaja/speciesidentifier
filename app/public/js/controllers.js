'use strict';
//lets require/import the mongodb native drivers.
	//var mongodb = require('mongodb');
/* Controllers */

var insectIdentifierControllers = angular.module('insectIdentifierControllers', []);

insectIdentifierControllers.controller('BrowseObservationsCtrl', ['$scope', 'Search', '$location', '$http', '$localStorage', 
	function ($scope, Search, $location, $http, $localStorage) {
		console.log('browse observation ctrl');
		
		// init datepicker
		var weekday = [$scope.translations.MONDAY, $scope.translations.TUESDAY, $scope.translations.WEDNESDAY, 
$scope.translations.THURSDAY, $scope.translations.FRIDAY, $scope.translations.SATURDAY, $scope.translations.SUNDAY];
		var monthtime = [$scope.translations.JANUARY, $scope.translations.FEBRUARY, $scope.translations.MARCH, $scope.translations.APRIL, $scope.translations.MAY, $scope.translations.JUNE, $scope.translations.JULY, $scope.translations.AUGUST, $scope.translations.SEPTEMBER, $scope.translations.OCTOBER, $scope.translations.NOVEMBER, $scope.translations.DECEMBER];
			
		init_times(monthtime, weekday); 
		init_close($scope.translations.CLOSE);

		$scope.searchObservations= function(query) {
			// convert the date to javascript date
			// YYYY-MM-DD
			var formattedDate=document.getElementById('startDate').value;
			var startDate = new Date();
			startDate.setYear(formattedDate.substring(0,4));
			startDate.setMonth(formattedDate.substring(5,7));
			startDate.setDate(formattedDate.substring(8,10));
			
			formattedDate=document.getElementById('endDate').value;;
			var endDate = new Date();
			endDate.setYear(formattedDate.substring(0,4));
			endDate.setMonth(formattedDate.substring(5,7));
			endDate.setDate(formattedDate.substring(8,10));

			$http({
		  		url: '/observation/browse', 
				method: "GET",
				params: {userId: $location.search().currentUser._id, location: query.location, country: query.country, place: query.place, startDate: query.startDate, endDate: query.endDate, name: query.name, language: query.language, category: query.category, nofarm: query.nofarm, organicFarm: query.organicFarm, nonOrganicFarm: query.nonOrganicFarm }
			}).success(function(data) {
				console.log('received observations: '+JSON.stringify(data));
				$scope.observations = data;
				for (var i = 0; i < data.length; i++) {
					var formattedDate = new Date();
					var rawDate = new Date(data[i].date);
					console.log('rawdate: '+rawDate);
					/*formattedDate.setYear(rawDate.getYear());
					formattedDate.setMonth(rawDate.getMonth());
					formattedDate.setDate(rawDate.getDate());*/
					var formattedDate = ds_format_date(rawDate.getDate(), rawDate.getMonth(), rawDate.getYear());	
					console.log('year: '+rawDate.getYear());
					console.log('formatted date: '+formattedDate);
					$scope.observations[i].date = formattedDate;
					if (data[i].farm) {
						if (data[i].organicFarm) 	
							$scope.observations[i].farmType= $scope.translations.ORGANICTYPE;
						else 
							$scope.observations[i].farmType = $scope.translations.NONORGANICTYPE;
					} else
						$scope.observations[i].farmType = $scope.translations.NOFARM;
				}				
				
				if (data) 

					$scope.searchResults = "showResults";
				else
					$scope.searchResults = "noResults";
			});
		}
	}
]);

insectIdentifierControllers.controller('UploadListCtrl', ['$scope', 'Search', '$location', '$http', '$localStorage', 
	function ($scope, Search, $location, $http, $localStorage) {
		
		console.log('uploadlist ctrl current User:'+$location.search().currentUser._id);
		$http({
		  	url: '/uploadList', 
			method: "GET",
			params: {userId: $location.search().currentUser._id}
			}).success(function(data) {
				//alert("received uploaded insects");
				if (data[0]) {
					console.log('received insects images: '+data[0].images);
					console.log('1st insect: '+data[0].latinName);
				}
				
				// order by category
				var list = {};		
				var categories = [];
				var listLength = 0;
				console.log('data.length: '+data.length);
				console.log('data: '+data);
				
				for (var i = 0; i < data.length; i++) {
					// check if the category exists
					var categoryExists = false;
					for (var j = 0; j < listLength; j++) {
						console.log('list[data[i].category]: '+list[data[i].category]);
						if (list[data[i].category]) {
							console.log('category: '+data[i].category+' exists.');
							categoryExists = true;
							break;						
						}	
					}					
					
						
					if (!categoryExists) {
						
						console.log("adding a category: "+data[i].category);
						list[data[i].category] = [];
						
						
					}
					console.log("adding an item: "+data[i]);
					listLength++;
					list[data[i].category].push(data[i]);
						
					
					console.log(list[data[i].category]);
					//console.log("category's "+data[i].category+" "+i+"st item:"+list[data[i].category][i]);					
				}
				console.log(JSON.stringify(list['Butterfly']));
				console.log(JSON.stringify(list));
				$scope.uploadList = list;
				$scope.insect = data[0];
		 });		
		
		$scope.upload = function(insect) {
			
			$scope.location.path('insect/upload').search({'insect': insect, 'fromUploadListPage': '1'});
		}
	}
	
]);

insectIdentifierControllers.controller('UploadInsectCtrl', ['$scope', 'Search', '$location', '$http', '$localStorage',
	  function($scope, Search, $location, $http, $localStorage) {
	  		// create a blank object to handle form data.
      	
      	if ($location.search().fromUploadListPage == '1') {
		$location.search().fromUploadListPage = 0;
      		console.log('filling loaded insect\'s fields');
      
				var insect = $location.search().insect;		
				console.log(insect);
				$scope.insect = insect;
				console.log('insect.translations: '+insect.translations);
				console.log('insect.translations[0]: '+insect.translations[0]);
				console.log('insect.translations[0].name: '+insect.translations[0].name);
				
				if (insect.translations.length > 0) {
					$scope.enName = insect.translations[0].name;
					$scope.fiName = insect.translations[1].name;
				}
				$scope.latinName = insect.latinName;
				$scope.wiki = insect.wiki;
				$scope.primaryColor = insect.primaryColor;
				$scope.secondaryColor = insect.secondaryColor;
				$scope.legs = '0'+insect.legs;
				$scope.category = insect.category;
				$scope.uploadedPhotos = insect.images;
				$scope.isRequired = false;	
				console.log("uploadedphotos: "+$scope.uploadedPhotos);
												
				$scope.insectId = insect._id;
				$scope.isUpload = '0';
				$scope.photos = [];
			
				for (var i = 0; i< insect.images.length; i++)
					$scope.photos.push({name: insect.images[i], 'checked': '0'});
				
				console.log('scope.photos: '+$scope.photos);
				console.log('scope.photos[0].name: '+$scope.photos[0].name);
				
				$scope.checkPhotoRequired = function(photo) {
					// check if the clicked remove checkbox is non-ticked
					console.log('photo: '+photo);
					console.log('photo.name: '+photo.name);
					console.log('photo.checked: '+photo.checked);
					
					if (photo.checked) {
	
						// loop remove-checkboxes
						var isRequired = true;
						for (var i =  0; i < $scope.photos.length; i++) {
							if (!$scope.photos[i].checked) {
								console.log('found non-ticked photo checkbox');
								$scope.isRequired = false;
							}														
						}
						$scope.isRequired = isRequired;	
					} else {
						console.log('found the clicked checkbox to be non-ticked.');
						$scope.isRequired = false;					
					}
				}
		 	}	
			else {
				$scope.isUpload = '1';
				$scope.isRequired = '1';
			}
	  }
]);

insectIdentifierControllers.controller('InsectDetailCtrl', ['$scope', 'Search', '$location', '$http', 
	'$localStorage', '$cookies',
	  function($scope, Search, $location, $http, $localStorage, $cookies) {
			
			if ($localStorage.connected!='1') {
				$scope.connected=0;	
				console.log('detailctrl: not connected');				
			} else {
				$scope.connected=1;
				console.log('detailctrl: connected');
			}
			$scope.localStorage = $localStorage;
		
			// save the insect to the scope
	  		$scope.prevUrl=$location.search().prevUrl;
			$scope.insect=$location.search().insect;
			console.log('prevUrl: '+$scope.prevUrl);
			console.log('insect: '+$scope.insect);
			$scope.lang=$cookies.get('lang');
	  		$scope.location=$location;
	  	  		
	  		//get the wiki description
	  		var wikilink="https://"+$cookies.get("lang")+".wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&"+
	  			"explaintext=&titles="+$scope.insect.wiki+'&callback=?';
	  		$.getJSON(wikilink, function(data) {
	  			if (data.query) {
	  				var pages=data.query.pages;
	    				for (var prop in pages) {
	    					var description = JSON.stringify(data.query.pages[prop].extract);
	    				}
	    				 
		    			console.log(description);
		    			var res=description.replace("\"", '');
		    			res=description.replace("\"", '');
		    			res= res.replace("\\", '');
		    			console.log(res);
		    			
					$scope.description=res;
				}
	  		});

	  		var insect = $scope.insect;
	  		console.log(insect.images);
			$scope.mainImageUrl = insect.images[0];
				
			$scope.pic = function(index) {
				window.alert('pic '+$scope.insect.images[index]+' :'+$localStorage[$scope.insect.images[index]]);
			}			
			$scope.setImage = function (img) {
				if ($localStorage.connected != '1') {
					$scope.mainImageUrl = img;
					console.log('setImage (not connected)');
					console.log($scope.mainImageUrl);
				}
				else
					$scope.mainImageUrl = img;			
			}
		
			$scope.setImageUrl = function (img) {
				if ($localStorage.getItem('connected') != '1')	{
					var url = $localStorage.getItem(img);
					console.log('url: '+url);
					img = url;
					// loop through thumb images
				}
			}

			$scope.getBase64FromImage =function(id,name) {
			    console.log('getbase64fromimageurl, id: '+id+' and name: '+name);
			    var img = getImg(id,name);
			    		    
				/*	
			    var img = new Image();
			    if (name!= id) {
				/* load image from the server 
				img.src = name;
				console.log('image : '+img);
	
			    }   else  
			        img = document.getElementById(id);
				*/

			    img.setAttribute('crossOrigin', 'anonymous');

			    img.onload = function () {
				console.log('img.onload');
			        var canvas = document.createElement("canvas");
				console.log('this.width: '+this.width+' this.height: '+this.height);
				
				// thumb.jpg
				console.log('name.substring: '+name.substring(name.length-9,name.length));
				if (name.substring(name.length-9,name.length) == 'thumb.jpg') {
					// resize
					img.width =150;
	                        	img.height = 150;
					canvas.width = 150;
					canvas.heigth = 150;
				} else {
				        canvas.width =this.width;
				       	canvas.height =this.height;
				}
				
			        var ctx = canvas.getContext("2d");
			        ctx.drawImage(this, 0, 0);

			        var dataURL = canvas.toDataURL("image/png");

			        alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));

				// set to localstorage
				//name = name.replace(/^ ', "");
	
				console.log('saving image with name: '+name+' to localstorage');
				$localStorage[name] = dataURL;
				var tmp = $localStorage[name];
				console.log('saved item: '+tmp);
				//console.log(JSON.stringify($localStorage));
    			};
}
			$scope.saveImagesToLocalStorage = function() {
				/* loop through insect's images */	
				console.log('saving images to local storage');	
					
				for (var i = 0; i < $scope.insect.images.length; i++) {
					// full pics
					console.log('before saving image to localstorage');
					$scope.getBase64FromImage('mainimage', $scope.insect.images[i],$localStorage);
					console.log('after saving image to localstorage');
					
					// thumbs
					if ($scope.insect.images.length > 1) {
						$scope.getBase64FromImage($scope.insect.images[i]+"_thumb.jpg",$scope.insect.images[i]+"_thumb.jpg", $localStorage);
						console.log('saved thumb to localstorage');
					}
					else {
						$scope.getBase64FromImage('mainimage',$scope.insect.images[i]+"_thumb.jpg", $localStorage);
						console.log('saved and resized thumb to localstorage');
					}		
				}
			}

			$scope.removeFromCollection = function(insect) {
				$http({
			   		url: '/collection/remove', 
		 			method: "GET",
		 			params: { _id: insect._id }
		 		}).success(function(data) {
					console.log('data: '+data);
					if (data == 'success') {
						console.log('removed insect: '+insect.latinName +' from collection');
						alert ($translations.REMOVEDINSECTFROMCOLLECTION);
					}	
					else {
						alert ($translations.FAILEDTOREMOVEINSECTFROMCOLLECTION);
						console.log('failed to remove insect');
					}
				});
			}  		
	 		$scope.add_to_collection=function() {
				var insectsByCategory = {'Ant': [], 'Bee': [], 'Beetle':[], 'Butterfly': [], 'Caterpillar': [], 'Spider': []};
				var duplicate = 0;
				
				$localStorage.collection =null;
	 			if ($localStorage.collection) {
					console.log('category: '+$scope.insect.category);
	 				if ($localStorage.collection[$scope.insect.category].length > 0) {
		 						 				
		 				var duplicate = 0;
						// search matches
						
						var t = $localStorage.collection[$scope.insect.category];
						
						console.log(t);
						//console.log(t[0].names[0].name);
						for (var i = 0; i < t.length; i++) {
							var lsInsect = t[i];
							console.log(lsInsect._id);
							
							if (lsInsect._id == $scope.insect._id) {
								console.log("found duplicate between localstorage and server data");
								// found duplicate
								duplicate = true;																					
							}
							
						}				
						if (!duplicate)	{
							$localStorage.collection[$scope.insect.category].push($scope.insect);
							console.log('not a duplicate');
							$scope.saveImagesToLocalStorage();
						}
					}
					else {
						$localStorage.collection[$scope.insect.category].push($scope.insect);				console.log('found no insects int the category: '+$localStorage.collection[$scope.insect.category]);				
						$scope.saveImagesToLocalStorage();
					} 
						 			
				}
	 			else {
					$localStorage.collection=[];
					$localStorage.collection = insectsByCategory;
					$localStorage.collection[$scope.insect.category].push($scope.insect); 
					console.log('initialized localstorage');
					$scope.saveImagesToLocalStorage();
								
	 			}
	 			// save to the server
	 			if (!duplicate) {
		 			$http({
				   	url: '/collection/insert', 
		    			method: "GET",
		    			params: {insectId: $scope.insect._id}
		 			}).success(function(data) {
						alert($scope.translations.ITEMSAVED); 			
		 			});
				} else 
					alert ($scope.translations.ITEMALREADYINCOLLECTION);					
	 		};
	 	
			$scope.collection=function() {
				$scope.location.path('collection');
			};		
			$scope.new_search=function() {
				
	 			$scope.location.path("search").search({"returningFromDetailPage": "1"});
	 			
			};		
  }]);

insectIdentifierControllers.controller('SearchCtrl', ['$scope', 'Search', '$location', '$http', '$localStorage',
	  function($scope, Search, $location, $http, $localStorage) {
	  	
		// Pagination
	 	$scope.itemsPerPage = 8;
   		$scope.currentPage = 0;
		$scope.pagedInsects = [];
		$scope.localStorage= $localStorage;
		$scope.selectExistingObservation = '0';
		$scope.place = "addobservationplace"; // default to add a new observation place

		$scope.toggleElements = function(elem, deactivated) {
			console.log('elem: '+elem+' hidden: '+deactivated);
			if (elem=='observationplace') {
				console.log('showing observationplace');
				$scope.place="selectobservation";
				$scope.selectExistingObservation = '1';
			}
			else {
				console.log('showing addobservation');
				$scope.place="addobservationplace";
				$scope.selectExistingObservation = '0';
			}
			
		}

		$scope.toggleFarmType = function() {
			var farmtype = document.getElementById('organicfarm');
			var nonorganicfarm = document.getElementById('nonorganicfarm');
			if (farmtype.disabled) {
				nonorganicfarm.disabled = false;
				farmtype.visibility = 'visible';
			}
			else {
				nonorganicfarm.disabled = true;
				farmtype.visibility = 'hidden';
			}
				
		}

		$scope.addObservation = function(query) {
			var params;
			// convert the date to javascript date
			// YYYY-MM-DD

			var formattedDate=document.getElementById('date').value;
			console.log('formatteddate: '+formattedDate);
			var date = new Date();
			date.setYear(formattedDate.substring(0,4));
			date.setMonth(formattedDate.substring(5,7));
			date.setDate(formattedDate.substring(8,10));
			console.log('latinname: '+query.observationLatinName);
			console.log('insectId: '+query.insectId);
			
			if ($scope.selectExistingObservation == '1') {
				console.log('adding observation with existing place');
				console.log('observationplace id: '+query.observationPlace);
				params = {insectId: document.getElementById('insectId').value, user: $location.search().currentUser, date: date, count: query.count, observationPlaceId: query.observationPlace, latinName: query.observationLatinName }; 
			}
			else {
				console.log('adding an observation without existing place');
				console.log('organicfarm: '+document.getElementById('organicFarm').checked);
				console.log('nonorganicfarm: '+document.getElementById('nonOrganicFarm').checked);
				console.log('nofarm: '+document.getElementById('nofarm').checked);

				console.log('insectId:'+document.getElementById('insectId').value);
				console.log('query.country: '+query.country);
				params = {country: query.country, location: query.location, count: query.count, date: date, place: query.place, organicFarm: document.getElementById('organicFarm').checked, nonOrganicFarm: document.getElementById('nonOrganicFarm').checked, user: $location.search().currentUser, latinName: query.observationLatinName, insectId: document.getElementById('insectId').value};			
			}

			$http({	url: '/observation/add', 
		 		method: "POST",
		 		params: params
		 	}).success(function (data) {
				alert('added an observation');
			});
		}
			
			$scope.fromObservationPage = $location.search().fromObservationPage;
			
			$scope.savetest = function() {
				savetest('abs.thumb.jpg');
			}
			$scope.onchange = function() {
				console.log('onchange');
			}
			
			$scope.setPagedInsects = function(insects) {

				$scope.nroOfPages = insects.length / $scope.itemsPerPage;
  				if (!isInt($scope.nroOfPages) ) {
  					$scope.nroOfPages = Math.floor($scope.nroOfPages); 
  					$scope.nroOfPages++;
  				}
  				console.log("nroofpages: "+$scope.nroOfPages);
  				// clear paged insects
				$scope.pagedInsects = [];
				// loop through nro of pages
				for (var i = 0; i < $scope.nroOfPages; i++) {
					// loop through nro of insects per page						
					for (var j = 0; j < $scope.itemsPerPage; j++) {
						if (j == 0) {
							$scope.pagedInsects[i] = [];							
						}						
						$scope.pagedInsects[i].push(insects[i*$scope.itemsPerPage + j]);
					}	
				}
					
			}	  		
	  		
			if ($location.search().fromObservationPage == '1') {	
				$scope.fromObservationPage = 1;
				$location.search().fromObservationPage = 0;
				// init datepicker
				var weekday = [$scope.translations.MONDAY, $scope.translations.TUESDAY, $scope.translations.WEDNESDAY, 
$scope.translations.THURSDAY, $scope.translations.FRIDAY, $scope.translations.SATURDAY, $scope.translations.SUNDAY];
				var monthtime = [$scope.translations.JANUARY, $scope.translations.FEBRUARY, $scope.translations.MARCH, $scope.translations.APRIL, $scope.translations.MAY, $scope.translations.JUNE, $scope.translations.JULY, $scope.translations.AUGUST, $scope.translations.SEPTEMBER, $scope.translations.OCTOBER, $scope.translations.NOVEMBER, $scope.translations.DECEMBER];
				
				init_times(monthtime, weekday); 
				init_close($scope.translations.CLOSE);

				console.log('returning from observation page');
				console.log('user: '+$location.search().currentUser);

				// fetch for user's stored observation places
				// get a list of beetles
		  		$http({
			   		url: '/observationplace/list', 
		 			method: "GET",
		 			params: { user: $location.search().currentUser }
		 		}).success(function (data) {
					alert('received observation places'+ data);
					
									
					console.log('showing observation places');
					console.log('data: '+JSON.stringify(data));
					var observationPlaceFormatted = [];
					for (var i = 0; i < data.length; i++) {
						var text = data[i].country+', '+data[i].location+', '+data[i].place;
						if (data[i].organicFarm) {
							console.log('organic farm');
							text = text.concat(', '+$scope.translations.ORGANICFARM);
							console.log('modfied text: '+text);
						}
						else if (data[i].farm && !data[i].organicFarm) {
							console.log('non organic farm');
							text = text.concat(', '+$scope.translations.NONORGANICFARM);
							console.log('modified text: '+text);
						}
						console.log('country: '+data[i].country+', organicfarm: '+data[i].organicFarm+', '+data[i].place+', '+data[i].location+', farm: '+data[i].farm);	
						observationPlaceFormatted.push({summary: text, id: data[i]._id});			
						
					}		
					console.log('observation places formatted: '+JSON.stringify(observationPlaceFormatted));
					$scope.observationPlaces = observationPlaceFormatted;
				});
			}

	  		if ($location.search().returningFromDetailPage == '1') {
	  			console.log('returning from detail page');
	  			
	  			$scope.searchResults="showResults";	
	  			var insects = $localStorage.searchResults;
	  			$scope.setPagedInsects(insects);
	  				  			
	  			// main image
	  			var imgs = [];
	  			for (var i=0; i<insects.length; i++) {
					imgs.push(insects[i].images[0]);  		
		  		}
		  		$scope.imgs = imgs;
		  		$scope.mainImageUrl=insects[0];
	  		}
	  		$scope.location=$location;
	 		
	 		$scope.search = function(query) {
	 			console.log("query: "+query);
						 			
	 			if (query =="" || typeof query == 'undefined') {
	 				$scope.searchResults = "Please, provide search parameters";
	 				console.log("query is empty");
	 	
	 			} else {
	 					 			
				// get a list of beetles
		  		$http({
			   	url: '/insect/search', 
		 			method: "GET",
		 			params: { primaryColor: query.primaryColor, secondaryColor: query.secondaryColor, 
		 				category: query.category, legs: query.legs, latinName: query.latinName }
		 		}).success(function (data) {
		 			
		 			console.log("receiving search results.")
		 			$scope.mainImageUrl = "not-available";
					console.log("search results:"+data+" with length: "+data.length);
					if (data.length == 0) {
						$scope.searchResults="noResults";
					} else {		
			 			$scope.insect=data[0];
				 			$scope.insects = data;	
			 			$localStorage.searchResults = data;
		 						
  						$scope.setPagedInsects(data);
  					  					
			 			var imgs=[];
				  	   	// make a list of image urls
			  			var len = data.length;
			  			for (var i=0; i<len; i++) {
							imgs.push(data[i].images[0]);  		
			  			}
			  			$scope.imgs = imgs;
						$scope.mainImageUrl = data[0].images[0];
			  			console.log("showing search results");
						$scope.searchResults="showResults";

						// in case coming from observation page
						// and search narrowed by name
						console.log('query.latinName: '+query.latinName);
						if (query.latinName != '' && $scope.fromObservationPage == '1') {
							console.log('setting latin name for add observation form');
							document.getElementById('observationLatinName').value = query.latinName;
							document.getElementById('insectId').value=data[0]._id;
						}


					}
		 		}); 		
		 		} /* end of search*/			
			};
			   $scope.setImage = function(insect) {
				
				$scope.mainImageUrl=insect.images[0];
				$scope.insect=insect;
				if ($scope.fromObservationPage == '1')
					document.getElementById('observationLatinName').value = insect.latinName;
	    	};
	  	   $scope.insectDetail = function() {
	  	   
	  	   	$location.path('insect').search({insect: $scope.insect, prevUrl: "#/list"});

	    	};
	    	
			$scope.range = function (start, end) {
        		var ret = [];
        		if (!end) {
            	end = start;
            	start = 0;
        		}
        		for (var i = start; i < end; i++) {
            	ret.push(i);
        		}
        		return ret;
    		};	    	
	    	
	    	$scope.prevPage = function () {
        		if ($scope.currentPage > 0) {
            	$scope.currentPage--;
        		}
    		};
    
    		$scope.nextPage = function () {
        		if ($scope.currentPage < $scope.pagedInsects.length - 1) {
            	$scope.currentPage++;
        		}
    		};
    
    		$scope.setPage = function () {
        		$scope.currentPage = this.n;
    		};
    		
 		   function isInt(value) {
 				 return !isNaN(value) && 
         	parseInt(Number(value)) == value && 
         	!isNaN(parseInt(value, 10));
			}
					
	  			
}]);
  
  
insectIdentifierControllers.controller('ListCtrl', ['$scope', 'Search', '$http', '$location',
  function($scope, Search, $http, $location) {

	
  		// save the search filter properties to the scope
  		var query = Search.get();
  		$scope.searchParams = query;
  		$scope.location=$location;
  		
  		// get a list of beetles
  		$http({
		   	url: '/insect/search', 
    			method: "GET",
    			params: {primaryColor: query.primaryColor, secondaryColor: query.secondaryColor, 
    				category: query.category, legs: query.legs }
 		}).success(function (data) {
 			 $scope.mainImageUrl = "not-available";
 			$scope.insects = data;
 			var imgs=[];
  	   	// make a list of image urls
  			var len=data.length;
  			for (var i=0; i<len; i++) {
				imgs.push(data[i].image);  		
  			}
  			$scope.imgs = imgs;
 			
 		});
 		
  	   $scope.setImage = function(insect) {
			
			$scope.mainImageUrl=insect.image;
			$scope.insect=insect;
  			$("#identify").prop('disabled', false);
    	};
  	   $scope.insectDetail = function() {
  	   	var obj = {};
  	   	obj.insect = angular.copy($scope.insect);
  	   	obj.prevUrl = "#/list";
  	   	
  	   	Search.set(obj);
			$scope.location.path('insect');
    	};
  }]);

insectIdentifierControllers.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();   
    $scope.orderProp = 'age';
  }]);

insectIdentifierControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;      
    };
  }]);

insectIdentifierControllers.controller('MainCtrl', ['$scope', 'Search', '$location', '$http', '$cookies', 
	'TranslationService', function($scope, Search, $location, $http, $cookies, TranslationService) {
 			$scope.location=$location;
			$scope.collection=function() {
				$scope.location.path('collection');
			}
			$scope.search=function() {
				$scope.location.path('search');
			}
  			$scope.upload=function() {
				$scope.location.path('insect/upload');
			}
				// pagination controls
					$scope.currentPage = 1;
					$scope.totalItems = 30;
					$scope.entryLimit = 8; // items per page
					$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
  }]);



insectIdentifierControllers.controller('CollectionCtrl', ['$scope', 'Search', '$location', 
'$http', '$localStorage', "$cookies", function($scope, Search, $location, $http, $localStorage, $cookies) {
	$scope.switchConnected = function() {
		if ($localStorage.connected == '0')	
			 $localStorage.connected = '1';
		else 
			$localStorage.connected = '0';
	}

		$scope.connected=$localStorage.connected;
		console.log('connected: '+$localStorage.connected);
		
		$scope.localStorage = $localStorage;
		$scope.tmp = "";
		var name = 'abc d';
		//console.log("$localstorage.abc d: "+$localStorage.name);
		var name = 'images/Scarabaeidae-Lehtisarviset tv20100621_081.jpg_thumb.jpg';
		console.log("$localStorage.name:" +$localStorage[name]);
		console.log("$scope.$localStorage.name:"+$scope.localStorage[name]);

		//console.log(JSON.stringify($localStorage));

		$scope.lang=$cookies.get('lang');
		$scope.upload=function() {
			console.log('upload');			
//			$scope.location.path('insect/upload');
		}
		
		if ($localStorage.collection ==  null) {	  	
			$localStorage.collection = $scope.insectsByCategory;
		}
		
		$http.get('/collection/list').success(function(data) {
			// add items to the localstorage by category
			
			for (var ind in data) {
				var insect = data[ind];
				var duplicate  = 0;
				//console.log("localStorage: "+JSON.stringify($localStorage));
				var t = $localStorage.collection[insect.category];
				//console.log(t.length);
				//console.log(t[0].name);
				for (var i = 0; i < t.length; i++) {
					var lsInsect = t[i];
					//console.log(lsInsect.name);
					
					if (lsInsect.name == insect.name) {
						//console.log("found duplicate between localstorage and server data");
						// found duplicate
						duplicate = true;																					
					}	
				}				
				if (!duplicate)	{
					// add thumbs from localstorage as needed
					
					$localStorage.collection[insect.category].push(insect);
				}
			}			
			
				    				
		}).error(function(){
			window.alert($scope.translations.REFRESHINGCOLLECTION);		   
		});		
		
		$scope.location=$location;
		$scope.localStorage=$localStorage;
			
		$scope.viewDetail = function(insect) {
		   	var obj = {};
  		   	obj.insect = angular.copy(insect);
  		   	obj.prevUrl = "#/collection";
  		   	Search.set(obj);
			$scope.location.path('insect').search({insect: insect, prevUrl: "#/collection"});
		};  
		
				
  }]);
