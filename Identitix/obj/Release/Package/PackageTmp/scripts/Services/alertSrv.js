var identitixApp = angular.module('identitixApp');
identitixApp.service('alertSrv', function ($rootScope, $http,$timeout) {

    var THAT = this;

    this.alerts = [
        'please select 5 - 9 images'
    ];

    var data = {
        isAlertShow: false,
        body: ""
    };

    this.getData = function () {
        return data;
    };

    this.showAlert = function (body) {
        data.isAlertShow = true;
        data.body = body;
        $timeout(function () {
            data.isAlertShow = false;
        }, 4000);
        return data;
    }
      
});