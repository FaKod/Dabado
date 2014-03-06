'use strict';

/* App Module */

var dashboardApp = angular.module('dashboardApp', [
  'ngRoute',
  'dashboardControllers',
  'dashboardServices',
  'dashboardDirectives',
  'nvd3ChartDirectives'
]);

dashboardApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/dashboard', {
        templateUrl: 'partials/dashboard.html',
        controller: 'sploutQuery'
      }).
      /*when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).*/
      otherwise({
        redirectTo: '/dashboard'
      });
  }]);
