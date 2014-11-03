'use strict';

var customServices = angular.module('customServices', ['ngResource']);

customServices.factory('DemoConvertService', [ function () {

    var Service = {};

    Service.convert = function (convertThis) {
        var toThis = convertThis + "1";
        return toThis;
    };

    return Service;
}]);