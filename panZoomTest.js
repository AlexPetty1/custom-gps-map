window.onload = onLoad;

const canvasWidth = 800;
const canvasHeight = 500;
const canvasRatio = canvasWidth / canvasHeight;

const minZoom = 1;
const maxZoom = 10;

const canvasEle = document.getElementById("myCanvas");
const canvas = canvasEle.getContext("2d");
const imageEle = document.getElementById("map");

const iconEle = document.getElementById("icon");

var mouseClientX = 0;
var mouseClientY = 0;
var mouseMapX = 0;
var mouseMapY = 0;


class MapObject{
    constructor(srcEle){
        this.imageSRC = srcEle;
        this.mapX = 0;
        this.mapY = 0;

        this.width = srcEle.width;
        this.height = srcEle.height;

        this.centerX = 0.5;
        this.centerY = 0.5;

        this.collisionEnabled = false;
    }

    testCollision( xClient, yClient, mapRender, success){
        var clientCords = mapRender.mapPixelToClientPixel(this.mapX, this.mapY);
        var imageLeft = clientCords[0] - this.centerX * this.width;
        var imageTop = clientCords[1] - this.centerY * this.height;

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

        success()
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

    constructor(){
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

        this.imageID = imageEle;
    }



    drawMap(){
        canvas.clearRect(0, 0, canvasWidth, canvasHeight);
        this.updateMapImageVariables();
    
        var dx = 0;
        var dy = 0;
        canvas.drawImage(this.imageID, this.sourceX, this.sourceY, this.sourceImageWidth, this.sourceImageHeight, 
            dx, dy, this.imageWidth, this.imageHeight);

        this.drawMapObjects();
    }

    drawMapObjects(){
        for(let i = 0; i < this.numberMapObjects; i++){
            var objectOn = this.mapObjects[i];

            if(objectOn == null){
                continue;
            }

            var clientCords = this.mapPixelToClientPixel(objectOn.mapX, objectOn.mapY);
            var dx = clientCords[0] - objectOn.width / 2;
            var dy = clientCords[1] - objectOn.height / 2;

            canvas.drawImage(objectOn.imageSRC, dx, dy, objectOn.width, objectOn.height);
        }
    }

    addMapObject(mapObject){
        this.mapObjects[this.numberMapObjects] = mapObject;
        this.numberMapObjects++;
    }

    updateMapImageVariables(){
        var imageRatio = this.imageID.width / this.imageID.height;
    
        if(imageRatio > canvasRatio){
            this.sourceImageWidth = Math.min(this.imageID.width, this.imageID.width * 1/this.zoom)
            this.sourceImageHeight = Math.min(this.imageID.height, this.sourceImageWidth* (1/canvasRatio))
    
            this.imageWidth = canvasWidth;
            this.imageHeight = Math.min(canvasHeight, canvasWidth * this.zoom * (1/imageRatio))
        } else {
            this.sourceImageHeight = Math.min(this.imageID.height, this.imageID.height * 1/this.zoom)
            this.sourceImageWidth = Math.min(this.imageID.width, this.sourceImageHeight * (canvasRatio))
    
            this.imageHeight = canvasHeight;
            this.imageWidth = Math.min(canvasWidth, canvasHeight * this.zoom * (imageRatio))
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

var testMapRender = new MapRender();
var iconMapObj = new MapObject(iconEle);
iconMapObj.setMapCords(535, 460);
iconMapObj.setSize(25, 25);
testMapRender.addMapObject(iconMapObj);



canvasEle.addEventListener('mousedown', () => {
    testMapRender.startPan();

    iconMapObj.testCollision(mouseClientX, mouseClientY, testMapRender, printHello);
});

function printHello(){
    console.log("Hello");
}

canvasEle.addEventListener('mousemove', () =>{
    testMapRender.pan();
});

canvasEle.addEventListener('mouseleave', () => {
    testMapRender.stopPanning();
});

document.addEventListener('mouseup', () => {
    testMapRender.stopPanning();
});


function onLoad(){
    canvas.clearRect(0, 0, canvasWidth, canvasHeight);

    window.addEventListener('mousemove', updateMouseCords, false);
    testMapRender.drawMap();
}


function scroll(event) {
    event.preventDefault();

    testMapRender.zoomIn(event.deltaY)
}
 
canvasEle.onwheel = scroll;


function updateMouseCords(event){
    let xMouse = event.clientX;
    let yMouse = event.clientY;

    let mapRect = canvasEle.getBoundingClientRect();
    mouseClientX = xMouse - mapRect.left;
    mouseClientY = yMouse - mapRect.top;

    updateMouseMapCords();
}

function updateMouseMapCords(){
    cords = testMapRender.clientPixelToMapPixel(mouseClientX, mouseClientY);
    mouseMapX = cords[0]
    mouseMapY = cords[1]
    clientCords = testMapRender.mapPixelToClientPixel(mouseMapX, mouseMapY);
}
