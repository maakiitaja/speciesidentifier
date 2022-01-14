/* Directives */

var myApp = angular.module("insectIdentifierApp");

myApp.directive("fileModel", [
  "$parse",
  function ($parse) {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        console.log("filemodel directive.");
        element.bind("change", function () {
          scope.$apply(function () {
            modelSetter(scope, element[0].files[0]);
          });
        });
      },
    };
  },
]);

myApp.directive("fileread", [
  function () {
    return {
      scope: {
        fileread: "=",
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          var reader = new FileReader();
          reader.onload = function (loadEvent) {
            scope.$apply(function () {
              scope.fileread = loadEvent.target.result;
            });
          };
          reader.readAsDataURL(changeEvent.target.files[0]);
        });
      },
    };
  },
]);

myApp.directive("footer", function () {
  return {
    restrict: "A", //This means that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
    replace: true,
    templateUrl: "../partials/footer.html",
    controller: ["$scope", function ($scope) {}],
  };
});

/** file upload */
myApp.directive("customOnChange", function () {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.on("change", onChangeHandler);
      element.on("$destroy", function () {
        element.off();
      });
    },
  };
});

myApp.directive("ngResize", function ($window) {
  return {
    scope: {
      ngResize: "=",
    },
    link: function ($scope, element, attrs) {
      function onResize() {
        if ($scope.ngResize.fromAddObservationsCtrl) {
          var vw = getVw();
          if (vw >= 860) {
            console.log("vw >= 860px");
            $scope.ngResize.withoutIdentifyBtnSmCond = false;
            $scope.ngResize.withoutIdentifyBtnMdCond = true;
          } else {
            console.log("vw < 860px");
            $scope.ngResize.withoutIdentifyBtnSmCond = true;
            $scope.ngResize.withoutIdentifyBtnMdCond = false;
          }
          $scope.$apply();
        }
      }

      function cleanUp() {
        console.log("resize directive cleanup");
        angular.element($window).off("resize", onResize);
      }

      angular.element($window).on("resize", onResize);
      $scope.$on("$destroy", cleanUp);

      console.log("resize directive");
    },
  };
});

myApp.directive("resizev2", [
  "$window",
  function ($window) {
    return {
      link: link,
      restrict: "A",
    };

    function link(scope, element, attrs) {
      console.log("resizev2 directive start");

      function onResize() {
        scope.vw = getVw();
        // uncomment for only fire when $window.innerWidth change
        // if (scope.width !== $window.innerWidth)
        {
          console.log("resize event with width: ", scope.vw);
          console.log("directive resize scope: ", scope);
          scope.$digest();
        }
      }

      function cleanUp() {
        console.log("resize directive cleanup");
        angular.element($window).off("resize", onResize);
      }

      angular.element($window).on("resize", onResize);
      scope.$on("$destroy", cleanUp);
    }
  },
]);

myApp.directive("header", function () {
  return {
    restrict: "A", //This means that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
    replace: true,
    templateUrl: "../partials/header.html",
    controller: [
      "$scope",
      "$filter",
      "$cookies",
      "UserRestService",
      "Auth",
      "TranslationService",
      "$location",
      "$route",
      "$localStorage",
      function (
        $scope,
        $filter,
        $cookies,
        UserRestService,
        Auth,
        TranslationService,
        $location,
        $route,
        $localStorage
      ) {
        if (!$cookies.get("lang")) {
          console.log("no lang chosen.");
          $cookies.put("lang", "en");
        }
        console.log("header directive.");
        $scope.location = $location;
        $scope.lang = $cookies.get("lang");

        TranslationService.getTranslation($scope, $cookies.get("lang"), "");

        UserRestService.requestCurrentUser(function (data) {
          console.log("header Ctrl user: " + JSON.stringify(data));
          Auth.set(data);
          $scope.currentUser = JSON.parse(JSON.stringify(data));
          var tmp = JSON.parse(JSON.stringify(data));
          console.log("tmp: " + tmp);
          console.log("tmp.username: " + tmp.username);
          console.log("header currentuser: " + $scope.currentUser);
          console.log(
            "header currentuser.username: " + $scope.currentUser.username
          );

          $scope.openMobileNav = function () {
            var header = document.getElementById("header");
            header.classList.toggle("nav-open");
          };

          $scope.closeMobileNav = function () {
            var header = document.getElementById("header");
            header.classList.toggle("nav-open");
          };

          $scope.collection = function () {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            // var dropbtnEls = document.querySelectorAll("dropbtn");
            // dropbtnEls.forEach(function (el) {
            //   el.classList.remove("dropbtn-selected");
            //   el.classList.add("dropbtn-nonselected");
            // });
            // // add the selected class to the current nav item
            // var collectionEl = document.getElementById("collection-button");
            // collectionEl.classList.add("dropbtn-selected");
            // collectionEl.classList.remove("dropbtn-nonselected");

            // loop through all the menu items and remove the highlighted/selected css class
            var searchEl = document.getElementById("search-header");
            searchEl.classList.remove("dropbtn-selected");
            searchEl.classList.add("dropbtn-nonselected");

            var manageEl = document.getElementById("manage-button");
            if (manageEl) {
              manageEl.classList.remove("dropbtn-selected");
              manageEl.classList.add("dropbtn-nonselected");
            }

            var observationEl = document.getElementById("observation-button");
            if (observationEl) {
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            } else {
              var observationEl = document.getElementById(
                "observation-button-browse"
              );
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            }

            var loginEl = document.getElementById("login");
            if (loginEl) {
              loginEl.classList.remove("dropbtn-selected");
              loginEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected images
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.add("dropbtn-selected");
            collectionEl.classList.remove("dropbtn-nonselected");

            $scope.location.path("collection");
          };
          $scope.search = function () {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            // var dropbtnEls = document.querySelectorAll("dropbtn");
            // dropbtnEls.forEach(function (el) {
            //   el.classList.remove("dropbtn-selected");
            //   el.classList.add("dropbtn-nonselected");
            // });
            // // Set the current menu item as selected
            // var searchEl = document.getElementById("search-header");
            // searchEl.classList.add("dropbtn-selected");
            // searchEl.classList.remove("dropbtn-nonselected");

            // loop through all the menu items and remove the highlighted/selected css class
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.remove("dropbtn-selected");
            collectionEl.classList.add("dropbtn-nonselected");

            var manageEl = document.getElementById("manage-button");
            if (manageEl) {
              manageEl.classList.remove("dropbtn-selected");
              manageEl.classList.add("dropbtn-nonselected");
            }

            var observationEl = document.getElementById("observation-button");
            if (observationEl) {
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            } else {
              var observationEl = document.getElementById(
                "observation-button-browse"
              );
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            }

            var loginEl = document.getElementById("login");
            if (loginEl) {
              loginEl.classList.remove("dropbtn-selected");
              loginEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected
            var searchEl = document.getElementById("search-header");
            searchEl.classList.add("dropbtn-selected");
            searchEl.classList.remove("dropbtn-nonselected");

            $scope.location.path("search");
          };
          $scope.upload = function () {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.remove("dropbtn-selected");
            collectionEl.classList.add("dropbtn-nonselected");

            var searchEl = document.getElementById("search-header");
            searchEl.classList.remove("dropbtn-selected");
            searchEl.classList.add("dropbtn-nonselected");

            var observationEl = document.getElementById("observation-button");
            if (observationEl) {
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            } else {
              var observationEl = document.getElementById(
                "observation-button-browse"
              );
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected
            var manageEl = document.getElementById("manage-button");
            manageEl.classList.add("dropbtn-selected");
            manageEl.classList.remove("dropbtn-nonselected");

            $scope.location.path("insect/upload");
          };

          $scope.modify = function (currentUser) {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.remove("dropbtn-selected");
            collectionEl.classList.add("dropbtn-nonselected");

            var searchEl = document.getElementById("search-header");
            searchEl.classList.remove("dropbtn-selected");
            searchEl.classList.add("dropbtn-nonselected");

            var observationEl = document.getElementById("observation-button");
            if (observationEl) {
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            } else {
              var observationEl = document.getElementById(
                "observation-button-browse"
              );
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected
            var manageEl = document.getElementById("manage-button");
            manageEl.classList.add("dropbtn-selected");
            manageEl.classList.remove("dropbtn-nonselected");

            $scope.location
              .path("insect/uploadList")
              .search({ currentUser: currentUser });
          };
          $scope.addObservation = function (currentUser) {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.remove("dropbtn-selected");
            collectionEl.classList.add("dropbtn-nonselected");

            var searchEl = document.getElementById("search-header");
            searchEl.classList.remove("dropbtn-selected");
            searchEl.classList.add("dropbtn-nonselected");

            var manageEl = document.getElementById("manage-button");
            if (manageEl) {
              manageEl.classList.remove("dropbtn-selected");
              manageEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected
            var observationEl = document.getElementById("observation-button");
            observationEl.classList.add("dropbtn-selected");
            observationEl.classList.remove("dropbtn-nonselected");

            $scope.location
              .path("addObservations")
              .search({ currentUser: currentUser });
          };
          $scope.browseObservation = function (currentUser) {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.remove("dropbtn-selected");
            collectionEl.classList.add("dropbtn-nonselected");

            var searchEl = document.getElementById("search-header");
            searchEl.classList.remove("dropbtn-selected");
            searchEl.classList.add("dropbtn-nonselected");

            var manageEl = document.getElementById("manage-button");
            if (manageEl) {
              manageEl.classList.remove("dropbtn-selected");
              manageEl.classList.add("dropbtn-nonselected");
            }

            var loginEl = document.getElementById("login");
            if (loginEl) {
              loginEl.classList.remove("dropbtn-selected");
              loginEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected
            var observationEl = document.getElementById("observation-button");
            if (observationEl) {
              observationEl.classList.add("dropbtn-selected");
              observationEl.classList.remove("dropbtn-nonselected");
            } else {
              var observationEl = document.getElementById(
                "observation-button-browse"
              );
              observationEl.classList.add("dropbtn-selected");
              observationEl.classList.remove("dropbtn-nonselected");
            }

            $scope.location
              .path("browseObservations")
              .search({ currentUser: currentUser });
          };

          $scope.setLanguage = function (lang) {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            $cookies.put("lang", lang);
            console.log("lang: " + lang);
            TranslationService.getTranslation($scope, $cookies.get("lang"), "");
            $scope.lang = lang;
            $route.reload();
          };
          $scope.login = function () {
            var header = document.getElementById("header");
            header.classList.remove("nav-open");

            // loop through all the menu items and remove the highlighted/selected css class
            var collectionEl = document.getElementById("collection-button");
            collectionEl.classList.remove("dropbtn-selected");
            collectionEl.classList.add("dropbtn-nonselected");

            var searchEl = document.getElementById("search-header");
            searchEl.classList.remove("dropbtn-selected");
            searchEl.classList.add("dropbtn-nonselected");

            var manageEl = document.getElementById("manage-button");
            if (manageEl) {
              manageEl.classList.remove("dropbtn-selected");
              manageEl.classList.add("dropbtn-nonselected");
            }

            var observationEl = document.getElementById("observation-button");
            if (observationEl) {
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            } else {
              var observationEl = document.getElementById(
                "observation-button-browse"
              );
              observationEl.classList.remove("dropbtn-selected");
              observationEl.classList.add("dropbtn-nonselected");
            }

            // Set the current menu item as selected
            var loginEl = document.getElementById("login");
            loginEl.classList.add("dropbtn-selected");
            loginEl.classList.remove("dropbtn-nonselected");

            $scope.location.path("login");
          };
        });
      },
    ],
  };
});

myApp.directive("connectivity", function () {
  return {
    link: function (scope, element, attrs) {
      element.bind("load", function (e) {
        // success, "onload" catched
        // now we can do specific stuff:

        console.log("this.id: " + this.id);
        var id = "";
        console.log("scope: " + scope);
        console.log("scope.mainimageUrl: " + scope.mainImageUrl);
        var isMainImage = false;
        if (this.id == "mainimage") {
          id = scope.currentMainImageUrl;
          isMainImage = true;
        } else id = this.id;

        checkconnectivity(id, isMainImage);
      });
    },
  };
});

/*

myApp.directive('searchrepeater',  function($timeout, $rootScope) {

  return {	

	
	link: function(scope, element, attrs) {
		console.log('search repeater');
	    if (scope.$last){
		console.log('updating scope.');
		$timeout(function() {
			$rootScope.$apply(function() {
				$rootScope.filterupdate = true;
			});

			
			scope.$apply(function() {
				console.log('searchrepeater: filter update');
          			scope.filterupdate = true;
        		});
		});
		
	      // iteration is complete, do whatever post-processing
	      // is necessary
		console.log('last element');
		var e = element.find('img');

		console.log('e: '+JSON.stringify(e));
	
		var el  =element.find('img')[0];
		console.log('el: '+JSON.stringify(el));

		var src = element.find('img')[0].src;
		console.log('src: '+src);
		var id = element.find('img')[0].name;
		console.log('name: '+JSON.stringify(name));

		var alt = element.find('img')[0].alt;
		console.log('id: '+JSON.stringify(alt));

		var src = element.find('img').attr('src');
		console.log('src: '+src);
	
    	    }
  	}
    }
});
*/
myApp.directive("englishname", [
  "$q",
  function ($q) {
    return {
      require: "ngModel",
      link: function (scope, elm, attrs, ctrl, $q) {
        console.log("englishname directive called.");
        ctrl.$validators.englishname = function (modelValue, viewValue, $q) {
          var def = $q.defer();

          if (ctrl.$isEmpty(modelValue)) {
            def.reject();
          } else {
            def.resolve();
          }
          return def.promise;
        };
      },
    };
  },
]);
