/*window.ononline=online;
window.onoffline=offline;
var localStorage = window.localStorage; 

function online() {
	console.log('online');
	connected = true;
	localStorage.setItem('connected', '1');
	console.log('localstorage.connected: '+localStorage.connected);
}

function offline() {
	connected = false;
	console.log('offline');
	localStorage.setItem('connected', '0');
	console.log('localstorage.connected: '+localStorage.connected);
}*/

function connectivity(status, $scope, $localStorage) {
	if (status == false) {
		$scope.connected = 0;
		$localStorage.connected = 0;
		console.log('detailctrl: not connected');
	}
	else {
		$scope.connected = 1;
		$localStorage.connected = 1;
		console.log('detailctrl: connected');
	}
}

function checkconnectivity(id, isMainImage) {

	console.log('checkconnectivity, id: '+id);
	console.log('localstorage connected: '+localStorage.getItem('connected'));

	if (id.substring(0, 4) == 'http') { 
		console.log('id started with http');
		for (var i = 4;  i < id.length; i++) {
			//console.log('i: '+i+', id.length: '+id.length+', checking substring: '+id.substring(i,i+7));
			if (id.substring(i, i+7) == '/images') {
				var tmp = id;
				id = tmp.substring(i, id.length);
				console.log('found /images from id');
				break;
			}	
		}
	}
	console.log('checkconnectivity id: '+id);	
	if (localStorage.getItem('connected') != '1') {
		
		console.log('setting image from localstorage');
		var src = localStorage.id;
		if (isMainImage)
			document.getElementById('mainimage').src = src;			
		else
			document.getElementById(id).src = src;		
	}	
}

function savetest(name) {
	console.log('name.substring: '+name.substring(name.length-9,name.length));
	if (name.substring(name.length-1-9,name.length-1) == 'thumb.jpg') {
		console.log('name consists thumb.jpg');
	
	}
//	localStorage.setItem(name, name);
//	console.log('connectivity, localstorage.name: '+localStorage.getItem(name));
}

function getImg(id,name) {
	var img = new Image();
	    if (name!= id) {
		/* load image from the server */
		img.src = name;
		console.log('image : '+img);
	
	    }   else  
	        img = document.getElementById(id);
	return img;
}
/*
function getBase64FromImage(id,name, localStorage) {
    console.log('getbase64fromimageurl, id: '+id);
    var img = new Image();
    if (name!= id) {
	/* load image from the server 
	img.src = name;
	console.log('image : '+img);

    }   else  
        img = document.getElementById(id);

    img.setAttribute('crossOrigin', 'anonymous');

    img.onload = function () {
	console.log('img.onload');
        var canvas = document.createElement("canvas");
	
        canvas.width =this.width;
       	canvas.height =this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));

	// set to localstorage
	//name = name.replace(/^ ', "");
	
	console.log('saving image with name: '+name+' to localstorage');
	localStorage.setItem(name, dataURL);
	var tmp = localStorage.getItem(name);
	console.log('saved item: '+tmp);
	console.log(JSON.stringify(localStorage));
    };
}
*/
