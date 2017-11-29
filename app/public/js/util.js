function toggleElements(hideElem, showElem) {

	document.getElementById(hideElem).visibility="hidden";
	document.getElementById(showElem).visibility="visible";
}


//Where el is the DOM element you'd like to test for visibility
function isHidden(el) {
    return (el.offsetParent === null)
} 

function updateMainImageUrl($scope) {
	var elem = $('.insect-thumbs').find(':first');
	console.log('elem: '+JSON.stringify(elem));
	if (elem)
		console.log(' with id: '+elem.id);
	
}

function setDelay(callback, ms) {

	var myVar = window.setTimeout(callback, ms);
}

function isvisible(obj) {
																																																																																																																																																																																																																																																			  	return obj.offsetWidth > 0 && obj.offsetHeight > 0;
}


function insectDetail($location, $scope) {
   	$location.path('insect').search({insect: $scope.insect, prevUrl: "#/list"});

}

function updateRequired () {
	var latinName = document.getElementById('latinName').value ;	
	console.log('latinName: '+latinName);
	if (latinName)
		$scope.latinNameRequired = 'false';
	else
		$scope.latinNameRequired = 'true';
		
}	

function setPagedInsects(insects, $scope) {

	$scope.nroOfPages = insects.length / $scope.itemsPerPage;
	if (!isInt($scope.nroOfPages) ) {
		$scope.nroOfPages = Math.floor($scope.nroOfPages); 
		$scope.nroOfPages++;
	}
	console.log("nroofpages: "+$scope.nroOfPages);
	// clear paged insects
	$scope.pagedInsects = [];
	// loop through nro of pages
	for (var i = 0; i < $scope.nroOfPages; i++) {
		// loop through nro of insects per page						
		for (var j = 0; j < $scope.itemsPerPage; j++) {
			if (j == 0) {
				$scope.pagedInsects[i] = [];							
			}						
			$scope.pagedInsects[i].push(insects[i*$scope.itemsPerPage + j]);
		}	
	}
}
