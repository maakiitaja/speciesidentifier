'use strict';

/* jasmine specs for controllers go here */
describe('InsectIdentifier controllers', function() {

  beforeEach(module('insectIdentifierApp'));

  var $controller;

  beforeEach(inject(function(_$controller_) {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  /*describe('UploadInsectCtrl', function() {
    var scope, ctrl, $httpBackend, location;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, $location) {
      $httpBackend = _$httpBackend_;

      scope = $rootScope.$new();

      $location.search().fromUploadListPage = '1';
      var insect;
      insect.translations = [];
      $location.search().insect = insect;
      ctrl = $controller('UploadInsectCtrl', {$scope: scope});
    }));

    it('should be an upload', function() {
	$httpBackend.flush();
	expect(scope.isUpload).toBe('1');
	expect(scope.isRequired).toBe('1');	
    });
   });
  */

  describe('InsectDetailCtrl', function() {
    var scope, ctrl, location, rootScope;

    beforeEach(inject(function($controller,$rootScope, $location) {
	scope = $rootScope.$new();
	location = $location;
	console.log('setting ctrl');
	var insect = {};
	insect.wiki = 'wiki';
	insect.images = [];
	insect.images[0] = 'bbb.jpg';
	location.prevUrl = 'prev';
	location.searchValues = {};
	location.searchValues.insect = insect;

	location.search = function () {
		return $location.searchValues;
	}

	rootScope = $rootScope;
	$rootScope.$apply();
	rootScope.$apply();

	console.log('$location.search().insect: '+$location.search().insect);
	console.log('location.search().insect: '+location.search().insect);
	ctrl = $controller('InsectDetailCtrl', {'$scope': scope});
	console.log('after setting ctrl');
       
    }));
	
    it('should change imageurl', function() {


	expect(scope.mainImageUrl).toBe('bbb.jpg');	
	scope.setImage('abc.jpg');
	expect(scope.mainImageUrl).toBe('abc.jpg');
    });

    it('should change location path to collection', function() {
	scope.collection();
	expect(location.path()).toBe('/collection');
    });

    it('should change location path to new search', function() {
	scope.new_search();
	scope.$apply();
	console.log('location.path(): '+location.path());
	expect(location.path()).toBe('/search');
	
	console.log('location.search().returningFromDetailPage:'+location.search().returningFromDetailPage);
	
//	expect(location.search().returningFromDetailPage).toBe('1');

    });

  });
    
    /*    	
    it('should create "phones" model with 2 phones fetched from xhr', function() {
      expect(scope.phones).toEqualData([]);
      $httpBackend.flush();

      expect(scope.phones).toEqualData(
          [{name: 'Nexus S'}, {name: 'Motorola DROID'}]);
    });

    it('should set the default value of orderProp model', function() {
      expect(scope.orderProp).toBe('age');
    });
    */

//  describe('')
/*

  describe('PhoneDetailCtrl', function(){
    var scope, $httpBackend, ctrl,
        xyzPhoneData = function() {
          return {
            name: 'phone xyz',
                images: ['image/url1.png', 'image/url2.png']
          }
        };

    beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData());

      $routeParams.phoneId = 'xyz';
      scope = $rootScope.$new();
      ctrl = $controller('PhoneDetailCtrl', {$scope: scope});
    }));

    it('should fetch phone detail', function() {
      expect(scope.phone).toEqualData({});
      $httpBackend.flush();

      expect(scope.phone).toEqualData(xyzPhoneData());
    });
  });*/
});
