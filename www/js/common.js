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
        isNullOrEmptyString: function (vlr) {
            var self = this;
            return (self.isUndefined(vlr) || vlr === null || vlr === '');
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
            } else {
                alert(msg);
            }
        },
        eachArray: function (arr, iterator) {
            var self = this;
            if (arr) {
                if (self.isArray(arr)) {
                    for (var i = 0; i < arr.length; i++) {
                        iterator(i, arr[i]);
                    }
                } else {
                    throw 'Array is not valid';
                }
            }
        },
        eachArrayInvert: function (arr, iterator) {
            var self = this;
            if (arr) {
                if (self.isArray(arr)) {
                    for (var i = arr.length - 1; i >= 0; i--) {
                        iterator(i, arr[i]);
                    }
                } else {
                    throw 'Array is not valid';
                }
            }
        },
        eachProperties: function (obj, iterator) {
            var self = this;
            if (obj) {
                if (self.isObject(obj)) {
                    for (var p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            iterator(p, obj[p]);
                        }
                    }
                } else {
                    throw 'Object is not valid';
                }
            }
        },
        eachSqlRS: function (sqlRS, iterator) {
            var self = this;
            if (sqlRS) {
                if (self.isDefined(sqlRS.rows)) {
                    for (var i = 0; i < sqlRS.rows.length; i++) {
                        var r = sqlRS.rows.item(i);
                        self.eachProperties(r, function (key, val) {
                            if (self.isString(val)) {
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
                } else {
                    throw 'SQLResultSet is not valid';
                }
            }
        },
        eachSqlRSInvert: function (sqlRS, iterator) {
            var self = this;
            if (sqlRS) {
                if (self.isDefined(sqlRS.rows)) {
                    for (var i = sqlRS.rows.length - 1; i >= 0; i--) {
                        var r = sqlRS.rows.item(i);
                        self.eachProperties(r, function (key, val) {
                            if (self.isString(val)) {
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
                } else {
                    throw 'SQLResultSet is not valid';
                }
            }
        }
    };

})();
