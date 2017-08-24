/* Directives */

var myApp = angular.module('insectIdentifierApp');

myApp.directive('fileModel', ['$parse', function ($parse) {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
			console.log("filemodel directive.");
        element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
            });
        });
    }
};
}]);

myApp.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);

myApp.directive('header', function () {
    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "../partials/header.html",
        controller: ['$scope', '$filter', '$cookies', 'UserRestService', 'Auth', 'TranslationService', 
        		'$location','$route',
        		function ($scope, $filter,	$cookies, UserRestService, Auth, TranslationService, $location, $route) {
			if (!$cookies.get('lang')) {
					console.log('no lang chosen.');
					$cookies.put('lang', 'en');	    	
		    	}
		    	console.log('header directive.');
		    	$scope.location=$location;
				$scope.lang=$cookies.get('lang');
			
			TranslationService.getTranslation($scope, $cookies.get('lang'), '');
		    			    	
		    	UserRestService.requestCurrentUser(function (data) {
	      	 	console.log("header Ctrl user: "+JSON.stringify(data));
   	    		Auth.set(data);
   	    		$scope.currentUser = JSON.parse(JSON.stringify(data));
   	    		var tmp = JSON.parse(JSON.stringify(data));
   	    		console.log('tmp: '+tmp);	
   	    		console.log('tmp.username: '+ tmp.username);
   	    		console.log("header currentuser: "+$scope.currentUser);
   	    		console.log("header currentuser.username: "+$scope.currentUser.username);

		    	
		    	
				$scope.collection=function() {
					$scope.location.path('collection');
				}
				$scope.search=function() {
					$scope.location.path('search');
				}
  				$scope.upload=function() {
					$scope.location.path('insect/upload');
				}
				$scope.addObservation=function(currentUser) {
					$scope.location.path('search').search({'fromObservationPage':'1', 'currentUser': currentUser});
				}
				$scope.browseObservation=function(currentUser) {
					$scope.location.path('browseObservations').search({'currentUser': currentUser});
				}
				$scope.modify=function(currentUser) {
					$scope.location.path('insect/uploadList').search({'currentUser': currentUser});
				}
				$scope.setLanguage = function(lang) {
					 $cookies.put('lang', lang);
					 console.log('lang: '+lang);
					 TranslationService.getTranslation($scope, $cookies.get('lang'), '');
					 $scope.lang=lang;
				 	 $route.reload();			
				}		

       		});
		  
        }]
    }
});

myApp.directive('connectivity', function () {       
    return {
        link: function(scope, element, attrs) {   

            element.bind("load" , function(e) { 

                // success, "onload" catched
                // now we can do specific stuff:
  
                console.log('this.id: '+this.id);
		var id = '';
		console.log('scope: '+scope);
		console.log('scope.mainimageUrl: '+scope.mainImageUrl);
		var isMainImage = false;
		if (this.id == 'mainimage') {
			id = scope.currentMainImageUrl;
			isMainImage=true;
		}
		else 
			id = this.id;
		
		checkconnectivity(id, isMainImage);
            });
        }
    }
});

myApp.directive('englishname', ['$q', function($q) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl, $q) {
      console.log("englishname directive called.");
      ctrl.$validators.englishname = function(modelValue, viewValue, $q) {
		  var def = $q.defer();
        
        if (ctrl.$isEmpty(modelValue)) {																																																																																		
           	 																																																																																																																																																														
          def.reject();
        } else {
        	def.resolve();																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
        	}
        return def.promise;
      };
    }
  };
}]);
