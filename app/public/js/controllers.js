"use strict";

//lets require/import the mongodb native drivers.
//var mongodb = require('mongodb');
/* Controllers */

var insectIdentifierControllers = angular.module(
  "insectIdentifierControllers",
  ["ngCookies"]
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

insectIdentifierControllers.controller("ViewAlbumCtrl", [
  "$scope",
  "$location",
  "$http",
  "$cookies",
  function ($scope, $location, $http, $cookies) {
    console.log("album view ctrl");
    if ($location.search()) {
      const album = $location.search().album;
      $http({
        method: "GET",
        url: "/albums/view",
        params: { id: album._id },
      })
        .success(function (response) {
          console.log("response:", response);
          $scope.album = response.album;
        })
        .catch(function (error) {
          console.log("error:", error);
        });
    }
  },
]);

insectIdentifierControllers.controller("AlbumListCtrl", [
  "$scope",
  "$location",
  "$http",
  "$cookies",
  "$localStorage",
  "$window",
  function ($scope, $location, $http, $cookies, $localStorage, $window) {
    console.log("album list ctrl");
    $scope.albumList = [];
    $http({ method: "GET", url: "/albums/list" })
      .success(function (response) {
        console.log(response);
        $scope.albumList = response.albumList;
      })
      .catch(function (error) {
        console.log("error");
      });
    $scope.viewAlbum = function (album) {
      $location.path("view-album").search({ album: album });
    };

    $scope.deleteAlbum = function (album) {
      if (confirm("Are you sure you want to delete this album?")) {
        console.log("deleting...", album);

        $http({
          url: "/albums/delete",
          method: "DELETE",
          params: { id: album._id },
        })
          .success(function (response) {
            console.log("response", response);
            $scope.albumList = $scope.albumList.filter(
              (el) => el._id !== album._id
            );
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    };

    $scope.startAddingAlbum = function () {
      $window.location.href = "#/create-album";
    };
  },
]);

insectIdentifierControllers.controller("CreateAlbumCtrl", [
  "$scope",
  "$location",
  "$http",
  "$cookies",
  "$localStorage",
  "$window",
  function ($scope, $location, $http, $cookies, $localStorage, $window) {
    $scope.emptyCollection = false;
    $scope.messageError = "";
    $scope.messageInfo = "";
    console.log("in create album ctrl");
    sortCategories($scope);
    sortColors($scope);
    if (
      $localStorage.collection === undefined ||
      $localStorage.collection.length === 0
    ) {
      $scope.emptyCollection = true;
    }

    $scope.startToAddCollectionItems = function () {
      $location.path("search");
    };

    $scope.selectImage = async function (insect) {
      console.log("setting image");

      console.log("controller: setimage: " + insect.images[0]);

      if ($scope.selectedInsects.includes(insect._id)) {
        console.log("selected insect image was clicked again");
        $scope.selectedInsects = $scope.selectedInsects.filter(
          (selectedInsectId) => selectedInsectId !== insect._id
        );
        var previousThumbImg = document.getElementById(
          insect.images[0] + "_thumb.jpg"
        );
        if (previousThumbImg) {
          previousThumbImg.classList.toggle("activeThumb");
        }
      } else {
        // toggle the active status
        console.log("toggling the active status");
        $scope.selectedInsects.push(insect._id);
        var thumbImg = document.getElementById(insect.images[0] + "_thumb.jpg");
        if (thumbImg) {
          thumbImg.classList.toggle("activeThumb");
        }

        // drop event listener
        await wait(0.5);
        const albumCover = document.getElementById("album-cover");
        albumCover.addEventListener("drop", (e) => {
          e.preventDefault();
          console.log("hi from drop");
          var imageParent = document.getElementById("album-cover");
          imageParent.classList.remove("dragover");

          // remove earlier image
          console.log("imageparent.firstchild:", imageParent.firstChild);
          if (imageParent.firstChild) {
            console.log("removing child");
            imageParent.removeChild(imageParent.firstChild);
          }

          // add dragged image
          var image = document.createElement("img");
          var imageName = e.dataTransfer.getData("image");
          imageName = imageName.slice(0, imageName.length - 10);
          image.src = imageName;
          image.id = imageName;
          image.classList.add("album-cover-image");

          console.log("image", image);
          console.log("e.target:", e.target);
          imageParent.appendChild(image);

          // add class to parent element
          imageParent.classList.add("albumCoverWithImage");
          imageParent.classList.remove("album-cover");

          $scope.coverImage = imageName;
        });
      }
      console.log("selectedInsects:", $scope.selectedInsects);
    };

    $scope.saveAlbum = function (query) {
      console.log("cover:", $scope.coverImage);
      console.log("album name:", query.albumName);

      if ($localStorage.albums === undefined) {
        $localStorage.albums = [];
      }

      if ($scope.coverImage === undefined) {
        const insect = $localStorage.collection.find(
          (insect) => insect._id === $scope.selectedInsects[0]
        );
        $scope.coverImage = insect.images[0];
      }

      $localStorage.albums.push({
        name: query.albumName,
        insects: $scope.selectedInsects,
        cover: $scope.coverImage,
      });

      $http({
        url: "/albums/add",
        method: "POST",
        params: {
          name: query.albumName,
          insects: $scope.selectedInsects,
          coverImage: $scope.coverImage,
        },
      })
        .success(function (response) {
          console.log(response);
          $scope.messageInfo = response.message;
          setTimeout(
            function ($scope, $window) {
              $scope.messageInfo = "";
              $scope.$apply();
              $window.location.href = "#/album-list";
            },
            3000,
            $scope,
            $window
          );
        })
        .catch(function (error) {
          console.log(error);
          $scope.messageError = response.message;
          setTimeout(
            function ($scope, $location) {
              $scope.messageError = "";
              $scope.$apply();
            },
            3000,
            $scope
          );
        });
    };

    $scope.dropCtrl = function (e) {
      e.preventDefault();
      console.log("hi from drop");
      var imageParent = document.getElementById("album-cover");
      imageParent.classList.remove("dragover");

      // remove earlier image
      console.log("imageparent.firstchild:", imageParent.firstChild);
      if (imageParent.firstChild) {
        console.log("removing child");
        imageParent.removeChild(imageParent.firstChild);
      }

      // add dragged image
      var image = document.createElement("img");
      var imageName = e.dataTransfer.getData("image");
      imageName = imageName.slice(0, imageName.length - 10);
      image.src = imageName;
      image.id = imageName;
      image.classList.add("album-cover-image");

      console.log("image", image);
      console.log("e.target:", e.target);
      imageParent.appendChild(image);

      // add class to parent element
      imageParent.classList.add("albumCoverWithImage");
      imageParent.classList.remove("album-cover");
    };

    $scope.search = async function (query) {
      $scope.insects = [];
      const category = query.category;
      const primaryColor = query.primaryColor;
      const secondaryColor = query.secondaryColor;
      $scope.selectedInsects = [];
      const response = await $http({
        url: "/collections/search",
        method: "GET",
        params: {
          category: category,
          primaryColor: primaryColor,
          secondaryColor: secondaryColor,
        },
      });

      console.log("response: ", response);

      console.log(response.data.insects);
      if (response.data.insects === undefined) {
        console.log("error");
        $scope.searchResults = "noResults";
        return;
      }

      $scope.insects = response.data.insects;

      console.log("category: ", category);
      console.log("$scope.insects: ", $scope.insects);

      if ($scope.insects.length > 0) {
        $scope.searchResults = "showResults";
      } else {
        console.log("No results found");
        $scope.searchResults = "noResults";
        $scope.$apply();
        return;
      }
      await wait(0.2);
      $scope.itemsPerPage = 6;
      const visiblePages = 2;
      const totalPages = Math.ceil(
        ($scope.insects.length + 1) / $scope.itemsPerPage
      );

      if ($scope.insects.length > $scope.itemsPerPage) {
        $scope.hidePagination = false;
      } else $scope.hidePagination = true;

      console.log("$scope.hidePagination:", $scope.hidePagination);
      setPagedInsects($scope.insects, $scope);
      $scope.currentPage = 0;
      console.log("totalPages:", totalPages);
      console.log(
        "$scope.insects.length",
        $scope.insects.length,
        "$scope.itemsPerPage",
        $scope.itemsPerPage
      );
      // apply needs to be here in order for pagination to show
      $scope.$apply();

      window.pagObj = $("#pagination")
        .twbsPagination({
          totalPages: totalPages,
          visiblePages: visiblePages,
          onPageClick: function (event, page) {
            console.info(page + " (from options)");
            console.log("scope:", $scope);
            $scope.currentPage = page - 1;
            $scope.$apply();
            // update selected insects
            $scope.pagedInsects[$scope.currentPage].forEach(function (insect) {
              console.log("insect: ", insect);
              console.log("selected insects: ", $scope.selectedInsects);
              const insectFound = $scope.selectedInsects.includes(insect._id);
              if (insectFound) {
                console.log("insect found");
                var thumbImg = document.getElementById(
                  insect.images[0] + "_thumb.jpg"
                );
                console.log("thumbimg:", thumbImg);
                if (thumbImg) {
                  thumbImg.classList.toggle("activeThumb");
                }
              }
            });
          },
        })
        .on("page", function (event, page) {
          console.info(page + " (from event listening)");
        });
    };
  },
]);

insectIdentifierControllers.controller("ResetPasswordCtrl", [
  "$scope",
  "$location",
  "$http",
  "$cookies",
  function ($scope, $location, $http, $cookies) {
    $scope.message = "";
    $scope.messageInfo = "";
    const resetToken = $cookies.get("reset-token");
    console.log("resetToken: ", resetToken);

    $scope.passwordConfirmField = function () {
      console.log("password confirmation");
      const passwordConfirmEl = document.getElementById("passwordConfirm");

      if ($scope.password === $scope.passwordConfirm) {
        console.log("passwords match");
        passwordConfirmEl.classList.add("ng-valid");
        passwordConfirmEl.classList.remove("ng-invalid");
        $scope.passwordConfirmOk = true;
      } else {
        passwordConfirmEl.classList.remove("ng-valid");
        passwordConfirmEl.classList.add("ng-invalid");
        $scope.passwordConfirmOk = false;
        console.log('passwords don"t match');
      }
    };

    $scope.resetPassword = function () {
      const resetToken = $cookies.get("reset-token");
      console.log(resetToken);
      $http({
        method: "POST",
        url: "/reset-password/" + resetToken,
        params: {
          password: $scope.password,
          passwordConfirm: $scope.passwordConfirm,
        },
      })
        .success(function (response) {
          console.log(response);
          $scope.messageInfo = response.message;
          setTimeout(
            function ($scope, $location) {
              $scope.messageInfo = "";
              $scope.$apply();
              $location.path("#/login");
            },
            3000,
            $scope,
            $location
          );
        })
        .catch(function (err) {
          console.log(err);
          $scope.message = err.data.message;
          setTimeout(
            function ($scope) {
              $scope.messageInfo = "";
              $scope.$apply();
            },
            3000,
            $scope
          );
        });
    };
  },
]);

insectIdentifierControllers.controller("ForgotPasswordCtrl", [
  "$scope",
  "$location",
  "$http",
  function ($scope, $location, $http) {
    $scope.message = "";
    $scope.messageInfo = "";

    $scope.sendEmail = function () {
      $http({
        url: "/forgot-password",
        method: "POST",
        params: { emailOrUsername: $scope.emailOrUsername },
      })
        .success(function (response) {
          console.log(response);
          $scope.messageInfo = response.message;
          setTimeout(
            function ($scope) {
              $scope.messageInfo = "";
              $scope.$apply();
            },
            20000,
            $scope
          );
          return;
        })
        .catch(function (error) {
          console.log(error);
          $scope.message = error.data;
          setTimeout(
            function ($scope) {
              $scope.message = "";
              $scope.$apply();
            },
            10000,
            $scope
          );
          return;
        });
    };
  },
]);

insectIdentifierControllers.controller("LoggingCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$cookies",
  function ($scope, Search, $location, $http, $cookies) {
    $scope.message = "";
    console.log("logging controller");
    resetHeader();
    highlightElement("login");

    console.log("cookies.XSRF-TOKEN:", $cookies.get("XSRF-TOKEN"));
    $scope.csrftoken = $cookies.get("XSRF-TOKEN");
  },
]);

insectIdentifierControllers.controller("LoggingFailureCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$cookies",
  function ($scope, Search, $location, $http, $cookies) {
    $scope.$watch("translations", function (val) {
      $scope.message = $scope.translations.INCORRECTCREDENTIALS;
    });
    resetHeader();
    highlightElement("login");
    $scope.csrftoken = $cookies.get("XSRF-TOKEN");

    console.log("logging failure controller, message: " + $scope.message);
  },
]);

insectIdentifierControllers.controller("SignupCtrl", [
  "$scope",
  "Search",
  "$location",
  "$http",
  "$cookies",
  "$window",
  function ($scope, Search, $location, $http, $cookies, $window) {
    $scope.message = "";
    $scope.messageInfo = "";
    console.log("logging controller");
    resetHeader();

    console.log("cookies.XSRF-TOKEN:", $cookies.get("XSRF-TOKEN"));
    $scope.csrftoken = $cookies.get("XSRF-TOKEN");
    $scope.passwordConfirmField = function () {
      console.log("password confirmation");
      const passwordConfirmEl = document.getElementById("passwordConfirm");

      if ($scope.password === $scope.passwordConfirm) {
        console.log("passwords match");
        passwordConfirmEl.classList.add("ng-valid");
        passwordConfirmEl.classList.remove("ng-invalid");
        $scope.passwordConfirmOk = true;
      } else {
        passwordConfirmEl.classList.remove("ng-valid");
        passwordConfirmEl.classList.add("ng-invalid");
        $scope.passwordConfirmOk = false;
        console.log('passwords don"t match');
      }
    };

    $scope.signup = function () {
      console.log("$scope.password:", $scope.password);
      console.log("$scope.username:", $scope.username);
      console.log("$scope.email:", $scope.email);
      console.log("$scope.confirmPassword: ", $scope.passwordConfirm);
      if ($scope.password !== $scope.passwordConfirm) {
        $scope.message = "Passwords do not match";
        setTimeout(
          function ($scope) {
            $scope.message = "";
            $scope.$apply();
          },
          2000,
          $scope
        );
        return;
      }

      $http({
        url: "/signup",
        method: "POST",
        params: {
          password: $scope.password,
          passwordConfirm: $scope.passwordConfirm,
          email: $scope.email,
          username: $scope.username,
        },
      })
        .success(function (response) {
          console.log(
            "response:",
            response,
            "response.status:",
            response.status
          );
          if (response.message === "User already exists") {
            console.log("user already exists");
            $scope.message = "User already exists";
            setTimeout(
              function ($scope) {
                console.log("clearing message");
                $scope.message = "";
                $scope.$apply();
              },
              5000,
              $scope
            );
            return;
          }

          if (response.message === "Passwords do not match") {
            $scope.message = "Passwords do not match";
            setTimeout(
              function ($scope) {
                $scope.message = "";
                $scope.$apply();
              },
              5000,
              $scope
            );
            return;
          }
          $scope.messageInfo = "Successfully signed up. Redirecting...";
          setTimeout(
            function ($window) {
              console.log("changing to login page");
              $window.location.href = "#/login";
            },
            2000,
            $window
          );
        })
        .catch(function (error) {
          // validation error
          if (error.status === 400) {
            $scope.message = "Email is not valid";
            setTimeout(
              function ($scope) {
                console.log("clearing message");
                $scope.message = "";
                $scope.$apply();
              },
              5000,
              $scope
            );
            return;
          }
          if (error.status === 422) {
            $scope.message = "Username already exists";
            setTimeout(
              function ($scope) {
                console.log("clearing message");
                $scope.message = "";
                $scope.$apply();
              },
              5000,
              $scope
            );
            return;
          }
        });
    };
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
    $scope.query = {};
    $scope.query.placeType = "anyType";
    $scope.dropdownCountry = "All";
    $scope.hideMap = true;
    const displayAllOption = true;
    sortCountries($scope, displayAllOption);
    sortCategories($scope);
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

    $scope.updateDropbtnContent = function (content, value) {
      const dropBtnContent = document.getElementById("dropbtn-content-select");
      dropBtnContent.innerText = content;
      toggleDropdownContent();
      $scope.query.dropdownCountry = value;
    };

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
      if (observations.length === 0) {
        return;
      }
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
      console.log("country: ", query.dropdownCountry);

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

      var anyType = query.placeType === "anyType";
      var organicFarm = query.placeType === "organicFarm";
      var nonOrganicFarm = query.placeType === "nonOrganicFarm";

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

      console.log("anyTYpe: " + anyType);
      console.log("farmtype organicFarm: " + organicFarm);
      console.log("farmtype nonOrganicFarm: " + nonOrganicFarm);

      $http({
        url: "/observations/browse",
        method: "GET",
        params: {
          countryPart: query.countryPart,
          country: query.dropdownCountry,
          place: query.place,
          startDate: startDate,
          endDate: endDate,
          name: name,
          category: category,
          organicFarm: organicFarm,
          nonOrganicFarm: nonOrganicFarm,
          latitude: query.latitude,
          longitude: query.longitude,
          radius: query.radius,
        },
      }).success(async function (data) {
        if (data.length === 0) $scope.hideMap = true;
        else $scope.hideMap = false;

        $scope.observations = data;
        console.log("hidemap: ", $scope.hideMap);
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

        // map locations
        await wait(0.2);
        displayMap(data);

        // Hide spinner element
        spinnerEl.classList.toggle("spinner-loading");
        // Enable search button
        $scope.disableSearch = false;
        $scope.$apply();
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
      url: "/insects/upload-list",
      method: "GET",
      params: { userId: $scope.currentUser._id },
    }).success(function (data) {
      if (data[0]) {
        console.log("1st insect: " + data[0].latinName);
      }

      console.log("data.length: " + data.length);
      console.log("data: " + data);

      // order by category
      var uploadList = constructUploadListByCategory(data, $cookies);

      $scope.uploadList = uploadList;
      $scope.dataLength = data.length;
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
  "$cookies",
  function ($scope, Search, $location, $http, $localStorage, $cookies) {
    // header
    resetHeader();
    highlightElement("manage-button");
    $scope.csrftoken = $cookies.get("XSRF-TOKEN");
    // util
    sortColors($scope);
    sortCategories($scope);

    $scope.returnToUploadList = function () {
      $location.path("insect/uploadList").search({ user: $scope.currentUser });
    };

    $scope.deleteInsect = function () {
      var result = confirm("Are you sure you want to delete this insect?");
      if (!result) {
        console.log("not wanting to delete");
        return;
      }

      var params = {
        insectId: $scope.insect._id,
        user: $scope.currentUser,
      };
      $http({
        url: "/insects/delete",
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
          $scope.nroOfUserPhotos = files.length;
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
      if ($scope.numberOfImagesDownloaded > 0 || $scope.fileInputPopulated) {
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
    $scope.updated_at = 0;

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
      $scope.updated_at = insect.updatedAt;
      $scope.created_at = insect.createdAt;
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
    $scope.messageDelayTime = 2500;

    // check connectivity
    if ($localStorage.offline) {
      console.log("$localStorage.offline: ", $localStorage.offline);
    }
    $scope.connected = !$localStorage.offline;

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
      if ($localStorage.offline != "1") {
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

    $scope.removeFromCollection = function (insect) {
      // check authentication status before going to the Server
      var currentUser = $cookies.get("current.user");
      if (currentUser === "") {
        // attempt to remove the insect from local collection
        $scope.disableAddOrRemove = true;
        toggleLoadingSpinner($scope);
        $scope.removeInsectFromLocalCollection($scope, $localStorage);
        toggleLoadingSpinner($scope);
        $scope.disableAddOrRemove = false;
        return;
      }
      $scope.disableAddOrRemove = true;
      toggleLoadingSpinner($scope);

      // remove the insect from the remote collection
      $http({
        url: "/collections/remove",
        method: "DELETE",
        params: { insectId: insect._id, user: $location.search().currentUser },
      })
        .success(function (data) {
          console.log("data: " + data);
          if (data.msg) {
            // found item in the remote collection, remove it next from the local collection
            console.log("found item in the remote collection");
            $scope.removeInsectFromLocalCollection($scope, $localStorage);
          } else {
            // failed to remove the insect from the remote collection
            console.log(
              "failed to remove the insect from the remote collection"
            );
            alert("failed to remove the insect from the remote collection");
            $scope.removeInsectFromLocalCollection($scope, $localStorage);
          }
          toggleLoadingSpinner($scope);
          $scope.disableAddOrRemove = false;
        })
        .error(function (err) {
          console.log(
            "got error while removing item from collection, err:",
            err
          );
          alert("got error while removing item from collection, err:", err);
          toggleLoadingSpinner($scope);
          $scope.disableAddOrRemove = false;
        });
    };

    $scope.removeInsectFromLocalCollection = function ($scope, $localStorage) {
      var category = $scope.insect.category;

      var success = false;
      var collection = $localStorage.collection;
      // remove the insect from local collection
      const removeInd = collection.findIndex((insect) => {
        if (insect._id === $scope.insect._id) {
          return true;
        }
      });

      if (removeInd !== -1) {
        success = true;
        collection.splice(removeInd, 1);
        // remove the insect's images from local collection
        $scope.insect.images.forEach(function (image) {
          console.log('emptying local collection"s insect image:', image);
          $localStorage[image] = null;
          $localStorage[image + "_thumb.jpg"] = null;
        });
      }

      if (success) {
        $scope.messageRemovedSuccess =
          $scope.translations.REMOVEDINSECTFROMLOCALCOLLECTION;
        setDelay("messageRemovedSuccess", $scope.messageDelayTime, $scope);
        // update the state
        $scope.inCollection = 0;
      } else {
        setDelay("messageRemovedFailure", $scope.messageDelayTime, $scope);
        $scope.messageRemovedFailure =
          $scope.translations.FAILEDTOREMOVEINSECTFROMLOCALCOLLECTION;
      }

      return success;
    };

    $scope.add_to_collection = async function () {
      $scope.disableAddOrRemove = true;
      toggleLoadingSpinner($scope);

      var duplicate = false;
      var collection = $localStorage.collection;

      // 1. save to the localstorage
      if (collection) {
        console.log("category: " + $scope.insect.category);
        // check for duplicate
        const ind = collection.findIndex((insect) => {
          if (insect._id === $scope.insect._id) return true;
        });

        if (ind === -1) {
          collection.push($scope.insect);
          await saveImagesToLocalStorage($scope, $localStorage);
        } else {
          console.log("found duplicate");
          duplicate = true;
        }
      } else {
        $localStorage.collection = [];

        $localStorage.collection.push($scope.insect);
        console.log("initialized localstorage");

        await saveImagesToLocalStorage($scope, $localStorage);
      }

      // 2. save to the server
      if (!duplicate) {
        // check authentication status before going to the Server
        console.log("current.user: ", $cookies.get("current.user"));
        var currentUser = $cookies.get("current.user");
        if (currentUser === "") {
          $scope.setAddItemToCollectionMessage();
          toggleLoadingSpinner($scope);
          $scope.disableAddOrRemove = false;
          return;
        }
        console.log("performing insert item to remote collection");
        // insert the item to the remote collection

        $http({
          url: "/collections/insert",
          method: "POST",
          params: {
            insectId: $scope.insect._id,
            user: $location.search().currentUser,
          },
        })
          .success(function (data) {
            console.log(data);
            if (data.msg) {
              $scope.setAddItemToCollectionMessage();
            } else {
              console.log("inserting item to the remote database failed");
              alert(
                "inserting item to the remote database failed, might already exist there"
              );
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
        console.log("ITEMALREADYINCOLLECTION");
        $scope.messageCollectionAddFailure =
          $scope.translations.ITEMALREADYINCOLLECTION;
        setDelay("messageAddFailure", $scope.messageDelayTime, $scope);
      }
      toggleLoadingSpinner($scope);
      $scope.disableAddOrRemove = false;
    };

    $scope.setAddItemToCollectionMessage = function () {
      console.log("translations.ITEMSAVED");
      console.log(
        "$scope.translations.ITEMSAVED: ",
        $scope.translations.ITEMSAVED
      );
      $scope.messageCollectionAddSuccess = $scope.translations.ITEMSAVED;
      setDelay("messageAddSuccess", $scope.messageDelayTime, $scope);
      $scope.inCollection = 1;
      $scope.$apply();
    };

    $scope.callb = function (el) {
      console.log("callb insectdetail, el:", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl && htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.initMessages();
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
  "$cookies",
  function (
    $scope,
    Search,
    $location,
    $http,
    $localStorage,
    SearchService,
    $cookies
  ) {
    // Header
    resetHeader();
    highlightElement("observation-button");
    // util
    sortColors($scope);
    sortCategories($scope);
    // initialize form
    $scope.params = {
      country: "All",
      countrypart: null,
      place: "",
      count: "",
      placeType: "anytype",
      observationLatinName: "",
    };
    // disable fileupload success message
    $scope.showFileuploadSuccessMessage = "";
    $scope.addObservationFailure = "";
    $scope.addObservationSuccess = "";

    // toggle selected insect image flag
    $scope.toggleSelectedInsectImage = true;

    // reset the hidden insectid
    $scope.insectId = null;

    // resizing the container search
    $scope.resize = {};
    $scope.latinNameExists = undefined;

    sortCountries($scope, false, $cookies);

    // validation
    $scope.dateRequired = { date: 1 };
    $scope.observationLatinNameRequired = 1;

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

    $scope.getCurrentLocation = function () {
      const getPos = function (position) {
        $scope.params.latitude = position.coords.latitude;
        $scope.params.longitude = position.coords.longitude;
        console.log("latitude: ", $scope.params.latitude);
        console.log("longitude: ", $scope.params.longitude);
        toggleLoadingSpinner($scope, "spinner-search-location");
        $scope.$apply();
      };

      if (navigator.geolocation) {
        toggleLoadingSpinner($scope, "spinner-search-location");
        console.log("getting position");
        navigator.geolocation.getCurrentPosition(getPos);
      }
    };

    $scope.updateDropbtnContent = function (content, value) {
      const dropBtnContent = document.getElementById("dropbtn-content-select");
      dropBtnContent.innerText = content;
      toggleDropdownContent();
      $scope.params.dropdownCountry = value;
    };

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
        "query.placeType === 'organicFarm'",
        query.placeType === "organicFarm"
      );
      console.log(
        "query.placeType === 'nonorganicFarm'",
        query.placeType === "nonorganicFarm"
      );

      console.log("formattedDate: ", formattedDate instanceof Date);
      console.log("date: ", date instanceof Date);
      console.log(
        "new Date(formattedDate)",
        new Date(formattedDate) instanceof Date
      );
      console.log("new Date(date)", new Date(date) instanceof Date);
      console.log("new Date()", new Date() instanceof Date);

      console.log("query.country: " + query.dropdownCountry);
      params = {
        country: query.dropdownCountry,
        countryPart: query.countrypart,
        count: query.count,
        date: date,
        place: query.place,
        organicFarm: query.placeType === "organicFarm",
        nonOrganicFarm: query.placeType === "nonorganicFarm",
        user: $scope.currentUser,
        latinName: query.observationLatinName,
        insectId: $scope.insectId,
        latitude: query.latitude,
        longitude: query.longitude,
      };

      $http({ url: "/observations/add", method: "POST", params: params })
        .success(function (data) {
          console.log("add observation returned data: ", data);
          if (!data || data === "not authenticated") {
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

    $scope.search = async function (query) {
      await SearchService.search($scope, $localStorage, query);
      $scope.$apply();
      // select the active insect thumb
      if ($scope.insect) {
        var thumbImg = document.getElementById(
          $scope.insect.images[0] + "_thumb.jpg"
        );
        console.log(thumbImg);
        thumbImg.classList.toggle("activeThumb");
      }
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
      if (insect._id === $scope.insectId) {
        console.log("selected insect image was clicked again");
        // toggle the active class of the same clicked insect
        var currentThumbImg = document.getElementById(
          insect.images[0] + "_thumb.jpg"
        );
        if (currentThumbImg.classList.contains("activeThumb")) {
          // reset hidden insect id
          $scope.insectId = null;
        } else {
          $scope.insectId = insect._id;
        }

        currentThumbImg.classList.toggle("activeThumb");

        return;
      } else {
        // toggle the active status of the previously activated insect

        var previousThumbImg = document.getElementById(
          $scope.insect.images[0] + "_thumb.jpg"
        );
        if (
          previousThumbImg &&
          previousThumbImg.classList.contains("activeThumb")
        ) {
          previousThumbImg.classList.toggle("activeThumb");
        }

        var currentThumbImg = document.getElementById(
          insect.images[0] + "_thumb.jpg"
        );
        currentThumbImg.classList.toggle("activeThumb");

        $scope.mainImageUrl = insect.images[0];

        // update the hidden insect id
        $scope.insectId = insect._id;
        // update the pointer to the currently active insect
        $scope.insect = insect;

        // update the latinname input
        if (insect.latinName !== undefined) {
          $scope.params.observationLatinName = insect.latinName;
        }
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
  "ModalService",
  async function (
    $scope,
    Search,
    $location,
    $http,
    $localStorage,
    SearchService,
    $timeout,
    ModalService
  ) {
    // Update the main header
    resetHeader();
    highlightElement("search-header");
    $scope.showFileuploadSuccessMessage = "";
    // resizing the container search
    $scope.resize = {};
    //util
    sortColors($scope);
    sortCategories($scope);

    $scope.callb = function (el) {
      console.log("callb addobservation, el: ", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.showFileuploadSuccessMessage = "";
    };

    $scope.search = async function (query) {
      await SearchService.search($scope, $localStorage, query);
      $scope.$apply();
      // select the active insect thumb
      if ($scope.insect) {
        var thumbImg = document.getElementById(
          $scope.insect.images[0] + "_thumb.jpg"
        );
        console.log(thumbImg);
        thumbImg.classList.toggle("activeThumb");
      }
    };

    $scope.setImage = function (insect) {
      console.log("setting image");

      console.log("controller: setimage: " + insect.images[0]);
      console.log(
        "insect._id: ",
        insect._id,
        " $scope.insect._id:",
        $scope.insect._id
      );
      if (insect._id === $scope.insect._id) {
        console.log("selected insect image was clicked again");
        return;
      } else {
        // toggle the active status of the previously activated insect
        console.log("toggling the previous image");

        var previousThumbImg = document.getElementById(
          $scope.insect.images[0] + "_thumb.jpg"
        );
        if (previousThumbImg) {
          previousThumbImg.classList.toggle("activeThumb");
        }

        var currentThumbImg = document.getElementById(
          insect.images[0] + "_thumb.jpg"
        );
        currentThumbImg.classList.toggle("activeThumb");

        $scope.mainImageUrl = insect.images[0];

        $scope.insect = insect;
      }
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

    $scope.wait = function (seconds) {
      return new Promise(function (resolve) {
        console.log("in wait");
        setTimeout(resolve, 1000 * seconds);
      });
    };
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
        $location.search().insect
      );
      if ($location.search().insect === undefined) {
        return;
      }

      $scope.insect = $location.search().insect;
      if ($scope.insect.images === undefined || $scope.insect.images === null) {
        return;
      }
      console.log("$scope.insect.images[0]", $scope.insect.images[0]);

      // for proper pagination to work
      $scope.selectedInsect = $location.search().insect;

      $scope.searchResults = "showResults";

      // use localstorage to obtain the previous search results
      var insects = $localStorage.searchResults;
      console.log("insects: ", insects);
      $scope.insects = insects;
      $scope.setPagedInsects(insects);
      console.log("$scope.pagedInsects: ", $scope.pagedInsects);

      // responsiveness
      responsiveSearch($scope);
      // main image
      var imgs = [];
      for (var i = 0; i < insects.length; i++) {
        console.log("pushing image: ", insects[i].images[0]);
        imgs.push(insects[i].images[0]);

        if (insects[i].images[0] == $scope.insect.images[0]) {
          console.log("setting mainimage url:", insects[i].images[0]);
          $scope.mainImageUrl = insects[i].images[0];
        }
      }
      $scope.imgs = imgs;

      if ($scope.insect) {
        var thumbImg = document.getElementById(
          $scope.insect.images[0] + "_thumb.jpg"
        );
        while (thumbImg === undefined || thumbImg === null) {
          await $scope.wait(0.2);
          thumbImg = document.getElementById(
            $scope.insect.images[0] + "_thumb.jpg"
          );
          $scope.$apply();
        }

        console.log(thumbImg);
        // set the active thumb
        thumbImg.classList.toggle("activeThumb");

        $scope.$apply();
      }
    }
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
      url: "/insects/search",
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
  "ModalService",
  function (
    $scope,
    Search,
    $location,
    $http,
    $localStorage,
    $cookies,
    ModalService
  ) {
    // menu
    resetHeader();
    highlightElement("collection-button");

    console.log("$localStorage.offline", $localStorage.offline);
    if ($localStorage.offline === undefined) {
      $localStorage.offline = false;
    }
    $scope.checkbox = { offline: $localStorage.offline };
    $scope.remotePolicy = "pull-remote";
    $scope.localPolicy = "push-local";
    $scope.newRemoteDisabled = true;
    $scope.newLocalDisabled = true;
    $scope.updateDisabled = true;

    console.log("$scope.offline", $scope.checkbox.offline);
    $scope.initMessages = function () {
      $scope.messageUpdate = "";
      $scope.messageNewRemoteSuccess = "";
      $scope.messageNewLocalSuccess = "";
      $scope.skippingCollectionSynchronization = "";
    };

    $scope.localStorage = $localStorage;
    $scope.tmp = "";
    $scope.location = $location;

    $scope.lang = $cookies.get("lang");
    $scope.initMessages();

    $scope.viewOffline = function () {
      console.log("connected : " + !$scope.checkbox.offline);

      $localStorage.offline = $scope.checkbox.offline;
    };

    $scope.closeModal = function (id, buttonId) {
      console.log("buttonId:", buttonId);
      $scope.modalPressed = buttonId;
      ModalService.Close(id);
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

    $scope.openModal = function (id) {
      console.log("ModalService: ", ModalService);
      ModalService.Open(id);
    };

    $scope.callb = function (el) {
      console.log("callb collection, el:", el);
      var htmlEl = document.getElementById(el);
      if (htmlEl && htmlEl.classList.contains("is-paused")) {
        htmlEl.classList.remove("is-paused");
      }
      $scope.initMessages();

      $scope.$apply();
    };

    if ($localStorage.collection === undefined) {
      console.log("initializing localstorage");

      $localStorage.collection = [];
    }

    var collection = $localStorage.collection;
    console.log(
      "$location.search().currentUser:",
      $location.search().currentUser
    );
    var isUserAuthenticated = $cookies.get("current.user");
    console.log("isUserAuthenticated: ", isUserAuthenticated);
    if (isUserAuthenticated !== undefined && !isUserAuthenticated) {
      // check whether collection is empty
      $scope.collectionEmpty = collection.length === 0;
      console.log("collection empty: ", $scope.collectionEmpty);
      constructCollectionByCategory($localStorage, $cookies);
      return;
    } else {
      console.log("$scope.currentUser: ", $scope.currentUser);
    }

    // skip synchronization if the user is in offline mode and signed in

    if ($localStorage.offline === true) {
      if (isUserAuthenticated) {
        $scope.skippingCollectionSynchronization =
          "Skipping collection synchronization because of offline mode.";
        setDelay("skippingCollectionSynchronization", 3000, $scope);
      }
      console.log("skipping collection synchronization");

      return;
    }
    toggleLoadingSpinner($scope);
    var params = { user: $scope.currentUser };

    // search for remote collection items
    $http({ url: "/collections/list", method: "GET", params: params })
      .success(async function (data) {
        console.log("data: ", data);
        if (data === "not authenticated") {
          $scope.collectionEmpty = collection > 0;
          toggleLoadingSpinner($scope);
          return;
        }

        if (!data) {
          console.log("user has no items in remote collection");
          // no existing remote collection
          console.log("collection: ", collection);
          let ids = collection.map((insect) => insect._id);

          params = { insectIds: ids, user: $scope.currentUser };

          console.log("params.insectIds: ", params.insectIds);
          $scope.numberOfNewLocalItemsNoRemote = collection.length;

          // confirm if the authenticated user wants to insert
          // the existing local collection items to remote collection
          if (collection.length > 0) {
            console.log("opening modal: new-local-items-no-remote-modal");
            $scope.openModal("new-local-items-no-remote-modal");
            while (
              $scope.modalPressed === undefined ||
              $scope.modalPressed === null
            ) {
              await $scope.wait(1);
              $scope.$apply();
              console.log("waited for 1s");
            }
            if ($scope.modalPressed === "push") {
              console.log("pushing local changes");
              // synchronize all items in local storage with the remote (push local changes)
              $http({
                url: "/collections/insertmany",
                method: "POST",
                params: params,
              })
                .success(function (results) {
                  console.log("results: ", results);
                  if (results) {
                    console.log("synced the remote and local collections");
                  } else {
                    console.log(
                      "failed to sync between remote and local collections"
                    );
                  }
                })
                .error(function (err) {
                  console.log(
                    "error occured during syncing remote and local collection, err: ",
                    err
                  );
                });
            } else if ($scope.modalPressed === "remove") {
              console.log("choosing to empty the local collection");
              // remove local imagesDownloaded
              collection.forEach(function (localInsect) {
                localInsect.images.forEach(function (image) {
                  $localStorage[image] = null;
                  $localStorage[image + "_thumb.jpg"];
                });
              });
              // reset local collection
              $localStorage.collection = [];
            } else {
              console.log("choosing to later resolve changes");
            }
          } else {
            console.log("no items in the local storage");
          }

          toggleLoadingSpinner($scope);
        } else {
          if (typeof data === "string") {
            data = [];
          }
          //  Add items from the backend to the localstorage (pull changes) if there are no duplicates
          // OR allow the user to delete the new remote items

          var newRemoteObj = $scope.findNewRemoteItems(data);
          console.log("newremoteInsects: ", newRemoteObj.newRemoteInsects);
          $scope.newRemoteInsects = newRemoteObj.newRemoteInsects;
          console.log("newRemoteIds", newRemoteObj.newRemoteIds);

          if (newRemoteObj.newRemoteIds.length > 0) {
            //await waitForModalToBeLoaded("new-remote-items-modal");
            console.log("showing remote item modal");
            //open the modal and wait for choice
            $scope.openModal("new-remote-items-modal");
            while (
              $scope.modalPressed === undefined ||
              $scope.modalPressed === null
            ) {
              await $scope.wait(1);
              $scope.$apply();
              console.log("waited for 1s");
            }

            if ($scope.modalPressed === "pull") {
              console.log("pulling new remote items");
              $scope.pullNewItemsFromRemote($scope.newRemoteInsects);
            } else if ($scope.modalPressed === "remove") {
              console.log("deleting new remote items");
              $scope.deleteNewRemoteItems(data, newRemoteObj.newRemoteIds);
            } else {
              console.log("canceling new remote item syncing");
              $scope.$apply();
            }
            $scope.modalPressed = undefined;
          }

          //  find out which items are new in the local collection
          var newLocalInsectsObj = $scope.findNewItemsInLocalCollection(data);
          console.log("newlocalInsects:", newLocalInsectsObj.newLocalInsects);
          console.log("about to resolve new local items");
          $scope.numberOfNewLocalItems =
            newLocalInsectsObj.newLocalInsects.length;
          console.log(
            "$scope.numberOfNewLocalItems: ",
            $scope.numberOfNewLocalItems
          );

          //  sync the (updated) local collection with the remote collection OR update merge request flag
          if (newLocalInsectsObj.newLocalInsects.length > 0) {
            $scope.openModal("new-local-items-modal");
            while (
              $scope.modalPressed === undefined ||
              $scope.modalPressed === null
            ) {
              await $scope.wait(1);
              $scope.$apply();
              console.log("waited for 1s");
            }

            if ($scope.modalPressed === "push") {
              $scope.pushNewItemsFromLocalCollection(
                newLocalInsectsObj.newLocalIds
              );
            } else if ($scope.modalPressed === "remove") {
              $scope.removeItemsFromLocal(newLocalInsectsObj.newLocalIds);
            } else {
              console.log("canceling new local items syncing");
              $scope.newLocalInsects = newLocalInsectsObj.newLocalInsects;
            }
            $scope.modalPressed = undefined;
            $scope.$apply();
          }

          // updates
          console.log("finding modified items");
          var updatedInsectsObj = $scope.findUpdatedIdsWithInsects(data);
          $scope.numberOfUpdatedItems = updatedInsectsObj.updatedInsects.length;
          console.log(
            "$scope.numberOfUpdatedItems: ",
            $scope.numberOfUpdatedItems
          );
          if ($scope.numberOfUpdatedItems > 0) {
            // conflictobj , images array is of form {image: string, added: boolean}
            console.log(
              "constructing conflict object between local and remote items"
            );
            var conflictObj = $scope.constructConflictObject(
              updatedInsectsObj.updatedInsects
            );

            console.log("conflictObj: ", conflictObj);
            $scope.openModal("updated-items-modal");
            while (
              $scope.modalPressed === undefined ||
              $scope.modalPressed === null
            ) {
              await $scope.wait(1);
              console.log("waited for 1s");
              $scope.$apply();
            }
            if ($scope.modalPressed === "update") {
              console.log("applying modifications");
              $scope.applyModifiedItems(
                updatedInsectsObj.updatedInsects,
                updatedInsectsObj.updatedIds
              );
            } else {
              console.log("choosing to update items later");
              $scope.conflictObj = conflictObj;
              console.log("$scope.conflictObj: ", $scope.conflictObj);

              $scope.updatedInsectsObj = updatedInsectsObj;
              $scope.$apply();
            }
          }
          console.log("sync done");

          toggleLoadingSpinner($scope);
        }
        $scope.newRemoteDisabled = false;
        $scope.newLocalDisabled = false;
        $scope.updateDisabled = false;
        $scope.collectionEmpty = collection.length === 0;
        constructCollectionByCategory($localStorage, $cookies);
        console.log("collection empty: ", $scope.collectionEmpty);
        $scope.$apply();
      })
      .error(function () {
        console.log("failed to refresh collection");
        $scope.collectionEmpty = collection.length === 0;
        console.log("collection empty: ", $scope.collectionEmpty);
        constructCollectionByCategory($localStorage, $cookies);
        toggleLoadingSpinner($scope);
        alert($scope.translations.REFRESHINGCOLLECTION);
      });

    $scope.showModal = function (id) {
      return new Promise(function (resolve) {
        waitForModalToBeLoaded(
          id,
          function () {
            $scope.openModal(id);
            resolve({ msg: "ok" });
          },
          500,
          9000,
          ModalService
        );
      });
    };

    $scope.wait = function (seconds) {
      return new Promise(function (resolve) {
        setTimeout(resolve, 1000 * seconds);
      });
    };

    $scope.constructConflictObject = function (updatedRemoteInsects) {
      var results = [];
      console.log("updatedInsects:", updatedRemoteInsects);

      updatedRemoteInsects.forEach(function (updatedRemoteInsect) {
        const localInd = $localStorage.collection.findIndex((insect) => {
          if (insect._id === updatedRemoteInsect._id) return true;
        });

        if (localInd > -1) {
          const changedImages = [];
          const outdatedLocalInsect = $localStorage.collection[localInd];
          if (
            outdatedLocalInsect.images.length === 1 &&
            updatedRemoteInsect.images.length == 1
          ) {
            console.log(
              "not necessary to find the difference between the original and remote insect images"
            );
          } else {
            console.log("outdatedLocalInsect: ", outdatedLocalInsect);
            console.log("updatedRemoteInsect: ", updatedRemoteInsect);

            // check deleted images in updated insect
            $scope.findDeletedImages(
              outdatedLocalInsect,
              updatedRemoteInsect,
              changedImages
            );
            console.log("changedImages: ", changedImages);

            // check added images in updated insect
            $scope.findNewImages(
              outdatedLocalInsect,
              updatedRemoteInsect,
              changedImages
            );
            console.log("changedImages: ", changedImages);
          }

          results.push({
            outdatedInsect: outdatedLocalInsect,
            changedImages: changedImages,
            updatedInsect: updatedRemoteInsect,
          });
        }
        // }
      });

      console.log(
        "local insects with changed images and updated insects: ",
        results
      );
      return results;
    };

    // in updated insect
    $scope.findNewImages = function (
      outdatedLocalInsect,
      updatedRemoteInsect,
      changedImages
    ) {
      console.log(outdatedLocalInsect);
      console.log(updatedRemoteInsect);
      console.log(updatedRemoteInsect.images);
      const addedImages = updatedRemoteInsect.images.filter(
        (image) => !outdatedLocalInsect.images.includes(image)
      );
      console.log(addedImages);
      addedImages.forEach((addedImage) => {
        console.log(
          "found that an image is added to updated remote insect with url: ",
          addedImage
        );
        changedImages.push({ url: addedImage, added: "1" });
      });

      console.log("changedImages: ", changedImages);
    };

    // in updated insect
    $scope.findDeletedImages = function (
      outdatedLocalInsect,
      updatedRemoteInsect,
      changedImages
    ) {
      const removedImages = outdatedLocalInsect.images.filter(
        (image) => !updatedRemoteInsect.images.includes(image)
      );
      removedImages.forEach((removedImage) => {
        console.log(
          "found that an image is deleted from updated remote insect with url: ",
          removedImage
        );
        changedImages.push({ url: removedImage, added: "0" });
      });

      console.log("changedImages: ", changedImages);
    };

    $scope.findNewRemoteItems = function (data) {
      var resultObj = { newRemoteIds: [], newRemoteInsects: [] };

      // get the remote ids
      var remoteInsectIds = data.map((insect) => insect._id);
      var localInsectIds = $localStorage.collection.map((insect) => insect._id);
      console.log("remoteInsectIds", remoteInsectIds);
      //console.log("$localstorage:", $localStorage);

      remoteInsectIds.forEach(function (remoteId, ind) {
        if (!localInsectIds.includes(remoteId)) {
          console.log(
            "local collection does not include item with id: ",
            remoteId
          );

          resultObj["newRemoteIds"].push(remoteId);
          var newRemoteInsect = data.find((insect) => insect._id === remoteId);
          resultObj["newRemoteInsects"].push(newRemoteInsect);
        }
      });

      return resultObj;
    };

    $scope.deleteNewRemoteItems = function (data, removeRemoteIds) {
      console.log("delete new remote items");
      console.log("removed local ids: ", removeRemoteIds);

      $http({
        url: "/collections/removemany",
        method: "DELETE",
        params: { user: $scope.currentUser, removeInsectIds: removeRemoteIds },
      })
        .success(function (response) {
          if (response.msg) {
            console.log("successfully deleted new remote items");
          } else {
            console.log("failed to delete remote items");
          }
        })
        .error(function (err) {
          console.log(
            "got error while deleting many items from the remote collection, err: " +
              err
          );
        });
    };

    // return the remote insects and remote insect ids
    $scope.findUpdatedIdsWithInsects = function (remoteInsects) {
      // check if data[i]._id is included in collection.insects

      var resultObj = { updatedIds: [], updatedInsects: [] };
      var remoteInsectIds = remoteInsects.map(
        (remoteInsect) => remoteInsect._id
      );

      console.log("remoteInsectIds", remoteInsectIds);

      $localStorage.collection.forEach(function (localInsect, ind) {
        // remote collection data
        console.log("insectId: ", localInsect._id);
        if (remoteInsectIds.includes(localInsect._id)) {
          console.log("remote collection includes id: ", localInsect._id);

          console.log("data: ", remoteInsects);
          var remoteInd = remoteInsects.findIndex((remoteInsect) => {
            if (remoteInsect._id === localInsect._id) return true;
          });

          console.log("remoteInd: ", remoteInd);
          console.log("insect: ", localInsect);

          // check updated fields
          if (
            remoteInd >= 0 &&
            remoteInsects[remoteInd].updatedAt !== undefined &&
            localInsect.updatedAt !== undefined &&
            remoteInsects[remoteInd].updatedAt > localInsect.updatedAt
          ) {
            console.log(
              "remote insect and the local insect update time is different"
            );

            resultObj.updatedIds.push(localInsect._id);
            resultObj.updatedInsects.push(remoteInsects[remoteInd]);
          } else {
            console.log("remote and local insect the same");
          }
        }
      });

      console.log("updatedInsectsObj: ", resultObj);

      return resultObj;
    };

    // updated ids refers to modified remote ids
    $scope.applyModifiedItems = function (updatedInsects, updatedIds) {
      const localInsects = $localStorage.collection;

      updatedIds.forEach(async function (updatedId, updatedIdInd) {
        const indLocal = localInsects.findIndex((localInsect) => {
          if (localInsect._id === updatedId) return true;
        });

        const indUpdated = updatedIds.indexOf(updatedId);
        console.log("indUpdated", indUpdated, " updatedIdInd: ", updatedIdInd);

        // 1. update the local collection's insect
        localInsects[indLocal] = updatedInsects[indUpdated];

        // modify the images array to include only added pictures
        const addedImages = [];

        // 2. load local images again
        $scope.findNewImages(
          $scope.conflictObj[updatedIdInd].outdatedInsect,
          $scope.conflictObj[updatedIdInd].updatedInsect,
          addedImages
        );

        const addedImagesUrls = addedImages.map((addedImage) => addedImage.url);

        // to avoid mutating the updatedInsects
        $scope.insect = JSON.parse(JSON.stringify(updatedInsects[indUpdated]));
        $scope.insect.images = addedImagesUrls;
        console.log("adding new images to local storage: ", addedImages);

        await $scope.saveImagesToLocalStorage($scope, $localStorage);
        $scope.$apply();
        const removedImages = [];

        // 3. remove old local images
        $scope.findDeletedImages(
          $scope.conflictObj[updatedIdInd].outdatedInsect,
          $scope.conflictObj[updatedIdInd].updatedInsect,
          removedImages
        );

        for (var i = 0; i < removedImages.length; i++) {
          console.log(
            "removing image: ",
            removedImages[i].url,
            "from localStorage"
          );
          $localStorage[removedImages[i].url + "_thumb.jpg"] = null;
          $localStorage[removedImages[i].url] = null;
        }
      });
    };

    $scope.removeItemsFromLocal = function (localIds) {
      console.log("remove items from local");
      var insectsByCategory = $localStorage.collection;
      var insectsByCategoryTmp = JSON.parse(JSON.stringify(insectsByCategory));

      // 1. remove from insectsByCategory
      localIds.forEach(function (localId) {
        console.log("id: ", localId);
        insectsByCategoryTmp = insectsByCategoryTmp.filter(
          (insect) => insect._id !== localId
        );
      });

      // update the collection
      $localStorage.collection = insectsByCategoryTmp;

      // 2 images
      // remove the insect's images
      console.log("removing local images for ids: ", localIds);
      const localInsects = $scope.findLocalInsects(localIds);
      localInsects.forEach(function (localInsect) {
        localInsect.images.forEach(function (image) {
          console.log('emptying local collection"s insect image:', image);
          $localStorage[image] = null;
          $localStorage[image + "_thumb.jpg"] = null;
        });
      });

      $localStorage.collection = insectsByCategoryTmp;
      console.log("collection after", $localStorage.collection);
    };

    $scope.pushNewItemsFromLocalCollection = function (syncIds) {
      console.log(
        "choosing to push new items from local to the remote collection"
      );
      $http({
        url: "/collections/insertmany",
        params: { insectIds: syncIds },
        user: $location.search().currentUser,
        method: "POST",
      })
        .success(function (response) {
          console.log("response: ", response);
          if (response.compendium) {
            console.log("response.length: ", response.compendium.length);
            alert(
              "added " +
                response.compendium.length +
                " items to remote collection"
            );
          } else {
            console.log(
              "no items were added from local collection to remote collection"
            );
          }
        })
        .error(function (error) {
          console.log(
            "got error while syncing local collection to remote collection, error: " +
              error
          );
        });
    };

    $scope.pullNewItemsFromRemote = function (newRemoteInsects) {
      console.log("pull new items from remote");
      var insectsByCategory = $localStorage.collection;
      newRemoteInsects.forEach(function (newRemoteInsect) {
        console.log("iterating over data");
        const localInd = insectsByCategory.findIndex((insect) => {
          if (insect._id === newRemoteInsect._id) return true;
        });
        if (localInd === -1) {
          console.log(
            "adding to local collection item from remote collection with insect id: ",
            newRemoteInsect._id
          );
          insectsByCategory.push(newRemoteInsect);
          // add the image of the item to the local collection
          $scope.insect = newRemoteInsect;

          $scope.saveImagesToLocalStorage($scope, $localStorage);
        } else {
          console.log("found a duplicate remote item in local collection");
        }
      });
    };

    $scope.findNewItemsInLocalCollection = function (data) {
      console.log("finding out which items are new in the local collection");

      var resultObj = { newLocalIds: [], newLocalInsects: [] };
      console.log("data is: ", data);
      if (data.length > 0) {
        console.log("data[0]._id", data[0]._id);
      }
      // get the remote ids
      var remoteInsectIds = data.map((insect) => insect._id);
      console.log("remoteInsectIds: ", remoteInsectIds);
      // get the local insects objects
      var localInsects = $scope.findLocalInsects();
      console.log("localInsects is: ", localInsects);

      console.log("localstorage.collection: ", $localStorage.collection);
      $localStorage.collection.forEach(function (insect, ind) {
        // remote collection data
        console.log("insectId: ", insect._id);
        if (insect._id !== undefined && !remoteInsectIds.includes(insect._id)) {
          console.log(
            "remote collection does not include item with id: ",
            insect._id
          );
          resultObj["newLocalIds"].push(insect._id);
          var localInsect = localInsects.find(
            (localInsect) => localInsect._id === insect._id
          );
          resultObj["newLocalInsects"].push(localInsect);
        }
      });

      return resultObj;
    };

    $scope.saveImagesToLocalStorage = async function ($scope, $localStorage) {
      const res = await saveImagesToLocalStorage($scope, $localStorage);
    };

    $scope.findLocalInsects = function (remoteIds) {
      let localInsects = [];

      if (remoteIds) {
        remoteIds.forEach(function (remoteId) {
          const localInd = $localStorage.collection.findIndex((insect) => {
            if (insect._id === remoteId) return true;
          });
          if (localInd !== -1)
            localInsects.push($localStorage.collection[localInd]);
        });
      } else {
        localInsects = $localStorage.collection;
      }
      console.log("localInsects", localInsects);
      return localInsects;
    };

    $scope.updateInsects = function () {
      console.log(
        "scope.updatedInsectsObj.updatedInsects: ",
        $scope.updatedInsectsObj.updatedInsects
      );
      toggleLoadingSpinner($scope);
      $scope.applyModifiedItems(
        $scope.updatedInsectsObj.updatedInsects,
        $scope.updatedInsectsObj.updatedIds
      );
      constructCollectionByCategory($localStorage, $cookies);
      $scope.hideUpdateButton = true;

      $scope.messageUpdate = "Successfully updated the local collection.";

      setDelay("messageUpdate", 2000, $scope.callb);
      toggleLoadingSpinner($scope);
    };

    $scope.remoteSync = function (remotePolicy) {
      console.log("starting remote sync");
      console.log(remotePolicy);
      toggleLoadingSpinner($scope);
      if (remotePolicy === "delete-remote") {
        console.log("deleting new remote items");
        const newRemoteIds = $scope.newRemoteInsects.map(
          (remoteInsect) => remoteInsect._id
        );
        $scope.deleteNewRemoteItems(null, newRemoteIds);
      } else if (remotePolicy === "pull-remote") {
        console.log("pulling new remote items");
        $scope.pullNewItemsFromRemote($scope.newRemoteInsects);
        $scope.collectionEmpty = $localStorage.collection.length === 0;
        constructCollectionByCategory($localStorage, $cookies);
      } else {
        console.log("check selection value");
      }
      toggleLoadingSpinner($scope);
      $scope.messageNewRemoteSuccess =
        "Successfully synchronized remote collection";
      $scope.hideRemoteButton = true;
    };

    $scope.localSync = function (localPolicy) {
      console.log("starting local sync");
      console.log(localPolicy);
      toggleLoadingSpinner($scope);
      const newLocalIds = $scope.newLocalInsects.map(
        (localInsect) => localInsect._id
      );
      if (localPolicy === "delete-local") {
        console.log("deleting new local items");
        console.log("newinsectids: ", newLocalIds);
        $scope.removeItemsFromLocal(newLocalIds);
        $scope.collectionEmpty = $localStorage.collection.length === 0;
        constructCollectionByCategory($localStorage, $cookies);
      } else if (localPolicy === "push-local") {
        console.log("pushing new local items");
        $scope.pushNewItemsFromLocalCollection(newLocalIds);
      } else {
        console.log("check selection value");
      }
      toggleLoadingSpinner($scope);
      $scope.messageNewLocalSuccess =
        "Successfully synchronized local collection";
      $scope.hideLocalButton = true;
    };
  },
]);
