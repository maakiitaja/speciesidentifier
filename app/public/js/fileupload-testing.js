

You need to inject the path of your file into your input.

var path = require('path');

it('should upload file', function() {
  var fileToUpload = '../path/foo.txt',
  var absolutePath = path.resolve(__dirname, fileToUpload);
  $('input[type="file"]').sendKeys(absolutePath);
  $('#uploadButton').click();
});


