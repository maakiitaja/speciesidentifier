// Copyright 2006-2007 javascript-array.com

var timeout	= 500;
var closetimer	= 0;
var ddmenuitem	= 0;

function hoverout(id)
{
	console.log('hoverout');
	var el  = document.getElementById(id+'-img');
	el.src = "images/"+id+'.png';	
	//el.opacity = 1.0;
}


function hover(id)
{
	console.log('hover');
	var str = id+"-img";
	var el  = document.getElementById(str);
	el.src = "images/"+id+"-hover.png";
	//el.opacity = 0.5;
}


// open hidden layer
function mopen(id)
{	
	console.log("mopen");

	// cancel close timer
	mcancelclosetime(id);

	// close old layer
	if(ddmenuitem) {
		console.log("mopen: closing menu");
	//	ddmenuitem.style.visibility = 'hidden';
	}

	// get new layer and show it
	ddmenuitem = document.getElementById(id);
	ddmenuitem.style.display = 'block';

}

// close showed layer

function close(id) {
	console.log('close: '+id);
	if (ddmenuitem) {
		ddmenuitem.style.display = 'none';
	}
}

// go close timer
function mclosetime(id)
{
	console.log("mclosetime set timeout with id: "+id+' timeout: '+timeout);

	closetimer = window.setTimeout(function mclose(id)
	{
	if (!closetimer)
		return;
	console.log("mclose"+' id: '+id);
	if(ddmenuitem) {
		console.log("mclose, closing submenu, id: "+id);
		ddmenuitem.style.visibility = 'hidden';
		//document.getElementById("submenu").visibility="hidden"; 
		
	}
	}, timeout);
	console.log('mclosetime (id: '+id+') '+closetimer);
}

// cancel close timer
function mcancelclosetime(id)
{
	console.log("mcancelclosetime, id: "+id);
	if(closetimer)
	{
		console.log('mcancelclosetime, clearing timer (id: '+id+'):'+closetimer);
		closetimer = null;
	}
	// show the submenu
	//document.getElementById("submenu").style.visibility="visible"; 
	//document.getElementById(id).style.visibility = 'visible';
}

// close layer when click-out
//document.click = mclose; 
