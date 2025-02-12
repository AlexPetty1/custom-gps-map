window.onload = onLoad;

var mapGPSBLx = -124.9;
var mapGPSBLy = 45.1;
var mapGPSWidth = 8.2;
var mapGPSHeight = 3.8;

var numberReferences = 0;

class Mouse{
    constructor(){
        this.globalX = 0;
        this.globalY = 0;
        this.mapX = 0;
        this.mapY = 0;
    }
}

class Reference{
    constuctor(){
      this.gpsX = null;
      this.gpsY = null
      this.pixelX = null
      this.pixelY = null
    }  
}

var reference1 = new Reference();
var reference2 = new Reference();
var mouse = new Mouse();

function onLoad(){
    setReferences();


    setMapFromReferences(reference1, reference2);

    //yakima
    setIconCords(-120.665365, 46.625374);

    //add event listeners
    window.addEventListener('mousemove', showCordsMouse, false);
    window.addEventListener('mousemove', updateMouseCords, false);

    let addReferenceButton = document.getElementById('addReferenceButton');
    addReferenceButton.addEventListener('mouseup', addingReference, false)
}

function updateMouseCords(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;
    mouse.globalX = xMouse;
    mouse.globalY = yMouse;


    let map = document.getElementById('mapImage');
    let mapRect = map.getBoundingClientRect();
    mouse.mapX = xMouse - mapRect.left;
    mouse.mapY = mapRect.bottom - yMouse;
}


function addingReference(){
    if(numberReferences >= 2){
        return;
    }

    let referenceID = 'reference1';
    if(numberReferences == 1){
        referenceID = 'reference2';
    }

    var eventHandlerWrapper = function(){
        addReference(referenceID, eventHandlerWrapper)
    };

    let testImage = document.getElementById('mapImage');
    testImage.addEventListener('click', eventHandlerWrapper, false);

    window.addEventListener
}

function addReference(id, reference, functionToRemove){
    console.log("Add reference called");
    console.log(id);

    let reference = document.getElementById(id);
    reference.style.position = 'absolute';
    reference.style.top = mouse.globalY + 'px';
    reference.style.left = mouse.globalX + 'px';
    numberReferences = numberReferences + 1;

    

    let testImage = document.getElementById('mapImage');
    testImage.removeEventListener('click', functionToRemove);
}

function setReferences(){
    // aberdeen
    reference1.gpsX = -123.824;
    reference1.gpsY = 46.970;
    reference1.pixelX = 44;
    reference1.pixelY = 125;

    // Bellingham
    reference2.gpsX = -122.486;
    reference2.gpsY = 48.747;
    reference2.pixelX = 115;
    reference2.pixelY = 252;
}


function setIconCords(gpsX, gpsY){
    var icon = document.getElementById('dogIcon');
    var map = document.getElementById('mapImage');
    var mapRect = map.getBoundingClientRect();
    var gpsToPixelX = mapRect.width / mapGPSWidth;
    var gpsToPixelY = mapRect.height / mapGPSHeight;

    console.log("GPS To Pixel X set: " + gpsToPixelX);
    console.log("GPS To Pixel Y set: " + gpsToPixelY);

    console.log(gpsY - mapGPSBLy);

    icon.style.position = 'absolute';
    xLocation = mapRect.left + (gpsX - mapGPSBLx) * gpsToPixelX;
    yLocation = mapRect.bottom - (gpsY - mapGPSBLy) * gpsToPixelY;

    // adjusts location so bottom middle is at location
    var iconSize = 20;
    xLocation = xLocation - iconSize/2;
    yLocation = yLocation - iconSize;

    console.log("X location icon new: " + xLocation);
    console.log("Y location icon new: " + yLocation);

    icon.style.top = yLocation + 'px';
    icon.style.left = xLocation + 'px';
}


function showCordsMouse(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;
    xDisplay = document.getElementById("xCor");
    yDisplay = document.getElementById("yCor");

    let map = document.getElementById('mapImage');
    let mapRect = map.getBoundingClientRect();
    xDisplay.value = xMouse - mapRect.left;
    yDisplay.value = mapRect.bottom - yMouse;
}


function setMapFromReferences(reference1, reference2){
    let map = document.getElementById('mapImage');
    let mapRect = map.getBoundingClientRect();

    var gpsToPixelX = Math.abs((reference1.pixelX - reference2.pixelX) / (reference1.gpsX - reference2.gpsX));
    var gpsToPixelY = Math.abs((reference1.pixelY - reference2.pixelY) / (reference1.gpsY - reference2.gpsY));
    var pixelToGPSX = 1/gpsToPixelX;
    var pixelToGPSY = 1/gpsToPixelY;

    mapGPSWidth = pixelToGPSX * mapRect.width;
    mapGPSHeight = pixelToGPSY * mapRect.height;
    console.log("New gps width: " + mapGPSWidth);
    console.log("New gps height: " + mapGPSHeight);

    mapGPSBLx = reference1.gpsX - (reference1.pixelX * pixelToGPSX);
    mapGPSBLy = reference1.gpsY - (reference1.pixelY * pixelToGPSY);
    console.log("GPS X: " + mapGPSBLx);
    console.log("GPS Y: " + mapGPSBLy);
}
