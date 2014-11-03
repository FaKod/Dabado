'use strict';

/* Services */

var dabadoServices = angular.module('dabadoServices', ['ngResource']);


dabadoServices.factory('$couchDb', ['$rootScope', function ($rootScope) {
    if ($rootScope.$couchDb === undefined)
        $rootScope.$couchDb = new PouchDB(config.remoteCouch, {cache: false});
    return $rootScope.$couchDb;
}]);


dabadoServices.factory('$splout', ['$http', function ($http) {

    var Service = {};

    Service.call = function (url) {
        return $http({
            method: 'GET',
            url: config.sploutURL + url
        });
    };

    return Service;
}]);


dabadoServices.factory('$nvd3tags', [function () {
    var Service = {};
    Service.getNVD3Tags = function (graphType) {
        switch (graphType) {
            case 'table':
                return '<table class="table table-hover table-bordered">\
													  <thead>\
				  								      	<tr>\
													      <th ng-repeat="t in rowtitles">{{t}}</th>\
													    </tr>\
													  </thead>\
												      <tbody>\
												        <tr ng-repeat="d in tabledata">\
												          <td ng-repeat="t in rowtitles">{{ d[t] }}</td>\
												        </tr>\
												      </tbody>\
												  </table>';
            case 'bar':
                return '<nvd3-multi-bar-chart data=datadef margin="{{margin}}" interactive="true" xaxistickformat="tickTime2Date()" showControls="{{showControls}}" tooltips="true" ' +
                    'height="{{height}}" showXAxis="true" showYAxis="true" showLegend="{{showLegend}}" rotateLabels="90"> </nvd3-multi-bar-chart>';
            case 'horbar':
                return '<nvd3-multi-bar-horizontal-chart data=datadef margin="{{margin}}" xaxistickformat="tickTime2Date()" interactive="true" showControls="{{showControls}}" ' +
                    'tooltips="true" height="{{height}}" showXAxis="true" showYAxis="true" showLegend="{{showLegend}}" rotateLabels="90"> </nvd3-multi-bar-horizontal-chart>';
            case 'lineplusbar':
                return '<nvd3-line-plus-bar-chart data=datadef margin="{{margin}}" xaxistickformat="tickTime2Date()" useinteractiveguideline="true" tooltips="true" ' +
                    'height="{{height}}" showXAxis="true" showYAxis="true" showLegend="{{showLegend}}" xaxisrotatelabels="90"> </nvd3-line-plus-bar-chart>';
            case 'pie':
                return '<nvd3-pie-chart data=piedata margin="{{margin}}" tooltips="true" height="{{height}}" x="pieXFunction()" y="pieYFunction()" showLabels="true" ' +
                    'showLegend="{{showLegend}}" labelType="percent" donut="true" donutRatio="0.35"> </nvd3-pie-chart>';
            case 'stacked-area':
                return '<nvd3-stacked-area-chart data=datadef margin="{{margin}}" controlsdata="controlsdata()" xaxistickformat="tickTime2Date()" height="{{height}}" ' +
                    'showXAxis="true" showYAxis="true" showLegend="{{showLegend}}" xaxisrotatelabels="90" useInteractiveGuideline="true" showControls="true" tooltips="true"> </nvd3-stacked-area-chart>';
            case 'line':
                return '<nvd3-line-chart data=datadef margin="{{margin}}" xaxistickformat="tickTime2Date()" useinteractiveguideline="true" tooltips="true" height="{{height}}" ' +
                    'showXAxis="true" showYAxis="true" showLegend="{{showLegend}}" xaxisrotatelabels="90"> </nvd3-line-chart>';
            case 'linefocus':
                return '<nvd3-line-with-focus-chart data=datadef margin="{{margin}}" xaxistickformat="tickTime2Date()" x2axistickformat="tickTime2Date()" ' +
                    'useinteractiveguideline="true" tooltips="true" height="{{height}}" showXAxis="true" showYAxis="true" showLegend="{{showLegend}}" x2axisrotatelables="90" xaxisrotatelabels="90"> </nvd3-line-with-focus-chart>';
        }
        return undefined;
    };
    return Service;
}]);