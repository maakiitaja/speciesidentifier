'use strict';
//lets require/import the mongodb native drivers.
	//var mongodb = require('mongodb');
/* Controllers */

var insectIdentifierControllers = angular.module('insectIdentifierControllers', []);

insectIdentifierControllers.controller('UploadListCtrl', ['$scope', 'Search', '$location', '$http', '$localStorage', 
	function ($scope, Search, $location, $http, $localStorage) {
		
		console.log('uploadlist ctrl current User:'+$location.search().currentUser._id);
		$http({
		  	url: '/uploadList', 
			method: "GET",
			params: {userId: $location.search().currentUser._id}
			}).success(function(data) {
				//alert("received uploaded insects");
				console.log('received insects images: '+data[0].images);
				console.log('1st insect: '+data[0].latinName);
				
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
	
	  		// save the insect to the scope
	  		$scope.prevUrl=Search.get().prevUrl;
			$scope.insect=Search.get().insect;
			console.log('prevUrl: '+$scope.prevUrl);
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
 				 						
			$scope.setImage = function(img) {		
				$scope.mainImageUrl=img;					  			
	    	};
	  		
	 		$scope.add_to_collection=function() {
				var insectsByCategory = {'Ant': [], 'Beetle':[], 'Butterfly': [], 'Caterpillar': [], 'Spider': []};
				var duplicate = 0;
	 			if ($localStorage.collection) {
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
						if (!duplicate)	
							$localStorage.collection[$scope.insect.category].push($scope.insect);
					}
					else {
						$localStorage.collection[$scope.insect.category].push($scope.insect);											
					} 
						 			
				}
	 			else {
					$localStorage.collection=[];
					$localStorage.collection = insectsByCategory;
					$localStorage.collection[$scope.insect.category].push($scope.insect); 
								
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
	 		$scope.itemsPerPage = 5;
   		$scope.currentPage = 0;
			$scope.pagedInsects = [];
			
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
		 				category: query.category, legs: query.legs }
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
			  			console.log("showing search results");
						$scope.searchResults="showResults";

					}
		 		}); 		
		 		}			
			};
			
					
	  	   $scope.setImage = function(insect) {
				
				$scope.mainImageUrl=insect.images[0];
				$scope.insect=insect;
	    	};
	  	   $scope.insectDetail = function() {
	  	   	var obj = {};
	  	   	obj.insect = angular.copy($scope.insect);
	  	   	obj.prevUrl = "#/list";
	  	   	
	  	   	Search.set(obj);
				$scope.location.path('insect');
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
'$http', '$localStorage', "$cookies",
	function($scope, Search, $location, $http, $localStorage, $cookies) {

		$scope.lang=$cookies.get('lang');
		
		if ($localStorage.collection ==  null) {	  	
				$localStorage.collection = $scope.insectsByCategory;
		}

		$http.get('/collection/list').success(function(data) {
			// add items to the localstorage by category
			
			for (var ind in data) {
				var insect = data[ind];
				var duplicate  = 0;
				console.log("localStorage: "+JSON.stringify($localStorage));
				var t = $localStorage.collection[insect.category];
				console.log(t.length);
				console.log(t[0].name);
				for (var i = 0; i < t.length; i++) {
					var lsInsect = t[i];
					console.log(lsInsect.name);
					
					if (lsInsect.name == insect.name) {
						console.log("found duplicate between localstorage and server data");
						// found duplicate
						duplicate = true;																					
					}	
				}				
				if (!duplicate)	
					$localStorage.collection[insect.category].push(insect);
			}			
			console.log(JSON.stringify($localStorage.collection['Butterfly']));
				    				
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
			$scope.location.path('insect');
		};
		
  		
  }]);
