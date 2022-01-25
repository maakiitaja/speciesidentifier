function toggleElements(hideElem, showElem) {
  document.getElementById(hideElem).visibility = "hidden";
  document.getElementById(showElem).visibility = "visible";
}

//Where el is the DOM element you'd like to test for visibility
function isHidden(el) {
  return el.offsetParent === null;
}

function updateMainImageUrl($scope) {
  var elem = $(".insect-thumbs").find(":first");
  console.log("elem: " + JSON.stringify(elem));
  if (elem) console.log(" with id: " + elem.id);
}

function setDelay(callback, ms) {
  var myVar = window.setTimeout(callback, ms);
}

function isvisible(obj) {
  return obj.offsetWidth > 0 && obj.offsetHeight > 0;
}

function insectDetail($location, $scope) {
  // decode the previously encoded imagepath
  console.log("$scope.insect: ", $scope.insect);
  console.log("encoded imagepath: ", $scope.insect.images[0]);
  $scope.insect.images[0] = decodeURIComponent($scope.insect.images[0]);
  console.log("decoded imagepath: ", $scope.insect.images[0]);
  $location.path("insect").search({ insect: $scope.insect, prevUrl: "#/list" });
}

function updateRequired() {
  var latinName = document.getElementById("latinName").value;
  console.log("latinName: " + latinName);
  if (latinName) $scope.latinNameRequired = "false";
  else $scope.latinNameRequired = "true";
}

function setPagedInsects(insects, $scope) {
  // hide pagination if necessary
  if (insects.length === 1) {
    $scope.hidePagination = true;
    $scope.noInsectThumbs = true;
  } else if (insects.length <= $scope.itemsPerPage) {
    $scope.hidePagination = true;
    $scope.noInsectThumbs = false;
  } else {
    $scope.hidePagination = false;
    $scope.noInsectThumbs = false;
  }

  $scope.nroOfPages = insects.length / $scope.itemsPerPage;
  if (!isInt($scope.nroOfPages)) {
    $scope.nroOfPages = Math.floor($scope.nroOfPages);
    $scope.nroOfPages++;
  }
  console.log("nroofpages: " + $scope.nroOfPages);
  // clear paged insects
  $scope.pagedInsects = [];
  // loop through nro of pages
  for (var i = 0; i < $scope.nroOfPages; i++) {
    // loop through nro of insects per page
    console.log("util selectedInsect:", $scope.selectedInsect);
    for (var j = 0; j < $scope.itemsPerPage; j++) {
      if (j == 0) {
        $scope.pagedInsects[i] = [];
      }
      if (insects[i * $scope.itemsPerPage + j] !== undefined) {
        $scope.pagedInsects[i].push(insects[i * $scope.itemsPerPage + j]);
      }
      console.log("pagedinsects[i][j]: " + $scope.pagedInsects[i][j]);
      // choose the pagination page corresponding to the selected insect
      if (
        $scope.selectedInsect !== undefined &&
        $scope.pagedInsects[i][j] !== undefined &&
        $scope.selectedInsect._id === $scope.pagedInsects[i][j]._id
      ) {
        console.log("util: changing pagination current page to: ", i + 1);
        $scope.currentPage = i;
      }
    }
  }
}

function getVw() {
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  return vw;
}

function getInsectIdsFromLocalCollection(collection) {
  var ids = [];

  if (collection === undefined) {
    return null;
  }
  console.log("collection: ", collection);

  for (var ind in collection) {
    console.log("category ", ind);
    console.log("category.length ", collection[ind].length);
    collection[ind].forEach(function (id) {
      ids.push(id);
    });
  }
  return ids;
}

function collectionEmpty(collection) {
  var isEmpty = true;

  if (collection === undefined || collection === null) {
    return isEmpty;
  }
  console.log("collection: ", collection);

  for (var ind in collection.insectsByCategory) {
    console.log("category ", ind);
    console.log("category.length ", collection.insectsByCategory[ind].length);
    if (collection.insectsByCategory[ind].length > 0) {
      isEmpty = false;
      break;
    }
  }
  return isEmpty;
}

setDelay = function (el, ms, $scope) {
  console.log("in set delay, el:", el);
  const timeoutF = function (elName, $scope) {
    console.log("setdelay: calling callb, elName:", elName);
    $scope.callb(elName);
  };
  setTimeout(timeoutF, ms, el, $scope);
};

resetHeader = function () {
  //loop through all the menu items and remove the highlighted/selected css class
  var dropbtnEls = document.querySelectorAll(".dropbtn");
  dropbtnEls.forEach(function (el) {
    el.classList.remove("dropbtn-selected");
    el.classList.add("dropbtn-nonselected");
  });
};

highlightElement = function (elName) {
  // add the selected class to the current nav item
  var el = document.getElementById(elName);
  if (el) {
    el.classList.add("dropbtn-selected");
    el.classList.remove("dropbtn-nonselected");
  } else {
    console.log("util highlightelement, element is null:", elName);
  }
};

// xml blob res
function getImgURL(url, transferContainer, ind, callback) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    var enableCORS = true;

    console.log("getImgURL ind: ", ind);

    console.log("getimgurl before xhr.open");
    xhr.open("GET", url, enableCORS);
    xhr.extraInfo = { ind: ind, transferContainer: transferContainer };
    console.log("getimgurl after xhr.open");
    xhr.responseType = "blob";
    console.log("getimgurl before xhr.send");
    xhr.send();
    console.log("getimgurl after xhr.send");

    xhr.onload = function () {
      console.log(
        "xhr.onload start, transfercontainer: " +
          transferContainer +
          " ind: " +
          this.extraInfo.ind
      );

      callback(
        xhr.response,
        this.extraInfo.transferContainer,
        this.extraInfo.ind
      )
        .then(() => {
          if (this.status >= 200 && this.status < 300) {
            console.log("happy");
            resolve({ message: true });
          } else {
            console.log("sad");
            transferContainer.items = null;
            reject({ message: false });
          }
        })
        .catch((err) => {
          console.log("callback failure");
        });
    };
    xhr.onerror = function () {
      console.error("** An error occurred during the XMLHttpRequest");
      alert("Attempt of fetching the resource failed");
      resolve({
        msg: false,
      });
    };
  });
}

function loadURLToContainer(url, transferContainer, ind) {
  return new Promise(function (resolve, reject) {
    console.log("loadUrlToInputFIeld, transferContainer: " + transferContainer);

    getImgURL(url, transferContainer, ind, (imgBlob, container, index) => {
      return new Promise(function (resolve, reject) {
        const containerObj = container;
        // Load img blob to input
        let fileName = "filename_" + index + ".jpg"; // should .replace(/[/\\?%*:|"<>]/g, '-') for remove special char like / \
        console.log("filename: ", fileName, " imgBlob: ", imgBlob);
        // validate
        let file = new File(
          [imgBlob],
          fileName,
          { type: "image/jpeg", lastModified: new Date().getTime() },
          "utf-8"
        );

        console.log("getImgURL, file: ", file);
        console.log("getImgUrl, container:", containerObj);
        containerObj.items.add(file);
        console.log("util: added items to transfer container");

        if (file) {
        }
        resolve({ message: true });
      });
    })
      .then((msg) => {
        console.log("promise returned from getImgUrl: ", msg);
        if (!msg.message) {
          console.log("setting transfercontainer back to empty");
          containerObj.files = null;
          containerObj.items = null;
        }
        resolve({ message: msg });
      })
      .catch((err) => {
        console.log("getimgurl catch error");
        reject({ msg: err });
      });
  }).catch((err) => {
    console.log("loadurltocontainer catch error");
    //reject({ msg: err });
  });
}

function getBase64FromImage(id, name, $localStorage, $scope) {
  console.log("getbase64fromimageurl, id: " + id + " and name: " + name);
  return new Promise(function (resolve, reject) {
    var loadImageToLocalStorage = function (id, name, $localStorage) {
      console.log("on load image to local storage");
      try {
        var img = new Image();

        //img.setAttribute("crossOrigin", "anonymous");
        console.log("img.src: ", name);
        img.src = name;

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

          canvas.width = this.width;
          canvas.height = this.height;

          var ctx = canvas.getContext("2d");
          ctx.drawImage(this, 0, 0);

          var dataURL = canvas.toDataURL("image/png");

          //alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));

          // set to localstorage
          //name = name.replace(/^ ', "");

          console.log("saving image with name: " + name + " to localstorage");
          // TODO catch max size reached
          $localStorage[name] = dataURL;
          resolve({ msg: true });
        };
      } catch (e) {
        console.log("image elememnt not found for id: ", id);
        reject({ msg: false });
      }
    };
    loadImageToLocalStorage(id, name, $localStorage);
  }).catch((err) => {
    console.log("error occured err:", err);
  });
}

function toggleLoadingSpinner($scope) {
  var spinnerEl = document.getElementById("spinner-search");
  $scope.displaySpinner = !$scope.displaySpinner;
  if (spinnerEl) {
    spinnerEl.classList.toggle("spinner-loading");
  } else {
    console.log("couldn't toggle loading spinner");
  }
}

// example: waitForElementToDisplay(
//   "#div1",
//   function () {
//     alert("Hi");
//   },
//   1000,
//   9000
// );

function waitForElementToDisplay(
  selector,
  callback,
  checkFrequencyInMs,
  timeoutInMs
) {
  var startTimeInMs = Date.now();
  (function loopSearch() {
    console.log("searching for ", selector, " in the document");
    if (document.getElementById(selector) != null) {
      console.log("found the image: ", selector);
      callback();
      return;
    } else {
      console.log('couldn"t find the image: ', selector);
      setTimeout(function () {
        console.log("in set timeout, checking end condition");
        if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}

function waitForModalToBeLoaded(
  selector,
  callback,
  checkFrequencyInMs,
  timeoutInMs,
  ModalService
) {
  var startTimeInMs = Date.now();
  (function loopSearch() {
    var modal = ModalService.Get(selector);

    console.log("searching for ", selector, " in the document");
    if (modal != null) {
      console.log("found the modal: ", selector);
      callback();
      return;
    } else {
      console.log('couldn"t find the modal: ', selector);
      setTimeout(function () {
        console.log("in set timeout, checking end condition");
        if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}

function saveImagesToLocalStorage($scope, $localStorage) {
  /* loop through insect's images */
  return new Promise(function (resolve, reject) {
    console.log("saving images to local storage");
    var imagePromises = [];
    $scope.loadingLocalImages = true;

    for (var i = 0; i < $scope.insect.images.length; i++) {
      // full pic
      console.log("before saving main image to localstorage");
      var mainImagePromise = new Promise(function (resolve, reject) {
        getBase64FromImage(
          $scope.insect.images[i],
          $scope.insect.images[i],
          $localStorage,
          $scope
        ).then(function (result) {
          console.log(
            "promise returnining after getBase64Fromimage, result.msg",
            result.msg
          );
          //return result;
          if (result !== undefined && result.msg) {
            console.log("promise ok");
            resolve({ msg: "ok" });
          } else {
            console.log("promise fail");
            reject({ msg: "fail" });
          }
        });
      });

      console.log("after saving main image to localstorage");

      // thumb
      var thumbPromise = new Promise(function (resolve, reject) {
        getBase64FromImage(
          $scope.insect.images[i] + "_thumb.jpg",
          $scope.insect.images[i] + "_thumb.jpg",
          $localStorage,
          $scope
        ).then(function (result) {
          console.log(
            "promise returnining after getBase64Fromimage, result.msg",
            result.msg
          );
          //return result;
          if (result !== undefined && result.msg) {
            console.log("promise ok");
            console.log("result: ", result);
            resolve({ msg: "ok" });
          } else {
            console.log("promise fail, result:", result);
            reject({ msg: "fail" });
          }
        });
      });
      imagePromises.push(mainImagePromise);
      imagePromises.push(thumbPromise);
    }

    Promise.all(imagePromises)
      .then(function (results) {
        console.log("results: " + results);
        if (results.length > 0) {
          console.log(
            "local images loaded for insect: " + $scope.insect.latinName
          );
          results.forEach((result) => {
            console.log(JSON.stringify(result));
          });
          resolve({ msg: "ok" });
        } else {
          console.log(
            "local image loading not successful for insect: " +
              $scope.insect.latinName
          );
          reject({ msg: "fail" });
        }
        $scope.loadingLocalImages = false;
      })
      .catch((err) => {
        console.error(err);
        console.log(
          "local image loading not successful for insect: " +
            $scope.insect.latinName
        );
        reject({ msg: "error" });
      });
  });
}

// function userAuthenticated($scope) {
//   console.log($scope.currentUser);
//   if ($scope.currentUser === '""') {
//     console.log("initializing currentuser");
//     $scope.currentUser = {};
//   }
//   return !angular.equals({}, $scope.currentUser);
// }
