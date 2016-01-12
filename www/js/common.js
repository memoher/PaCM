(function () {

    var STRING_EMPTY = '';

    var _randomS4Fnc = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    var _buildGuidFnc = function () {
        return _randomS4Fnc() + _randomS4Fnc() + '-' + _randomS4Fnc() + '-' + _randomS4Fnc() + '-' + _randomS4Fnc() + '-' + _randomS4Fnc() + _randomS4Fnc() + _randomS4Fnc();
    };

    var _buildFunctionFnc = function (fnc01, fnc02) {
        return function () {
            fnc01(fnc02);
        };
    };

    window.PaCM = {
        isDefined: function (vlr) {
            var self = this;

            return !self.isUndefined(vlr);
        },
        isUndefined: function (vlr) {
            return (typeof vlr === 'undefined');
        },
        isNull: function (vlr) {
            return (vlr === null);
        },
        isArray: function (vlr) {
            return (vlr instanceof Array);
        },
        isFunction: function (vlr) {
            return (typeof vlr === 'function');
        },
        isObject: function (vlr) {
            return (typeof vlr === 'object' && vlr.toString() === '[object Object]');
        },
        isInteger: function (vlr) {
            var self = this;

            return (self.isNumber(vlr) && (vlr % 1 === 0));
        },
        isNumber: function (vlr) {
            return (typeof vlr === 'number');
        },
        isDate: function (vlr) {
            return (vlr instanceof Date);
        },
        parseDateString: function (vlr) {
            var self = this;

            if (self.isDate(vlr)) {
                return vlr;
            }
            if (self.isString(vlr)) {
                if (vlr.length = 24 && vlr.substring(4,5) == '-' && vlr.substring(7,8) == '-' && vlr.substring(10,11) == 'T') {
                    return new Date(vlr);
                }
                if (vlr.indexOf('/Date(') >= 0 && vlr.indexOf(')/') >= 0) {
                    return new Date(parseInt(vlr.replace('/Date(', STRING_EMPTY).replace(')/', STRING_EMPTY)));
                }
                if (vlr.indexOf(' GMT') >= 0) {
                    return new Date(vlr);
                }
            }
            return null;
        },
        isBoolean: function (vlr) {
            return (typeof vlr === 'boolean');
        },
        isString: function (vlr) {
            return (typeof vlr === 'string');
        },
        isStringIsNullOrEmpty: function (vlr) {
            var self = this;

            return (vlr === STRING_EMPTY || self.isNull(vlr));
        },
        getStringEmpty: function () {
            return STRING_EMPTY;
        },
        newGuid: function () {
            return _buildGuidFnc();
        },
        execute: function (actions, onSuccess) {
            var self = this;

            if (actions.length == 0) {
                onSuccess();
                return;
            }
            
            var totalFncs = actions.length;

            var fncs = [];
            self.eachArrayInvert(actions, function (inx, f) {
                // Todos menos el último
                if (inx < (totalFncs - 1)) {
                    fncs.push(_buildFunctionFnc(f, fncs[fncs.length - 1]));
                }
                //Último (primera función en la pila, última en ejecutarse)
                else {
                    fncs.push(_buildFunctionFnc(f, onSuccess));
                }
            });
            fncs[fncs.length - 1]();

            self.cleaner(fncs); delete fncs;
            self.cleaner(actions); delete actions;
        },
        prepareErrorMessage: function (err, msg) {
            var self = this;

            if (err) {
                if (self.isDefined(err.DATABASE_ERR)) {
                    if (self.isString(msg)) {
                        return msg + '\r\nSQL ERROR: [' + err.code + '] ' + err.message;
                    } else {
                        return 'SQL ERROR: [' + err.code + '] ' + err.message;
                    }
                } else if (self.isDefined(err.status) && self.isDefined(err.statusText)) {
                    if (self.isString(msg)) {
                        return msg + '\r\nHTTP ERROR: [' + err.status + '] ' + err.statusText;
                    } else {
                        return 'HTTP ERROR: [' + err.status + '] ' + err.statusText;
                    }
                } else {
                    if (self.isString(msg)) {
                        return msg + '\r\nERROR: ' + err.toString();
                    } else {
                        return 'ERROR: ' + err.toString();
                    }                    
                }
            } else {
                return msg;
            }
        },
        showErrorMessage: function (err, msg) {
            var self = this;

            alert(self.prepareErrorMessage(err, msg));
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

            var arr1Clone = arr1.slice(0);

            if (self.isArray(key)) {
                self.eachArrayInvert(arr0, function (inx, e) {
                    var i = self.eachArray(arr1Clone, function (inx2, e2) {
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
                        arr0[inx] = arr1Clone[i];
                        arr1Clone.splice(i, 1);
                    } else {
                        arr0.splice(inx, 1);
                    }
                });
                self.eachArray(arr1Clone, function (inx, e) {
                    arr0.push(e);
                });
            } else {
                self.eachArrayInvert(arr0, function (inx, e) {
                    var i = arr1Clone.indexOf(e);
                    if (i >= 0) {
                        arr1Clone.splice(i, 1);
                    } else {
                        arr0.splice(inx, 1);
                    }
                });
                self.eachArray(arr1Clone, function (inx, e) {
                    arr0.push(e);
                });
            }

            self.cleaner(arr1Clone); delete arr1Clone;
        },
        eachArray: function (arr, iterator) {
            var self = this;

            if (arr) {
                if (self.isArray(arr)) {
                    var arrayLength = arr.length;
                    for (var i = 0; i < arrayLength; i++) {
                        var result = iterator(i, arr[i], arrayLength);
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
                    var arrayLength = arr.length;
                    for (var i = arrayLength - 1; i >= 0; i--) {
                        var result = iterator(i, arr[i], arrayLength);
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
                    var totalRows = sqlRS.rows.length;
                    for (var i = 0; i < totalRows; i++) {
                        var r = sqlRS.rows.item(i);
                        var o = {};
                        self.eachProperties(r, function (key, val) {
                            o[key] = val;
                            if (self.isString(val)) {
                                if (val === 'true') {
                                    o[key] = true;
                                } else if (val === 'false') {
                                    o[key] = false;
                                } else {
                                    var date = self.parseDateString(val);
                                    if (date) {
                                        o[key] = date;
                                    }
                                }
                            }
                        });
                        self.cleaner(r); delete r;
                        var result = iterator(i, o, totalRows);
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
                    var totalRows = sqlRS.rows.length;
                    for (var i = totalRows - 1; i >= 0; i--) {
                        var r = sqlRS.rows.item(i);
                        var o = {};
                        self.eachProperties(r, function (key, val) {
                            o[key] = val;
                            if (self.isString(val)) {
                                if (val === 'true') {
                                    o[key] = true;
                                } else if (val === 'false') {
                                    o[key] = false;
                                } else {
                                    var date = self.parseDateString(val);
                                    if (date) {
                                        o[key] = date;
                                    }
                                }
                            }
                        });
                        self.cleaner(r); delete r;
                        var result = iterator(i, o, totalRows);
                        if (self.isDefined(result)) {
                            return result;
                        }
                    } 
                } else {
                    throw 'SQLResultSet is not valid';
                }
            }
        },
        cleaner: function (obj) {
            var self = this;

            if (self.isArray(obj)) {
                obj.length = 0;
            } else if (self.isObject(obj)) {
                self.eachProperties(obj, function (key, val) {
                    if (!(key.substring(0, 1) === '$')) {
                        if (self.isArray(obj[key])) {
                            obj[key].length = 0;
                        }
                        delete obj[key];
                    }
                });
            }
        },
        isNetworkOnline: function () {
            var self = this;

            if (self.isDefined(navigator.connection)) {
                var networkState = navigator.connection.type;
                return !(networkState === Connection.NONE);
            } else {
                return true;
            }
        }
    };

})();
