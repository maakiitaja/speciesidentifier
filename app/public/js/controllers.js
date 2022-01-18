"use strict";

//lets require/import the mongodb native drivers.
//var mongodb = require('mongodb');
/* Controllers */

var insectIdentifierControllers = angular.module(
  "insectIdentifierControllers",
  []
);
insectIdentifierControllers.controller("FileUploadErrorCtrl", [
  "$scope",
  "$location",
  function ($scope, $location) {
    $scope.main = function () {
      $location.path("search");
    };
  },
]);

insectIdentifierControllers.controller("LoggingCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  function ($scope, Search, $location, $http) {
    $scope.message = "";
    console.log("logging controller");
    resetHeader();
    highlightElement("login");
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
    resetHeader();
    highlightElement("login");

    console.log("logging failure controller, message: " + $scope.message);
  },
]);

insectIdentifierControllers.controller("BrowseObservationsCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  "$cookies",
  function ($scope, Search, $location, $http, $localStorage, $cookies) {
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

    $scope.addLatinName = function (observations) {
      console.log(
        "starting to loop through observations with lenght: ",
        observations.length
      );
      observations.forEach(function (observation, data_index) {
        // filter
        console.log("observation: ", observation);
        if (!observation.insect) {
          return;
        }
        observation.insect.translations.every(function (translation) {
          if (translation.language === "Latin") {
            console.log("setting name: ", translation.name);
            observations[data_index].name = translation.name;
            // break
            return false;
          }
          return true;
        });
      });
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

      var category = "";
      if ($scope.insectSearchSelection == "byCategory") {
        category = query.category;
        name = "";

        console.log("selected category: ", category);
      } else if ($scope.insectSearchSelection == "byName") {
        console.log("search narrowed by name");
        name = query.name;
        category = "";
      }

      console.log("nofarm: " + nofarm);
      console.log("farmtype organicFarm: " + organicFarm);
      console.log("farmtype nonOrganicFarm: " + nonOrganicFarm);

      $http({
        url: "/observation/browse",
        method: "GET",
        params: {
          countryPart: query.countryPart,
          country: query.country,
          place: query.place,
          startDate: startDate,
          endDate: endDate,
          name: name,
          category: category,
          nofarm: nofarm,
          organicFarm: organicFarm,
          nonOrganicFarm: nonOrganicFarm,
          byType: byType,
        },
      }).success(function (data) {
        $scope.observations = data;
        for (var i = 0; i < data.length; i++) {
          // date
          var formattedDate = new Date();
          var rawDate = new Date(data[i].date);
          console.log("data[i].date: " + data[i].date);

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

          // place type
          if (data[i].organicFarm == true || data[i].organicFarm == false) {
            if (data[i].organicFarm)
              $scope.observations[i].farmType = $scope.translations.ORGANICTYPE;
            else
              $scope.observations[i].farmType =
                $scope.translations.NONORGANICTYPE;
          } else $scope.observations[i].farmType = $scope.translations.NOFARM;
        }

        // add name to the observations
        if (
          !$scope.insectSearchSelection ||
          $scope.insectSearchSelection === "byCategory"
        ) {
          // search latin name
          console.log("adding latin name");
          $scope.addLatinName(data);
        } else {
          console.log("adding given name");
          data.forEach(function (observation) {
            observation.name = name;
          });
        }

        if (data && data.length > 0) $scope.searchResults = "showResults";
        else $scope.searchResults = "noResults";

        // Hide spinner element
        spinnerEl.classList.toggle("spinner-loading");
        // Enable search button
        $scope.disableSearch = false;
      });
    };

    // header
    resetHeader();
    if ($cookies.get("current.user") !== "") {
      console.log("highglighting observation button");
      highlightElement("observation-button");
    } else {
      console.log("highglighting observation button browse");
      highlightElement("observation-button-browse");
    }
  },
]);

insectIdentifierControllers.controller("UploadListCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$localStorage",
  "$cookies",
  function ($scope, Search, $location, $http, $localStorage, $cookies) {
    console.log("uploadlist ctrl current User:" + $scope.currentUser);

    // menu
    resetHeader();
    highlightElement("manage-button");
    console.log("$scope.currentUser: ", $scope.currentUser);
    $http({
      url: "/uploadList",
      method: "GET",
      params: { userId: $scope.currentUser._id },
    }).success(function (data) {
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
      }

      //console.log(JSON.stringify(list));
      if (list.length == 0) {
        $scope.uploadList = {};
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
    // header
    resetHeader();
    highlightElement("manage-button");

    $scope.deleteInsect = function () {
      var result = confirm("Are you sure you want to delete this insect?");
      if (!result) {
        console.log("not wanting to delete");
        return;
      }

      var params = {
        insectId: $scope.insect._id,
        user: $location.search().currentUser,
      };
      $http({
        url: "/insect/delete",
        method: "DELETE",
        params: params,
      }).success(function (data) {
        console.log("data: ", data);
        if (data.msg) {
          console.log("insect deleted");
          alert("successfully removed insect");
          $location.path("insect/uploadList").search({ user: currentUser });
        } else {
          console.log("insect exists in some compendium");
          alert("Can't delete insect, because it exists in some collection. ");
          return;
        }
      });
    };

    $scope.validateFileFormat = function (files) {
      for (var i = 0; i < files.length; i++) {
        var validFiles = true;
        var ext = files[i].name.match(/\.(.+)$/)[1];
        if (
          angular.lowercase(ext) === "jpg" ||
          angular.lowercase(ext) === "jpeg" ||
          angular.lowercase(ext) === "png"
        ) {
        } else {
          console.log("Invalid File Format");
          validFiles = false;
          break;
        }
      }
      return validFiles;
    };

    $scope.fileChange = function (event) {
      var files = event.target.files;
      console.log(files);
      if (files.length > 5) {
        alert("The maximum amount of files (5) has been exceeded.");
        document.getElementById("userPhotos").value = null;
        $scope.$apply();
      } else if (files.length) {
        // validate
        var validFiles = $scope.validateFileFormat(files);

        if (validFiles) {
          console.log("setting file upload required to false");
          $scope.isRequired = false;
          console.log("setting file input populated to true");
          $scope.fileInputPopulated = true;
          $scope.noPhotosSelected = false;
          $scope.$apply();
          // show the files in form
          // document.getElementById("showFiles").innerHTML =
          //   document.getElementById("userPhotos").value;
        } else {
          alert("Invalid file(s). Accepted formats: jpg/jpeg/png");
          console.log("invalid file(s)");
          $scope.isRequired = true;
          $scope.fileInputPopulated = false;
          document.getElementById("userPhotos").value = null;

          if ($scope.numberOfImagesDownloaded == 0) {
            $scope.noPhotosSelected = true;
          }
          $scope.$apply();
        }
      }
    };

    $scope.submit = function () {
      // need to check if latinname has already been reserved
      if ($scope.latinNameReserved) {
        console.log("latinname has been reserved");
        alert("check the latin name again");
        // for form validation to work reset the field
        $scope.latinName = "";

        $scope.$apply();
        return;
      }

      // in case the main file input has been populated
      if ($scope.fileInputPopulated) {
        console.log("file input populated, submitting form");
        var form = document.getElementById("myForm");
        //form.submit();

        return;
      }

      // check that the insect has at least one picture
      if ($scope.isRequired) {
        alert("Please, select at least one photo");
        $scope.noPhotosSelected = true;
        var form = document.getElementById("myForm");
        // attempt to submit the form
        //form.submit();
      } else {
        console.log("user has selected at least one photo");
      }
    };

    $scope.checkPhotoRequiredAfterImageLinks = function () {
      const el = document.getElementById("userPhotos2");
      console.log("el: ", el);
      console.log(" el.files.length: ", el.files.length);

      if (el && el.files.length > 0) {
        console.log(
          "valid image links were provided, disabling main file input validation"
        );
        $scope.isRequired = false;
        return;
      }
    };

    $scope.checkPhotoRequired = function () {
      // check whether all pre-existing images all selected as removed
      var inputs = document.getElementsByClassName("photo-checkbox");
      console.log("photo checkbox inputs: ", inputs);
      var isRequired = true;

      for (var i = 0; i < inputs.length; i++) {
        console.log("inputs[i].checked", inputs[i].checked);
        if (!inputs[i].checked) {
          isRequired = false;
          break;
        }
      }

      $scope.isRequired = isRequired;

      // show warning
      if ($scope.numberOfImagesDownloaded > 0) {
        $scope.noPhotosSelected = false;
      } else {
        $scope.noPhotosSelected = isRequired;
      }

      return;
    };

    $scope.downloadImageLinks = async function () {
      console.log("links are: ", $scope.imageLinks.trim());

      // trim whitespace and check if imagelinks are empty
      if (!$scope.imageLinks.trim()) {
        console.log("$scope.imagesDownloaded: ", $scope.imagesDownloaded);
        $scope.imagesDownloaded = true;
        $scope.numberOfImagesDownloaded = 0;

        // check do we need to display warning for no photos selected -container
        $scope.checkPhotoRequired();

        // remove any files downloaded before
        document.getElementById("userPhotos2").value = null;
        //$scope.$apply();

        return;
      }

      var links = $scope.imageLinks.trim().split(",");
      console.log("links are: ", links);

      if (links.length > 5) {
        alert("The maximum amount of files (5) has been exceeded.");
        return;
      }

      var validFiles = true;
      // validate imagelinks
      for (var i = 0; i < links.length; i++) {
        links[i] = links[i].toLowerCase();
        if (
          links[i].indexOf(".jpg") != -1 ||
          links[i].indexOf(".jpeg") != -1 ||
          links[i].indexOf(".png") != -1
        ) {
        } else {
          console.log("Invalid File Format");
          validFiles = false;
          break;
        }
      }

      if (!validFiles) {
        alert("Invalid file(s). Accepted formats: jpg/jpeg/png");
        console.log("$scope.imagesDownloaded: ", $scope.imagesDownloaded);
        $scope.imagesDownloaded = true;
        $scope.numberOfImagesDownloaded = 0;
        console.log("$scope.fileInputPopulated: ", $scope.fileInputPopulated);
        $scope.checkPhotoRequired();

        // remove any files downloaded before
        document.getElementById("userPhotos2").value = null;
        //$scope.$apply();
        return;
      }
      console.log("image link validation passed");

      // show loading spinner
      toggleLoadingSpinner($scope);
      $scope.disableUpload = true;
      const container = new DataTransfer();
      console.log("container: ", container);

      var promises = [];
      // attempt to fetch the resource(s)
      for (var i = 0; i < links.length; i++) {
        var promise = new Promise(function (resolve, reject) {
          loadURLToContainer(links[i], container, i).then((msg) => {
            if (msg) {
              console.log("loaded item to container:");
              resolve(msg);
            } else {
              console.log('couldn"t load item to container:');
              reject(msg);
            }
          });
        }).catch((err) => {
          console.log("loadUrltocontainer failed");
          container.items = null;
          container.files = null;
        });
        promises.push(promise);
      }
      console.log("resolving all promises");
      try {
        const result = await Promise.all(promises);
        console.log("container.files: ", container.files);
        document.getElementById("userPhotos2").files = container.files;
        console.log("download done");
        // hide loading spinner
        toggleLoadingSpinner($scope);
        $scope.disableUpload = false;
        $scope.imagesDownloaded = true;
        $scope.numberOfImagesDownloaded = container.files.length;

        // perform validation
        $scope.isRequired = false;
        $scope.noPhotosSelected = false;

        $scope.$apply();
      } catch (err) {
        console.log("failed to load images");
        // hide loading spinner
        toggleLoadingSpinner($scope);
        $scope.disableUpload = false;
        $scope.imagesDownloaded = true;
        $scope.numberOfImagesDownloaded = 0;

        // check do we need to display warning for no photos selected
        $scope.checkPhotoRequired();

        $scope.$apply();
      }
    };

    // initialization
    $scope.noPhotosSelected = false;
    $scope.fileInputPopulated = false;
    $scope.numberOfImagesDownloaded = 0;

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
        insect.translations.forEach(function (translation) {
          if (translation.language === "fi") $scope.fiName = translation.name;
          if (translation.language === "en") $scope.enName = translation.name;
        });
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
      //console.log("scope.photos[0].name: " + $scope.photos[0].name);
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
    resetHeader();

    $scope.initMessages = function () {
      console.log("initializing messages");
      $scope.messageCollectionAddFailure = "";
      $scope.messageCollectionAddSuccess = "";
      $scope.messageRemovedFailure = "";
      $scope.messageRemovedSuccess = "";
      $scope.messageCollectionAddOfflineFailure = "";
    };

    $scope.initMessages();
    $scope.messageDelayTime = 1500;

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
    // // search
    // if ($scope.prevUrl == "#/list") {
    //   $http({
    //     url: "/collection/searchItem",
    //     params: { insectId: $scope.insect._id },
    //     method: "GET",
    //   }).then(function (response) {
    //     // add items to the localstorage by category
    //     console.log("response: " + JSON.stringify(response));
    //     console.log("response.data: " + response.data);
    //     if (response.data && response.data != "") {
    //       $scope.inCollection = 1;
    //       console.log("disabled add collection");
    //     } else {
    //       $scope.inCollection = 0;
    //       console.log("enabling add collection");
    //     }
    //   });
    // }
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
      var currentUser = $cookies.get("current.user");
      if (currentUser === "") {
        // attempt to remove the insect from local collection
        $scope.disableAddOrRemove = true;
        toggleLoadingSpinner($scope);
        $scope.removeInsectFromLocalCollection($scope, $localStorage);
        toggleLoadingSpinner($scope);
        return;
      }
      $scope.disableAddOrRemove = true;
      toggleLoadingSpinner($scope);

      // remove the insect from the remote collection
      $http({
        url: "/collection/remove",
        method: "DELETE",
        params: { insectId: insect._id, user: $location.search().currentUser },
      })
        .success(function (data) {
          console.log("data: " + data);
          if (data == "success") {
            // found item in the remote collection, remove it next from the local collection
            console.log("found item in the remote collection");
            $scope.removeInsectFromLocalCollection($scope, $localStorage);
          } else {
            // failed to remove the insect from the remote collection
            console.log(
              "failed to remove the insect from the remote collection"
            );
            $scope.removeInsectFromLocalCollection($scope, $localStorage);
          }
          toggleLoadingSpinner($scope);
        })
        .error(function (err) {
          console.log(
            "got error while removing item from collection, err:",
            err
          );
          alert("got error while removing item from collection, err:", err);
          toggleLoadingSpinner($scope);
        });
    };

    $scope.removeInsectFromLocalCollection = function ($scope, $localStorage) {
      var category = $scope.insect.category;

      var success = false;

      // remove the insect from local collection
      for (var i = 0; i < $localStorage.collection[category].length; i++) {
        if ($localStorage.collection[category][i]._id == $scope.insect._id) {
          console.log("found insect from local storage at position: " + i);

          $localStorage.collection[category].splice(i, 1);
          // remove the latinname and id in local collection
          $localStorage.collection.latinNames =
            $localStorage.collection.latinNames.filter(
              (latinName) => latinName !== $scope.insect.latinName
            );
          // remove the insect id from local collection
          $localStorage.collection.insectIds =
            $localStorage.collection.insectIds.filter(
              (insectId) => insectId !== $scope.insect._id
            );

          success = true;
          break;
        }
      }

      if (success) {
        $scope.messageRemovedSuccess =
          $scope.translations.REMOVEDINSECTFROMCOLLECTION;
        setDelay("messageRemovedSuccess", $scope.messageDelayTime, $scope);
        // update the state
        $scope.inCollection = 0;
      } else {
        setDelay("messageRemovedFailure", $scope.messageDelayTime, $scope);
        $scope.messageRemovedFailure =
          $scope.translations.FAILEDTOREMOVEINSECTFROMCOLLECTION;
      }

      return success;
    };

    $scope.add_to_collection = function () {
      $scope.disableAddOrRemove = true;
      toggleLoadingSpinner($scope);

      // guard if collection page has set the offline option
      if ($localStorage.connected == 0 || localStorage.connected === "0") {
        console.log(
          "addToCollection, collection page has set the offline option or synchronization issue"
        );

        setDelay(
          "messageCollectionAddOfflineFailure",
          $scope.messageDelayTime,
          $scope
        );
        $scope.messageCollectionAddOfflineFailure =
          $scope.translations.OFFLINEFAILURE;
        toggleLoadingSpinner($scope);
        return;
      }

      var collection = {
        Ant: [],
        Bee: [],
        Beetle: [],
        Butterfly: [],
        Centipede: [],
        Spider: [],
        latinNames: [],
        insectIds: [],
      };
      var duplicate = 0;

      // 1. save to the localstorage
      if ($localStorage.collection) {
        console.log("category: " + $scope.insect.category);
        // check for duplicate
        if ($localStorage.collection[$scope.insect.category].length > 0) {
          var duplicate = 0;

          var category = $localStorage.collection[$scope.insect.category];

          console.log(category);

          for (var i = 0; i < category.length; i++) {
            var tmpInsect = category[i];
            console.log(tmpInsect._id);

            if (tmpInsect._id == $scope.insect._id) {
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
            // add latin name to the localStorage
            if ($localStorage.collection.latinNames) {
              console.log(
                "saving reference information about insect to localStorage"
              );
              $localStorage.collection.latinNames.push($scope.insect.latinName);
              $localStorage.collection.insectIds.push($scope.insect._id);
            }
            console.log("not a duplicate");
            $scope.saveImagesToLocalStorage();
            //alert("Saved insect to collection");
          }
        } else {
          if ($localStorage.collection.insectsIds) {
            $localStorage.collection[$scope.insect.category].push(
              $scope.insect
            );
            // add latin name to the localStorage
            $localStorage.collection.latinNames.push($scope.insect.latinName);
            $localStorage.collection.insectIds.push($scope.insect._id);
            console.log(
              "found no insects in the category: " +
                $localStorage.collection[$scope.insect.category]
            );
            $scope.saveImagesToLocalStorage();
          } else {
            alert(
              "no collection exists in localstorage or it doesn't reflect the new structure, has it been removed?"
            );
          }
        }
      } else {
        $localStorage.collection = [];
        $localStorage.collection = collection;
        $localStorage.collection[$scope.insect.category].push($scope.insect);
        // add latin name to the localStorage
        $localStorage.collection.latinNames.push($scope.insect.latinName);
        $localStorage.collection.insectIds.push($scope.insect._id);
        console.log("initialized localstorage");
        $scope.saveImagesToLocalStorage();
      }

      // 2. save to the server
      if (!duplicate) {
        // check authentication status before going to the Server
        console.log("current.user: ", $cookies.get("current.user"));
        var currentUser = $cookies.get("current.user");
        if (currentUser === "") {
          $scope.addItemToCollection();
          toggleLoadingSpinner($scope);
          return;
        }

        // insert the item to the remote collection
        $http({
          url: "/collection/insert",
          method: "POST",
          params: {
            insectId: $scope.insect._id,
            user: $location.search().currentUser,
          },
        })
          .success(function (data) {
            if (data) {
              console.log("successfully added item to remote collection");
              if (
                !$localStorage.collection.insectIds.includes($scope.insect._id)
              ) {
                console.log("adding insect id to local storage");
                $localStorage.collection.insectIds.push($scope.insect._id);
              } else {
                console.log("found insect id already from local storage");
              }
              $scope.addItemToCollection();
            } else {
              console.log("inserting item to the remote database failed");
            }
          })
          .error(function (err) {
            console.log(
              "got error while saving item to the remote collection, err:",
              err
            );
            alert(
              "got error while saving item to the remote collection, err:",
              err
            );
          });
      } else {
        console.log("translations.ITEMALREADYINCOLLECTION");
        $scope.messageCollectionAddFailure =
          $scope.translations.ITEMALREADYINCOLLECTION;
        setDelay("messageAddFailure", $scope.messageDelayTime, $scope);
      }
      toggleLoadingSpinner($scope);
    };

    $scope.addItemToCollection = function () {
      console.log("translations.ITEMSAVED");
      $scope.messageCollectionAddSuccess = $scope.translations.ITEMSAVED;
      setDelay("messageAddSuccess", $scope.messageDelayTime, $scope);
      $scope.inCollection = 1;
    };

    $scope.callb = function (el) {
      console.log("callb insectdetail, el:", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.initMessages();
      $scope.disableAddOrRemove = false;
      $scope.$apply();
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
    // Header
    resetHeader();
    highlightElement("observation-button");

    // initialize form
    $scope.params = {
      country: null,
      countrypart: null,
      place: "",
      count: "",
      farmType: "other",
      observationLatinName: "",
    };
    // disable fileupload success message
    $scope.showFileuploadSuccessMessage = "";

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

    $scope.callb = function (el) {
      console.log("callb addobservation, el: ", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.addObservationSuccess = "";
      $scope.addObservationFailure = "";
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
      console.log("date is: ", date);
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

      console.log("formattedDate: ", formattedDate instanceof Date);
      console.log("date: ", date instanceof Date);
      console.log(
        "new Date(formattedDate)",
        new Date(formattedDate) instanceof Date
      );
      console.log("new Date(date)", new Date(date) instanceof Date);
      console.log("new Date()", new Date() instanceof Date);

      console.log("query.country: " + query.country);
      params = {
        country: query.country,
        countryPart: query.countrypart,
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

          setDelay("messageAddSuccess", 1500, $scope);
        })
        .error(function () {
          console.log("adding observation failed");
          $scope.reportError();
        });
    };

    $scope.reportError = function () {
      $scope.addObservationFailure = $scope.translations.ADDOBSERVATIONFAILURE;

      setDelay("messageAddFailure", 1500, $scope);
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
    // Update the main header
    resetHeader();
    highlightElement("search-header");
    $scope.showFileuploadSuccessMessage = "";
    if ($rootScope.search) {
      console.log("SearchCtrl, header search button clicked");
    }

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

    // Pagination
    $scope.itemsPerPage = 8;
    if ($scope.selectedInsect === undefined) {
      console.log("resetting pagination page");
      $scope.currentPage = 0;
    }
    $scope.pagedInsects = [];

    $scope.fromObservationPage = 0;
    console.log(
      "$location.search().fileuploadsuccess, ",
      $location.search().fileuploadsuccess
    );
    if ($location.search().fileuploadsuccess === "1") {
      $scope.$watch("translations", function (val) {
        $scope.showFileuploadSuccessMessage =
          $scope.translations.FILEUPLOADSUCCESS;
        console.log("inside scope.watch for translations");
        setDelay("showFileuploadSuccessMessage", 3000, $scope);
      });
    } else if ($location.search().returningFromDetailPage == "1") {
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

      // replace any backslashes with forward slashes
      $location.search().insect.images[0] = $location
        .search()
        .insect.images[0].replace("\\", "/");

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

    $scope.callb = function (el) {
      console.log("callb addobservation, el: ", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.showFileuploadSuccessMessage = "";
    };

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

    // menu
    resetHeader();
    highlightElement("collection-button");

    $scope.localStorage = $localStorage;
    $scope.tmp = "";
    $scope.location = $location;
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
      insectIds: [],
      latinNames: [],
    };

    var curUserEmpty = angular.equals({}, $scope.currentUser);
    console.log("curUserEmpty: ", curUserEmpty);
    if (curUserEmpty) {
      // check whether collection is empty
      $scope.collectionEmpty = collectionEmpty($localStorage.collection);
      console.log("collection empty: ", $scope.collectionEmpty);
      return;
    }
    toggleLoadingSpinner($scope);
    var params = { user: $location.search().currentUser };
    // search for existing remote collection
    $http({ url: "/collection/list", params: params })
      .success(function (data) {
        console.log("data: ", data);
        if (!data) {
          console.log("no data");
          // no existing remote collection
          let params;
          if ($localStorage.collection && $localStorage.collection.insectIds) {
            params = { insectIds: $localStorage.collection.insectIds };
          }

          // synchronize all items in local storage with the remote (push local changes)
          $http({
            url: "/collection/insertmany",
            method: "POST",
            params: params,
          })
            .success(function (data) {
              if (data) {
                console.log("synced the remote and local collections");
                console.log("data: ", data);
                $collection.insectIds = data.insectIds;
              } else {
                console.log(
                  "failed to sync between remote and local collections"
                );
              }
            })
            .error(function (err) {
              console.log(
                "error occured during syncing remote and local collection"
              );
            });

          toggleLoadingSpinner($scope);
        } else {
          // here it is needed to check whether local collection reflects the remote collection

          if ($localStorage.collection === null) {
            console.log("initializing localstorage");

            $localStorage.collection = [];
            $localStorage.collection = insectsByCategory;
          }
          console.log("data: ", data);

          // 1. Add items from the backend to the localstorage if there are no duplicates
          // but do not remove anything from localstorage
          for (var ind in data) {
            console.log("iterating over data");
            var insectData = data[ind];
            var duplicate = 0;

            var category = $localStorage.collection[insectData.category];

            for (var i = 0; i < category.length; i++) {
              var localInsect = category[i];

              if (localInsect._id == insectData._id) {
                console.log(
                  "found duplicate between localstorage and server data for insect: ",
                  localInsect.latinName
                );
                // found duplicate
                duplicate = true;
              }
            }
            if (!duplicate) {
              console.log(
                "adding local collection data with insect id: ",
                insectData._id
              );

              $localStorage.collection[insectData.category].push(insectData);
              $localStorage.collection[insectData.category].insectIds.push(
                insectData._id
              );
              $localStorage.collection[insectData.category].latinNames.push(
                insectData.latinName
              );
            }
          }

          // 2. sync the updated local collection with the remote collection
          if ($localStorage.collection.insectIds) {
            console.log("about to perform sync operation");
            var syncIds = [];
            $localStorage.collection.insectIds.forEach(function (
              insectId,
              ind
            ) {
              if (!data.includes(insectId)) {
                syncIds.push(insectId);
              }
            });

            // perform sync operation
            $http({
              url: "/collection/insertmany",
              insectIds: syncIds,
              user: $location.search().currentUser,
            }).success(function (response) {});
          }

          toggleLoadingSpinner($scope);
        }
      })
      .error(function () {
        console.log("failed to refresh collection");
        toggleLoadingSpinner($scope);
        alert($scope.translations.REFRESHINGCOLLECTION);
      });
    $scope.collectionEmpty = collectionEmpty($localStorage.collection);
    console.log("collection empty: ", $scope.collectionEmpty);

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
