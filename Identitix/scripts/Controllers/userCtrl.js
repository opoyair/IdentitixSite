(function () {
    angular
    .module('identitixApp')
      .controller('userCtrl', ['userSrv', '$scope', '$http', '$window', '$location', '$anchorScroll', '$rootScope', 'alertSrv', 'utilSrv', function (userSrv, $scope, $http, $window, $location, $anchorScroll, $rootScope, alertSrv, utilSrv) {
          'use strict';

            var THAT = this;
            
           // var ipAddress = "192.168.10.100";           
          // var ipAddress = "192.168.43.216";
            var ipAddress = "52.169.29.5";
           // var ipAddress = "10.100.102.3";
            var port = "1311";
            var serverAddress = "http://" + ipAddress +":" + port + "/api/Register/newUser";
            var isExistUrl = "http://" + ipAddress + ":" + port + "/api/Register/isUserExist";
            var gallery = {};
            $scope.isConnected = false;
            $scope.userExist = false;
            $scope.openGallery = false;            
            $scope.success = false;
            $scope.error = false;
            $scope.userName = 'user';         
            $scope.userData = {};
            $scope.border = 'picture';
            $scope.imgsSelected = [];
            $scope.loading = false;
            
            this.alertData = alertSrv.getData();
            
            function IdentitixUser(facebookId, name, firstName, lastName, images, email) {
                this.facebookId = facebookId;
                this.name       = name;
                this.firstname  = firstName;
                this.lastName   = lastName;
                this.images     = images;
                this.email      = email;               
            }
            
            // load the Facebook javascript SDK
            (function (d) {
               

                var js,
                id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];

                if (d.getElementById(id)) {
                    return;
                }

                js = d.createElement('script');
                js.id = id;
                js.async = true;
                js.src = "//connect.facebook.net/en_US/all.js";

                ref.parentNode.insertBefore(js, ref);

            }(document));
            
            this.watchLoginChange = function () {

                FB.Event.subscribe('auth.authResponseChange', function (res) {

                    if (res.status === 'connected') {
                        /*
                         The user is already logged,                         
                        */
                        THAT.statusChangeToConnected(res);

                        /*
                         This is also the point where you should create a
                         session for the current user.
                         For this purpose you can use the data inside the
                         res.authResponse object.
                        */

                    }
                    else {

                        /*
                         The user is not logged to the app, or into Facebook:
                         destroy the session on the server.
                        */

                    }

                });

            }
          // Executed when the SDK is loaded
            $window.fbAsyncInit = function() {                

                FB.init({
                    appId: '1116961045036428',  //this is identitix app key
                    cookie: true,                  
                    xfbml: true,  // parse social plugins on this page
                    version: 'v2.5' // use graph api version 2.5
                });               
                           
            };

            this.fb_login = function () {

                FB.login(function (response) {                    
                    //permissions
                }, { scope: userSrv.getUserPermissions() });

                THAT.watchLoginChange();                
            }

            //jump page to currect anchor 
            THAT.scrollTo = function (id) {
                $location.hash(id);
                $anchorScroll();
            }
            
            var openGallery = function (data) {
                $scope.userData.photos = data;
                if ($scope.userData.photos) {
                    $scope.openGallery = true;                   
                    console.log("openGallery is " + $scope.openGallery);
                   // $scope.loading = true;
                    $scope.$apply();
                    THAT.scrollTo('identitx');
                }
            }
            
            //invoke when get images from facebook
            $scope.$on('event:showGallery', function (event, data) {
                $scope.loading = false;
                THAT.alertData = alertSrv.showAlert(alertSrv.alerts[0]);
                if (Object.keys(gallery).length === 0 )
                    gallery = data;
                else 
                    gallery = [].concat(gallery, data);               
                openGallery(gallery);
                //openGallery(data);
            })
            
            $scope.$on('event:addLink', function (event,data) {
                for (var i = 0; i < $scope.imgsSelected.length; i++) {
                    if ($scope.imgsSelected[i].id === data.id) {
                         $scope.imgsSelected[i].link = data.link;
                         break;
                    }
                }
            })


            $scope.$on('event:addDataImage', function (event, id, base64Data) {
                for (var i = 0; i < $scope.imgsSelected.length; i++) {
                    if ($scope.imgsSelected[i].id === id) {                
                         $scope.imgsSelected[i].dataBase64 = base64Data;
                        break;
                    }
                }
            })
                 
                      
            this.statusChangeToConnected = function(response) {             
                    startAPI();
                    $scope.isConnected = true;                    
                    if (response.authResponse.accessToken) {                        
                        THAT.isUserNotExist(response.authResponse);
                      /*userSrv.getUserDetails(response.authResponse.userID);
                        userSrv.getLikes(response.authResponse.userID);
                        userSrv.getPhotosOfYou(response.authResponse.accessToken);
                        userSrv.getPhotos(response.authResponse.accessToken);
                        userSrv.getEvents(response.authResponse.userID);
                        userSrv.getGroups(response.authResponse.userID);
                        var data = userSrv.getUserData();
                      */
                    }                
            }
          
            function startAPI() {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', { fields: 'name,first_name,last_name,gender,email,birthday,age_range' }, function (response) {
                    $scope.fid = response.id;                   
                    $scope.userName = response.name;
                    $scope.firstName = response.first_name;
                    $scope.lastName = response.last_name;
                    $scope.email = response.email;
                    console.log('Successful login for: ' + response.name);
                    $scope.userData.nameProfile = response.name;
                    $scope.userData.picProfile = "http://graph.facebook.com/" + response.id + "/picture";      
                    console.log("pic profile: " + $scope.userData.picProfile);
     
                });

            }

            var deleteImageSelected = function (image) {
                for (var i = 0; i < $scope.imgsSelected.length; i++) {
                    if ($scope.imgsSelected[i].id === image.id) {
                        $scope.imgsSelected.splice(i, 1);                       
                        break;
                    }
                }
            }
               
               
            THAT.imgSelected = function (myE,index) {              
                if (!($scope.userData.photos[index].selected) || myE.target.style.border === "4px solid rgb(85, 85, 85)") { //selected
                    myE.target.style.border = "4px solid #ff3d59";
                    $scope.userData.photos[index].selected = true;
                    $scope.imgsSelected.push($scope.userData.photos[index]);
                    userSrv.getImageDetails($scope.userData.photos[index].id);
                    userSrv.getImageData($scope.userData.photos[index].url, function (base64Img) {
                        $rootScope.$broadcast('event:addDataImage', $scope.userData.photos[index].id, base64Img);
                    });
                }
                else {
                    myE.target.style.border = "4px solid #555";
                    $scope.userData.photos[index].selected = false;
                    deleteImageSelected($scope.userData.photos[index]);
                }
                
            }

            $scope.start = 0;

            THAT.refresh = function () {
                $scope.start += 9;
                var end = $scope.start + 9;

                if ($scope.start >= $scope.userData.photos.length) {
                    $scope.start = 0;
                }

                else if (end > $scope.userData.photos.length) {
                    $scope.start -= (end - $scope.userData.photos.length);
                }               
                
            }

            THAT.isUserNotExist = function (authResponse) {
              //  var newUser = new IdentitixUser($scope.fid, null,null,null,null, $scope.email);
              /*  var json = {
                    facebookUser: angular.toJson(newUser),
                    orderID: $scope.orderID
                }; */
                var json = {
                    facebookUser: {
                        facebookId: authResponse.userID, // $scope.fid,
                        name: $scope.userName,
                        firstName: $scope.firstName,
                        lastName: $scope.lastName,
                        images: $scope.imgsSelected,
                        email: $scope.email
                    },
                    orderID: $scope.orderID
                };

                $scope.loading = true;
                $http({
                    method: 'POST',
                    url: isExistUrl,
                    data: json,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Accept': 'application/json',

                    }
                })
                .then(function successCallback(response) {                    
                    console.log("the user not exists");
                    userSrv.getUserDetails(authResponse.userID);
                    userSrv.getLikes(authResponse.userID);
                    userSrv.getPhotosOfYou(authResponse.accessToken);
                    userSrv.getPhotos(authResponse.accessToken);
                    userSrv.getEvents(authResponse.userID);
                    userSrv.getGroups(authResponse.userID);
                    var data = userSrv.getUserData();

                }, function errorCallback(response) {
                    if (response.data && response.data.Message == "the user exists") {
                        console.log("the user exists!!!!");
                        $scope.loading = false;                        
                        $scope.userExist = true;
                       
                    }
                    else {
                        $scope.error = true;
                    }
                });

            }

            THAT.send = function () {
              
                if ($scope.imgsSelected.length >= 5  && $scope.imgsSelected.length <= 9 ) {
                   // var newUser = new IdentitixUser($scope.fid, $scope.userName, $scope.firstName, $scope.lastName, $scope.imgsSelected, $scope.email);
                   /* var json = {
                        facebookUser: angular.toJson(newUser),
                        orderID: $scope.orderID
                    };*/  
                    
                    var json = {
                        facebookUser: {
                            facebookId: $scope.fid,
                            name: $scope.userName,
                            firstName: $scope.firstName,
                            lastName: $scope.lastName,
                            images: $scope.imgsSelected,
                            email: $scope.email
                        },
                        orderID: $scope.orderID
                    };  
                    $scope.loading = true;
                    $http({
                        method: 'POST',
                        url: serverAddress,
                        data: json  ,
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Accept':'application/json',
                                                       
                        }                     
                    })
                    .then(function successCallback(response) {
                        $scope.loading = false;
                        $scope.openGallery = false;
                        $scope.success = true;
                        console.log("send: " + JSON.stringify(json));
                    }, function errorCallback(response) {
                        $scope.loading = false;
                        $scope.openGallery = false;
                        $scope.error = true;
                       // $scope.imgsSelected = [];
                    });

                   

                }
                else {
                    THAT.alertData = alertSrv.showAlert(alertSrv.alerts[0]);
                }
              
            }
            
           
                    
                      
            $scope.orderID = utilSrv.getParamterFromUrl('orderID', document.location.search);
             
            THAT.tryAgain = function () {                
                if ($scope.imgsSelected.length > 0) {
                  //  $scope.imgsSelected = [];
                    $scope.openGallery = true;
                    $scope.error = false;
                }
                else {
                    $scope.isConnected = false;
                    $scope.userExist = false;
                    $scope.error = false;
                }
                
            }

            THAT.close = function () {
                $scope.isConnected = false;
                $scope.userExist = false;
                $scope.openGallery = false;
                $scope.success = false; 
                $scope.error = false;
                $scope.imgsSelected = [];
            }
                     

        }]);
    }


)();
