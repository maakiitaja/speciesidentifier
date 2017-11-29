module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/public/js/app.js',
      'app/public/js/controllers.js',
      'app/public/js/services.js',
      'app/public/js/ngRoute.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/public/js/ngStorage.min.js',	
      'test/unit/**/*.js',
      'app/bower_components/jquery/dist/jquery.js'	
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome', 'Firefox'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
	    'jasmine-spec-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
