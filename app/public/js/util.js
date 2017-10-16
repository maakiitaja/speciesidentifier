function toggleElements(hideElem, showElem) {

	document.getElementById(hideElem).visibility="hidden";
	document.getElementById(showElem).visibility="visible";
}

function setImage(insect, $scope) {
	console.log('setting image');
	$scope.mainImageUrl=insect.images[0];
	$scope.insect=insect;
	if ($scope.fromObservationPage == '1') {
		console.log('util.setImage: latinName: '+insect.latinName);
		if (insect.latinName !== undefined && insect.latinName != 'undefined') {
			document.getElementById('observationLatinName').value = insect.latinName;
			$scope.observationLatinNameRequired = 0;//document.getElementById('observationLatinName')
		}
	}
}

function setDelay(callback, ms) {
	var myVar = window.setTimeout(callback, ms);
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
