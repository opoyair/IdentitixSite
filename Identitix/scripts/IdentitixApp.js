(function () {
    'use strict';
    var identitixApp = angular.module('identitixApp', ['ngRoute']);
        
    /*
    identitixApp.config(function ($routeProvider) {
     $routeProvider     
    .when('/', {
    templateUrl: 'index.html',
    controller: 'userCtrl'
    })

    .when('/gallery', {
     templateUrl: 'View/gallery.html',
     controller: 'userCtrl'
    })

    .when('/q', {
        templateUrl: 'View/q.html',
        controller: 'userCtrl'
    })

    .when('/success', {
        templateUrl: 'View/success.html',
        controller: 'userCtrl'
    })
    .when('/error', {
     templateUrl: 'View/error.html',
     controller: 'userCtrl'
    })

.otherwise({ redirectTo: '/' });

    }); */

    identitixApp.$inject = ['$scope'];
})();
