"use strict";

/* Services */

var insectIdentifierServices = angular.module("insectIdentifierServices", [
  "ngResource",
]);

insectIdentifierServices.factory("Phone", [
  "$resource",
  function ($resource) {
    return $resource(
      "../phones/:phoneId.json",
      {},
      {
        query: { method: "GET", params: { phoneId: "phones" }, isArray: true },
      }
    );
  },
]);

insectIdentifierServices.factory("Insect", [
  "$resource",
  function ($resource) {
    return $resource(
      "../phones/:categoryName.json",
      {},
      {
        query: {
          method: "GET",
          params: { categoryName: "kovakuoriaiset" },
          isArray: true,
        },
      }
    );
  },
]);

insectIdentifierServices.factory("Search", function () {
  var savedData = {};

  function set(data) {
    savedData = data;
  }

  function get() {
    return savedData;
  }

  return {
    set: set,
    get: get,
  };
});

insectIdentifierServices.factory(
  "redirectInterceptor",
  function ($q, $location, $window) {
    return {
      response: function (response) {
        if (
          typeof response.data === "string" &&
          response.data === "not authenticated"
        ) {
          console.log("LOGIN!!");
          //console.log(response.data);
          $window.location.href = "/#/login.html";
          return $q.reject(response);
        } else {
          return response;
        }
      },
    };
  }
);

insectIdentifierServices.factory(testInterceptor);

var testInterceptor = function ($q) {
  return {
    request: function (config) {
      console.log("request started...");
    },
    // requestError: function (rejection) {
    //   console.log(rejection);
    //   // Contains the data about the error on the request and return the promise rejection.
    //   return $q.reject(rejection);
    // },
    // response: function (result) {
    //   console.log("data for " + result.data.name + " received");
    //   //If some manipulation of result is required before assigning to scope.
    //   result["testKey"] = "testValue";
    //   console.log("request completed");
    //   return result;
    // },
    // responseError: function (response) {
    //   console.log("response error started...");
    //   //Check different response status and do the necessary actions 400, 401, 403,401, or 500 eror
    //   return $q.reject(response);
    // },
  };
};

insectIdentifierServices.config([
  "$httpProvider",
  function ($httpProvider) {
    $httpProvider.interceptors.push("redirectInterceptor");
    //$httpProvider.interceptors.push(testInterceptor);
  },
]);

insectIdentifierServices.factory("TranslationService", [
  "$resource",
  "Search",
  function ($resource, Search) {
    return {
      getTranslation: function ($scope, language, page) {
        var languageFilePath = "translations/" + page + language + ".json";
        $resource(languageFilePath).get(function (data) {
          console.log("translation service");
          var obj = Search.get();
          obj.translations = data;
          Search.set(obj);
          if ($scope) {
            console.log("setting translations for scope");
            $scope.translations = data;
          }
        });
      },
    };
  },
]);

insectIdentifierApp.factory("UserRestService", [
  "$http",
  function ($http) {
    return {
      requestCurrentUser: function (callback) {
        $http
          .get("/currentUser")
          .success(function (data) {
            callback(data);
          })
          .error(function () {
            console.log("currentUser error.");
            callback(null);
          });
      },
    };
  },
]);

insectIdentifierApp.factory("ModalService", [
  function () {
    var modals = [];
    return {
      Add: function (modal) {
        // add modal to array of active modals
        modals.push(modal);
      },
      Open: function (id) {
        // open modal specified by id
        var modal = modals.find((modal) => modal.id === id);
        console.log("modal is: ", modal);
        modal.open(id);
      },
      Remove: function (id) {
        // remove modal from array of active modals
        var modalToRemoveInd = modals.findIndex((modal) => {
          if (modal.id === id) return true;
        });
        console.log("modalToRemoveInd", modalToRemoveInd);
        modals.splice(modalToRemoveInd, 1);
      },

      Close: function (id) {
        // close modal specified by id
        var modal = modals.find((modal) => modal.id === id);
        console.log("modal is: ", modal);

        modal.close(id);
      },
      Get: function (id) {
        var modal = modals.find((modal) => modal.id === id);
        console.log("modal is: ", modal);
        return modal;
      },
    };
  },
]);

insectIdentifierApp.factory("SearchService", [
  "$http",
  function ($http) {
    return {
      search: function (
        $scope,
        query,
        page,
        itemsPerPage,
        $localStorage,
        selectFirstInsect
      ) {
        return new Promise((resolve, reject) => {
          console.log("query: " + query);

          if (query == "" || typeof query == "undefined") {
            $scope.searchResults = "Please, provide search parameters";
            console.log("query is empty");
          } else {
            // show loading spinner
            toggleLoadingSpinner($scope);

            // disable search button
            $scope.disableSearch = true;

            $http({
              url: "/insects/search",
              method: "GET",
              params: {
                primaryColor: query.primaryColor,
                secondaryColor: query.secondaryColor,
                category: query.category,
                legs: query.legs,
                name: query.name,
                page: page,
                itemsPerPage: itemsPerPage,
                //language: query.language,
              },
            }).success(function (response) {
              const data = response.insects;
              const totalCount = response.totalCount;

              console.log("receiving search results.");
              console.log("$scope:", $scope);

              $scope.mainImageUrl = null;

              // in case coming from observation page, reset the hidden insect id just in case
              if ($scope.fromObservationPage) {
                $scope.insectId = null;
              }

              console.log(
                "search results:" + data + " with length: " + data?.length
              );
              //console.log(JSON.stringify(data));
              if (data === undefined || data.length == 0) {
                $scope.searchResults = "noResults";
                $scope.insect = null;
              } else {
                // in case coming from observation page, validate the latinname input
                if ($scope.fromObservationPage) {
                  console.log(
                    "searchservice setting $scope.observationLatinNameRequired to nonrequired"
                  );
                  $scope.observationLatinNameRequired = 0;
                }

                var imgs = [];
                // make a list of image urls
                var len = data.length;
                for (var i = 0; i < len; i++) {
                  //console.log("data[i].images[0]", data[i].images[0]);

                  var replacedImagePath = encodeURIComponent(data[i].images[0]);
                  //console.log("replaced image value: ", replacedImagePath);

                  data[i].images[0] = replacedImagePath;
                  imgs.push(replacedImagePath);
                }
                if (selectFirstInsect) {
                  console.log("selecting first insect");
                  $scope.insect = data[0];
                  $scope.mainImageUrl = data[0].images[0];
                }

                $scope.insects = data;
                console.log("determining style classes for search results");
                // determine necessary style classes for taking care of hiding pagination etc.
                responsiveSearch($scope, itemsPerPage, totalCount);

                $localStorage.searchResults = data;
                $localStorage.totalSearchCount = totalCount;
                $localStorage.searchQuery = query;

                console.log("imgs:", imgs);
                $scope.imgs = imgs;
                console.log(
                  "search service, setting mainimage: " + data[0].images[0]
                );

                // in case coming from observation page
                if ($scope.fromObservationPage == "1") {
                  console.log(
                    "coming from observation page: setting hidden insectId and latinname"
                  );

                  $scope.insectId = data[0]._id;
                  $scope.params.observationLatinName = data[0].latinName;
                }

                console.log("showing search results");
                $scope.searchResults = "showResults";
              }

              // Hide spinner element
              toggleLoadingSpinner($scope);

              // Enable search button
              $scope.disableSearch = false;
              resolve({ msg: "ok", totalCount: totalCount });
            });
          } /* end of search*/
        });
      },
    };
  },
]);

insectIdentifierApp.factory("Auth", [
  "$cookies",
  function ($cookies) {
    var _user = {};

    return {
      user: _user,

      set: function (user) {
        // you can retrive a user setted from another page, like login sucessful page.
        var existing_cookie_user = $cookies.get("current.user");
        if (Array.isArray(existing_cookie_user))
          console.log("existing_user is an array");
        console.log("Auth set user parameter: " + JSON.stringify(user));

        $cookies.put("current.user", user);
      },

      remove: function () {
        $cookies.remove("current.user", _user);
      },
    };
  },
]);
