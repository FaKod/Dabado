'use strict';

/* Directives */

var dashboardDirectives = angular.module('dashboardDirectives', []);

dashboardDirectives.directive('dashfigure', function($compile) {
	return {
		restrict: "E",
		replace: true,
		scope: {
			datadef: '=',
			piedata: '=',
			type: '='
		},
		link: function(scope, element, attrs) {    
			scope.pieXFunction = scope.piedata.pieXFunction;  
			scope.pieYFunction = scope.piedata.pieYFunction;

			scope.$watch('type', function(newValue, oldValue) {
				element.empty();

				var codeSt;
				if (newValue == 'bar') codeSt = '<nvd3-multi-bar-chart data=datadef id="exampleId" height="500" showXAxis="true" showYAxis="true" showLegend="true" rotateLabels="90"> </nvd3-multi-bar-chart>';
				if (newValue == 'line') codeSt = '<nvd3-line-chart data=datadef id="exampleId" height="500" showXAxis="true" showYAxis="true" showLegend="true" rotateLabels="90"> </nvd3-line-chart>';
				if (newValue == 'stacked-area') codeSt = '<nvd3-stacked-area-chart data=datadef id="exampleId" height="500" showXAxis="true" showYAxis="true" showLegend="true" rotateLabels="90"> </nvd3-stacked-area-chart>';
				if (newValue == 'pie') codeSt = '<nvd3-pie-chart data=piedata id="exampleId" height="500" x="pieXFunction()" y="pieYFunction()" showLlabels="true" showLegend="true"> </nvd3-pie-chart>';
				$compile(codeSt)(scope, function(cloned, scope) {
					element.append(cloned);
				});
			});
		}
	}
})
