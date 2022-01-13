"use strict";
//lets require/import the mongodb native drivers.
//var mongodb = require('mongodb');
/* Controllers */

var insectIdentifierControllers = angular.module(
  "insectIdentifierControllers",
  []
);

insectIdentifierControllers.controller("LoggingCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  function ($scope, Search, $location, $http) {
    $scope.message = "";
    console.log("logging controller");
  },
]);

insectIdentifierControllers.controller("LoggingFailureCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  function ($scope, Search, $location, $http) {
    $scope.$watch("translations", function (val) {
      $scope.message = $scope.translations.INCORRECTCREDENTIALS;
    });

    console.log("logging failure controller, message: " + $scope.message);
  },
]);

insectIdentifierControllers.controller("BrowseObservationsCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  function ($scope, Search, $location, $http) {
    console.log("browse observation ctrl");
    $scope.dateRequired = { startDate: 1, endDate: 1 };
    $scope.dateRequired.startDate = 1;
    $scope.dateRequired.endDate = 1;
    $scope.disableSearch = false;
    //$scope.startDateRequired = 1;
    //$scope.endDateRequired = 1;

    $scope.$watch("translations", function (val) {
      console.log("inside scope.watch for translations");
      if (val) {
        console.log("initializing calendar");
        // init datepicker
        var weekday = [
          $scope.translations.MONDAY,
          $scope.translations.TUESDAY,
          $scope.translations.WEDNESDAY,
          $scope.translations.THURSDAY,
          $scope.translations.FRIDAY,
          $scope.translations.SATURDAY,
          $scope.translations.SUNDAY,
        ];
        var monthtime = [
          $scope.translations.JANUARY,
          $scope.translations.FEBRUARY,
          $scope.translations.MARCH,
          $scope.translations.APRIL,
          $scope.translations.MAY,
          $scope.translations.JUNE,
          $scope.translations.JULY,
          $scope.translations.AUGUST,
          $scope.translations.SEPTEMBER,
          $scope.translations.OCTOBER,
          $scope.translations.NOVEMBER,
          $scope.translations.DECEMBER,
        ];

        init_times(monthtime, weekday);
        init_close($scope.translations.CLOSE);
      }
    });

    $scope.ds_sh_search = function (el) {
      ds_sh(el, $scope);
    };

    $scope.toggleInsectSearch = function (visibility) {
      console.log(
        "search calendar close button: " + document.getElementById("cal_close")
      );
      if (visibility == 0) {
        console.log("showing by category");
        $scope.insectSearchSelection = "byCategory";
      } else {
        console.log("hide by category");
        $scope.insectSearchSelection = "byName";
      }
    };

    $scope.showByType = function (visibility) {
      console.log(
        "cal_close_startDate: " + document.getElementById("cal_close_startDate")
      );
      console.log(
        "cal_close_endDate: " + document.getElementById("cal_close_endDate")
      );
      console.log("day 1 button: " + document.getElementById("cal_day_1"));
      if (visibility == 1) {
        console.log("showing by type");
        $scope.typeSelection = "byType";
      } else {
        console.log("hide by type");
        $scope.typeSelection = "";
      }
    };

    $scope.searchObservations = function (query) {
      // show loading spinner
      var spinnerEl = document.getElementById("spinner-search");
      spinnerEl.classList.toggle("spinner-loading");
      // disable search button
      $scope.disableSearch = true;

      // convert the date to javascript date
      // YYYY-MM-DD
      var formattedDate = document.getElementById("startDate").value;

      var startDate = "";
      if (formattedDate != "") {
        startDate = new Date();
        startDate.setYear(formattedDate.substring(0, 4));
        startDate.setMonth(formattedDate.substring(5, 7) - 1);
        startDate.setDate(formattedDate.substring(8, 10));
        console.log("startdate: " + startDate);
      }

      formattedDate = document.getElementById("endDate").value;
      console.log("rawdate: " + document.getElementById("endDate").value);

      var endDate = "";
      if (formattedDate != "") {
        endDate = new Date();

        endDate.setYear(formattedDate.substring(0, 4));
        endDate.setMonth(formattedDate.substring(5, 7) - 1);
        endDate.setDate(formattedDate.substring(8, 10));
        console.log("enddate: " + endDate);
      }

      var byType = false;
      if ($scope.typeSelection == "byType") {
        byType = true;
        var nofarm = document.getElementById("nofarm").checked;
        var organicFarm = document.getElementById("organicFarm").checked;
        var nonOrganicFarm = document.getElementById("nonOrganicFarm").checked;
      }

      var name = "";
      var language = "";
      var category = "";
      if ($scope.insectSearchSelection == "byCategory") {
        category = query.category;
        name = "";
        language = "";
      } else if ($scope.insectSearchSelection == "byName") {
        name = query.name;
        language = query.language;
        category = "";
      }

      console.log("nofarm: " + nofarm);
      console.log("farmtype organicFarm: " + organicFarm);
      console.log("farmtype nonOrganicFarm: " + nonOrganicFarm);

      $http({
        url: "/observation/browse",
        method: "GET",
        params: {
          location: query.location,
          country: query.country,
          place: query.place,
          startDate: startDate,
          endDate: endDate,
          name: name,
          language: language,
          category: category,
          nofarm: nofarm,
          organicFarm: organicFarm,
          nonOrganicFarm: nonOrganicFarm,
          byType: byType,
        },
      }).success(function (data) {
        console.log("received observations: " + JSON.stringify(data));
        $scope.observations = data;
        for (var i = 0; i < data.length; i++) {
          var formattedDate = new Date();
          var rawDate = new Date(data[i].date);
          console.log("data[i].date: " + data[i].date);
          /*formattedDate.setYear(rawDate.getYear());
					formattedDate.setMonth(rawDate.getMonth());
					formattedDate.setDate(rawDate.getDate());*/
          var formattedDate = ds_format_date(
            rawDate.getDate(),
            rawDate.getMonth() + 1,
            rawDate.getFullYear()
          );
          console.log("year: " + rawDate.getFullYear());
          console.log("month: " + rawDate.getMonth());
          console.log("day: " + rawDate.getDate());
          console.log("formatted date: " + formattedDate);
          $scope.observations[i].date = formattedDate;
          console.log("data[i].organicFarm: " + data[i].organicFarm);
          if (data[i].organicFarm == true || data[i].organicFarm == false) {
            if (data[i].organicFarm)
              $scope.observations[i].farmType = $scope.translations.ORGANICTYPE;
            else
              $scope.observations[i].farmType =
                $scope.translations.NONORGANICTYPE;
          } else $scope.observations[i].farmType = $scope.translations.NOFARM;
        }

        if (data && data.length > 0) $scope.searchResults = "showResults";
        else $scope.searchResults = "noResults";

        // Hide spinner element
        spinnerEl.classList.toggle("spinner-loading");
        // Enable search button
        $scope.disableSearch = false;
      });
    };
  },
]);

insectIdentifierControllers.controller("UploadListCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  function ($scope, Search, $location, $http, $localStorage) {
    console.log(
      "uploadlist ctrl current User:" + $location.search().currentUser._id
    );

    $http({
      url: "/uploadList",
      method: "GET",
      params: { userId: $location.search().currentUser._id },
    }).success(function (data) {
      //alert("received uploaded insects");
      if (data[0]) {
        console.log("received insects images: " + data[0].images);
        console.log("1st insect: " + data[0].latinName);
      }

      // order by category
      var list = {};
      var categories = [];
      var listLength = 0;
      console.log("data.length: " + data.length);
      console.log("data: " + data);

      for (var i = 0; i < data.length; i++) {
        // check if the category exists
        var categoryExists = false;
        for (var j = 0; j < listLength; j++) {
          console.log("list[data[i].category]: " + list[data[i].category]);
          if (list[data[i].category]) {
            console.log("category: " + data[i].category + " exists.");
            categoryExists = true;
            break;
          }
        }

        if (!categoryExists) {
          console.log("adding a category: " + data[i].category);
          list[data[i].category] = [];
        }
        console.log("adding an item: " + data[i]);
        listLength++;
        list[data[i].category].push(data[i]);

        console.log(list[data[i].category]);
        //console.log("category's "+data[i].category+" "+i+"st item:"+list[data[i].category][i]);
      }

      console.log(JSON.stringify(list));
      if (list.length == 0) {
        $scope.uploadList = null;
      } else {
        $scope.uploadList = list;
      }
      $scope.insect = data[0];
    });

    $scope.upload = function (insect) {
      if (insect === undefined) {
        $scope.location.path("insect/upload");
      } else {
        $scope.location
          .path("insect/upload")
          .search({ insect: insect, fromUploadListPage: "1" });
      }
    };
  },
]);

insectIdentifierControllers.controller("UploadInsectCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  function ($scope, Search, $location, $http, $localStorage) {
    if ($location.search().fromUploadListPage == "1") {
      // update
      $location.search().fromUploadListPage = 0;
      console.log("filling loaded insect's fields");

      var insect = $location.search().insect;
      console.log(insect);
      if (insect.images == null) {
        console.log("uploadctrl: insect is empty");
        $scope.location.path("search");
        return;
      }

      $scope.insect = insect;
      console.log("insect.translations: " + insect.translations);

      if (insect.translations && insect.translations.length > 0) {
        $scope.enName = insect.translations[0].name;
        $scope.fiName = insect.translations[1].name;
      }

      $scope.latinName = insect.latinName;
      $scope.wiki = insect.wiki;
      $scope.primaryColor = insect.primaryColor;
      $scope.secondaryColor = insect.secondaryColor;
      $scope.legs = "0" + insect.legs;
      $scope.category = insect.category;
      $scope.uploadedPhotos = insect.images;
      $scope.isRequired = false;
      console.log("uploadedphotos: " + $scope.uploadedPhotos);

      $scope.insectId = insect._id;
      $scope.isUpload = "0";
      $scope.photos = [];

      for (var i = 0; i < insect.images.length; i++)
        $scope.photos.push({ name: insect.images[i], checked: "0" });

      console.log("scope.photos: " + $scope.photos);
      console.log("scope.photos[0].name: " + $scope.photos[0].name);

      $scope.checkPhotoRequired = function (photo) {
        // check if the clicked remove checkbox is non-ticked
        console.log("photo: " + photo);
        console.log("photo.name: " + photo.name);
        console.log("photo.checked: " + photo.checked);

        if (photo.checked) {
          // loop remove-checkboxes
          var isRequired = true;
          for (var i = 0; i < $scope.photos.length; i++) {
            if (!$scope.photos[i].checked) {
              console.log("found non-ticked photo checkbox");
              $scope.isRequired = false;
            }
          }
          $scope.isRequired = isRequired;
        } else {
          console.log("found the clicked checkbox to be non-ticked.");
          $scope.isRequired = false;
        }
      };
    } else {
      console.log("isupload: true");
      $scope.isUpload = "1";
      $scope.isRequired = "1";
    }
  },
]);

insectIdentifierControllers.controller("InsectDetailCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  "$cookies",
  function ($scope, Search, $location, $http, $localStorage, $cookies) {
    $scope.messageCollectionAddFailure = "";
    $scope.messageCollectionAddSuccess = "";
    $scope.messageRemovedFailure = "";
    $scope.messageRemovedSuccess = "";
    $scope.messageCollectionAddOfflineFailure = "";

    // check connectivity
    if ($localStorage.connected) {
      console.log("$localStorage.connected: ", $localStorage.connected);
    }
    $scope.connected = $localStorage.connected;

    $scope.$watch("online", function (newStatus, $scope, $localStorage) {
      console.log("watch for 'online' called");
      //connectivity(newStatus, $scope, $localStorage);
    });

    $scope.localStorage = $localStorage;

    // save the insect to the scope
    $scope.prevUrl = $location.search().prevUrl;
    $scope.insect = $location.search().insect;
    console.log("prevUrl: " + $scope.prevUrl);
    console.log("insect: " + $scope.insect);
    $scope.addCollection = "false";
    // search
    if ($scope.prevUrl == "#/list") {
      $http({
        url: "/collection/searchItem",
        params: { insectId: $scope.insect._id },
        method: "GET",
      }).then(function (response) {
        // add items to the localstorage by category
        console.log("response: " + JSON.stringify(response));
        console.log("response.data: " + response.data);
        if (response.data && response.data != "") {
          $scope.inCollection = 1;
          console.log("disabled add collection");
        } else {
          $scope.inCollection = 0;
          console.log("enabling add collection");
        }
      });
    }
    if ($scope.prevUrl === "#/collection") {
      $scope.inCollection = 1;
    }

    $scope.lang = $cookies.get("lang");
    $scope.location = $location;

    //get the wiki description
    var wikilink;
    if ($scope.insect) {
      var wikilink =
        "https://" +
        $cookies.get("lang") +
        ".wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&" +
        "explaintext=&titles=" +
        $scope.insect.wiki +
        "&callback=?";
    }

    $.getJSON(wikilink, function (data) {
      if (data.query) {
        var pages = data.query.pages;
        var description = "";
        for (var prop in pages) {
          var description = JSON.stringify(data.query.pages[prop].extract);
          if (description === '""') {
            description = null;
            console.log("set description to empty");
          }
          console.log("description: ", description);
        }

        console.log(description);
        if (description) {
          $scope.$apply(function () {
            $scope.description = description;
          });
        }
      }
    });

    var insect = $scope.insect;
    if (insect) {
      console.log(insect.images);
      if (insect.images) $scope.mainImageUrl = insect.images[0];
    }

    $scope.pic = function (index) {
      window.alert(
        "pic " +
          $scope.insect.images[index] +
          " :" +
          $localStorage[$scope.insect.images[index]]
      );
    };

    $scope.setImage = function (img) {
      if ($localStorage.connected != "1") {
        $scope.mainImageUrl = img;
        console.log("setImage (not connected)");
        console.log($scope.mainImageUrl);
      } else $scope.mainImageUrl = img;
    };

    $scope.setImageUrl = function (img) {
      if ($localStorage.getItem("connected") != "1") {
        var url = $localStorage.getItem(img);
        console.log("url: " + url);
        img = url;
        // loop through thumb images
      }
    };

    $scope.getBase64FromImage = function (id, name) {
      console.log("getbase64fromimageurl, id: " + id + " and name: " + name);
      var img = getImg(id, name);

      img.setAttribute("crossOrigin", "anonymous");

      img.onload = function () {
        console.log("img.onload");
        var canvas = document.createElement("canvas");
        console.log(
          "this.width: " + this.width + " this.height: " + this.height
        );

        // thumb.jpg
        console.log(
          "name.substring: " + name.substring(name.length - 9, name.length)
        );
        if (name.substring(name.length - 9, name.length) == "thumb.jpg") {
          // resize
          img.width = 150;
          img.height = 150;
          canvas.width = 150;
          canvas.heigth = 150;
        } else {
          canvas.width = this.width;
          canvas.height = this.height;
        }

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        //alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));

        // set to localstorage
        //name = name.replace(/^ ', "");

        console.log("saving image with name: " + name + " to localstorage");
        // TODO catch max size reached
        $localStorage[name] = dataURL;
        var tmp = $localStorage[name];
      };
    };

    $scope.saveImagesToLocalStorage = function () {
      /* loop through insect's images */

      console.log("saving images to local storage");

      for (var i = 0; i < $scope.insect.images.length; i++) {
        // full pics
        console.log("before saving image to localstorage");
        $scope.getBase64FromImage(
          "mainimage",
          $scope.insect.images[i],
          $localStorage
        );
        console.log("after saving image to localstorage");

        // thumbs
        if ($scope.insect.images.length > 1) {
          $scope.getBase64FromImage(
            $scope.insect.images[i] + "_thumb.jpg",
            $scope.insect.images[i] + "_thumb.jpg",
            $localStorage
          );
          console.log("saved thumb to localstorage");
        } else {
          $scope.getBase64FromImage(
            "mainimage",
            $scope.insect.images[i] + "_thumb.jpg",
            $localStorage
          );
          console.log("saved and resized thumb to localstorage");
        }
      }
    };

    $scope.removeFromCollection = function (insect) {
      // check authentication status before going to the Server
      console.log("current.user: ", $cookies.get("current.user"));
      var currentUser = $cookies.get("current.user");
      if (currentUser === "") {
        // attempt to remove the insect from local storage
        $scope.removeInsectFromCollection($scope, $localStorage);
        return;
      }
      $http({
        url: "/collection/remove",
        method: "GET",
        params: { _id: insect._id },
      }).success(function (data) {
        console.log("data: " + data);
        if (data == "success") {
          $scope.removeInsectFromCollection($scope, $localStorage);
        } else {
          // check first whether the insect is in the localstorage collection
          var successLocalStorageRemoval = $scope.removeInsectFromCollection(
            $scope,
            $localStorage
          );
          if (successLocalStorageRemoval) {
            return;
          }

          $scope.messageRemovedFailure =
            $scope.translations.FAILEDTOREMOVEINSECTFROMCOLLECTION;
          $scope.inCollection = 0;
          console.log("failed to remove insect");
          alert("Failed to remove insect from collection.");
        }
      });
    };

    $scope.removeInsectFromCollection = function ($scope, $localStorage) {
      var category = $scope.insect.category;
      console.log(
        "category: " +
          category +
          ", with length: " +
          $localStorage.collection[category].length +
          ", $localStorage.collection[category][0]: " +
          $localStorage.collection[category][0]
      );
      var success = false;

      for (var i = 0; i < $localStorage.collection[category].length; i++) {
        if ($localStorage.collection[category][i]._id == $scope.insect._id) {
          console.log("found insect from local storage at position: " + i);

          $localStorage.collection[category].splice(i, 1);
          success = true;
          break;
        }
      }

      if (success) {
        $scope.messageRemovedSuccess =
          $scope.translations.REMOVEDINSECTFROMCOLLECTION;
        // update the state
        $scope.inCollection = 0;
      } else {
        $scope.messageRemovedFailure =
          $scope.translations.FAILEDTOREMOVEINSECTFROMCOLLECTION;
      }

      return success;
    };

    $scope.add_to_collection = function () {
      // guard if collection page has set the offline option
      if ($localStorage.connected == 0 || localStorage.connected === "0") {
        console.log(
          "addToCollection, collection page has set the offline option"
        );
        $scope.messageCollectionAddOfflineFailure =
          $scope.translations.OFFLINEFAILURE;
        return;
      }

      var insectsByCategory = {
        Ant: [],
        Bee: [],
        Beetle: [],
        Butterfly: [],
        Centipede: [],
        Spider: [],
      };
      var duplicate = 0;

      if ($localStorage.collection) {
        console.log("category: " + $scope.insect.category);
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
              console.log(
                "found duplicate between localstorage and server data"
              );
              // found duplicate
              duplicate = true;
            }
          }
          if (!duplicate) {
            $localStorage.collection[$scope.insect.category].push(
              $scope.insect
            );
            console.log("not a duplicate");
            $scope.saveImagesToLocalStorage();
            //alert("Saved insect to collection");
          }
        } else {
          $localStorage.collection[$scope.insect.category].push($scope.insect);
          console.log(
            "found no insects int the category: " +
              $localStorage.collection[$scope.insect.category]
          );
          $scope.saveImagesToLocalStorage();
        }
      } else {
        $localStorage.collection = [];
        $localStorage.collection = insectsByCategory;
        $localStorage.collection[$scope.insect.category].push($scope.insect);
        console.log("initialized localstorage");
        $scope.saveImagesToLocalStorage();
      }
      // save to the server
      if (!duplicate) {
        // check authentication status before going to the Server
        console.log("current.user: ", $cookies.get("current.user"));
        var currentUser = $cookies.get("current.user");
        if (currentUser === "") {
          $scope.addItemToCollection($scope);
        }
        $http({
          url: "/collection/insert",
          method: "GET",
          params: { insectId: $scope.insect._id },
        }).success(function (data) {
          $scope.addItemToCollection($scope);
        });
      } else {
        console.log("translations.ITEMALREADYINCOLLECTION");
        $scope.messageCollectionAddFailure =
          $scope.translations.ITEMALREADYINCOLLECTION;
      }
    };

    $scope.addItemToCollection = function ($scope) {
      console.log("translations.ITEMSAVED");
      $scope.disableAddCollection = "true";
      $scope.messageCollectionAddSuccess = $scope.translations.ITEMSAVED;
      $scope.inCollection = 1;
    };

    $scope.collection = function () {
      $scope.location.path("collection");
    };

    $scope.new_search = function () {
      $scope.location
        .path("search")
        .search({ returningFromDetailPage: "1", insect: $scope.insect });
    };
  },
]);

insectIdentifierControllers.controller("AddObservationsCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  "SearchService",
  function ($scope, Search, $location, $http, $localStorage, SearchService) {
    // initialize form
    $scope.params = {
      country: null,
      countrypart: null,
      place: "",
      count: "",
      farmType: "other",
      observationLatinName: "",
    };

    // toggle selected insect image flag
    $scope.toggleSelectedInsectImage = true;

    // reset the hidden insectid
    $scope.insectId = null;

    // resizing the container search
    $scope.resize = {};
    $scope.resize.fromAddObservationsCtrl = true;

    // validation
    $scope.dateRequired = { date: 1 };
    $scope.observationLatinNameRequired = 1;

    $scope.addObservationFailure = "";
    $scope.addObservationSuccess = "";

    // add the without identify button row -class to the search-container
    if (getVw() < 860) {
      console.log(
        "setting without identify button grid configuration for small screens"
      );
      $scope.resize.withoutIdentifyBtnSmCond = true;
      $scope.resize.withoutIdentifyBtnMdCond = false;
    } else {
      console.log(
        "setting without identify button grid configuration for large screens"
      );
      $scope.resize.withoutIdentifyBtnSmCond = false;
      $scope.resize.withoutIdentifyBtnMdCond = true;
    }

    // Pagination
    $scope.itemsPerPage = 8;
    $scope.currentPage = 0;
    $scope.pagedInsects = [];

    $scope.fromObservationPage = 1;
    $scope.$watch("translations", function (val) {
      console.log("inside scope.watch for translations");
      // init datepicker
      var weekday = [
        $scope.translations.MONDAY,
        $scope.translations.TUESDAY,
        $scope.translations.WEDNESDAY,
        $scope.translations.THURSDAY,
        $scope.translations.FRIDAY,
        $scope.translations.SATURDAY,
        $scope.translations.SUNDAY,
      ];
      var monthtime = [
        $scope.translations.JANUARY,
        $scope.translations.FEBRUARY,
        $scope.translations.MARCH,
        $scope.translations.APRIL,
        $scope.translations.MAY,
        $scope.translations.JUNE,
        $scope.translations.JULY,
        $scope.translations.AUGUST,
        $scope.translations.SEPTEMBER,
        $scope.translations.OCTOBER,
        $scope.translations.NOVEMBER,
        $scope.translations.DECEMBER,
      ];

      init_times(monthtime, weekday);
      init_close($scope.translations.CLOSE);
    });

    $scope.ds_sh_search = function (el) {
      ds_sh(el, $scope);
    };

    $scope.setPagedInsects = function (insects) {
      setPagedInsects(insects, $scope);
    };

    $scope.setDelay = function (el, ms) {
      console.log("in set delay, el:", el);
      const timeoutF = function (elName) {
        console.log("setdelay: calling callb, elName:", elName);
        $scope.callb(elName);
      };
      setTimeout(timeoutF, ms, el);
    };

    $scope.callb = function (el) {
      console.log("callb, el: ", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.addObservationSuccess = "";
      $scope.addObservationFailure = "";
      //el.className += " is-paused";
    };

    $scope.addObservation = function (query) {
      var params;
      // convert the date to javascript date
      // YYYY-MM-DD

      var formattedDate = document.getElementById("date").value;
      console.log("formatteddate: " + formattedDate);
      var date = new Date();
      date.setYear(formattedDate.substring(0, 4));
      var month = Number(formattedDate.substring(5, 7)) - 1;
      console.log("month: " + month);
      date.setMonth(month);
      date.setDate(formattedDate.substring(8, 10));
      console.log("latinname: " + query.observationLatinName);
      console.log("insectId: " + $scope.insectId);

      console.log("adding an observation without existing place");
      console.log("query object: ", query);

      console.log(
        "query.farmType === 'organicFarm'",
        query.farmType === "organicFarm"
      );
      console.log(
        "query.farmType === 'nonorganicFarm'",
        query.farmType === "nonorganicFarm"
      );

      console.log("query.country: " + query.country);
      params = {
        country: query.country,
        location: query.countrypart,
        count: query.count,
        date: date,
        place: query.place,
        organicFarm: query.farmType === "organicFarm",
        nonOrganicFarm: query.farmType === "nonorganicFarm",
        user: $location.search().currentUser,
        latinName: query.observationLatinName,
        insectId: $scope.insectId,
      };

      $http({ url: "/observation/add", method: "POST", params: params })
        .success(function (data) {
          console.log("add observation returned data: ", data);
          if (!data) {
            console.log("no data after add observation");
            $scope.reportError();
            return;
          }
          console.log("observation added successfully");

          $scope.addObservationSuccess =
            $scope.translations.ADDOBSERVATIONSUCCESS;

          $scope.setDelay("messageAddSuccess", 1500);
        })
        .error(function () {
          console.log("adding observation failed");
          $scope.reportError();
        });
    };

    $scope.reportError = function () {
      $scope.addObservationFailure = $scope.translations.ADDOBSERVATIONFAILURE;

      $scope.setDelay("messageAddFailure", 1500);
    };

    $scope.search = function (query) {
      SearchService.search($scope, $localStorage, query);
    };
    $scope.checkLatinname = function (name) {
      console.log("checking latinname, ", name);
      // validation
      if (name === '""' || name === undefined || name == "") {
        console.log("setting latinname validation to required");
        $scope.observationLatinNameRequired = 1;
      } else {
        console.log("setting latinname validation to nonrequired");
        $scope.observationLatinNameRequired = 0;
      }
    };
    $scope.updateRequired = function () {
      var latinName = document.getElementById("latinName").value;
      console.log("latinName: " + latinName);
      if (latinName) $scope.latinNameRequired = "false";
      else $scope.latinNameRequired = "true";
    };

    $scope.setImage = function (insect) {
      // check was the selected insect image clicked again
      if (insect._id === $scope.insectId) {
        console.log("selected insect image was clicked again");
        // enable latinname input
        $scope.mainImageUrl = null;
        // reset hidden insect id
        $scope.insectId = null;
        return;
      }
      $scope.mainImageUrl = insect.images[0];

      // update the hidden insect id
      $scope.insectId = insect._id;

      // update the latinname input
      if (insect.latinName !== undefined) {
        $scope.params.observationLatinName = insect.latinName;
      }
    };

    /** Pagination functions **/

    $scope.range = function (start) {
      console.log("range called with start: " + start);
      return range(start);
    };

    $scope.prevPage = function () {
      prevPage($scope);
    };

    $scope.nextPage = function () {
      nextPage($scope);
    };

    $scope.setPage = function () {
      setPage($scope, this.n);
    };
  },
]);

insectIdentifierControllers.controller("SearchCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  "SearchService",
  "$timeout",
  "$rootScope",
  function (
    $scope,
    Search,
    $location,
    $http,
    $localStorage,
    SearchService,
    $timeout,
    $rootScope
  ) {
    $scope.setPagedInsects = function (insects) {
      // call util function
      setPagedInsects(insects, $scope);
    };

    // enable search button
    console.log("enabling search button");
    $scope.disableSearch = false;

    // resizing the container search
    $scope.resize = {};
    $scope.resize.fromAddObservationsCtrl = false;

    // Update the main header

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
      var observationEl = document.getElementById("observation");
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

    // Pagination
    $scope.itemsPerPage = 8;
    if ($scope.selectedInsect === undefined) {
      console.log("resetting pagination page");
      $scope.currentPage = 0;
    }
    $scope.pagedInsects = [];

    $scope.fromObservationPage = 0;

    if ($location.search().returningFromDetailPage == "1") {
      console.log("returning from detail page");
      // guard for page reloads
      console.log(
        "location.search().insect.images: ",
        $location.search().insect.images
      );
      if ($location.search().insect.images === undefined) {
        return;
      }
      $scope.insect = $location.search().insect;
      // for proper pagination to work
      $scope.selectedInsect = $location.search().insect;
      $scope.searchResults = "showResults";

      // use localstorage to obtain the previous search results
      var insects = $localStorage.searchResults;
      $scope.setPagedInsects(insects);

      // main image
      var imgs = [];
      for (var i = 0; i < insects.length; i++) {
        imgs.push(insects[i].images[0]);

        if (insects[i].images[0] == $scope.insect.images[0]) {
          console.log("setting mainimage url");
          $scope.mainImageUrl = insects[i].images[0];
        }
      }
      $scope.imgs = imgs;
    }

    $scope.search = function (query) {
      SearchService.search($scope, $localStorage, query);
    };

    $scope.setImage = function (insect) {
      console.log("setting image");

      console.log("controller: setimage: " + insect.images[0]);
      $scope.mainImageUrl = insect.images[0];

      $scope.insect = insect;
    };

    $scope.insectDetail = function () {
      insectDetail($location, $scope);
    };

    /** Pagination functions **/

    $scope.range = function (start) {
      console.log("range called with start: " + start);
      return range(start);
    };

    $scope.prevPage = function () {
      prevPage($scope);
    };

    $scope.nextPage = function () {
      nextPage($scope);
    };

    $scope.setPage = function () {
      setPage($scope, this.n);
    };
  },
]);

insectIdentifierControllers.controller("ListCtrl", [
  "$scope",
  "Search",
  "$http",
  "$location",
  function ($scope, Search, $http, $location) {
    // save the search filter properties to the scope
    var query = Search.get();
    $scope.searchParams = query;
    $scope.location = $location;

    // get a list of beetles
    $http({
      url: "/insect/search",
      method: "GET",
      params: {
        primaryColor: query.primaryColor,
        secondaryColor: query.secondaryColor,
        category: query.category,
        legs: query.legs,
      },
    }).success(function (data) {
      $scope.mainImageUrl = "not-available";
      $scope.insects = data;
      var imgs = [];
      // make a list of image urls
      var len = data.length;
      for (var i = 0; i < len; i++) {
        imgs.push(data[i].image);
      }
      $scope.imgs = imgs;
    });

    $scope.setImage = function (insect) {
      $scope.mainImageUrl = insect.image;
      $scope.insect = insect;
      $("#identify").prop("disabled", false);
    };
    $scope.insectDetail = function () {
      var obj = {};
      obj.insect = angular.copy($scope.insect);
      obj.prevUrl = "#/list";

      Search.set(obj);
      $scope.location.path("insect");
    };
  },
]);

insectIdentifierControllers.controller("PhoneListCtrl", [
  "$scope",
  "Phone",
  function ($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = "age";
  },
]);

insectIdentifierControllers.controller("PhoneDetailCtrl", [
  "$scope",
  "$routeParams",
  "Phone",
  function ($scope, $routeParams, Phone) {
    $scope.phone = Phone.get(
      { phoneId: $routeParams.phoneId },
      function (phone) {
        $scope.mainImageUrl = phone.images[0];
      }
    );

    $scope.setImage = function (imageUrl) {
      $scope.mainImageUrl = imageUrl;
    };
  },
]);

insectIdentifierControllers.controller("MainCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$cookies",
  "TranslationService",
  function ($scope, Search, $location, $http, $cookies, TranslationService) {
    $scope.location = $location;
    $scope.collection = function () {
      $scope.location.path("collection");
    };
    $scope.search = function () {
      $scope.location.path("search");
    };
    $scope.upload = function () {
      $scope.location.path("insect/upload");
    };
    // pagination controls
    $scope.currentPage = 0;
    $scope.totalItems = 30;
    $scope.entryLimit = 8; // items per page
    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
  },
]);

insectIdentifierControllers.controller("CollectionCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  "$cookies",
  function ($scope, Search, $location, $http, $localStorage, $cookies) {
    console.log("$localStorage.connected", $localStorage.connected);
    $scope.checkbox = { offline: !$localStorage.connected };
    console.log("$scope.offline", $scope.checkbox.offline);

    $scope.localStorage = $localStorage;
    $scope.tmp = "";
    var name = "images/Scarabaeidae-Lehtisarviset tv20100621_081.jpg_thumb.jpg";
    console.log("$localStorage.name:" + $localStorage[name]);
    console.log("$scope.$localStorage.name:" + $scope.localStorage[name]);

    $scope.lang = $cookies.get("lang");

    var insectsByCategory = {
      Ant: [],
      Bee: [],
      Beetle: [],
      Butterfly: [],
      Centipede: [],
      Spider: [],
    };

    $scope.collectionEmpty = collectionEmpty($localStorage.collection);
    console.log("collection empty: ", $scope.collectionEmpty);

    $http
      .get("/collection/list")
      .success(function (data) {
        // add items to the localstorage by category
        if ($localStorage.collection == null) {
          $localStorage.collection = [];
          $localStorage.collection = insectsByCategory;
        }
        console.log("data: ", data);

        // Add items from the backend to the localstorage if there are no duplicates
        for (var ind in data) {
          var insect = data[ind];
          var duplicate = 0;
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
          if (!duplicate) {
            // add thumbs from localstorage as needed

            $localStorage.collection[insect.category].push(insect);
          }
        }
        $scope.collectionEmpty = collectionEmpty($localStorage.collection);
        console.log("collection empty: ", $scope.collectionEmpty);
      })
      .error(function () {
        console.log("failed to refresh collection");
        //window.alert($scope.translations.REFRESHINGCOLLECTION);
      });

    $scope.location = $location;
    $scope.localStorage = $localStorage;

    $scope.viewOffline = function () {
      console.log("connected : " + !$scope.checkbox.offline);

      $localStorage.connected = !$scope.checkbox.offline;
    };

    $scope.viewDetail = function (insect) {
      var obj = {};
      obj.insect = angular.copy(insect);
      obj.prevUrl = "#/collection";
      Search.set(obj);
      $scope.location
        .path("insect")
        .search({ insect: insect, prevUrl: "#/collection" });
    };

    $scope.startToAddCollectionItems = function () {
      $scope.location.path("search");
    };
  },
]);
