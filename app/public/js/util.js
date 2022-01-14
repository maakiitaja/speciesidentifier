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
  $location.path("insect").search({ insect: $scope.insect, prevUrl: "#/list" });
}

function updateRequired() {
  var latinName = document.getElementById("latinName").value;
  console.log("latinName: " + latinName);
  if (latinName) $scope.latinNameRequired = "false";
  else $scope.latinNameRequired = "true";
}

function setPagedInsects(insects, $scope) {
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

function collectionEmpty(collection) {
  var isEmpty = true;

  if (collection === undefined) {
    return isEmpty;
  }
  console.log("collection: ", collection);

  for (var ind in collection) {
    console.log("category ", ind);
    console.log("category.length ", collection[ind].length);
    if (collection[ind].length > 0) {
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
