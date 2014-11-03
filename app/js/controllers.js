'use strict';

/* Controllers */

var dabadoControllers = angular.module('dabadoControllers', []);


dabadoControllers.controller('dabadoDataController', ['$scope', function ($scope) {

    $scope.data = [
        {
            "graphname": "Population",
            "graphtype": "pie",
            "tablespace": "city_pby_country_code",
            "key": "JPN",
            "sql": "\"Population\" select name as x, population as y from city where country_code='JPN' limit 10"
        },
        {
            "graphname": "Most talked languages on Central Africa",
            "graphtype": "bar",
            "tablespace": "world-pby-continent-region",
            "key": "AfricaCentral Africa",
            "sql": "\"... on Central Africa\" select language as x, sum((percentage/100)*population) as y from country, country_language where country.code = country_language.country_code AND continent = \"Africa\" and region = \"Central Africa\" GROUP BY x ORDER BY y DESC limit 20"
        },
        {
            "graphname": "Population of... ",
            "graphtype": "horbar",
            "tablespace": "world-pby-continent-region",
            "key": "EuropeWestern Europe",
            "sql": "\"... Western Europe\" select name as x, population as y from country where continent = \"Europe\" AND region = \"Western Europe\"\n\"... Southern Europe\" select name as x, population as y from country where continent = \"Europe\" AND region = \"Southern Europe\""
        }
    ];
}]);


dabadoControllers.controller('dabadoController', ['$scope', '$http', '$q', '$location', '$routeParams', '$couchDb', '$splout',
    function ($scope, $http, $q, $location, $routeParams, $couchDb, $splout) {

        $scope.showChartPanel = false;
        var originalPath = $location.path();

        $scope.$watch('graphtype', function (newValue, oldValue) {
            $scope.type = newValue;
        });

        $scope.handleClickOnGoForIt = function (newSql) {
            graphHelper.calcGraphData(newSql, $scope.tablespace.name, $scope.key, $scope.dtFrom, $scope.dtTo, $scope.selectedRanges).then(function (ret) {
                $scope.sqlHasRangeParameter = ret.range.sqlHasRangeParameter;
                $scope.ranges = ret.range.ranges;
                $scope.selectedRanges = ret.range.selectedRanges;

                $scope.data = ret.data.data;
                $scope.SqlResultsStats = ret.data.SqlResultsStats;
                $scope.sqlHasDateParameter = ret.data.sqlHasDateParameter;
                $scope.pieData = ret.data.pieData;
                $scope.tableData = ret.data.tableData;
                $scope.rowTitles = ret.data.rowTitles;

                $scope.$apply();
            })
        };

        $scope.handleRowSelection = function (row) {
            $location.url(originalPath + '?dash=' + $scope.loadedDashboardName + '&chart=' + row.graphname);
        };

        function doRowSelection(row) {
            $scope.tablespace = _.find($scope.tablespaces, function (ts) {
                return ts.name === row.tablespace;
            });

            $scope.type = row.graphtype;
            $scope.graphtype = row.graphtype;
            $scope.graphname = row.graphname;
            $scope.key = row.key;
            $scope.sql = row.sql;
            $scope.selectedRow = row;
            $scope.selectedRanges = undefined;

            $scope.handleClickOnGoForIt($scope.sql);
        }


        $scope.saveDashboard = function () {
            $couchDb.get($scope.dashboardName, function (err, oldDoc) {
                var newDashboard = {
                    sql: $scope.queries
                };

                if (oldDoc != undefined)
                    newDashboard._rev = oldDoc._rev;

                $couchDb.put(newDashboard, $scope.dashboardName, function (err, response) {
                    console.log("writing dashboard: " + $scope.dashboardName);
                    if (err != null) {
                        console.log(err);
                        console.log(newDashboard);
                    }
                    $scope.getDashboard("").then(function (data) {
                        $scope.synchDashboardList = data;
                    })
                });
            });
        };

        $scope.addSQLToTable = function (newSql) {
            var row = {
                graphname: $scope.graphname,
                graphtype: $scope.type,
                tablespace: $scope.tablespace.name,
                key: $scope.key,
                sql: newSql
            };
            $scope.queries.unshift(row);
            $scope.selectedRow = row;
            $scope.tableAsJSON = angular.toJson($scope.queries);
        };

        $scope.updateSQLInTable = function (newSql) {
            $scope.deleteSelectedRow();
            $scope.addSQLToTable(newSql);
        };

        $scope.loadDashboard = function (dash) {
            var deferred = $q.defer();
            $couchDb.get(dash, function (err, res) {
                //console.log(res);
                $scope.queries = res.sql;
                $scope.tableAsJSON = angular.toJson($scope.queries);
                $scope.loadedDashboardName = dash;
                $scope.dashboardName = dash;
                $scope.$apply();
                deferred.resolve(dash);
            });
            return deferred.promise;
        };

        $scope.getDashboard = function (val) {
            var deferred = $q.defer();
            $couchDb.query({map: "(function(doc){emit(doc._id)})"}, {reduce: false}, function (err, res) {
                //console.log(res);
                var dashs = [];
                res.rows.forEach(function (item) {
                    dashs.push(item.id);
                });
                deferred.resolve(dashs);
            });
            return deferred.promise;
        };

        $scope.importJSONTable = function (json) {
            var newTableArray = angular.fromJson(json);
            if (angular.isArray(newTableArray)) {
                $scope.queries = newTableArray;
            }
        };

        $scope.deleteSelectedRow = function () {
            $scope.queries = _.filter($scope.queries, function (query) {
                return !(query === $scope.selectedRow);
            });
            $scope.tableAsJSON = angular.toJson($scope.queries);
        };

        // for pie data
        $scope.pieData = [];

        $scope.data = [
            {
                key: "Cumulative Return",
                values: []
            }
        ];

        $scope.key = '';
        $scope.queries = [];
        $scope.updateTable = false;
        $scope.graphtype = "bar";

        if ($routeParams.dash)
            $scope.loadedDashboardName = $scope.dashboardName = $routeParams.dash;
        else
            $scope.loadedDashboardName = $scope.dashboardName = "default";


        // initialization ---------------------------------

        var initPromises = [
            $splout.call('/tablespaces'),
            $scope.getDashboard(""),
            $http.get('demoSQL.json')];


        $q.all(initPromises).then(function (results) {
            //** tablespace ---------------------------------
            var entries = results[0].data,
                data = [];

            entries.forEach(function (entry) {
                data.push({
                    name: entry
                });
            });
            $scope.tablespaces = data;

            //Dashboard
            $scope.synchDashboardList = results[1];

            //** DemoJSON -----------------------------------
            $scope.importJSONTable(results[2].data);
            $scope.tableAsJSON = angular.toJson($scope.queries);


            //** load chart
            if ($routeParams.dash) {
                $scope.loadDashboard($routeParams.dash).then(function (d) {
                    if ($routeParams.chart) {
                        var row = _.find($scope.queries, function (query) {
                            return query.graphname === $routeParams.chart;
                        });
                        //$scope.handleRowSelection(row);
                        doRowSelection(row);
                        $scope.showChartPanel = true;
                    }
                });
            }
        });
    }
]);
