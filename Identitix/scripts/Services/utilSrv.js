var identitixApp = angular.module('identitixApp');
identitixApp.service('utilSrv', function ($rootScope, $http,$timeout,$location) {

    var THAT = this;

    //get OrderID from url
    THAT.getParamterFromUrl = function (name, url) {
        if (!url) url = $location.href;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? null : results[1];
    }
      
});