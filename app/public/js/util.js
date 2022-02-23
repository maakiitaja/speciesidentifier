function toggleElements(hideElem, showElem) {
  document.getElementById(hideElem).visibility = "hidden";
  document.getElementById(showElem).visibility = "visible";
}

function drag(e) {
  console.log("hi from drag");
  e.dataTransfer.setData("image", e.target.id);
  console.log("target.id: " + e.target.id);
}

function dragLeave(e) {
  console.log("hi from dragleave");
  var imageParent = document.getElementById("album-cover");
  imageParent.classList.remove("dragover");
}

function drop(e) {}

function dragOver(e) {
  console.log("hi from dragOver");

  e.preventDefault();
  var imageParent = document.getElementById("album-cover");
  imageParent.classList.add("dragover");
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
  //$scope.insect.images[0] = decodeURIComponent($scope.insect.images[0]);
  console.log("decoded imagepath: ", $scope.insect.images[0]);
  $location.path("insect").search({ insect: $scope.insect, prevUrl: "#/list" });
}

function updateRequired() {
  var latinName = document.getElementById("latinName").value;
  console.log("latinName: " + latinName);
  if (latinName) $scope.latinNameRequired = "false";
  else $scope.latinNameRequired = "true";
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

selectActiveThumb = async function (selectedInsect) {
  // select the active insect thumb
  if (selectedInsect) {
    var thumbImg = document.getElementById(
      selectedInsect.images[0] + "_thumb.jpg"
    );
    if (thumbImg === undefined || thumbImg === null) {
      console.log("waiting for thumb image");
      await wait(0.2);
      thumbImg = document.getElementById(
        selectedInsect.images[0] + "_thumb.jpg"
      );
    }
    console.log(thumbImg);
    thumbImg.classList.toggle("activeThumb");
  }
};

setPaginationForSearchPage = async function (
  SearchService,
  query,
  $scope,
  page,
  itemsPerPage,
  visiblePages,
  $localStorage,
  totalCount
) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  if (totalPages < visiblePages) {
    visiblePages = totalPages;
  }
  console.log("visiblePages", visiblePages);
  console.log("totalPages", totalPages);
  console.log("page: ", page);
  if (totalPages > 1) {
    console.log("showing pagination element");
    console.log("total pages: ", totalPages);
    console.log("window.pagObj:", window.pagObj);
    window.pagObj = undefined;
    await wait(0.2);
    $scope.$apply();
    window.pagObj = $("#pagination")
      .twbsPagination({
        totalPages: totalPages,
        visiblePages: visiblePages,
        startPage: page + 1,

        onPageClick: async function (event, page) {
          console.log("on page click:", page, " event: ", event);
          $scope.page = page - 1;
          if (!$scope.firstPaginationLoad) {
            console.log("searching from page: ", page);
            const selectFirstInsect = true;
            const response = await SearchService.search(
              $scope,
              query,
              page - 1,
              itemsPerPage,
              $localStorage,
              selectFirstInsect
            );
            const totalCount = response.totalCount;
            setPaginationForSearchPage(
              SearchService,
              query,
              $scope,
              page,
              itemsPerPage,
              visiblePages,
              $localStorage,
              totalCount
            );
            selectActiveThumb($scope.insect);

            $scope.$apply();
          } else {
            console.log("changing first pagination load to false");
            $scope.firstPaginationLoad = false;
            $scope.$apply();
          }
        },
      })
      .on("page", function (event, page) {
        console.info(page + " (from event listening)");
      });
  }
};

getLocalInsectsMinified = function ($localStorage) {
  let collection = [];
  $localStorage.collection.forEach(function (insect) {
    let collectionItem = { _id: insect._id, updatedAt: insect.updatedAt };

    collection.push(collectionItem);
  });
  let encodedCollection = null;
  if (collection.length > 0) {
    collection = JSON.stringify(collection);

    encodedCollection = btoa(collection);
  } else {
    encodedCollection = btoa("[]");
  }

  return encodedCollection;
};

const insectsByCategory = {
  Ant: [],
  Bee: [],
  Beetle: [],
  Butterfly: [],
  Centipede: [],
  General: [],
  Spider: [],
};

const insectsByCategoryFi = {
  Spider: [],
  Beetle: [],
  Bee: [],
  Ant: [],
  Butterfly: [],
  Centipede: [],
  General: [],
};

constructCollectionByCategory = async function (
  $localStorage,
  $cookies,
  $scope,
  page,
  itemsPerPage,
  visiblePages,
  initialSyncDone,
  category,
  name
) {
  console.log("construct local collection by category");

  console.log("page: ", page);

  $scope.$watch("translations", async function (val) {
    console.log("scope watch translations");

    // filter
    const resInsects = [];
    if (category || name) {
      $localStorage.collection.forEach(function (insect) {
        let result;

        if (category && name) {
          name = name.charAt(0).toUpperCase() + name.slice(1);
          for (let i = 0; i < insect.translations.length; i++) {
            if (insect.translations[i].name.includes(name)) {
              result = insect;
            }
          }
          if (!(result !== undefined && insect.category === category)) {
            result = undefined;
          }
        } else if (category && insect.category === category) {
          result = insect;
        } else if (name) {
          name = name.charAt(0).toUpperCase() + name.slice(1);
          for (let i = 0; i < insect.translations.length; i++) {
            if (insect.translations[i].name.includes(name)) {
              result = insect;
            }
          }
        }
        if (result) resInsects.push(result);
      });
    }
    let copy;
    if ((name || category) && resInsects.length === 0) {
      copy = [];
    } else if (resInsects.length > 0) {
      copy = resInsects;
    } else {
      copy = JSON.parse(JSON.stringify($localStorage.collection));
    }

    const totalCount = copy.length;

    Array.prototype.alphaSort = function (translations) {
      function compare(a, b) {
        if (translations[a.category] < translations[b.category]) return -1;
        if (translations[a.category] > translations[b.category]) return 1;
        return 0;
      }
      console.log("in alphasort");
      console.log("translations", translations);
      this.sort(compare);
    };

    // sort collection by category
    copy.alphaSort($scope.translations);

    // take a slice of the collection
    copy = copy.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

    console.log("displayed items length:", copy.length);
    const dst = insectsByCategoryByLang($cookies);
    // construct final displayed items by category
    if (copy?.length > 0) {
      copy.forEach(function (item) {
        const category = item.category;
        dst[category].push(item);
      });
    }

    // assign dst
    console.log("dst:", dst);
    $localStorage.collectionByCategory = dst;

    // pagination

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (totalPages < visiblePages) {
      visiblePages = totalPages;
    }

    if (totalPages > 1) {
      console.log("showing pagination");
      $scope.hidePagination = false;

      await wait(0.2);
      $scope.$apply();

      window.pagObj = $("#pagination")
        .twbsPagination({
          totalPages: totalPages,
          visiblePages: visiblePages,
          startPage: page + 1,
          onPageClick: async function (event, page) {
            console.log("on page click:", page, " event: ", event);
            $scope.collectionPage = page - 1;
            if (!$scope.firstPaginationLoad) {
              console.log("reconstructing collection by category");
              constructCollectionByCategory(
                $localStorage,
                $cookies,
                $scope,
                page - 1,
                itemsPerPage,
                visiblePages,
                true,
                category,
                name
              );
              await wait(0.2);
              $scope.$apply();
            } else {
              console.log("changing first pagination load to false");
              $scope.firstPaginationLoad = false;
            }
          },
        })
        .on("page", function (event, page) {
          console.info(page + " (from event listening)");
        });
    } else {
      console.log("hiding pagination");
      $scope.hidePagination = true;
    }
  });
  if (initialSyncDone) {
    $scope.$apply();
  }
};

function setPagedInsects(insects, $scope) {
  $scope.nroOfPages = Math.ceil(insects.length / $scope.itemsPerPage);

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
    console.log("util $scope.pagedInsects: ", $scope.pagedInsects);
  }
}

removeValueFromLocalStorage = function ($localStorage, key) {
  window.localStorage.removeItem(key);
  $localStorage[key] = undefined;
};

removeInsectFromLocalStorage = function ($localStorage, key, insect) {
  try {
    var collection = window.localStorage.getItem(key);
    // console.log("localStorage.key:", item);

    // console.log("parse localStorage.key:", JSON.parse(item));
    let newArray = JSON.parse(collection);
    console.log("newArray:", newArray);
    const ind = newArray.findIndex((el) => {
      if (el._id === insect._id) return true;
    });
    if (ind !== -1) {
      newArray.splice(ind, 1);
      console.log("newArray: ", newArray);
    } else {
      alert('Local collection removal error: couldn"t find insect');
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(newArray));
    //console.log("localStorage", localStorage);

    $localStorage[key] = JSON.parse(window.localStorage.getItem(key));
  } catch (err) {
    console.log("err: ", err);
  }
};

pushToLocalStorage = function ($localStorage, key, value) {
  try {
    var item = window.localStorage.getItem(key);
    // console.log("localStorage.key:", item);

    // console.log("parse localStorage.key:", JSON.parse(item));
    let newArray = [];
    if (Array.isArray(JSON.parse(item))) {
      console.log("item is array");
      //console.log(...JSON.parse(item));
      newArray.push(...JSON.parse(item));
      newArray.push(value);
    } else {
      console.log("item not array");
      //console.log("value:", value);

      newArray.push(value);
      //console.log("newArray:", newArray);
    }

    // console.log("after pushing:", newArray);
    // console.log("stringifying result:", JSON.stringify(newArray));
    console.log("saving to localstorage");
    window.localStorage.setItem(key, JSON.stringify(newArray));
    //console.log("localStorage", localStorage);

    $localStorage[key] = JSON.parse(window.localStorage.getItem(key));
    //console.log("$localStorage", $localStorage);
  } catch (e) {
    if (isQuotaExceeded(e)) {
      console.log("local storage quota exceeded. e:", e);
      //window.localStorage.setItem("disableSyncImages", true);
      $localStorage["disableSyncImages"] = true;
      alert(
        "Exceeded local storage quota, disabling local storage image saving and freeing space."
      );
      freeLocalStorageSpace($localStorage, 1);
      return false;
    }
  }
  return true;
};

freeLocalStorageSpace = function ($localStorage, nroOfPictures) {
  if (!nroOfPictures) nroOfPictures = 1;

  console.log("start of freeLocalStorageSpace");
  console.log(
    "window.localstorage estimated size before freeing: ",
    JSON.stringify(window.localStorage).length
  );
  for (let i = 0; i < nroOfPictures; i++) {
    for (let j = 0; j < $localStorage.collection.length; j++) {
      let removeImg = $localStorage.collection[j].images[0];
      if (window.localStorage.getItem(removeImg) !== "undefined") {
        console.log("freeing up image from local collection: ", removeImg);
        window.localStorage.setItem(removeImg, undefined);

        break;
      }
    }
  }

  console.log(
    "window.localstorage estimated size after freeing space: ",
    JSON.stringify(window.localStorage).length
  );
};

setLocalStorageItem = function ($localStorage, key, value, kind) {
  try {
    const localStorage = window.localStorage;

    localStorage.setItem(key, value);
    if (kind === "image") {
      console.log("NOT storing image to angular $localstorage");
    } else {
      console.log("storing to $localstorage");
      $localStorage[key] = localStorage.getItem(key);
    }
  } catch (e) {
    if (isQuotaExceeded(e)) {
      console.log("local storage quota exceeded. e:", e);
      freeLocalStorageSpace($localStorage, 1);
      // alert(
      //   "Exceeded local storage quota, disabling local storage image saving and freeing space."
      // );
      $localStorage["disableSyncImages"] = true;
      return false;
    }
  }
  return true;
};

function isQuotaExceeded(e) {
  var quotaExceeded = false;
  if (e) {
    if (e.code) {
      switch (e.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
            quotaExceeded = true;
          }
          break;
      }
    } else if (e.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
}

constructUploadListByCategory = function (remoteItems, $cookies) {
  console.log("construct upload list by category");

  const dst = insectsByCategoryByLang();

  remoteItems.forEach(function (item) {
    const category = item.category;
    dst[category].push(item);
  });
  console.log("dst: ", dst);
  return dst;
};

insectsByCategoryByLang = function ($cookies) {
  let dst;
  if (
    $cookies === undefined ||
    $cookies === null ||
    $cookies.get("lang") === "en"
  )
    dst = JSON.parse(JSON.stringify(insectsByCategory));
  else if ($cookies.get("lang") === "fi")
    dst = JSON.parse(JSON.stringify(insectsByCategoryFi));
  else dst = JSON.parse(JSON.stringify(insectsByCategory));
  return dst;
};

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

          console.log("saving image with name: " + name + " to localstorage");
          // TODO catch max size reached
          const success = setLocalStorageItem(
            $localStorage,
            name,
            dataURL,
            "image"
          );

          if (success) resolve({ msg: true });
          else reject({ msg: false });
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

function toggleLoadingSpinner($scope, id) {
  if (id === undefined || id === null) {
    id = "spinner-search";
  }
  var spinnerEl = document.getElementById(id);
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
            result?.msg
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
            result?.msg
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

responsiveSearch = function ($scope, itemsPerPage, totalCount) {
  // resize style classes
  console.log("util: responsive search start");
  $scope.resize.insectsLength = $scope.insects.length;
  if ($scope.insects.length === 1) {
    console.log("insects length is 1");
    $scope.resize.largePictureOnly = true;
    $scope.resize.containerInsectThumbsHigh = false;
    $scope.resize.hidePagination = true;
    $scope.resize.noInsectThumbs = true;
  } else {
    $scope.resize.largePictureOnly = false;
    $scope.resize.noInsectThumbs = false;
    if (totalCount <= itemsPerPage) {
      $scope.resize.hidePagination = true;
    } else {
      $scope.resize.hidePagination = false;
    }
    if (getVw() >= 860) {
      if ($scope.hidePagination) {
        console.log("container insect thumbs high: true");

        $scope.resize.containerInsectThumbsHigh = true;
      }
    } else {
      $scope.resize.containerInsectThumbsHigh = false;
    }
  }
};

sortColors = function ($scope) {
  $scope.$watch("translations", function (translations) {
    const colorArr = [];

    colorArr.push(
      ["", ""],
      [translations.BLACK, "Black"],
      [translations.WHITE, "White"],
      [translations.RED, "Red"],
      [translations.GREEN, "Green"],
      [translations.BLUE, "Blue"],
      [translations.YELLOW, "Yellow"],
      [translations.GOLDEN, "Golden"],
      [translations.SILVER, "Silver"],
      [translations.ORANGE, "Orange"],
      [translations.GREY, "Grey"],
      [translations.VIOLET, "Violet"],
      [translations.TURQUOISE, "Turquoise"],
      [translations.BROWN, "Brown"]
    );
    $scope.colors = colorArr.sort();
  });
};

sortCategories = function ($scope) {
  $scope.$watch("translations", function (translations) {
    const categoryArr = [];

    categoryArr.push(
      ["", ""],
      [translations.Ant, "Ant"],
      [translations.Beetle, "Beetle"],
      [translations.Bee, "Bee"],
      [translations.Butterfly, "Butterfly"],
      [translations.Spider, "Spider"],
      [translations.Centipede, "Centipede"],
      [translations.General, "General"]
    );
    $scope.categories = categoryArr.sort();
  });
};

sortCountries = function ($scope, displayAllOption, $cookies) {
  $scope.$watch("translations", async function (translations) {
    const countryArr = [];
    console.log("translations: ", translations);

    countryArr.push(
      [translations.FINLAND, "FINLAND"],
      [translations.SWEDEN, "SWEDEN"],
      [translations.NORWAY, "NORWAY"],
      [translations.DENMARK, "DENMARK"],
      [translations.GERMANY, "GERMANY"],
      [translations.FRANCE, "FRANCE"],
      [translations.RUSSIA, "RUSSIA"],
      [translations.ITALY, "ITALY"],
      [translations.SPAIN, "SPAIN"],
      [translations.GREECE, "GREECE"],
      [translations.CYPRYS, "CYPRYS"],
      [translations.BELGIUM, "BELGIUM"],
      [translations.UNITEDKINGDOM, "UNITEDKINGDOM"],
      [translations.SCOTLAND, "SCOTLAND"],
      [translations.IRELAND, "IRELAND"],
      [translations.ICELAND, "ICELAND"],
      [translations.NETHERLAND, "NETHERLAND"],
      [translations.UKRAINE, "UKRAINE"],
      [translations.HUNGARY, "HUNGARY"],
      [translations.SERBIA, "SERBIA"],
      [translations.ROMANIA, "ROMANIA"],
      [translations.PORTUGAL, "PORTUGAL"],
      [translations.POLAND, "POLAND"],
      [translations.LIETHUA, "LIETHUA"],
      [translations.LATVIA, "LATVIA"],
      [translations.BELARUS, "BELARUS"],
      [translations.CHINA, "CHINA"],
      [translations.INDIA, "INDIA"],
      [translations.PAKISTAN, "PAKISTAN"],
      [translations.KAZAKSTAN, "KAZAKSTAN"],
      [translations.THAILAND, "THAILAND"],
      [translations.SOUTHKOREA, "SOUTHKOREA"],
      [translations.NORTHKOREA, "NORTHKOREA"],
      [translations.PAPUAGUINEA, "PAPUAGUINEA"],
      [translations.NEWZEALAND, "NEWZEALAND"],
      [translations.INDONESIA, "INDONESIA"],
      [translations.LAOS, "LAOS"],
      [translations.VIETNAM, "VIETNAM"],
      [translations.BRUNEI, "BRUNEI"],
      [translations.MALESIA, "MALESIA"],
      [translations.MYANMAR, "MYANMAR"],
      [translations.SINGAPORE, "SINGAPORE"],
      [translations.AFGANISTAN, "AFGANISTAN"],
      [translations.BANGLADESH, "BANGLADESH"],
      [translations.BHUTAN, "BHUTAN"],
      [translations.MALEDIVE, "MALEDIVE"],
      [translations.NEPAL, "NEPAL"],
      [translations.SRILANKA, "SRILANKA"],
      [translations.AZERBAIDZAN, "AZERBAIDZAN"],
      [translations.YEMEN, "YEMEN"],
      [translations.LIBANON, "LIBANON"],
      [translations.OMAN, "OMAN"],
      [translations.QATAR, "QATAR"],
      [translations.TURKEY, "TURKEY"],
      [translations.JORDANIA, "JORDANIA"],
      [translations.GEORGIA, "GEORGIA"],
      [translations.UZBEKISTAN, "UZBEKISTAN"],
      [translations.TURKEMISTAN, "TURKEMISTAN"],
      [translations.TADZIKISTAN, "TADZIKISTAN"],
      [translations.CANADA, "CANADA"],
      [translations.USA, "USA"],
      [translations.MEXICO, "MEXICO"],
      [translations.JAMAICA, "JAMAICA"],
      [translations.CUBA, "CUBA"],
      [translations.PANAMA, "PANAMA"],
      [translations.COSTARICA, "COSTARICA"],
      [translations.ECUADOR, "ECUADOR"],
      [translations.BRAZIL, "BRAZIL"],
      [translations.PERU, "PERU"],
      [translations.CHILE, "CHILE"],
      [translations.BOLIVIA, "BOLIVIA"],
      [translations.COLUMBIA, "COLUMBIA"],

      [translations.ISRAEL, "ISRAEL"],
      [translations.SYRIA, "SYRIA"],
      [translations.SAUDIARABIA, "SAUDIARABIA"],
      [translations.EGYPT, "EGYPT"],
      [translations.TUNISIA, "TUNISIA"],
      [translations.SUDAN, "SUDAN"],
      [translations.GHANA, "GHANA"],
      [translations.DEMOCRATICREPUPUBLICOFCONGO, "DEMOCRATICREPUPUBLICOFCONGO"],
      [translations.REPUBLICOFCONGO, "REPUBLICOFCONGO"],
      [translations.ALGERIA, "ALGERIA"],
      [translations.ZIMBABWE, "ZIMBABWE"],
      [translations.SOUTHAFRICA, "SOUTHAFRICA"],
      [translations.MAURITANIA, "MAURITANIA"],
      [translations.ANGOLA, "ANGOLA"],
      [translations.ETHIOPIA, "ETHIOPIA"],
      [translations.TANZANIA, "TANZANIA"],
      [translations.RWANDA, "RWANDA"],
      [translations.ERITREA, "ERITREA"],

      [translations.ZAMBIA, "ZAMBIA"],
      [translations.LIBYA, "LIBYA"],
      [translations.DIJIBOUTI, "DIJIBOUTI"],
      [translations.COMOROS, "COMOROS"],
      [translations.MALAWI, "MALAWI"],
      [translations.SEYCHELLES, "SEYCHELLES"],
      [translations.CHAD, "CHAD"],
      [translations.LESOTHO, "LESOTHO"],
      [translations.BENIN, "BENIN"],
      [translations.IVORYCOAST, "IVORYCOAST"],
      [translations.LIBERIA, "LIBERIA"],
      [translations.MALI, "MALI"],
      [translations.SENEGAL, "SENEGAL"],
      [translations.TOGO, "TOGO"],
      [translations.GUINEABISSEAU, "GUINEABISSEAU"],
      [translations.SIERRALEONE, "SIERRALEONE"],
      [translations.NIGER, "NIGER"],
      [translations.PHILIPPINES, "PHILIPPINES"],
      [translations.MONGOLIA, "MONGOLIA"],
      [translations.TAIWAN, "TAIWAN"],
      [translations.JAPAN, "JAPAN"],
      [translations.CAMBODIA, "CAMBODIA"],
      [translations.MACEDONIA, "MACEDONIA"],
      [translations.ARMENIA, "ARMENIA"],
      [translations.SWITZERLAND, "SWITZERLAND"],
      [translations.SOMALIA, "SOMALIA"],
      [translations.UGANDA, "UGANDA"],
      [translations.MOROCCO, "MOROCCO"],
      [translations.MADAGASCAR, "MADAGASCAR"],
      [translations.CAMEROON, "CAMEROON"],
      [translations.BOSTWANA, "BOSTWANA"],
      [translations.SWAZILAND, "SWAZILAND"]
    );
    if (displayAllOption) {
      countryArr.unshift(["", ""]);
    }
    countryArr.sort();
    if (displayAllOption) {
      countryArr[0] = [translations.ALL, "All"];
    } else {
      // search country by language
      let dropbtnContent = document.getElementById("dropbtn-content-select");
      while (dropbtnContent === undefined || dropbtnContent === null) {
        await wait(0.2);
        dropbtnContent = document.getElementById("dropbtn-content-select");
      }
      if ($cookies.get("lang") === "en") {
        dropbtnContent.innerHTML = "United Kingdom";
        $scope.params.dropdownCountry = "UNITEDKINGDOM";
      } else if ($cookies.get("lang") === "fi") {
        dropbtnContent.innerHTML = "Suomi";
        $scope.params.dropdownCountry = "FINLAND";
      } else {
        dropbtnContent.innerHTML = "Afganistan";
        $scope.params.dropdownCountry = "AFGANISTAN";
      }
    }
    $scope.countries = countryArr;
    if (!displayAllOption) {
      // use because of await
      $scope.$digest();
    }
  });
};

wait = function (seconds) {
  return new Promise(function (resolve) {
    console.log("in wait");
    setTimeout(resolve, 1000 * seconds);
  });
};
