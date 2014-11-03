'use strict';

var graphHelper = (function () {
    var injector = angular.injector(['ng']),
        $q = injector.get('$q');

    return {
        calcGraphData: function (newSql, tablespace, key, dtFrom, dtTo, currentRangeSelection) {

            var deferred = $q.defer(),
                sqlHasRangeParameter,
                dateSQL = DateSelectionHelper.getDateSQL(dtFrom, dtTo),
                labels = [],
                promises = [],
                selectedRanges,
                tmpSqlHasDateParameter = false;

            SQLHelper.extractRanges(newSql, tablespace, key, function (sqlToBeExecuted, tmpRanges, xValueConvertServiceName) {

                var $splout = angular.injector(['dabadoServices']).get('$splout');

                if (xValueConvertServiceName)
                    var xValueConvertService = angular.injector(['customServices']).get(xValueConvertServiceName);

                sqlHasRangeParameter = tmpRanges.length > 0;
                if (currentRangeSelection === undefined) {
                    selectedRanges = [];
                    tmpRanges.forEach(function (each) {
                        selectedRanges.push(each.selected);
                    })
                }
                else
                    selectedRanges = currentRangeSelection;

                sqlToBeExecuted.forEach(function (oneLineOfSQL) {

                    var extractedSQL = SQLHelper.extractSQL(oneLineOfSQL),
                        sql = extractedSQL.sql,
                        label = extractedSQL.label;

                    if (!tmpSqlHasDateParameter && sql.indexOf(':date') > -1) tmpSqlHasDateParameter = true;

                    sql = sql.replace(":date", dateSQL);

                    for (var i = 0; i < tmpRanges.length; i++) {
                        var rangeIndex = tmpRanges[i].displayValues.indexOf(selectedRanges[i]);
                        var rangeValue = tmpRanges[i].values[rangeIndex];
                        sql = sql.replace(":" + tmpRanges[i].name, "\'" + rangeValue + "\'");
                        label = label.replace(":" + tmpRanges[i].name, selectedRanges[i]);
                    }

                    labels.push(label);

                    promises.push($splout.call('/query/' + tablespace + '?key=' + key + '&sql=' + encodeURIComponent(sql)));
                });

                $q.all(promises).then(function (arrayOfResults) {
                    console.log('Got results from ' + arrayOfResults.length + " SQL statements");
                    var t = 0;
                    arrayOfResults.forEach(function (lineResult) {
                        var entries = lineResult.data.result;
                        console.log(++t + " Statement has " + (entries == null ? 0 : entries.length) + " values");
                    });

                    var firstLineEntries = arrayOfResults[0].data.result != null ? arrayOfResults[0].data.result : [],
                        tmpLineChartData = [],
                        tmpTableData = [],
                        tmpPieData = [],
                        tmpSqlResultsStats = [];

                    // ------------------------------------------------------------------------------------
                    // for Line Charts --------------------------------------------------------------------
                    // ------------------------------------------------------------------------------------
                    var i = 0,
                        maxDate = 0,
                        minDate = Number.MAX_VALUE,
                        dataShouldBeAligned = true;

                    arrayOfResults.forEach(function (lineResult) {
                        var lineEntries = lineResult.data.result != null ? lineResult.data.result : [],
                            lineValues = [],
                            barFlag;

                        tmpSqlResultsStats.push({
                            error: lineResult.data.error,
                            millis: lineResult.data.millis,
                            shard: lineResult.data.shard
                        });

                        lineEntries.forEach(function (entry) {
                            var validDate = MissingDataPointChecker.isStringValidDate(entry.x);
                            var yValue = Math.round(entry.y * 100) / 100;

                            if (validDate.flag && dataShouldBeAligned) {
                                var time = validDate.date.getTime();
                                lineValues.push({x: time, y: yValue}); // not [], because of the point default algorithm used in alignLineChartData

                                if (time > maxDate) maxDate = time;
                                if (time < minDate) minDate = time;
                            }
                            else {
                                lineValues.push([xValueConvertService ? xValueConvertService.convert(entry.x) : entry.x, yValue]);
                                dataShouldBeAligned = false;
                            }
                        });

                        if (labels[i].charAt(0) === '^') {
                            barFlag = labels[i].charAt(0) === '^';
                            labels[i] = labels[i].substring(1);
                        }

                        tmpLineChartData.push({
                            "key": (labels[i].length == 0) ? i + 1 : labels[i],
                            "bar": barFlag,
                            "values": lineValues
                        });
                        i++;
                    });

                    if (dataShouldBeAligned)
                        MissingDataPointChecker.alignLineChartData(tmpLineChartData, minDate, maxDate);

                    // ------------------------------------------------------------------------------------
                    // for pie charts ---------------------------------------------------------------------
                    // ------------------------------------------------------------------------------------
                    firstLineEntries.forEach(function (entry) {
                        tmpPieData.push({
                            key: xValueConvertService ? xValueConvertService.convert(entry.x) : entry.x,
                            value: entry.y
                        });
                    });

                    // ------------------------------------------------------------------------------------
                    // for Table --------------------------------------------------------------------------
                    // ------------------------------------------------------------------------------------
                    firstLineEntries.forEach(function (entry) {
                        tmpTableData.push(entry);
                    });

                    var tmpRowTitles = [];
                    for (var k in firstLineEntries[0]) tmpRowTitles.push(k);

                    deferred.resolve({
                        range: {
                            sqlHasRangeParameter: sqlHasRangeParameter,
                            ranges: tmpRanges,
                            selectedRanges: selectedRanges
                        },
                        data: {
                            rowTitles: tmpRowTitles,
                            data: tmpLineChartData,
                            pieData: tmpPieData,
                            tableData: tmpTableData,
                            SqlResultsStats: tmpSqlResultsStats,
                            sqlHasDateParameter: tmpSqlHasDateParameter
                        }
                    });
                });
            });
            return deferred.promise;
        }
    }
})();


var DateSelectionHelper = (function () {

    function getDate(date) {
        function padStr(i) {
            return (i < 10) ? "0" + i : "" + i;
        }

        return "\'" + date.getFullYear() + '-' + padStr(date.getMonth() + 1) + '-' + padStr(date.getDate()) + "\'";
    }

    return {
        getDateSQL: function (fromField, toField) {
            var fromPart = "",
                toPart = "",
                sqlOperator = "";

            if (fromField != undefined) fromPart = "DATE(x) >= DATE(" + getDate(fromField) + ")";

            if (toField != undefined) toPart = "DATE(x) <= DATE(" + getDate(toField) + ")";

            if (fromPart.length > 0 && toPart.length > 0) sqlOperator = " and ";

            var dateSQL = "(" + fromPart + sqlOperator + toPart + ")";
            if (dateSQL.length == 2) dateSQL = "(1)";
            return dateSQL;
        }
    };
})();


var SQLHelper = (function () {
    var injector = angular.injector(['ng']),
        $q = injector.get('$q');

    return {
        extractSQL: function (sql) {
            var label = "";
            if (sql.charAt(0) == "\"") {
                label = sql.split("\"")[1];
                var index = sql.toLowerCase().indexOf("select");
                sql = sql.substring(index, sql.length);
            }
            return {
                sql: sql,
                label: label
            };
        },

        extractRanges: function (linesOfSQL, tablespace, key, callback) {
            var sqlToBeExecuted = [],
                rangePromises = [],
                ranges = [],
                xValueConvertServiceName,
                $splout = angular.injector(['dabadoServices']).get('$splout');

            linesOfSQL.split('\n').forEach(function (lineOfSQL) {
                if (lineOfSQL.charAt(0) == ":") {
                    var rangeName = lineOfSQL.split(" ")[0].substring(1).split("?")[0];
                    var convertServiceName = lineOfSQL.split(" ")[0].substring(1).split("?")[1];
                    ranges.push({
                        name: rangeName,
                        values: [],
                        displayValues: [],
                        convertServiceName: convertServiceName
                    });
                    var index = lineOfSQL.toLowerCase().indexOf("select");
                    var sql = lineOfSQL.substring(index, lineOfSQL.length);
                    rangePromises.push($splout.call('/query/' + tablespace + '?key=' + key + '&sql=' + encodeURIComponent(sql)));
                }
                else if (lineOfSQL.charAt(0) == "?") {
                    xValueConvertServiceName = lineOfSQL.split(" ")[0].substring(1);
                }
                else
                    sqlToBeExecuted.push(lineOfSQL);
            });

            var i = 0;
            var injector = angular.injector(['customServices']);
            $q.all(rangePromises).then(function (arrayOfResults) {
                arrayOfResults.forEach(function (lineResult) {

                    if (ranges[i].convertServiceName)
                        var convertService = injector.get(ranges[i].convertServiceName);

                    var entries = lineResult.data.result;
                    if (entries) {
                        entries.forEach(function (element) {
                            var value = element[Object.keys(element)[0]];
                            ranges[i].values.push(value);
                            if (convertService)
                                ranges[i].displayValues.push(convertService.convert(value));
                            else
                                ranges[i].displayValues.push(value);

                            if (ranges[i].selected == undefined)
                                ranges[i].selected = "%";
                        });
                    }

                    // sorting (to be improved :)-----------------------------------
                    var zipped = [];
                    for (var t = 0; t < ranges[i].values.length; ++t) {
                        zipped.push({
                            array1elem: ranges[i].displayValues[t],
                            array2elem: ranges[i].values[t]
                        });
                    }
                    zipped.sort(function (left, right) {
                        var leftArray1elem = left.array1elem,
                            rightArray1elem = right.array1elem;
                        return leftArray1elem === rightArray1elem ? 0 : (leftArray1elem < rightArray1elem ? -1 : 1);
                    });
                    ranges[i].displayValues = [];
                    ranges[i].values = [];
                    for (t = 0; t < zipped.length; ++t) {
                        ranges[i].displayValues.push(zipped[t].array1elem);
                        ranges[i].values.push(zipped[t].array2elem);
                    }
                    // sorting end--------------------------------------------------

                    ranges[i].displayValues.push("%");
                    ranges[i].values.push("%");
                    i++;
                });
                callback(sqlToBeExecuted, ranges, xValueConvertServiceName);
            });
        }
    };
})();

