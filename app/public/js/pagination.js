function range(start, end) {
  var ret = [];
  if (!end) {
    end = start;
    start = 0;
  }
  for (var i = start; i < end; i++) {
    ret.push(i);
  }
  return ret;
}

function prevPage($scope) {
  if ($scope.currentPage > 0) {
    $scope.currentPage--;
  }
}

function nextPage($scope) {
  if ($scope.currentPage < $scope.pagedInsects.length - 1) {
    $scope.currentPage++;
  }
}

function setPage($scope, n) {
  $scope.currentPage = n;
}

function isInt(value) {
  return (
    !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10))
  );
}
