"use strict";

/* Filters */
/*
angular.module('phonecatFilters', []).filter('checkmark', function() {
  return function(input) {
    return input ? '\u2713' : '\u2718';
  };*/

angular
  .module("insectIdentifierFilters", [])
  .filter("searchFilter", function () {
    return function (items, primary, category, secondary, legs, filterClicked) {
      console.log("search filter.");
      console.log("primary: " + primary);
      console.log("category: " + category);
      var aPrimary = primary;
      var aCategory = category;
      var aSecondary = secondary;
      var aLegs = legs;
      console.log("filterclicked: " + filterClicked);
      if (aPrimary === undefined) aPrimary = "";
      if (aSecondary === undefined) aSecondary = "";
      if (aCategory === undefined) aCategory = "";
      if (aLegs === undefined) aLegs = "";

      if (items[0]) {
        console.log(
          "items[i].primaryColor: " +
            items[0].primaryColor +
            " primary: " +
            aPrimary
        );
      }

      var l = items.length;
      for (var i = 0; i < l; i++) {
        if (items[i] == null) items.splice(i, 1);
      }

      var filtered = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i] != null) filtered.push(items[i]);
      }

      var filteredInd = [];
      for (var i = 0; i < items.length; i++) {
        filteredInd[i] = false;
      }

      // primary
      var tmp = 0;
      for (var i = 0; i < items.length; i++) {
        //console.log('tmp: '+tmp);

        if (
          aPrimary != "" &&
          items[i] !== undefined &&
          items[i].primaryColor != primary
        ) {
          filteredInd[i] = true;

          console.log("filtering by primary");
          tmp = tmp - 1;
        }
        tmp = tmp + 1;
      }

      tmp = 0;
      // secondary
      for (var i = 0; i < items.length; i++) {
        //console.log('tmp: '+tmp);
        if (
          aSecondary != "" &&
          items[i] !== undefined &&
          items[i].secondaryColor != secondary
        ) {
          filteredInd[i] = true;
          console.log("filtering by secondary");
          tmp = tmp - 1;
        }
        tmp = tmp + 1;
      }
      tmp = 0;
      // category
      for (var i = 0; i < items.length; i++) {
        //console.log('tmp: '+tmp);

        if (
          aCategory != "" &&
          items[i] !== undefined &&
          items[i].category != category
        ) {
          filteredInd[i] = true;

          console.log("filtering by category");
          tmp = tmp - 1;
        }
        tmp = tmp + 1;
      }
      tmp = 0;
      // legs
      for (var i = 0; i < items.length; i++) {
        //console.log('tmp: '+tmp);
        if (aLegs != "" && items[i] !== undefined && items[i].legs != legs) {
          filteredInd[i] = true;

          console.log("filtering by legs");
          tmp = tmp - 1;
        }
        tmp = tmp + 1;
      }

      // filter
      tmp = 0;
      for (var i = 0; i < items.length; i++) {
        if (filteredInd[i] == true) {
          filtered.splice(tmp, 1);
          tmp = tmp - 1;
        }
        tmp = tmp + 1;
      }

      console.log("searchFilter: returning items: " + filtered);
      /*
		if (filtered.length > 0 && filterClicked) {
			console.log('filter: setting main url: '+filtered[0].images[0]);

			scope.mainImageUrl = filtered[0].images[0];
			
		}
		else if (filtered.length == 0)
			scope.mainImageUrl = "";
		*/

      // update search ui if no filtered items
      var paginationEl = document.getElementById("pagination");
      var largePictureEl = document.getElementById("large-picture-search");
      var buttonIdentifyEl = document.getElementById("button-identify");
      if (filtered.length == 0) {
        paginationEl.classList.add("pagination-hide");
        largePictureEl.classList.add("pagination-hide");
        buttonIdentifyEl.classList.add("pagination-hide");
      } else {
        paginationEl.classList.remove("pagination-hide");
        largePictureEl.classList.remove("pagination-hide");
        buttonIdentifyEl.classList.remove("pagination-hide");
      }
      return filtered;
    };
  });
