window.onload = (function () {

    // put the 'style.display' value in variables
    var showElement = "inline";
    var hideElement = "none";

    // get the HTML elements 
    var camera = $('#camera')[0];
    var canvas = $('#canvas')[0];
    var context = canvas.getContext('2d');
    var pictureFromUser = $('#pictureFromUser')[0];
    var captureFace = $('#captureFace')[0];
    var retakeFace = $('#retakeFace')[0];
    var sendFace = $('#sendFace')[0];

    // get the current window URL
    var vendorUrl = window.URL || window.webkitURL;

    // gets permission from the user to use the camera
    navigator.getMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia;

    // start streaming the camera
    navigator.getMedia({
        video: true,
        audio: false
    }, function(stream) {
        camera.src = vendorUrl.createObjectURL(stream);
        camera.play();
    }, function (error) { });
    
    // when the user capture his face, we'll hide the camera and show the image.
    captureFace.addEventListener('click', function () {
        context.drawImage(camera, 0, 0, 300, 150);
        pictureFromUser.src = canvas.toDataURL('image/png');
        pictureFromUser.style.display = showElement;
        captureFace.style.display = hideElement;
        camera.style.display = hideElement;
        retakeFace.style.display = showElement;
        sendFace.style.display = showElement;
    });

    // Show/Hide the necessary elements 
    // when the user wants to retake his face.
    retakeFace.addEventListener('click', function() {
        pictureFromUser.style.display = hideElement;
        camera.style.display = showElement;
        retakeFace.style.display = hideElement;
        sendFace.style.display = hideElement;
        captureFace.style.display = showElement;
    });

    // TODO: send the capture image to the server
    sendFace.addEventListener('click', function() {
        alert('sending the image!');
    });
});
