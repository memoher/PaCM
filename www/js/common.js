/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {

    window.PaCM = {
        isArray: function (vlr) {
            var self = this;
            return (vlr && self.isDefined(vlr.length) && self.isDefined(vlr.push));
        },
        isFunction: function (vlr) {
            return typeof(vlr) === 'function';
        },
        isObject: function (vlr) {
            var self = this;
            return (vlr && self.isDefined(vlr.hasOwnProperty));
        },
        isDefined: function (vlr) {
            var self = this;
            return !self.isUndefined(vlr);
        },
        isUndefined: function (vlr) {
            return typeof(vlr) === 'undefined';
        },
        isNumber: function (vlr) {
            return typeof(vlr) === 'number';
        },
        isString: function (vlr) {
            var self = this;
            return (vlr && self.isDefined(vlr.replace) && self.isDefined(vlr.toLowerCase));
        },
        showError: function (err, msg) {
            var self = this;
            if (err) {
                if (self.isDefined(err.DATABASE_ERR)) {
                    if (self.isString(msg)) {
                        alert(msg + '\r\nSQL ERROR: [' + err.code + '] ' + err.message);
                    } else {
                        alert('SQL ERROR: [' + err.code + '] ' + err.message);
                    }
                } else {
                    if (self.isString(msg)) {
                        alert(msg + '\r\nERROR: ' + err.toString());
                    } else {
                        alert('ERROR: ' + err.toString());
                    }                    
                }
            }
        },
        eachArray: function (arr, iterator) {
            var self = this;
            if (self.isArray(arr) && arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    iterator(i, arr[i]);
                }
            }
        },
        eachProperties: function (obj, iterator) {
            var self = this;
            if (self.isObject(obj)) {
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

})();
