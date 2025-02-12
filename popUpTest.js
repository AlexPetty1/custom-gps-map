class Reference{
    constuctor(){
      this.gpsX = null;
      this.gpsY = null
      this.pixelX = null
      this.pixelY = null
    }  
}

var reference1 = new Reference();
reference1.gpsX = -123.824;
reference1.gpsY = 46.970;
reference1.pixelX = 44;
reference1.pixelY = 125;

document.addEventListener("DOMContentLoaded", function() {
    var popupButton = document.getElementById('buttonPopup')
    popupButton.addEventListener('click', togglePopup, false);

    popupButton.addEventListener('click', function(){
        var value2 = "value2"
        printValues("test1", value2);
    }, false);

    var popupClose = document.getElementById('exitPopup');
    popupClose.addEventListener('mouseup', closePopup, false);

    var useCurrentLocationButton = document.getElementById("useCurrentLocationButton");
    useCurrentLocationButton.addEventListener('click', useCurrentLocation, false);
});

function printValues(a, b){
    console.log("Value of A: " + a);
    console.log("Value of B: " + b);
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

function openPopup(){
    var popup = document.getElementById('popup1');
    popup.style.display = "block";

    var latitudeInput = document.getElementById("latitudeInput");
    if(reference1.gpsX != null){
        latitudeInput.value= reference1.gpsX;
    } else {
        latitudeInput.value= "";
    }

    var longitudeInput = document.getElementById("longitudeInput");
    if(reference1.gpsY != null){
        longitudeInput.value = reference1.gpsY;
    } else {
        longitudeInput.value = "";
    }
}

function closePopup(){
    console.log("Close popup");
    var popup = document.getElementById('popup1');
    popup.style.display = "none";
}

function togglePopup(){
    console.log("toggle pressed")
    var popup = document.getElementById('popup1');
    if (popup.style.display === "none") {
        openPopup();    
    } else {
        popup.style.display = "none";
    }

    yLocation = 200;
    xLocation = 300;
    popup.style.position = 'absolute';
    popup.style.top = yLocation + 'px';
    popup.style.left = xLocation + 'px';
}