'use strict';

/* App Module */

var dabadoApp = angular.module('dabadoApp', [
    'ngRoute',
    'dabadoControllers',
    'dabadoServices',
    'dabadoDirectives',
    'nvd3ChartDirectives',
    'ngTable',
    'ui.bootstrap',
    'customServices'
]);

dabadoApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/dabado', {
                templateUrl: 'partials/dabado.html',
                controller: 'dabadoController'
            }).
            when('/dabado-chart-demo', {
                templateUrl: 'partials/dabado-chart-demo.html'
            }).
            otherwise({
                redirectTo: '/dabado'
            });
    }]);
