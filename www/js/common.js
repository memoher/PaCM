(function () {

    var stringEmpty = '';

    window.PaCM = {
        getStrEmpty: function () {
            return stringEmpty;
        },
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
        isString: function (vlr) {
            var self = this;
            return typeof(vlr) === 'string';
        },
        isInteger: function (vlr) {
            var self = this;
            return self.isNumber(vlr) && (vlr % 1 === 0);
        },
        isNumber: function (vlr) {
            return typeof(vlr) === 'number';
        },
        isDate: function (vlr) {
            return vlr instanceof Date;
        },
        isBoolean: function (vlr) {
            return (vlr === true || vlr === false);
        },
        isNullOrEmptyString: function (vlr) {
            var self = this;
            return (self.isUndefined(vlr) || vlr === null || vlr === self.getStrEmpty());
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
        mergeArray: function (key, arr0, arr1, arr2, arr3, arr4, arr5) {
            var self = this;
            
            if (!self.isArray(arr0) || !self.isArray(arr1)) {
                return;
            }

            if (self.isArray(key)) {
                self.eachArray(arr1, function (inx, e) {
                    var i = self.eachArray(arr0, function (inx2, e2) {
                        var valid = true;
                        self.eachArray(key, function (inx3, k) {
                            if (e[k] != e2[k])
                                valid = false;
                        });
                        if (valid === true) {
                            return inx2;
                        }
                    });
                    if (self.isNumber(i)) {
                        arr0[i] = e;
                    } else {
                        arr0.push(e);
                    }
                });
            } else {
                self.eachArray(arr1, function (inx, e) {
                    if (arr0.indexOf(e) < 0) {
                        arr0.push(e);
                    }
                });
            }
            if (self.isArray(arr2)) {
                self.mergeArray(key, arr0, arr2);
            }
            if (self.isArray(arr3)) {
                self.mergeArray(key, arr0, arr3);
            }
            if (self.isArray(arr4)) {
                self.mergeArray(key, arr0, arr4);
            }
            if (self.isArray(arr5)) {
                self.mergeArray(key, arr0, arr5);
            }
        },
        syncronizeArray: function (key, arr0, arr1) {
            var self = this;

            if (!self.isArray(arr0) || !self.isArray(arr1)) {
                return;
            }

            if (self.isArray(key)) {
                self.eachArrayInvert(arr0, function (inx, e) {
                    var i = self.eachArray(arr1, function (inx2, e2) {
                        var valid = true;
                        self.eachArray(key, function (inx3, k) {
                            if (e[k] != e2[k])
                                valid = false;
                        });
                        if (valid === true) {
                            return inx2;
                        }
                    });
                    if (self.isNumber(i)) {
                        arr0[inx] = arr1[i];
                        arr1.splice(i, 1);
                    } else {
                        arr0.splice(inx, 1);
                    }
                });
                self.eachArray(arr1, function (inx, e) {
                    arr0.push(e);
                });
            } else {
                self.eachArrayInvert(arr0, function (inx, e) {
                    var i = arr1.indexOf(e);
                    if (i >= 0) {
                        arr1.splice(i, 1);
                    } else {
                        arr0.splice(inx, 1);
                    }
                });
                self.eachArray(arr1, function (inx, e) {
                    arr0.push(e);
                });
            }
        },
        eachArray: function (arr, iterator) {
            var self = this;
            if (arr) {
                if (self.isArray(arr)) {
                    for (var i = 0; i < arr.length; i++) {
                        var result = iterator(i, arr[i]);
                        if (self.isDefined(result)) {
                            return result;
                        }
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
                        var result = iterator(i, arr[i]);
                        if (self.isDefined(result)) {
                            return result;
                        }
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
                            var result = iterator(p, obj[p]);
                            if (self.isDefined(result)) {
                                return result;
                            }
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
                        var o = {};
                        self.eachProperties(r, function (key, val) {
                            o[key] = val;
                            if (self.isString(o[key])) {
                                if (o[key] == 'true') {
                                    o[key] = true;
                                } else if (o[key] == 'false') {
                                    o[key] = false;
                                } else if (o[key].length = 24 && o[key].substring(10,11) == 'T' && o[key].substring(23,24) == 'Z') {
                                    o[key] = new Date(o[key]);
                                }
                            }
                        });
                        var result = iterator(i, o);
                        if (self.isDefined(result)) {
                            return result;
                        }
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
                        var o = {};
                        self.eachProperties(r, function (key, val) {
                            o[key] = val;
                            if (self.isString(o[key])) {
                                if (o[key] == 'true') {
                                    o[key] = true;
                                } else if (o[key] == 'false') {
                                    o[key] = false;
                                } else if (o[key].indexOf('GMT-') >= 0) {
                                    o[key] = new Date(o[key]);
                                }
                            }
                        });
                        var result = iterator(i, o);
                        if (self.isDefined(result)) {
                            return result;
                        }
                    } 
                } else {
                    throw 'SQLResultSet is not valid';
                }
            }
        }
    };

})();
