"use strict";

/* App Module */

var insectIdentifierApp = angular.module("insectIdentifierApp", [
  "ngRoute",
  //'insectIdentifierAnimations',
  "insectIdentifierControllers",
  "insectIdentifierFilters",
  "insectIdentifierServices",
  "ngStorage",
  "ngCookies",
]);

/* Listen for online and offline events. 
https://stackoverflow.com/questions/16242389/how-to-check-internet-connection-in-angularjs
*/
insectIdentifierApp.run(function ($window, $rootScope) {
  $rootScope.online = navigator.onLine;
  $window.addEventListener(
    "offline",
    function () {
      $rootScope.$apply(function () {
        $rootScope.online = false;
      });
    },
    false
  );

  $window.addEventListener(
    "online",
    function () {
      $rootScope.$apply(function () {
        $rootScope.online = true;
      });
    },
    false
  );
});

insectIdentifierApp.config([
  "$locationProvider",
  function ($locationProvider) {
    //$locationProvider.html5Mode(false).hashPrefix("!");
  },
]);
insectIdentifierApp.config(function ($httpProvider) {
  //Enable cross domain calls
  $httpProvider.defaults.useXDomain = true;
});
insectIdentifierApp.config([
  "$routeProvider",
  function ($routeProvider) {
    $routeProvider
      .when("/phones", {
        templateUrl: "partials/phone-list.html",
        controller: "PhoneListCtrl",
      })
      .when("/phones/:phoneId", {
        templateUrl: "partials/phone-detail.html",
        controller: "PhoneDetailCtrl",
      })
      .when("/search", {
        templateUrl: "partials/search.html",
        controller: "SearchCtrl",
      })
      .when("/list", {
        templateUrl: "partials/list.html",
        controller: "ListCtrl",
      })
      .when("/insect", {
        templateUrl: "partials/insect-detail.html",
        controller: "InsectDetailCtrl",
      })
      .when("/main", {
        templateUrl: "partials/search.html",
        controller: "SearchCtrl",
      })
      .when("/collection", {
        templateUrl: "partials/collection.html",
        controller: "CollectionCtrl",
      })
      .when("/insect/upload", {
        templateUrl: "partials/upload-insect.html",
        controller: "UploadInsectCtrl",
      })
      .when("/insect/uploadList", {
        templateUrl: "partials/upload-list.html",
        controller: "UploadListCtrl",
      })
      .when("/browseObservations", {
        templateUrl: "partials/browse-observations.html",
        controller: "BrowseObservationsCtrl",
      })
      .when("/addObservations", {
        templateUrl: "partials/search.html",
        controller: "AddObservationsCtrl",
      })
      .when("/login", {
        templateUrl: "partials/login.html",
        controller: "LoggingCtrl",
      })
      .when("/logout", {
        templateUrl: "partials/search.html",
        controller: "LoggingCtrl",
      })
      .when("/signup", {
        templateUrl: "partials/signup.html",
        controller: "SignupCtrl",
      })
      .when("/login-failure", {
        templateUrl: "partials/login.html",
        controller: "LoggingFailureCtrl",
      })
      .when("/signup-failure", {
        templateUrl: "partials/signup.html",
        controller: "SignupCtrl",
      })
      .when("/fileuploaderror", {
        templateUrl: "partials/fileuploaderror.html",
        controller: "FileUploadErrorCtrl",
      })
      .otherwise({
        redirectTo: "/login",
      });
  },
]);
