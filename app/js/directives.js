'use strict';

/* Directives */

var dabadoDirectives = angular.module('dabadoDirectives', []);

dabadoDirectives.directive('chart', ['$compile', '$nvd3tags', function ($compile, $nvd3tags) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            type: '@',
            rowtitles: '=',
            tabledata: '=',
            piedata: '=',
            datadef: '=',
            showControls: '@',
            showLegend: '@',
            height: '@',
            margin: '@'
        },
        link: function (scope, element, attrs) {

            scope.controlsdata = function () {
                return ['Stacked', 'Stream', 'Expanded']
            };

            scope.pieXFunction = function () {
                return function (d) {
                    return d.key;
                };
            };
            scope.pieYFunction = function () {
                return function (d) {
                    return d.value;
                };
            };

            scope.tickTime2Date = function () {
                return function (d) {
                    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    var dateString = d; //if its not possible to convert, simply use the initial value
                    try {
                        dateString = new Date(d).toISOString().slice(0, 10).replace(/-/g, "-");
                    }
                    catch (e) {
                        //do, ahm, nothing...
                    }
                    return dateString;
                }
            };

            scope.$watch('type', function (newValue, oldValue) {
                element.empty();
                scope.tabledata = [];
                scope.piedata = [];
                scope.datadef = [];
                $compile($nvd3tags.getNVD3Tags(newValue))(scope, function (cloned, scope) {
                    element.append(cloned);
                });
            });
        }
    }
}]);


dabadoDirectives.directive('dabadoChart', ['$http', '$q', function ($http, $q) {
    return {
        restrict: "E",
        scope: {
            chartData: '=?',
            dash: '@',
            chart: '@',
            showControls: '@',
            showLegend: '@',
            height: '@',
            margin: '@'
        },
        templateUrl: 'templates/dabado-chart-template.html',
        controller: ['$scope', '$couchDb', function ($scope, $couchDb) {

            function loadDashboard(dash, figure) {
                var deferred = $q.defer();
                $couchDb.get(dash, function (err, res) {
                    var row = _.find(res.sql, function (elem) {
                        return elem.graphname === figure;
                    });
                    deferred.resolve(row);
                });
                return deferred.promise;
            }

            $scope.handleClickOnGoForIt = function (newSql) {
                graphHelper.calcGraphData(newSql, $scope.chartData.tablespace, $scope.chartData.key, $scope.dtFrom, $scope.dtTo, $scope.selectedRanges).then(function (ret) {
                    $scope.selectedRanges = ret.range.selectedRanges;
                    $scope.sqlHasRangeParameter = ret.range.sqlHasRangeParameter;
                    $scope.ranges = ret.range.ranges;

                    $scope.sqlHasDateParameter = ret.data.sqlHasDateParameter;
                    $scope.SqlResultsStats = ret.data.SqlResultsStats;
                    $scope.rowTitles = ret.data.rowTitles;
                    $scope.tableData = ret.data.tableData;
                    $scope.pieData = ret.data.pieData;
                    $scope.datadef = ret.data.data;
                    $scope.$apply();
                })
            };

            $scope.$watch('type', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.type = newValue;
                    $scope.handleClickOnGoForIt($scope.chartData.sql);
                }
            });

            if ($scope.chartData !== undefined) {
                $scope.type = $scope.chartData.graphtype;
                $scope.graphname = $scope.chartData.graphname;
                $scope.handleClickOnGoForIt($scope.chartData.sql);
            }
            else {
                loadDashboard($scope.dash, $scope.chart).then(function (row) {
                    $scope.graphname = row.graphname;
                    $scope.type = row.graphtype;

                    $scope.chartData = {
                        tablespace: row.tablespace,
                        key: row.key,
                        sql: row.sql
                    };
                    $scope.handleClickOnGoForIt($scope.chartData.sql);
                })
            }

        }]
    }
}]);
