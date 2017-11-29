//var datePicker = require( './../../app/public/js/datepicker.js')
var path = require('path');
'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('InsectIdentifier App', function() {
	
/*	describe('Search view', function() {

		beforeEach(function() {
			browser.get('#/main');
			var EC = protractor.ExpectedConditions;

			element(by.model('query.primaryColor')).element(by.css('option[value="Yellow"]')).click();
			element(by.model('query.category')).element(by.css('option[value="Bee"]')).click();
	 
			element(by.name('search')).click();

			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
			// search results
			element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {
				console.log('search count: '+count);
				expect(count > 0).toBeTruthy();
			});			
		});

		
		it('should swap main image if a thumbnail image is clicked on', function() {
			// should display the first insect image as the main insect image'
			console.log('checking main image');
			expect(element(by.css('img.insect.active')).getAttribute('src')).toContain('images\/ampiaiset_495px.jpg');
			console.log('clicking third thumb image');
			element(by.css('.insect-thumbs li:nth-child(3) img')).click();
			expect(element(by.css('img.insect.active')).getAttribute('src')).toContain('images/\mehilaiset_495px.jpg');
	  		console.log('clicking first thumb image');
			element(by.css('.insect-thumbs li:nth-child(1) img')).click();
			expect(element(by.css('img.insect.active')).getAttribute('src')).toContain('images\/ampiaiset_495px.jpg');
		});

		it('should change to insect detail page', function() {
			var EC = protractor.ExpectedConditions;
	      	// activate an insect
			element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).then(function(arr) {
				console.log('search count: '+arr.length);
	    	    arr[0].click();
		
		      	// move to detail page
	
		      	element(by.id('identify')).click();
				
				// wait for the detail page to load
				browser.wait(EC.visibilityOf($('#description')), 5000);
				// expect the url to have changed
				browser.getCurrentUrl().then(function(url) {
					expect(url).toContain('/insect');
					
					// check description
					// check name
					expect(element(by.id('latinName')).getText()).not.toBeUndefined();
					// check picture
					element(by.id('mainimage')).getSize().then(function(size) {
						//console.log('size: '+size);
						expect(size.width > 0).toBeTruthy();
					});
					
					// return back to search page
					element(by.id('newSearch')).click();
					
					browser.wait(EC.visibilityOf($('#showResults')), 5000);	
					browser.getCurrentUrl().then(function(url) {
						expect(url).toContain('search');
							
						// check previous search result is shown
						expect(element(by.css('img.insect.active')).getAttribute('src')).toContain('images\/ampiaiset_495px.jpg');
						expect(element(by.css('.insect-thumbs li:nth-child(1) img')).getAttribute('src')).toContain('images\/ampiaiset_495px.jpg_thumb.jpg');
					});
				});
		
      		});
		});
		
		it('should view insect with multiple images', function() {
			var EC = protractor.ExpectedConditions;

			element(by.model('query.primaryColor')).element(by.css('option[value="Red"]')).click();
			element(by.model('query.category')).element(by.css('option[value="Butterfly"]')).click();
 
			element(by.name('search')).click();

			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
			element(by.id('identify')).click();
			
			// wait for detail page to load
			browser.wait(EC.visibilityOf($('#description')), 5000);
			
			browser.getCurrentUrl().then(function(url) {
					expect(url).toContain('/insect');
					
					// main image should be updated after thumb image has been clicked
					expect(element(by.css('img.active')).getAttribute('src')).toContain('images\/Aglais%20io.jpeg');
					
					element(by.css('.insect-thumbs-detail li:nth-child(3) img')).click();
					expect(element(by.css('img.active')).getAttribute('src')).toContain('images\/aglais_io_black.jpg');
			});
		});
		

	});*/
	/*
	describe('Advanced search', function() {
		beforeEach(function() {
			var EC = protractor.ExpectedConditions;
			browser.get('#/main');
	
			element(by.model('query.primaryColor')).element(by.css('option[value="Green"]')).click();
			
			

			
		});

		it('should be able to find according to category, primary and secondary color', function() {
			
			var EC = protractor.ExpectedConditions;
			element(by.model('query.category')).element(by.css('option[value="Beetle"]')).click();
			element(by.model('query.secondaryColor')).element(by.css('option[value="Green"]')).click();
			element(by.name('search')).click();

			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
			// search results
			element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {
				console.log('search count: '+count);
				expect(count > 0).toBeTruthy();
			}); 
		});
		it('should be able to find according to primary color and legs', function() {
			
			var EC = protractor.ExpectedConditions;
			element(by.model('query.legs')).element(by.css('option[value="6"]')).click();
			element(by.name('search')).click();

			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
			// search results
			element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {
				console.log('search count: '+count);
				expect(count > 0).toBeTruthy();

			
			}); 
		});
	});*/
	
/*
	describe('Add observations', function() {
		beforeEach(function() {
			browser.get('#/login');

			var EC = protractor.ExpectedConditions;
				
			element(by.name('email')).sendKeys('mauri.f@gmail.com');
	      		element(by.name('password')).sendKeys('aaaa');
			
			element(by.name('submit')).click();

			browser.getCurrentUrl().then(function(url) {
				console.log('waiting for search page');
				browser.wait(EC.visibilityOf($('#search')), 5000);
				
				console.log('switching to addobservation page');
				element(by.id('observationmenu')).click();
				element(by.id('addobservation-header')).click();
				browser.getCurrentUrl().then(function(url) {
					console.log('url: '+url);
					expect(url).toContain('addObservations');
					browser.wait(EC.visibilityOf($('#search')), 5000);
				});	
			});	
		});

  		it('should be able to add an observation with a new location', function() {
			var EC = protractor.ExpectedConditions;
						
			var latinName = 'Leptinotarsa decemlineata';			
			element(by.name('latinName')).sendKeys(latinName);
			element(by.name('search')).click();

			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
			
			
			// search results
			element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {

					// set the calendar date
				var browseCalendar = function(testDay, testMonth, testYear) {
					var date = new Date();
					var years = testYear-date.getFullYear();
					console.log('testDay: '+testDay);
					console.log('testYear: '+testYear);

					// browse to year

					for (var i = 0; i < years; i++ ) {
						element(by.id('cal_py')).click();
					}

					console.log('testmonth: '+testMonth);
					var months = testMonth - (date.getMonth() + 1);
					console.log('months: '+months+' getmonth: '+date.getMonth());
					if (months < 0)
						months = months *(-1);
					// browse to month
					for (var i = 0; i < months; i++) {
						if ((testMonth-(date.getMonth()+1)) < 0) {
							console.log('cal_pm');
							var el = element(by.id('cal_pm'));
							browser.wait(EC.visibilityOf(el), 5000);
							el.click();
						}
						else  {
							console.log('cal_nm');
							var el = element(by.id('cal_nm'));
							browser.wait(EC.visibilityOf(el), 5000);
							el.click();
						}
					}

					// select day
					var cal_day = "cal_day_"+testDay;
					console.log('cal_day: '+cal_day);
					var el = element(by.id(cal_day));
					browser.wait(EC.visibilityOf(el), 5000);
					el.click();

				}

				console.log('search count: '+count);
				expect(count > 0).toBeTruthy();
				console.log('checking the visibility of observation latin name');
				browser.wait(EC.visibilityOf($('#observationLatinName')), 5000);
				
				//console.log('checking observation latin name');
				//expect(element(by.name($('observationLatinName'))).getAttribute('value')).toMatch('Leptinotarsa decemlineata');
				element(by.css('.insect-thumbs li:nth-child(1) img')).click();
				//element(by.name('observationLatinName')).sendKeys(latinName);

				element(by.name('date')).click();

				var el = element(by.name('date'));
				browser.wait(EC.visibilityOf(el), 5000);
				element(by.name('date')).click();	
				console.log('writing number of occurences.');
				element(by.model('params.count')).sendKeys('2');
								
				browseCalendar(1,10,2017);
				
				//element(by.id('addNewObservationPlace')).click();

				element(by.model('params.place')).sendKeys('Tunturi');
				console.log('selecting place type')
				element(by.model('params.location')).element(by.css('option[value="West"]')).click();
				element(by.model('params.country')).element(by.css('option[value="Finland"]')).click();
				console.log('selecting place type');
				//																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																									element(by.id('other')).click();
				//console.log('clicking first thumb image');
				
				element(by.id('observationSubmit')).click();
				console.log('clicked submit');
				//element(by.id('addExistingObservationPlace')).click();
				// adding an observation from an existing place
				
				//function selectDropdownByNumber(element, index, milliseconds) {
    				//	element.findElements(by.tagName('option')).then(function(options) {
					 //       options[index].click();
      				//	});
				//    if (typeof milliseconds !== 'undefined') {
				//      browser.sleep(milliseconds);
				//    }
				//}

				//var mySelect = $('#addExistingObservationPlace');
				//selectDropdownByNumber(mySelect, 1);

				element(by.id('observationSubmit')).click();

				// switch to view the added observation
				console.log('switching to view observation');
				element(by.id('observationmenu')).click();
				element(by.id('browseobservation-header')).click();

				browser.wait(EC.visibilityOf($('#browseObservationHeader')), 5000);
				element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
				
				var el = element(by.id('startDate'));
				browser.wait(EC.visibilityOf(el), 5000);
				element(by.id('startDate')).click();	
				browseCalendar(1,10,2017);

				var el = element(by.id('endDate'));
				browser.wait(EC.visibilityOf(el), 5000);
				element(by.id('endDate')).click();	
				browseCalendar(1,10,2017);

		      		element(by.name('search')).click();

				browser.wait(EC.visibilityOf($('#showResults')), 5000);
		
				browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
	      		
				element.all(by.repeater('observation in observations')).count().then(function(count) {
					console.log('observationlist count: '+count);
					expect(count > 0).toBeTruthy();
				});
			});
				
		});

	});*/
	
	describe('Offline', function() {
		beforeEach(function() {
			browser.get('#/login');

			var EC = protractor.ExpectedConditions;
				
			element(by.name('email')).sendKeys('mauri.f@gmail.com');
	      		element(by.name('password')).sendKeys('aaaa');
			
			element(by.name('submit')).click();

			browser.getCurrentUrl().then(function(url) {
				console.log('waiting for search page');
				browser.wait(EC.visibilityOf($('#search')), 5000);
			
				element(by.id('collection-header')).click();
				browser.getCurrentUrl().then(function(url) {
					console.log('url: '+url);
					expect(url).toContain('collection');
				});
			});	
		});

		it('should be able to view images saved on local storage', function() {
			
			
			element(by.id('offline')).click();
		
			element(by.css('.insect-thumbs li:nth-child(1) img')).getSize().then(function(size) {
				console.log('size: '+size.width);
				expect(size.width > 0).toBeTruthy();
			});
			
			
		});
	});
  
	/*describe("Browse observations", function() {

    		beforeEach(function() {
			browser.get('#/browseObservations');
	    	});

		
		it('should be able to find observations from a given country', function() {
	      		var EC = protractor.ExpectedConditions;

	      		element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
	      		element(by.name('search')).click();
	      		browser.wait(EC.visibilityOf($('#showResults')), 5000);	
	      		browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
	      		
				element.all(by.repeater('observation in observations')).count().then(function(count) {
					console.log('observationlist count: '+count);
					expect(count > 0).toBeTruthy();
				});
		});
		
		it('should be able to find according to farm type', function () {
			var EC = protractor.ExpectedConditions;

	      	element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
			
			element(by.id('byFarmType')).click();
			element(by.model('query.nonOrganicFarm')).click();
			
			element(by.name('search')).click();
			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
			
			element.all(by.repeater('observation in observations')).count().then(function(count) {
				console.log('observationlist count: '+count);
				expect(count > 0).toBeTruthy();
			});
			
		});
		
		it('should be able to find according to insect category', function () {
			var EC = protractor.ExpectedConditions;

	      		element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
			element(by.id('byCategory')).click();
			element(by.model('query.category')).element(by.css('option[value="Beetle"]')).click();
			
			element(by.name('search')).click();
			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
			
			element.all(by.repeater('observation in observations')).count().then(function(count) {
				console.log('observationlist count: '+count);
				expect(count > 0).toBeTruthy();
			});

		});
		   
		it('should be able to find according to insect name', function () {
			var EC = protractor.ExpectedConditions;
			
	      		element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
			element(by.id('byName')).click();
			element(by.model('query.name')).sendKeys('Aglais io');
			
			element(by.model('query.language')).element(by.css('option[value="Latin"]')).click();
			
			element(by.name('search')).click();
			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
			
			element.all(by.repeater('observation in observations')).count().then(function(count) {
				console.log('observationlist count: '+count);
				expect(count > 0).toBeTruthy();
			});
			
			element(by.model('query.name')).clear().then(function() {
				element(by.model('query.name')).sendKeys('Neitoperhonen');
				
				element(by.model('query.language')).element(by.css('option[value="FI"]')).click();
				element(by.name('search')).click();
				
				browser.wait(EC.visibilityOf($('#showResults')), 5000);	
				browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
				
				element.all(by.repeater('observation in observations')).count().then(function(count) {
					console.log('observationlist count: '+count);
					expect(count > 0).toBeTruthy();
				});				
			});		
		});
		
		it('should be able to find according to latin name and Finnish name', function () {
			var EC = protractor.ExpectedConditions;

	      		element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
			element(by.id('byName')).click();
			element(by.model('query.name')).sendKeys('Aglais io');
			
			element(by.model('query.language')).element(by.css('option[value="Latin"]')).click();
			
			element(by.name('search')).click();
			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
			
			element.all(by.repeater('observation in observations')).count().then(function(count) {
				console.log('observationlist count: '+count);
				expect(count > 0).toBeTruthy();

				element(by.model('query.name')).clear().then(function() {
					element(by.model('query.name')).sendKeys('Neitoperhonen');
			
					element(by.model('query.language')).element(by.css('option[value="FI"]')).click();
					element(by.name('search')).click();
			
					browser.wait(EC.visibilityOf($('#showResults')), 5000);	
					browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
			
					element.all(by.repeater('observation in observations')).count().then(function(count) {
						console.log('observationlist count: '+count);
						expect(count > 0).toBeTruthy();
					});
				});
			
			});
		});
		
		it('should be able to find observations from a given country within a specific time interval', function() {
	      		var EC = protractor.ExpectedConditions;

	      		element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
				
	
			// set the calendar date
			var browseCalendar = function(testDay, testMonth, testYear) {
				var date = new Date();
				var years = testYear-date.getFullYear();
				console.log('testDay: '+testDay);
				console.log('testYear: '+testYear);

				// browse to year

				for (var i = 0; i < years; i++ ) {
					element(by.id('cal_py')).click();
				}

				console.log('testmonth: '+testMonth);
				var months = testMonth - (date.getMonth() + 1);
				console.log('months: '+months+' getmonth: '+date.getMonth());
				if (months < 0)
					months = months *(-1);
				// browse to month
				for (var i = 0; i < months; i++) {
					if ((testMonth-(date.getMonth()+1)) < 0) {
						console.log('cal_pm');
						var el = element(by.id('cal_pm'));
						browser.wait(EC.visibilityOf(el), 5000);
						el.click();
					}
					else  {
						console.log('cal_nm');
						var el = element(by.id('cal_nm'));
						browser.wait(EC.visibilityOf(el), 5000);
						el.click();
					}
				}

				// select day
				var cal_day = "cal_day_"+testDay;
				console.log('cal_day: '+cal_day);
				var el = element(by.id(cal_day));
				browser.wait(EC.visibilityOf(el), 5000);
				el.click();
	
			}
			

			console.log('enddate');
			var el = element(by.id('endDate'));
			browser.wait(EC.visibilityOf(el), 5000);
			element(by.id('endDate')).click();	
			browseCalendar(1,10,2017);

			console.log('startDate: '+element(by.id('startDate')).getAttribute('value'));
			
			console.log('startDate');
			var el = element(by.id('startDate'));
			browser.wait(EC.visibilityOf(el), 5000);
			el.click();	
			browseCalendar(1,8,2017);

			// see if calendar was set
			var val = element(by.id('startDate')).getAttribute('value').then(function(value) {
				console.log('startdate: '+value);
				
				el = element(by.name('search'));   			
				
				browser.wait(EC.visibilityOf(el), 5000);
				console.log('clicking search')
				el.click();
				console.log('showing results');
				browser.wait(EC.visibilityOf($('#showResults')), 5000);	
				browser.wait(EC.visibilityOf($("ul[name='table-data']")), 5000);		
      		
				element.all(by.repeater('observation in observations')).count().then(function(count) {
					console.log('observationlist count: '+count);
					expect(count > 0).toBeTruthy();
					
				});
			});
												
		});
		it('should be able to show no result pane', function() {
			var EC = protractor.ExpectedConditions;

	      		element(by.model('query.country')).element(by.css('option[value="Finland"]')).click();
				
			// date selection
			// set the calendar date
			var browseCalendar = function(testDay, testMonth, testYear) {
				var date = new Date();
				var years = testYear-date.getFullYear();
				console.log('testDay: '+testDay);
				console.log('testYear: '+testYear);

				// browse to year

				for (var i = 0; i < years; i++ ) {
					element(by.id('cal_py')).click();
				}

				console.log('testmonth: '+testMonth);
				var months = testMonth - (date.getMonth() + 1);
				console.log('months: '+months+' getmonth: '+date.getMonth());
				if (months < 0)
					months = months *(-1);
				// browse to month
				for (var i = 0; i < months; i++) {
					if ((testMonth-(date.getMonth()+1)) < 0) {
						console.log('cal_pm');
						var el = element(by.id('cal_pm'));
						browser.wait(EC.visibilityOf(el), 5000);
						el.click();
					}
					else  {
						console.log('cal_nm');
						var el = element(by.id('cal_nm'));
						browser.wait(EC.visibilityOf(el), 5000);
						el.click();
					}
				}

				// select day
				var cal_day = "cal_day_"+testDay;
				console.log('cal_day: '+cal_day);
				var el = element(by.id(cal_day));
				browser.wait(EC.visibilityOf(el), 5000);
				el.click();
	
			}

			element(by.id('startDate')).click();
 			browseCalendar(1,7,2014);
			element(by.id('endDate')).click();
 			browseCalendar(1,8,2014);
											
			element(by.name('search')).click();
      			browser.wait(EC.visibilityOf($('#noResults')), 5000);	
		});

	});*/
	
	describe('Logging',function() {

		beforeEach(function() {
			browser.get('#/login');
		});

		it('should be able to login and logout', function() {
			var EC = protractor.ExpectedConditions;
			browser.wait(EC.visibilityOf($('#email')), 5000);	
			element(by.id('email')).sendKeys('mauri.f@gmail.com');
	      		element(by.id('password')).sendKeys('aaaa');
			
			element(by.id('submit')).click();
			
			browser.getCurrentUrl().then(function(url) {
				expect(url).toContain('main');
				expect(element(by.id('logout_username')).getText()).toContain('Mauri');
				element(by.id('logout')).click();
				browser.getCurrentUrl().then(function(url) {
					
					expect(url).toContain('login');

				});
				
			});
	
		});
		it('should be able to notice incorrect credentials when logging', function() {
			var EC = protractor.ExpectedConditions;
			browser.wait(EC.visibilityOf($('#email')), 5000);	
			element(by.id('email')).sendKeys('mauri.f@gmail.com');
	      		element(by.id('password')).sendKeys('aaa');
			console.log('logging with incorrect credentials');
			element(by.id('submit')).click();
			browser.getCurrentUrl().then(function(url) {
				expect(url).toContain('login');
				browser.wait(EC.visibilityOf($('#password')), 5000);
				//expect(url).toContain('login');
				console.log('waiting for failure message');
				browser.wait(EC.visibilityOf($('#message')), 5000);	
				/*console.log('checking message content');
				expect(element(by.id('message'))).toContain('Incorrect');
				console.log('after checking message content');*/
			});
			
	
		});
	});
	
	describe('Add and view collection', function() {

		beforeEach(function() {
			browser.get('#/login');

			var EC = protractor.ExpectedConditions;
				

			element(by.name('email')).sendKeys('mauri.f@gmail.com');
	      		element(by.name('password')).sendKeys('aaaa');
			
			element(by.name('submit')).click();
			
			browser.getCurrentUrl().then(function(url) {
				expect(url).toContain('main');	
			});	
		});

		it('should be able to add and view collection connected and offline', function() {
			var EC = protractor.ExpectedConditions;
			
			
			element(by.model('query.primaryColor')).element(by.css('option[value="Yellow"]')).click();
					
			element(by.model('query.category')).element(by.css('option[value="Bee"]')).click();
//			element(by.model('query.secondaryColor')).element(by.css('option[value="Green"]')).click();
			element(by.name('search')).click();

			browser.wait(EC.visibilityOf($('#showResults')), 5000);	
			browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);

			// search results
			element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {
				console.log('search count: '+count);
				expect(count > 0).toBeTruthy();
				element(by.id('identify')).click();
				
				// expect the url to have changed
				browser.getCurrentUrl().then(function(url) {
					expect(url).toContain('/insect');
					// wait for the detail page to load
					browser.wait(EC.visibilityOf($('#description')), 5000);
					

					// aim to store the insect to the localstorage
					element(by.id('removeItem')).getAttribute('value').then(function(showRemove) {
					console.log('showRemove: '+showRemove);	
					if (showRemove == 1) {
						element(by.id('removeFromCollection')).click();
						browser.wait(EC.visibilityOf($('#messageRemovedSuccess')), 5000);
					}
					browser.wait(EC.visibilityOf($('#addToCollection')), 5000);

					// add the insect to the localstorage
					element(by.id('addToCollection')).click();
					browser.wait(EC.visibilityOf($('#messageAddSuccess')), 5000);

					// Switch to collection page
					element(by.id('collection-header')).click();
					console.log('waiting for bee header');

					browser.wait(EC.visibilityOf($('#collection-bee')), 5000);
					
					console.log('iterating over category'); 
		
				
					element.all(by.repeater('insect in insects')).count().then(function(count) {
						console.log('waiting for category item count');
						console.log('collectionlist count: '+count);
						console.log('waiting for testing count');
						expect(count > 0).toBeTruthy();
				
						element(by.css('.insect-thumbs li:nth-child(1) img')).getSize().then(function(size) {
							console.log('waiting for test image size');
							console.log('size online: '+size.width);
							console.log('waiting for testing the image size');
							expect(size.width > 0).toBeTruthy();

							// offline test
							browser.wait(EC.visibilityOf($('#offline')), 5000);
							element(by.id('offline')).click();
							//browser.wait(EC.visibilityOf($('#collection-bee')), 5000);
							element(by.css('.insect-thumbs li:nth-child(1) img')).getSize().then(function(size) {
								console.log('size offline: '+size.width);
								expect(size.width > 0).toBeTruthy();
	
								//element(by.css('.insect-thumbs li:nth-child(1) img')).click();
								//browser.wait(EC.visibilityOf($('#description')), 5000);
							});
						});
					
				
					});
				});
				});
				

				
					
			}); 
			
		});
	});
/*
	describe('Upload', function() {
		beforeEach(function() {
			browser.get('#/login');

			var EC = protractor.ExpectedConditions;
				

			element(by.name('email')).sendKeys('mauri.f@gmail.com');
	      		element(by.name('password')).sendKeys('aaaa');
			
			element(by.name('submit')).click();

			browser.getCurrentUrl().then(function(url) {
				browser.wait(EC.visibilityOf($('#upload')), 5000);

				element(by.id('upload')).click();

				browser.wait(EC.visibilityOf($('#upload-title')), 5000);	
	
			});	
		});
	
		it('should be able to upload insect', function() {

			var EC = protractor.ExpectedConditions;
			var latinName = "Leptinotarsa decemlineata";
			var finnishName = "Colorado kuoriainen";
			var englishName = "Colorado potato beetle";
			var photoName = "colorado-beetle.jpg";
			
			element(by.id('latinName')).sendKeys(latinName);
			element(by.id('finnishName')).sendKeys(finnishName);
			element(by.id('englishName')).sendKeys(englishName);
						
			element(by.id('primaryColor')).element(by.css('option[value="Yellow"]')).click();
					
			element(by.id('category')).element(by.css('option[value="Beetle"]')).click();
			element(by.id('secondaryColor')).element(by.css('option[value="Black"]')).click();

			element(by.id('legs')).element(by.css('option[value="06"]')).click();
			element(by.id('wiki')).sendKeys('Leptinotarsa_decemlineata');
			var __dirname = 'app/public/images/';
			var fileToUpload = 'colorado-beetle.jpg';
			var absolutePath = path.resolve(__dirname, fileToUpload);
  			$('input[type="file"]').sendKeys(absolutePath);

			console.log('before upload submit click');
			element(by.id('uploadSubmit')).click();
			console.log('before testing page switch');
	                
			browser.getCurrentUrl().then(function(url) {
				console.log('url: '+url);
				expect(url).toContain('main');
				browser.wait(EC.visibilityOf($('#search')), 15000);

				console.log('after testing page switch');
				element(by.name('latinName')).sendKeys(latinName);
				element(by.name('primaryColor')).element(by.css('option[value="Yellow"]')).click();
				element(by.name('secondaryColor')).element(by.css('option[value="Black"]')).click();
				element(by.id('search')).click();	

				browser.wait(EC.visibilityOf($('#showResults')), 5000);	
				browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
				// search results
				element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {
				console.log('search count: '+count);
				expect(count > 0).toBeTruthy();
				}); 

			});

		});
		
		it('should be able to modify insect', function() {
			var EC = protractor.ExpectedConditions;
			var latinName = "Leptinotarsa decemlineata";
			var finnishName = "Colorado kuoriainen";
			var englishName = "Colorado potato beetle";
			var photoName = "colorado-beetle.jpg";
			element(by.id('modify')).click();
			console.log('waiting uploadlist..');
			browser.wait(EC.visibilityOf($('#uploadList')), 5000);
			console.log('clicking insect image.');
			element(by.id(latinName)).click();

			console.log('waiting for the page switch');
			browser.wait(EC.visibilityOf($('#latinName')), 5000);
		
			browser.getCurrentUrl().then(function(url) {
				expect(url).toContain('upload');
				expect(element(by.id('latinName')).getAttribute('value')).toMatch(latinName);			
				expect(element(by.id('finnishName')).getAttribute('value')).toMatch(finnishName);	
				expect(element(by.id('englishName')).getAttribute('value')).toMatch(englishName);
				expect(element(by.id('category')).getAttribute('value')).toMatch('Beetle');
				expect(element(by.id('primaryColor')).getAttribute('value')).toMatch('Yellow');
				expect(element(by.id('secondaryColor')).getAttribute('value')).toMatch('Black');
				expect(element(by.id('legs')).getAttribute('value')).toMatch('06');

				// TODO match insect photo
				//expect(element(by.id('photoName')).getText()).toMatch(photoName);

				element(by.id('latinName')).sendKeys('test');
				
				element(by.css('.insect-thumbs li:nth-child(1) input')).click();

				var __dirname = 'app/public/images/';
				var fileToUpload = '220px-Celastrina_ladon_03745.JPG';
				var absolutePath = path.resolve(__dirname, fileToUpload);
  				$('input[type="file"]').sendKeys(absolutePath);
				
				console.log('before upload submit click');
				element(by.id('updateSubmit')).click();
				console.log('before testing page switch');
	                
				browser.getCurrentUrl().then(function(url) {
					console.log('url: '+url);
					expect(url).toContain('main');
					browser.wait(EC.visibilityOf($('#search')), 5000);

					element(by.name('latinName')).sendKeys(latinName+'test');
					element(by.name('category')).element(by.css('option[value="Beetle"]')).click();
					element(by.name('search')).click();	

					browser.wait(EC.visibilityOf($('#showResults')), 5000);	
					browser.wait(EC.visibilityOf($('#insect-thumbs')), 5000);
					
					// search results
					element.all(by.repeater('insect in ($parent.filteredItems =(pagedInsects[currentPage] | searchFilter: query.primaryColor: query.category:query.secondaryColor:query.legs:filterClicked))')).count().then(function(count) {
						console.log('search count: '+count);
						expect(count > 0).toBeTruthy();

						element(by.css('.insect-thumbs li:nth-child(1) img')).click();
						element(by.id('identify')).click();

						browser.wait(EC.visibilityOf($('#description')), 5000);
						// TODO view multiple thumb images
						/*element.all(by.repeater('img in insect.images')).count().then(function(count) {
							console.log('thumb image count: '+count);
							expect(count >0).toBeTruthy();
						});
					}); 
					
				});

			

			});
		});	
	});*/
});
