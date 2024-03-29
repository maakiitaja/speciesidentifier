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
// see: https://stackoverflow.com/questions/17922557/angularjs-how-to-check-for-changes-in-file-input-fields
myApp.directive("customOnChange", function () {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {
      console.log("custom on change directive");
      var onChangeHandler = scope.$eval(attrs.customOnChange);
      element.on("change", onChangeHandler);
      element.on("$destroy", function () {
        element.off();
      });
    },
  };
});

myApp.directive("latinName", function ($http, $q) {
  return {
    require: "ngModel",
    link: function (scope, element, attrs, ngModel) {
      ngModel.$asyncValidators.latinNameExists = async function (
        modelValue,
        viewValue
      ) {
        console.log("viewvalue: ", viewValue);
        //console.log("scope.insect.latinName: ", scope.insect.latinName);
        // check whether the new value is the same as the scope valueProperties

        if (
          scope.insect &&
          firstLetterToUppercase(viewValue) === scope.insect.latinName
        ) {
          scope.latinNameReserved = false;
          scope.latinNameExists = true;
          console.log("viewvalue equals scope value");
          return $q.resolve();
        }

        // check if the value is empty
        if (viewValue === "") {
          console.log("viewvalue is empty");
          scope.latinNameReserved = false;
          //scope.latinNameExists = false;
          return $q.reject();
        }

        const response = await $http({
          method: "GET",
          url: "/insects/latin-name-exists",
          params: { latinName: viewValue },
        });

        console.log("response latinname exist: ", response.data.msg);

        if (response.data.msg === true) {
          // latin-name-exists
          if (!scope.fromObservationPage) {
            console.log("rejecting");
            scope.latinNameReserved = true;
            return $q.reject();
            // latin name does not exist
          } else {
            console.log("resolving");
            scope.latinNameExists = true;
            return $q.resolve();
          }
        }
        // message was null, given latin name does not exist
        if (!scope.fromObservationPage === true) {
          console.log("response ok");
          scope.latinNameReserved = false;
          return $q.resolve();
        } else {
          console.log("response not ok");
          scope.latinNameExists = false;
          return $q.reject();
        }
      };
      var firstLetterToUppercase = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
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
        console.log(
          "$scope.ngResize.insectsLength:",
          $scope.ngResize.insectsLength
        );
        if ($scope.ngResize.insectsLength === 1) {
          console.log("insects length is 1");
          $scope.ngResize.largePictureOnly = true;
          $scope.ngResize.containerInsectThumbsHigh = false;
          return;
        }
        var vw = getVw();
        if (vw >= 860) {
          console.log("vw >= 860px");
          console.log(
            "$scope.ngResize.hidePagination:",
            $scope.ngResize.hidePagination
          );
          if ($scope.ngResize.hidePagination) {
            console.log("container insect thumbs high: true");
            $scope.ngResize.containerInsectThumbsHigh = true;
            $scope.ngResize.largePictureOnly = false;
          }
        } else {
          console.log("vw < 860 px");
          if ($scope.ngResize.hidePagination) {
            console.log("setting thumbs container to high: false");
            $scope.ngResize.containerInsectThumbsHigh = false;
          }
        }
        $scope.$apply();
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

myApp.directive("modal", Directive);

function Directive(ModalService) {
  return {
    link: function (scope, element, attrs) {
      // ensure id attribute exists
      if (!attrs.id) {
        console.error("modal must have an id");
        return;
      }
      console.log("element: ", element);
      console.log("attrs:", attrs);
      // move element to bottom of page (just before </body>) so it can be displayed above everything else
      //element.append("body");

      //close modal on background click
      // element.on("click", function (e) {
      //   var target = $(e.target);
      //   if (!target.closest(".modal-body").length) {
      //     scope.$evalAsync(Close);
      //   }
      // });

      // add self (this modal instance) to the modal service so it's accessible from controllers
      var modal = {
        id: attrs.id,
        open: Open,
        close: Close,
      };
      console.log("modal: ", modal);
      ModalService.Add(modal);

      // remove self from modal service when directive is destroyed
      scope.$on("$destroy", function () {
        ModalService.Remove(attrs.id);
        element.remove();
      });

      // open modal
      function Open(id) {
        //document.getElementById(attrs.id).style.display = "block";
        console.log("id: ", id);
        if (id === "new-local-items-no-remote-modal") {
          console.log("setting new local-items-no-remote-modal to true");
          scope.newLocalItemsNoRemoteModal = 1;
        }
        if (id === "updated-items-modal") {
          console.log("setting updated-items-modal class to true");
          scope.updatedItemsModal = 1;
        }
        if (id === "new-remote-items-modal") {
          scope.newRemoteItemsModal = 1;
        }
        if (id === "new-local-items-modal") {
          console.log("setting newLocalItemsModal to true");
          scope.newLocalItemsModal = 1;
        }

        if (id === "session-expiration-modal") {
          console.log("setting sessionExpiration to true");
          scope.sessionExpiration = 1;
        }
        $("body").addClass("modal-open-own");
      }

      // close modal
      function Close(id) {
        console.log("id: ", id);
        if (id === "new-local-items-no-remote-modal")
          scope.newLocalItemsNoRemoteModal = 0;
        if (id === "updated-items-modal") scope.updatedItemsModal = 0;
        if (id === "new-remote-items-modal") {
          scope.newRemoteItemsModal = 0;
        }
        if (id === "new-local-items-modal") {
          scope.newLocalItemsModal = 0;
        }
        if (id === "session-expiration-modal") {
          scope.sessionExpiration = 0;
        }
        $("body").removeClass("modal-open-own");
      }
    },
  };
}

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
      "$rootScope",
      "ModalService",
      function (
        $scope,
        $filter,
        $cookies,
        UserRestService,
        Auth,
        TranslationService,
        $location,
        $route,
        $localStorage,
        $rootScope,
        ModalService
      ) {
        // initialize current user for header menu item highlighing to work when reloading a page
        //$scope.currentUser = {};

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

          $scope.openModal = function (id) {
            console.log("ModalService: ", ModalService);
            ModalService.Open(id);
          };

          $scope.closeModal = function (id, buttonId) {
            console.log("buttonId:", buttonId, "id:", id);
            $scope.modalPressed = buttonId;
            ModalService.Close(id);
          };

          console.log("header currentuser: " + $scope.currentUser);
          let username = $scope.currentUser.username;
          if (username?.length > 20) {
            username = username.slice(0, 9) + "...";
            $scope.currentUser.username = username;
          }
          const githubjwt = $cookies.get("githubjwt");
          console.log("githubjwt: " + githubjwt);
          if (data && githubjwt) {
            console.log("setting expiration timer");
            const decoded = jwtDecode(githubjwt);
            const exp = decoded.exp * 1000;
            const now = Date.now();
            console.log("decoded.iat:" + new Date(decoded.iat * 1000));
            console.log("decoded.exp:" + new Date(decoded.exp * 1000));
            setTimeout(async function () {
              console.log("opening modal");
              $scope.openModal("session-expiration-modal");
              $scope.remainingTime = Math.round(exp / 1000 - now / 1000 - 5);
              while (
                $scope.modalPressed === undefined ||
                $scope.modalPressed === null
              ) {
                await wait(1);
                if ($scope.remainingTime > 0) {
                  $scope.remainingTime = $scope.remainingTime - 1;
                }
                $scope.$apply();
              }

              if ($scope.modalPressed === "continue") {
                console.log("continuing");
              }
              if ($scope.modalPressed === "logout") {
                console.log("logging out");

                const els = angular
                  .element(document.getElementById("logout-div"))
                  .find("a")[0];
                console.log("els: ", els);
                els.click();
              }
            }, exp - now - 25 * 1000);
          }
        });

        $scope.openMobileNav = function () {
          var header = document.getElementById("header");
          header.classList.toggle("nav-open");
        };

        $scope.closeMobileNav = function () {
          var header = document.getElementById("header");
          header.classList.toggle("nav-open");
        };

        $scope.resetHeader = function () {
          resetHeader();
        };

        $scope.highlightElement = function (el) {
          highlightElement(el);
        };

        $scope.disableMobileNavigation = function () {
          var header = document.getElementById("header");
          header.classList.remove("nav-open");
        };

        $scope.createAlbum = function () {
          $scope.disableMobileNavigation();
          $scope.resetHeader();

          $scope.location.path("create-album");
        };

        $scope.viewAlbums = function () {
          $scope.disableMobileNavigation();
          $scope.resetHeader();

          $scope.location.path("album-list").search({ sharedAlbums: 0 });
        };

        $scope.sharedAlbums = function () {
          $scope.disableMobileNavigation();

          $scope.resetHeader();

          $scope.location.path("album-list").search({ sharedAlbums: 1 });
        };

        $scope.collection = function () {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          $scope.highlightElement("collection-button");

          $location.url($location.path());
          $scope.location.path("collection");
        };
        $scope.search = function () {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          $scope.highlightElement("search-header");
          $location.url($location.path());
          $scope.location.path("search");
        };
        $scope.upload = function () {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          $scope.highlightElement("manage-button");

          $location.url($location.path());
          $scope.location.path("insect/upload");
        };

        $scope.modify = function (currentUser) {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          $scope.highlightElement("manage-button");

          $scope.location
            .path("insect/uploadList")
            .search({ currentUser: currentUser });
        };
        $scope.addObservation = function (currentUser) {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          if (currentUser) {
            $scope.highlightElement("observation-button");
          }

          $scope.location
            .path("addObservations")
            .search({ currentUser: currentUser });
        };
        $scope.browseObservation = function (currentUser) {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          if (currentUser) {
            $scope.highlightElement("observation-button");
          } else {
            $scope.highlightElement("observation-button-browse");
          }

          $scope.location
            .path("browseObservations")
            .search({ currentUser: currentUser });
        };

        $scope.setLanguage = function (lang) {
          $scope.disableMobileNavigation();

          $cookies.put("lang", lang);
          console.log("lang: " + lang);
          TranslationService.getTranslation($scope, $cookies.get("lang"), "");
          $scope.lang = lang;
          $route.reload();
        };
        $scope.login = function () {
          $scope.disableMobileNavigation();

          $scope.resetHeader();
          $scope.highlightElement("login");

          $scope.location.path("login");
        };
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
