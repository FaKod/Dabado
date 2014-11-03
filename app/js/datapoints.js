'use strict';

/**
 * checking data points
 */
var MissingDataPointChecker = (function () {
    function insertMissingValues(data, value, dimension, metric, domain) {
        var defaults = {};
        domain.forEach(function (item) {
            var v = {};
            v[dimension] = item;
            v[metric] = value;
            defaults[item] = v;
        });

        _.each(data, function (item) {
            var vals = _.groupBy(item.values, function (i) {
                return i[dimension];
            });
            vals = _.flatten(_.values(_.defaults(vals, defaults)));
            vals = _.sortBy(vals, dimension);
            item.values = vals;
        });
        return data;
    }

    return {
        alignLineChartData: function (data, minDate, maxDate) {

            var domain = [];
            for (var i = minDate; i <= maxDate; i += (24 * 60 * 60 * 1000)) {
                domain.push(i);
            }

            var filledData = insertMissingValues(data, 0, 'x', 'y', domain);

            // remove the x and y dimension and metric here
            _.each(filledData, function (item) {
                var vals = item.values;
                item.values = _.map(vals, function (ar) {
                    return [ar.x, ar.y];
                });
            });
        },
        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isStringValidDate: function (ds) {
            var d = new Date(ds);
            return {flag: d && d.getFullYear() > 0, date: d};
        }
    };
})();