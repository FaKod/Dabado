'use strict';

/* Controllers */

var dasboardControllers = angular.module('dashboardControllers', []);

dasboardControllers.controller('sploutQuery', ['$scope', '$http', '$q', function($scope, $http, $q) {

	$scope.$watch('graphtype', function(newValue, oldValue) {
		$scope.type = newValue;
	});


	$scope.handleClickOnGoForIt = function(newSql) {
		console.log('Executing query: ' + newSql);

		var promises = [];
		angular.forEach(newSql.split('\n'), function(sql) {
			promises.push($http({
				method: 'GET',
				url: '/splout/api/query/' + $scope.tablespace.name + '?key=' + $scope.key + '&sql=' + encodeURIComponent(sql)
			}));
		});

		$q.all(promises).then(function(arrayOfResults) {
			console.log('Got: ' + arrayOfResults.length + " results");

			var entries = arrayOfResults[0].data.result,
				data = [],
				pieData = [];

			// for Line Charts   
			$scope.data = [];
			var i = 1;
			angular.forEach(arrayOfResults, function(lineResult) {
				var entries = lineResult.data.result,
					data = [];

				angular.forEach(entries, function(entry) {
					data.push([entry.x, entry.y]);
				});
				$scope.data.push({
					"key": i++,
					"values": data
				});
			});

			// for pie charts
			angular.forEach(entries, function(entry) {
				pieData.push({
					key: entry.x,
					value: entry.y
				});
			});

			$scope.pieData = pieData;

			// fill table
			if ($scope.updateTable) {
				$scope.updateTable = false;
				$scope.queries.unshift({
					tablespace: $scope.tablespace.name,
					key: $scope.key,
					sql: newSql
				});
				$scope.queries = $scope.queries.slice(0, 9);
				$scope.tableAsJSON = angular.toJson($scope.queries);
			}
		});
	};



	$scope.importJSONTable = function(json) {
		var newTableArray = angular.fromJson(json);
		if (angular.isArray(newTableArray)) {
			$scope.queries = newTableArray;
		}
	}

	// for pie data
	$scope.pieData = [];

	$scope.pieData.pieXFunction = function() {
		return function(d) {
			return d.key;
		};
	}
	$scope.pieData.pieYFunction = function() {
		return function(d) {
			return d.value;
		};
	}
	//
	$scope.data = [{
		key: "Cumulative Return",
		values: []
	}];

	$scope.key = '';
	$scope.queries = [];
	$scope.updateTable = false;
	$scope.graphtype = "bar";

	$http.get('demoSQL.json').then(function(res) {
		$scope.importJSONTable(res.data);
		$scope.tableAsJSON = angular.toJson($scope.queries);
	});

	$scope.handleRowSelection = function(row) {
		$scope.tablespace = _.find($scope.tablespaces, function(ts) {
			return ts.name === row.tablespace;
		});

		$scope.key = row.key;
		$scope.sql = row.sql;
		//console.log(row);
	}

	$http({
		method: 'GET',
		url: '/splout/api/tablespaces'
	}).then(function(data, status) {

		var entries = data.data,
			data = [];

		angular.forEach(entries, function(entry) {
			data.push({
				name: entry
			});
		});

		$scope.tablespaces = data;
	});


}])
