window.onload = onLoad;

var mapGPSBLx = null;
var mapGPSBLy = null;
var mapGPSWidth = null;
var mapGPSHeight = null;
var numberReferences = 0;

var userGPSLatitude = null;
var userGPSLongitude = null;

const testImage = document.getElementById('mapImage');
const reference1Image = document.getElementById("reference1");
const reference2Image = document.getElementById("reference2");
const locationMarker = document.getElementById("locationMarker");


const LOCATION_MARKER_SIZE = 20;
const REFERENCE_IMAGE_WIDTH = 20;
const REFERENCE_IMAGE_HEIGHT = 28;

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
      this.imageID = null
    }  
}

class EditReferencePopup{
    constructor(){
        this.referenceModifing = null;
    }
}

var editReferencePopup = new EditReferencePopup;
var reference1 = new Reference();
var reference2 = new Reference();
var mouse = new Mouse();


function continouslyUpdateUserGPS() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(setUserGPS);
    }

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(fillPopupUseCurrentLocation);
    }
    
    setTimeout(continouslyUpdateUserGPS, 5000);
}

function setUserGPS(position){
    userGPSLatitude = position.coords.latitude;
    userGPSLongitude = position.coords.longitude;
}


function continouslyUpdatePosition(){
    setLocationCords(userGPSLongitude, userGPSLatitude);

    setTimeout(continouslyUpdatePosition, 10000);
}
continouslyUpdatePosition();


function onLoad(){
    setReferences();
    setMapFromReferences(reference1, reference2);
    updateReferencePosition(reference1);
    updateReferencePosition(reference2);

    //add event listeners
    window.addEventListener('mousemove', showCordsMouse, false);
    window.addEventListener('mousemove', updateMouseCords, false);

    let addReferenceButton = document.getElementById('addReferenceButton');
    addReferenceButton.addEventListener('mouseup', addingReference, false)


    //popup
    reference1Image.addEventListener('click', function(){
        openPopup(reference1);
    }, false);

    reference2Image.addEventListener('click', function(){
        openPopup(reference2);
    }, false);

    var popupClose = document.getElementById('exitPopup');
    popupClose.addEventListener('mouseup', closePopup, false);

    var useCurrentLocationButton = document.getElementById("useCurrentLocationButton");
    useCurrentLocationButton.addEventListener('click', useCurrentLocation, false);

    var acceptPopupButton = document.getElementById("acceptPopup");
    acceptPopupButton.addEventListener('click', acceptPopup, false);

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(setUserGPS);
    }
}


window.addEventListener('resize', function(event) {
    updateReferencePosition(reference1);
    updateReferencePosition(reference2);
    setLocationCords(userGPSLongitude, userGPSLatitude);
}, true);


function updateReferencePosition(reference){
    if(reference.pixelX == null){
        return
    }

    if(reference.pixelY == null){
        return
    }


    let mapRect = testImage.getBoundingClientRect();
    let referenceImage = document.getElementById(reference.imageID);

    referenceImage.style.position = 'absolute';
    xLocation = mapRect.left + reference.pixelX;
    yLocation = mapRect.bottom - reference.pixelY;

    xLocation = xLocation - REFERENCE_IMAGE_WIDTH / 2;
    yLocation = yLocation - REFERENCE_IMAGE_HEIGHT;

    referenceImage.style.top = yLocation + 'px';
    referenceImage.style.left = xLocation + 'px';
}

function updateMouseCords(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;
    mouse.globalX = xMouse;
    mouse.globalY = yMouse;


    let mapRect = testImage.getBoundingClientRect();
    mouse.mapX = xMouse - mapRect.left;
    mouse.mapY = mapRect.bottom - yMouse;
}


function addingReference(){
    if(numberReferences >= 2){
        return;
    }

    let reference = reference1;
    if(numberReferences == 1){
        reference = reference2;
    }

    var eventHandlerWrapper = function(){
        addReference(reference, eventHandlerWrapper)
    };

    testImage.addEventListener('click', eventHandlerWrapper, false);

    window.addEventListener
}

function addReference(reference, functionToRemove){
    console.log("Add reference called");

    reference.pixelX = mouse.mapX;
    reference.pixelY = mouse.mapY;

    console.log("Reference pixelX: " + reference.pixelX);
    console.log("Reference pixelY: " + reference.pixelY);

    updateReferencePosition(reference);
    numberReferences = numberReferences + 1;
    

    testImage.removeEventListener('click', functionToRemove);
}

function setReferences(){
    // Bend
    reference1.gpsX = -121.3131;
    reference1.gpsY = 44.0543;
    reference1.pixelX = 247;
    reference1.pixelY = 215;
    reference1.imageID = "reference1"

    // Pendleton
    reference2.gpsX = -118.807;
    reference2.gpsY = 45.662;
    reference2.pixelX = 418;
    reference2.pixelY = 367;
    reference2.imageID = "reference2"
}


function setLocationCords(gpsX, gpsY){
    if(gpsX == null){
        return;
    }

    if(gpsY == null){
        return;
    }

    var mapRect = testImage.getBoundingClientRect();
    var gpsToPixelX = mapRect.width / mapGPSWidth;
    var gpsToPixelY = mapRect.height / mapGPSHeight;

    console.log("GPS To Pixel X set: " + gpsToPixelX);
    console.log("GPS To Pixel Y set: " + gpsToPixelY);

    console.log(gpsY - mapGPSBLy);

    locationMarker.style.position = 'absolute';
    xLocation = mapRect.left + (gpsX - mapGPSBLx) * gpsToPixelX;
    yLocation = mapRect.bottom - (gpsY - mapGPSBLy) * gpsToPixelY;

    // adjusts location so bottom middle is at location
    var iconSize = 20;
    xLocation = xLocation - iconSize/2;
    yLocation = yLocation - iconSize;

    console.log("X location icon new: " + xLocation);
    console.log("Y location icon new: " + yLocation);

    locationMarker.style.top = yLocation + 'px';
    locationMarker.style.left = xLocation + 'px';
}


function showCordsMouse(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;
    xDisplay = document.getElementById("xCor");
    yDisplay = document.getElementById("yCor");

    let mapRect = testImage.getBoundingClientRect();
    xDisplay.value = xMouse - mapRect.left;
    yDisplay.value = mapRect.bottom - yMouse;
}


function setMapFromReferences(reference1, reference2){
    if(isReferenceFilled(reference1) == false){
        return;
    }

    if(isReferenceFilled(reference2) == false){
        return;
    }

    let mapRect = testImage.getBoundingClientRect();

    var gpsToPixelX = Math.abs((reference1.pixelX - reference2.pixelX) / (reference1.gpsX - reference2.gpsX));
    var gpsToPixelY = Math.abs((reference1.pixelY - reference2.pixelY) / (reference1.gpsY - reference2.gpsY));
    var pixelToGPSX = 1/gpsToPixelX;
    var pixelToGPSY = 1/gpsToPixelY;

    mapGPSWidth = pixelToGPSX * mapRect.width;
    mapGPSHeight = pixelToGPSY * mapRect.height;
    mapGPSBLx = reference1.gpsX - (reference1.pixelX * pixelToGPSX);
    mapGPSBLy = reference1.gpsY - (reference1.pixelY * pixelToGPSY);
}

function isReferenceFilled(reference){
    if( reference.gpsX == null || reference.gpsY == null ||
        reference.pixelX == null || reference.pixelY == null){
        return false
    }

    return true;
}



////// Popup section ///////

function openPopup(reference){
    var popup = document.getElementById('popup1');
    popup.style.display = "block";

    editReferencePopup.referenceModifing = reference;

    var referenceImage = document.getElementById(reference.imageID);
    var referenceBounding = referenceImage.getBoundingClientRect();

    var latitudeInput = document.getElementById("latitudeInput");
    if(reference.gpsX != null){
        latitudeInput.value= reference.gpsY;
    } else {
        latitudeInput.value= "";
    }

    var longitudeInput = document.getElementById("longitudeInput");
    if(reference.gpsY != null){
        longitudeInput.value = reference.gpsX;
    } else {
        longitudeInput.value = "";
    }

    xPosition = referenceBounding.left + REFERENCE_IMAGE_WIDTH / 2;
    yPosition = referenceBounding.top + REFERENCE_IMAGE_HEIGHT; 

    popup.style.position = 'absolute';
    popup.style.top = yPosition + "px";
    popup.style.left = xPosition + "px";

    console.log("Reference bounding: " + referenceBounding.top)
}

function closePopup(){
    console.log("Close popup");
    var popup = document.getElementById('popup1');
    popup.style.display = "none";
}

function useCurrentLocation(){
    console.log("Use current location used");
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(fillPopupUseCurrentLocation);
    }
}

function fillPopupUseCurrentLocation(position){
    var latitudeInput = document.getElementById("latitudeInput");
    latitudeInput.value= position.coords.latitude;

    var longitudeInput = document.getElementById("longitudeInput");
    longitudeInput.value = position.coords.longitude;
}

function acceptPopup(){
    var latitudeInput = document.getElementById("latitudeInput");
    var longitudeInput = document.getElementById("longitudeInput");

    if(latitudeInput.value == ""){
        return;
    }

    if(longitudeInput.value == ""){
        return;
    }

    editReferencePopup.referenceModifing.gpsX = longitudeInput.value;
    editReferencePopup.referenceModifing.gpsY = latitudeInput.value;

    var popup = document.getElementById('popup1');
    popup.style.display = "none";

    //updates, map
    setMapFromReferences(reference1, reference2);
    setLocationCords(userGPSLongitude, userGPSLatitude);
}
