window.onload = onLoad;

var userGPSLatitude = null;
var userGPSLongitude = null;
var areReferencesShown = true;

const locationMarker = document.getElementById("locationMarker");

const referenceImageEle = document.getElementById("referenceImage")

const addReferenceButton = document.getElementById("addReferenceButton");
const toggleReferencesButton = document.getElementById("toggleReferences");

const popupForReference = document.getElementById("popup1");
const popupLongitudeInput = document.getElementById("longitudeInput");
const popupLatitudeInput = document.getElementById("latitudeInput");

const gpsShow = document.getElementById("gpsShow");

const mapInfo1 = document.getElementById("mapInfo1");
const mapInfo2 = document.getElementById("mapInfo2");

const hiddenLoadFile = document.getElementById("hiddenLoadFile");
const uploadFileButton = document.getElementById("uploadFile");

const LOCATION_MARKER_SIZE = 20;
const REFERENCE_IMAGE_WIDTH = 20;
const REFERENCE_IMAGE_HEIGHT = 28;

const minZoom = 1;
const maxZoom = 10;

const canvasElement = document.getElementById("myCanvas");
const canvas = canvasElement.getContext("2d");
const imageEle = document.getElementById("mapImage");
const iconEle = document.getElementById("icon");

var mouseClientX = 0;
var mouseClientY = 0;
var mouseMapX = 0;
var mouseMapY = 0;
var mouseGPSX = 0;
var mouseGPSY = 0;

class Mouse{
    constructor(){
        this.globalX = 0;
        this.globalY = 0;
        this.clientX = 0;
        this.clientY = 0;
        this.mapX = 0;
        this.mapY = 0;
    }
}

class Reference{
    constuctor(mapObj){
      this.gpsX = null
      this.gpsY = null
      this.pixelX = null
      this.pixelY = null

      this.mapObject = mapObj;
    }
}

class EditReferencePopup{
    constructor(){
        this.referenceModifing = null;
    }
}


class Map{
    constructor(){
        this.GPSBLx = null;
        this.GPSBLy = null;
        this.GPSWidth = null;
        this.GPSHeight = null;
        this.numberReferences = 0;
    }
}

class MapObject{
    constructor(srcEle){
        this.imageSRC = srcEle;
        this.mapX = null;
        this.mapY = null;

        this.width = srcEle.width;          // width is in client pixels, so it will always be the same size
        this.height = srcEle.height;

        this.centerX = 0.5;
        this.centerY = 0.5;

        this.collisionEnabled = false;
        this.show = true;
    }

    draw(mapRender){
        if(this.show == false){
            return;
        }

        if(this.mapX == null || this.mapY == null){
            return;
        }

        var clientCords = mapRender.mapPixelToClientPixel(this.mapX, this.mapY);
        var dx = clientCords[0] - this.width * this.centerX;
        var dy = clientCords[1] - this.height * this.centerY;

        canvas.drawImage(this.imageSRC, dx, dy, this.width, this.height);
    }

    testCollision( xClient, yClient, mapRender, success, arg1){
        var clientCords = mapRender.mapPixelToClientPixel(this.mapX, this.mapY);
        var imageLeft = clientCords[0] - this.centerX * this.width;
        var imageTop = clientCords[1] - this.centerY * this.height;

        if(this.show == false){
            return;
        }

        if(xClient < imageLeft){
            return;
        }

        if(xClient > imageLeft + this.width){
            return;
        }

        if(yClient < imageTop){
            return;
        }

        if(yClient > imageTop + this.height){
            return;
        }

        success(arg1)
    }

    setCenter(centerX, centerY){
        this.centerX = centerX;
        this.centerY = centerY;
    }

    setSize(width, height){
        this.width = width;
        this.height = height;
    }

    setMapCords(x, y){
        this.mapX = x;
        this.mapY = y;
    }
}

class MapRender{

    constructor(imageElementID, canvasElementID){
        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceImageWidth = 0;
        this.sourceImageHeight = 0;
        
        this.imageWidth = 0;
        this.imageHeight = 0;

        this.panX = 0   
        this.panY = 0        
        this.zoom = 1

        this.isPanEnabled = true;
        this.panPrevPanX = null;
        this.panPrevPanY = null;
        this.isPanning = false;

        this.mapObjects = [null];
        this.numberMapObjects = 0;

        this.imageID = imageElementID;
        this.canvasEle = canvasElementID;
        this.canvas = canvasElementID.getContext("2d");
    }

    drawMap(){
        this.canvas.clearRect(0, 0, this.canvasEle.width,  this.canvasEle.height);
        this.updateMapImageVariables();
        
        var dx = 0;
        var dy = 0;
        this.canvas.drawImage(this.imageID, this.sourceX, this.sourceY, this.sourceImageWidth, this.sourceImageHeight, 
            dx, dy, this.imageWidth, this.imageHeight);

        this.drawMapObjects();
    }

    drawMapObjects(){
        for(let i = 0; i < this.numberMapObjects; i++){
            var objectOn = this.mapObjects[i];

            if(objectOn == null){
                continue;
            }
            objectOn.draw(this);
        }
    }

    addMapObject(mapObject){
        this.mapObjects[this.numberMapObjects] = mapObject;
        this.numberMapObjects++;
    }

    updateMapImageVariables(){
        var imageRatio = this.imageID.width / this.imageID.height;
        var canvasRatio = this.canvasEle.width / this.canvasEle.height;
    
        if(imageRatio > canvasRatio){
            this.sourceImageWidth = Math.min(this.imageID.width, this.imageID.width * 1/this.zoom)
            this.sourceImageHeight = Math.min(this.imageID.height, this.sourceImageWidth* (1/canvasRatio))
    
            this.imageWidth = this.canvasEle.width;
            this.imageHeight = Math.min(this.canvasEle.height, this.canvasEle.width * this.zoom * (1/imageRatio)) 
        } else {
            this.sourceImageHeight = Math.min(this.imageID.height, this.imageID.height * 1/this.zoom)
            this.sourceImageWidth = Math.min(this.imageID.width, this.sourceImageHeight * (canvasRatio))
    
            this.imageHeight = this.canvasEle.height;
            this.imageWidth = Math.min(this.canvasEle.width, this.canvasEle.height * this.zoom * (imageRatio))
        }
    
        this.panX = Math.max(this.panX, this.sourceImageWidth / 2);
        this.panY = Math.max(this.panY, this.sourceImageHeight / 2);
    
        this.panX = Math.min(this.panX, this.imageID.width - this.sourceImageWidth / 2);
        this.panY = Math.min(this.panY, this.imageID.height - this.sourceImageHeight / 2);
    
        this.sourceX = this.panX - (this.sourceImageWidth / 2);
        this.sourceY = this.panY - (this.sourceImageHeight / 2);

        updateMouseMapCords();
    }

    mapPixelToClientPixel(mapX, mapY){
        var imageXCenter =  this.imageWidth / 2;
        var ratioX = this.sourceImageWidth / this.imageWidth;
        
        var imageYCenter = this.imageHeight / 2;
        var ratioY = this.sourceImageHeight / this.imageHeight
    
        var clientX = (mapX - this.panX) / ratioX + imageXCenter;
        var clientY = (mapY - this.panY) / ratioY + imageYCenter;
        
        return [clientX, clientY]
    }
    
    //returns cordinates on map, from place on image of map
    clientPixelToMapPixel(clientX, clientY){
        var imageXCenter = this.imageWidth / 2;
        var ratioX = this.sourceImageWidth / this.imageWidth;
        var mapX = this.panX + (clientX - imageXCenter) * ratioX
    
        var imageYCenter = this.imageHeight / 2;
        var ratioY = this.sourceImageHeight / this.imageHeight;
        var mapY = this.panY + (clientY - imageYCenter) * ratioY;
    
        return [mapX, mapY]
    }

    zoomIn(changeInScroll) {    
        var oldMouseMapX = mouseMapX;
        var oldMouseMapY = mouseMapY;
        
        this.zoom = this.zoom * (1 + -changeInScroll / 1500);
        this.zoom = Math.max(this.zoom, minZoom);
        this.zoom = Math.min(this.zoom, maxZoom);
    
        this.updateMapImageVariables();
    
        this.panX = this.panX + (oldMouseMapX - mouseMapX);
        this.panY = this.panY + (oldMouseMapY - mouseMapY); 
        this.drawMap();
    }


    startPan(){
        if(this.isPanEnabled){
            this.isPanning = true;
            this.panPrevPanX = mouseMapX;
            this.panPrevPanY = mouseMapY;
        }
    }

    pan(){
        if(this.isPanning == false){
            return;
        }
    
        var changeX = mouseMapX - this.panPrevPanX;
        var changeY = mouseMapY - this.panPrevPanY; 
    
        this.panX = this.panX - changeX;
        this.panY = this.panY - changeY;
    
        this.drawMap();
    }

    stopPanning(){
        this.isPanning = false;
        this.panPrevPanX = null;
        this.panPrevPanY = null;
    }
}


var mapObjectForReference1 = new MapObject(referenceImageEle);
mapObjectForReference1.setSize(25 , 30);
mapObjectForReference1.setCenter(0.5, 1);
mapObjectForReference1.show = false;
var reference1 = new Reference(mapObjectForReference1);
reference1.mapObject = mapObjectForReference1;

var mapObjectForReference2 = new MapObject(referenceImageEle);
mapObjectForReference2.setSize(25 , 30);
mapObjectForReference2.setCenter(0.5, 1);
mapObjectForReference2.show = false;
var reference2 = new Reference(mapObjectForReference2);
reference2.mapObject = mapObjectForReference2;

var editReferencePopup = new EditReferencePopup;
var mouse = new Mouse();
var map = new Map();

var locationObj = new MapObject(iconEle);
locationObj.setSize(25, 25);

var testMapRender = new MapRender(imageEle, canvasElement);
testMapRender.addMapObject(locationObj);
testMapRender.addMapObject(reference1.mapObject);
testMapRender.addMapObject(reference2.mapObject);
testMapRender.drawMap();



canvasElement.addEventListener('mousedown', () => {
    testMapRender.startPan();

    reference1.mapObject.testCollision(mouseClientX, mouseClientY, testMapRender, openPopup, reference1)
    reference2.mapObject.testCollision(mouseClientX, mouseClientY, testMapRender, openPopup, reference2)
});


canvasElement.addEventListener('mousemove', () =>{
    testMapRender.pan();
});

canvasElement.addEventListener('mouseleave', () => {
    testMapRender.stopPanning();
});

document.addEventListener('mouseup', () => {
    testMapRender.stopPanning();
});

function scroll(event) {
    event.preventDefault();

    testMapRender.zoomIn(event.deltaY)
}
 
canvasElement.onwheel = scroll;

function updateMouseCords2(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;

    let mapRect = canvasElement.getBoundingClientRect();
    mouseClientX = xMouse - mapRect.left;
    mouseClientY = yMouse - mapRect.top;

    updateMouseMapCords();
}

function updateMouseMapCords(){
    cords = testMapRender.clientPixelToMapPixel(mouseClientX, mouseClientY);
    mouseMapX = cords[0]
    mouseMapY = cords[1]
}

function continouslyUpdateUserGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(setUserGPS);
    }
}
continouslyUpdateUserGPS();

function setUserGPS(position){
    userGPSLatitude = position.coords.latitude;
    userGPSLongitude = position.coords.longitude;
    message = "GPS: " + userGPSLatitude + ", " + userGPSLongitude;
    gpsShow.textContent = message;
}

function continouslyUpdatePosition(){
    setTimeout(continouslyUpdatePosition, 1000);
    setLocationCords(userGPSLongitude, userGPSLatitude, locationObj, map, testMapRender);
}
continouslyUpdatePosition();


function onLoad(){
    setMapFromReferences(reference1, reference2);
    hideElementsAtStart();

    //add event listeners
    window.addEventListener('mousemove', updateMouseCords2, false);

    var addReferenceButton = document.getElementById('addReferenceButton');
    addReferenceButton.addEventListener('mouseup', addingReference, false)


    //popup
    var popupClose = document.getElementById('exitPopup');
    popupClose.addEventListener('mouseup', closePopup, false);

    var useCurrentLocationButton = document.getElementById("useCurrentLocationButton");
    useCurrentLocationButton.addEventListener('click', fillPopupWithCurrentLocation, false);

    var acceptPopupButton = document.getElementById("acceptPopup");
    acceptPopupButton.addEventListener('click', acceptPopup, false);

    var movePopupButton = document.getElementById("movePopup");
    movePopupButton.addEventListener('click', initiateMoveReference, false);

    toggleReferencesButton.addEventListener('click', toggleReference, false);
    uploadFileButton.addEventListener('click', uploadMapConfirmation, false);
}


function hideElementsAtStart(){
    popupForReference.style.display = "none";
    locationMarker.style.display = "none";
}


window.addEventListener('resize', function(event) {
    setLocationCords(userGPSLongitude, userGPSLatitude, locationObj, map, testMapRender);
    movePopupToCenterCanvas();
}, true);

function updateMouseCords(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;
    mouse.globalX = xMouse;
    mouse.globalY = yMouse;


    let mapRect = testImage.getBoundingClientRect();
    mouse.mapX = xMouse - mapRect.left;
    mouse.mapY = mapRect.bottom - yMouse;
}

function setLocationCords(gpsX, gpsY, locationObject, map, mapRender){
    if(map.numberReferences < 2){
        mapInfo1.textContent = "Two map references are needed to show location: \n";  
        mapInfo1.textContent += "    Click on add reference in the tool bar to add a reference";
        return;
    }

    if(reference1.gpsX == null){
        mapInfo1.textContent = "A reference needs gps information to show location: \r\n"  
        mapInfo1.textContent += "    Click on the reference, edit the gps cordinates, then click accept";
        return;
    }

    if(reference2.gpsX == null){
        mapInfo1.textContent = "A reference needs gps information to show location: \r\n"  
        mapInfo1.textContent +="    Click on the reference, edit the gps cordinates, then click accept";
        return;
    }

    mapInfo1.textContent = "";

    var gpsToMapX = mapRender.imageID.width / map.GPSWidth;
    var gpsToMapY = mapRender.imageID.height / map.GPSHeight;

    var mapX = (gpsX - map.GPSBLx) * gpsToMapX;
    var mapY = (map.GPSBLy - gpsY) * gpsToMapY;

    locationObject.setMapCords(mapX, mapY);
}



///////////////// References ////////////////////////
function addingReference(){
    if(map.numberReferences >= 2){
        return;
    }

    let reference = reference1;
    if(map.numberReferences == 1){
        reference = reference2;
    }

    showReferences();
    toggleReferencesButton.textContent = "Hide References";
    addReferenceButton.style.borderColor = "black";

    var eventHandlerWrapper = function(){
        addReference(reference, eventHandlerWrapper)
    };

    canvasElement.addEventListener('click', eventHandlerWrapper, false);
}


function addReference(reference, functionToRemove){
    moveReferenceToMouse(reference)
    
    openPopup(reference);
    map.numberReferences = map.numberReferences + 1;
    testMapRender.drawMap();
    
    addReferenceButton.style.borderColor = "#654f36ff";
    canvasElement.removeEventListener('click', functionToRemove);
}

function moveReferenceToMouse(reference){
    reference.pixelX = mouseMapX;
    reference.pixelY = mouseMapY;

    reference.mapObject.show = true;
    reference.mapObject.setMapCords(mouseMapX, mouseMapY);
}

function initiateMoveReference(){
    popupForReference.style.display = "none";

    canvasElement.addEventListener('click', moveReference, false);
    document.addEventListener('contextmenu', cancelMoveReference, false);
}

function moveReference(){
    var reference = editReferencePopup.referenceModifing
    moveReferenceToMouse(reference)

    testMapRender.drawMap();
    openPopup(reference);

    popupForReference.style.display = 'block';

    canvasElement.removeEventListener('click', moveReference, false);
    document.removeEventListener('contextmenu', cancelMoveReference, false);
}

function cancelMoveReference(event){
    popupForReference.style.display = 'block';

    event.preventDefault();
    testImage.removeEventListener('click', moveReference, false);
    document.removeEventListener('contextmenu', cancelMoveReference, false);
}



function toggleReference(){
    if(areReferencesShown == true){
        hideReferences();
        toggleReferencesButton.textContent = "Show References";
    } else {
        showReferences();
        toggleReferencesButton.textContent = "Hide References";
    }

    testMapRender.drawMap();
}

function hideReferences(){
    console.log("Called hide reference")
    console.log(reference1.mapObject.show)
    areReferencesShown = false;
    reference1.mapObject.show = false;
    reference2.mapObject.show = false;
}

function showReferences(){
    areReferencesShown = true;
    
    if(reference1.pixelX != null){
        reference1.mapObject.show = true;
    }

    if(reference2.pixelX != null){
        reference2.mapObject.show = true;
    }
}


function setMapFromReferences(reference1, reference2){
    if(isReferenceFilled(reference1) == false){
        return;
    }

    if(isReferenceFilled(reference2) == false){
        return;
    }

    var gpsToPixelX = Math.abs((reference1.pixelX - reference2.pixelX) / (reference1.gpsX - reference2.gpsX));
    var gpsToPixelY = Math.abs((reference1.pixelY - reference2.pixelY) / (reference1.gpsY - reference2.gpsY));
    var pixelToGPSX = 1/gpsToPixelX;
    var pixelToGPSY = 1/gpsToPixelY;

    map.GPSWidth = pixelToGPSX * testMapRender.imageID.width;
    map.GPSHeight = pixelToGPSY * testMapRender.imageID.height;
    map.GPSBLx = reference1.gpsX - (reference1.pixelX * pixelToGPSX);

    var offset = (reference1.pixelY * pixelToGPSY);
    map.GPSBLy = reference1.gpsY + offset;
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
    popupForReference.style.display = "block";
    editReferencePopup.referenceModifing = reference;

    if(reference.gpsX != null){
        popupLatitudeInput.value = reference.gpsY;
    } else {
        popupLatitudeInput.value= "";
    }

    if(reference.gpsY != null){
        popupLongitudeInput.value = reference.gpsX;
    } else {
        popupLongitudeInput.value = "";
    }

    
    movePopupToCenterCanvas();
}

function movePopupToCenterCanvas(){
    var canvasElementBounding = canvasElement.getBoundingClientRect();
    var popupBounding = popupForReference.getBoundingClientRect();
    var xLocation = canvasElementBounding.left + canvasElement.width / 2 - popupBounding.width / 2;
    var yLocation = canvasElementBounding.top + canvasElement.height / 2 - popupBounding.height / 2;
    yLocation = yLocation + document.documentElement.scrollTop;

    popupForReference.style.position = 'absolute';
    popupForReference.style.top = yLocation + "px";
    popupForReference.style.left = xLocation + "px";
}


function closePopup(){
    popupForReference.style.display = "none";
}

function fillPopupWithCurrentLocation(){    
    popupLatitudeInput.value= userGPSLatitude
    popupLongitudeInput.value = userGPSLongitude;
}

function acceptPopup(){

    if(popupLatitudeInput.value == ""){
        return;
    }

    if(popupLongitudeInput.value == ""){
        return;
    }

    editReferencePopup.referenceModifing.gpsX = Number(longitudeInput.value);
    editReferencePopup.referenceModifing.gpsY = Number(latitudeInput.value);
    
    popupForReference.style.display = "none";

    setMapFromReferences(reference1, reference2);
    setLocationCords(userGPSLongitude, userGPSLatitude, locationObj, map, testMapRender);
    testMapRender.drawMap();
}


function uploadMapConfirmation(){
    if (confirm("Are you sure you want to switch to a different image for the map? References are currently not saved, modifying them on a different image then coming back will not restore them to their current state") == false) {
        return;
    }

    hiddenLoadFile.click();     //default load file is hidden so it clicks it for you, when clicking updated one
}

var loadFile = function(event) {
    imageEle.src = URL.createObjectURL(event.target.files[0]);
    imageEle.onload = function() {
        URL.revokeObjectURL(imageEle.src) // free memory
    }
};