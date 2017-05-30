angular.module("app").directive("footer", function() {
  return {
    restrict: 'A',
    templateUrl: 'partials/footer.html',
    scope: true,
    transclude : false,
    controller: 'FooterController'
  };
});