var identitixApp = angular.module('identitixApp');
identitixApp.service('userSrv', function ($rootScope,$http) {

    var THAT = this;

    var userPermissions = 'public_profile,email,user_photos,user_likes,user_events,user_managed_groups';

    var UserData = {};

    this.images = [];


    THAT.getUserPermissions = function () {
        return userPermissions;

    }

    function makeFacebookPhotoURL(id, accessToken) {
        return 'https://graph.facebook.com/' + id + '/picture?access_token=' + accessToken;
    }

    THAT.getPhotosOfYou = function (accessToken) {
        var photosOfYou = [];
        FB.api('/me/photos',
         function (response) {
             if (response && !response.error) {
                 for (var i = 0; i < response.data.length; i++) {
                     photosOfYou.push({
                         'id': response.data[i].id,
                         'added': response.data[i].created_time,
                         'url': makeFacebookPhotoURL(response.data[i].id, accessToken)                         
                     });
                 }
                 console.log("photosOfYou");
                 console.log(photosOfYou);
                 if (photosOfYou.length > 0)
                     $rootScope.$broadcast('event:showGallery', photosOfYou);
             
                // console.log("ofYou: " + JSON.stringify(response));
             }
         });
    }

    function getAlbums(callback) {
        FB.api(
                '/me/albums',
                { fields: 'id,cover_photo' },
                function (albumResponse) {
                    //console.log( ' got albums ' );
                    if (callback) {
                        callback(albumResponse);
                    }
                }
            );
    }
    function getPhotosForAlbumId(albumId, callback) {
        FB.api(
                '/' + albumId + '/photos',
                { fields: 'id,created_time' },
                function (albumPhotosResponse) {
                    //console.log( ' got photos for album ' + albumId );
                    if (callback) {
                        callback(albumId, albumPhotosResponse);
                    }
                }
            );
    }

    function getTagsFromPhotoID(albumId, photoID, callback) {
        FB.api(
                '/' + albumId + '/photos' + '/' + photoID + '/tags',
                function (tagsResponse) {
                    //console.log( ' got photos for album ' + albumId );
                    if (callback) {
                        callback(albumId, photoID, tagsResponse);
                    }
                }
            );
    }

    function getLikesForPhotoId(albumId, photoId, callback) {
        FB.api(
                '/' + albumId + '/photos/' + photoId + '/likes',
                {},
                function (photoLikesResponse) {
                    if (callback) {
                        callback(photoId, photoLikesResponse);
                    }
                }
            );
    }
    
    this.getImages = function () {
        return THAT.images;
    }

    this.getUserData = function () {
        return UserData;
    }

    THAT.getPhotos = function (accessToken) {
        var allPhotos = [];
        getAlbums(function (albumResponse) {
            var i, album, deferreds = {}, listOfDeferreds = [];
            for (i = 0; i < albumResponse.data.length; i++) {
                album = albumResponse.data[i];
                deferreds[album.id] = $.Deferred();
                listOfDeferreds.push(deferreds[album.id]);
                getPhotosForAlbumId(album.id, function (albumId, albumPhotosResponse) {
                    var i, facebookPhoto;
                    for (i = 0; i < albumPhotosResponse.data.length; i++) {
                        facebookPhoto = albumPhotosResponse.data[i];
                      
                        allPhotos.push({
                            'id': facebookPhoto.id,
                            'added': facebookPhoto.created_time,
                            'url': makeFacebookPhotoURL(facebookPhoto.id, accessToken),
                            // 'tags': tags
                        });
                    }
                    deferreds[albumId].resolve();
                });
            }
            $.when.apply($, listOfDeferreds).then(function () {
                console.log("photos:");
                console.log(allPhotos);
                THAT.images = angular.copy(allPhotos);
                $rootScope.$broadcast('event:showGallery', THAT.images);
                //  sendToServer(allPhotos);
            }, function (error) {
                console.log(allPhotos + "" + error);
                return null;
            });
        });

    }
    
    //parse url to data string
    THAT.getImageData = function (url, callback) {
      
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.send();        
    }
    //get link of image by id
    THAT.getImageDetails = function (id) {
        FB.api(
           "/" + id,{ fields: 'link' },
        function (response) {
            if (response && !response.error) {
                console.log("link: " + JSON.stringify(response));
                $rootScope.$broadcast('event:addLink', response);
            }
        }
       );

        FB.api(
          "/" + id + "/tags",
       function (response) {
           if (response && !response.error) {
               console.log("tags " + JSON.stringify(response));
           }
       }
      );
    }
   

    THAT.getUserDetails = function (userID) {
        FB.api(
              "/" + userID,{ fields: 'name,gender,email,birthday,age_range' },
              function (response) {
                  if (response && !response.error) {                      
                      UserData.gender = response.gender;
                      UserData.ageRangeMin = response.age_range.min;
                      UserData.email = response.email;
                      UserData.birthday = response.birthday;
                      console.log("user details: " + JSON.stringify(UserData));
                  }
              }
            );
    }

    THAT.getPageDetails = function (pageID) {
        FB.api(
           "/" + pageID, { fields: 'category,about' },
        function (response) {
            if (response && !response.error) {
                console.log("Page Details : " + JSON.stringify(response));
            }
        }
       );
    }

    THAT.getLikes = function (userID) {
        var allLikesPage = [];

        FB.api(
                "/" + userID + "/likes",
                function (response) {
                    if (response && !response.error) {
                        for (var i = 0; i < response.data.length; i++) {
                            allLikesPage.push(
                               {
                                   'id': response.data[i].id,
                                   'name': response.data[i].name,
                                   'added': response.data[i].created_time

                               });
                            THAT.getPageDetails(response.data[i].id);

                        }
                        UserData.likes = allLikesPage;
                        console.log("pages:" + JSON.stringify(allLikesPage));
                    }
                }
              );
    }

    THAT.getEvents = function (userID) {
        FB.api(
               "/" + userID + "/events",
               function (response) {
                   if (response && !response.error) {
                       console.log("events:");
                       console.log(response.data);
                       UserData.events = response.data;
                   }
               }
             );
        
    }

    THAT.getGroups = function (userID) {
        FB.api(
               "/" + userID + "/groups",
               function (response) {
                   if (response && !response.error) {
                       console.log("groups:");
                       console.log(response.data);
                       UserData.groups = response.data;
                   }
               }
             );
       

    }


    this.getVersion = function () {
        return "1.0";
    }
   
});