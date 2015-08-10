/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function ($window) {

    $window.PaCM = {
        eachArray: function (arr, iterator) {
            if (arr && arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    iterator(i, arr[i]);
                }
            }
        },
        eachProperties: function (obj, iterator) {
            if (obj != null) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        iterator(p, obj[p]);
                    }
                }
            }
        },
        eachSqlRS: function (sqlRS, iterator) {
            var self = this;

            if (sqlRS.rows && sqlRS.rows.length > 0) {
                for (var i = 0; i < sqlRS.rows.length; i++) {
                    var r = sqlRS.rows.item(i);
                    self.eachProperties(r, function (key, val) {
                        if (angular.isString(val)) {
                            if (val === 'true') {
                                r[key] = true;
                            } else if (val === 'false') {
                                r[key] = false;
                            } else if (val.indexOf('GMT-') >= 0) {
                                r[key] = new Date(val);
                            }
                        }
                    });
                    iterator(i, r);
                }
            }
        }
    };

})(window);
