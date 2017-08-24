var req = new XMLHttpRequest();
var req = new XMLHttpRequest();
req.open("GET", https://s3-ap-southeast-2.amazonaws.com/drugdetectionapp-media/1004/alcohol_para.jpg", true);
req.responseType = "arraybuffer";

req.onload = function (event) {
  var buffer = req.response;
  if (buffer) {
    var byteArray = new Uint8Array(buffer);
    // Maybe you could also use buffer directly here...
    var b64 = btoa(byteArray);
    localStorage.setItem("imageData", b64); 
  }
};
req.send(null);

---------------------

For more info see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL

Here is the code:

function previewFile() {
    // Where you will display your image
    var preview = document.querySelector('img');
    // The button where the user chooses the local image to display
    var file = document.querySelector('input[type=file]').files[0];
    // FileReader instance
    var reader  = new FileReader();

    // When the image is loaded we will set it as source of
    // our img tag
    reader.onloadend = function () {
      preview.src = reader.result;
    }

    
    if (file) {
      // Load image as a base64 encoded URI
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
    }
  }

  <input type="file" onchange="previewFile()"><br>
  <img src="" height="200" alt="Image preview...">