(function () {

    var TYPE_STRING = 'string';
    var TYPE_BOOLEAN = 'boolean';
    var TYPE_NUMBER = 'number';
    var TYPE_FUNCTION = 'function';
    var TYPE_UNDEFINED = 'undefined';
    var TYPE_OBJECT_GENERIC = 'object';
    var TYPE_DATE = '[object Date]';
    var TYPE_OBJECT = '[object Object]';

    var STRING_EMPTY = '';
    var STRING_HYPHEN = '-';

    function _randomS4Fnc() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    function _buildGuidFnc() {
        return [
            _randomS4Fnc(),
            _randomS4Fnc(),
            STRING_HYPHEN,
            _randomS4Fnc(),
            STRING_HYPHEN,
            _randomS4Fnc(),
            STRING_HYPHEN,
            _randomS4Fnc(),
            STRING_HYPHEN,
            _randomS4Fnc(),
            _randomS4Fnc(),
            _randomS4Fnc()
        ].join(STRING_EMPTY);
    };

    function _buildFunctionFnc(fnc01, fnc02) {
        return function () {
            fnc01(fnc02);
        };
    };

    function _findObjectFnc(arr0, key, obj) {
        var keyLength = key.length;
        var arr0Length = arr0.length;
        for (var j = 0; j < arr0Length; j++) {
            var arr0J = arr0[j];
            var valid = true;
            for (var k = 0; k < keyLength; k++) {
                var keyK = key[k];
                if (obj[keyK] != arr0J[keyK])
                    valid = false;
            }
            if (valid === true)
                return j;
        }
        return null;
    };

    window.PaCM = {
        isDefined: function (vlr) {
            return !(typeof vlr === TYPE_UNDEFINED);
        },
        isUndefined: function (vlr) {
            return (typeof vlr === TYPE_UNDEFINED);
        },
        isNull: function (vlr) {
            return (vlr === null);
        },
        isArray: function (vlr) {
            return Array.isArray(vlr);
        },
        isFunction: function (vlr) {
            return (typeof vlr === TYPE_FUNCTION);
        },
        isObject: function (vlr) {
            return (typeof vlr === TYPE_OBJECT_GENERIC) && (toString.call(vlr) === TYPE_OBJECT);
        },
        isInteger: function (vlr) {
            return (typeof vlr === TYPE_NUMBER) && (vlr % 1 === 0);
        },
        isNumber: function (vlr) {
            return (typeof vlr === TYPE_NUMBER);
        },
        isDate: function (vlr) {
            return (typeof vlr === TYPE_OBJECT_GENERIC) && (toString.call(vlr) === TYPE_DATE);
        },
        parseDateString: function (vlr) {
            var self = this;

            if (self.isDate(vlr))
                return vlr;
            
            if (self.isString(vlr)) {
                if (vlr.length === 24 && vlr.substring(4,5) === STRING_HYPHEN && vlr.substring(7,8) === STRING_HYPHEN && vlr.substring(10,11) === 'T')
                    return new Date(vlr);
                
                if (vlr.indexOf(' GMT') >= 0)
                    return new Date(vlr);
                
                if (vlr.indexOf('/Date(') >= 0 && vlr.indexOf(')/') >= 0)
                    return new Date(parseInt(vlr.replace('/Date(', STRING_EMPTY).replace(')/', STRING_EMPTY)));
            }

            return null;
        },
        isBoolean: function (vlr) {
            return (typeof vlr === TYPE_BOOLEAN);
        },
        isString: function (vlr) {
            return (typeof vlr === TYPE_STRING);
        },
        IsNullOrStringEmpty: function (vlr) {
            return (vlr === STRING_EMPTY) || (vlr == null);
        },
        newGuid: function () {
            return _buildGuidFnc();
        },
        execute: function (actions, onSuccess) {
            var self = this;

            if (!self.isArray(actions))
                throw 'Array is not valid';

            if (actions.length === 0) {
                onSuccess();
                return;
            }
            
            //Recorre el array del último al primero, arma una pila de funciones,
            //con el objetivo de que se ejecuten de manera ordenada
            var lastActionInx = actions.length - 1;
            var fncs = [];
            for (var i = lastActionInx; i >= 0; i--) {
                // Todos menos el último
                if (i < lastActionInx) {
                    fncs.push(_buildFunctionFnc(actions[i], fncs[fncs.length - 1]));
                }
                //Último (primera función en la pila, última en ejecutarse)
                else {
                    fncs.push(_buildFunctionFnc(actions[i], onSuccess));
                }
            }
            fncs[fncs.length - 1]();

            fncs.length = 0; fncs = null;
            actions.length = 0; actions = null;
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
        mergeArray: function (key, arr0, arr1) {
            var self = this;
            
            if (!self.isArray(arr0) || !self.isArray(arr1))
                throw 'Array0 or Array1 is not valid';

            var arr1Length = arr1.length;
            if (self.isArray(key)) {
                for (var i = 0; i < arr1Length; i++) {
                    var arr1I = arr1[i];
                    var index = _findObjectFnc(arr0, key, arr1I);
                    if (!(index === null)) {
                        arr0[index] = arr1I;
                    } else {
                        arr0.push(arr1I);
                    }
                };
            } else {
                for (var i = 0; i < arr1Length; i++) {
                    var arr1I = arr1[i];
                    if (arr0.indexOf(arr1I) < 0) {
                        arr0.push(arr1I);
                    }
                };
            }
        },
        syncronizeArray: function (key, arr0, arr1) {
            var self = this;

            if (!self.isArray(arr0) || !self.isArray(arr1))
                throw 'Array0 or Array1 is not valid';

            var arr1Clone = arr1.slice(0);

            var arr0Length = arr0.length;
            if (self.isArray(key)) {
                for (var i = arr0Length - 1; i >= 0; i--) {
                    var index = _findObjectFnc(arr1Clone, key, arr0[i]);
                    if (!(index === null)) {
                        arr0[i] = arr1Clone[index];
                        arr1Clone.splice(index, 1);
                    } else {
                        arr0.splice(i, 1);
                    }
                }
            } else {
                for (var i = arr0Length - 1; i >= 0; i--) {
                    var index = arr1Clone.indexOf(arr0[i]);
                    if (index >= 0) {
                        arr1Clone.splice(index, 1);
                    } else {
                        arr0.splice(i, 1);
                    }
                }
            }

            var arr1CloneLength = arr1Clone.length;
            for (var i = 0; i < arr1CloneLength; i++) {
                arr0.push(arr1Clone[i]);
            }

            arr1Clone.length = 0; arr1Clone = null;
        },
        eachArray: function (array, iterator) {
            var self = this;

            if (self.isArray(array)) {
                var arrayLength = array.length;
                for (var i = 0; i < arrayLength; i++) {
                    var result = iterator(i, array[i], arrayLength);
                    if (self.isDefined(result))
                        return result;
                }
            } else
                throw 'Array is not valid';
        },
        eachArrayInvert: function (array, iterator) {
            var self = this;

            if (self.isArray(array)) {
                var arrayLength = array.length;
                for (var i = arrayLength - 1; i >= 0; i--) {
                    var result = iterator(i, array[i], arrayLength);
                    if (self.isDefined(result))
                        return result;
                }
            } else
                throw 'Array is not valid';
        },
        eachProperties: function (obj, iterator) {
            var self = this;

            if (self.isObject(obj)) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        var result = iterator(p, obj[p]);
                        if (self.isDefined(result))
                            return result;
                    }
                }
            } else
                throw 'Object is not valid';
        },
        eachSqlRS: function (sqlRS, iterator) {
            var self = this;

            if (self.isDefined(sqlRS.rows)) {
                var totalRows = sqlRS.rows.length;
                if (totalRows > 0) {
                    var properties = [];
                    if (true) { // private scope
                        var r = sqlRS.rows.item(i);
                        for (var p in r) {
                            if (r.hasOwnProperty(p)) {
                                properties.push(p);
                            }
                        }
                    }
                    var propertiesLength = properties.length;
                    for (var i = 0; i < totalRows; i++) {
                        // ------------------------
                        var r = sqlRS.rows.item(i);
                        var o = {};
                        for (var j = 0; j < propertiesLength; j++) {
                            var p = properties[j];
                            var v = r[p];
                            o[p] = v;
                            if (self.isString(v)) {
                                if (v === 'true') {
                                    o[p] = true;
                                } else if (v === 'false') {
                                    o[p] = false;
                                } else {
                                    var date = self.parseDateString(v);
                                    if (date) {
                                        o[p] = date;
                                    }
                                }
                            }
                        }
                        r = null;
                        var result = iterator(i, o, totalRows);
                        if (self.isDefined(result))
                            return result;
                        // ------------------------
                    }
                    properties.length = 0; properties = null;
                }
            } else
                throw 'SQLResultSet is not valid';
        },
        eachSqlRSInvert: function (sqlRS, iterator) {
            var self = this;

            if (self.isDefined(sqlRS.rows)) {
                var totalRows = sqlRS.rows.length;
                if (totalRows > 0) {
                    var properties = [];
                    if (true) { // private scope
                        var r = sqlRS.rows.item(i);
                        for (var p in r) {
                            if (r.hasOwnProperty(p)) {
                                properties.push(p);
                            }
                        }
                    }
                    var propertiesLength = properties.length;
                    for (var i = totalRows - 1; i >= 0; i--) {
                        // ------------------------
                        var r = sqlRS.rows.item(i);
                        var o = {};
                        for (var j = 0; j < propertiesLength; j++) {
                            var p = properties[j];
                            var v = r[p];
                            o[p] = v;
                            if (self.isString(v)) {
                                if (v === 'true') {
                                    o[p] = true;
                                } else if (v === 'false') {
                                    o[p] = false;
                                } else {
                                    var date = self.parseDateString(v);
                                    if (date) {
                                        o[p] = date;
                                    }
                                }
                            }
                        }
                        r = null;
                        var result = iterator(i, o, totalRows);
                        if (self.isDefined(result))
                            return result;
                        // ------------------------
                    }
                    properties.length = 0; properties = null;    
                } 
            } else
                throw 'SQLResultSet is not valid';
        },
        cleaner: function (obj) {
            var self = this;

            if (self.isArray(obj)) {
                obj.length = 0;
            } else if (self.isObject(obj)) {
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        if (!(p.substring(0, 1) === '$')) {
                            if (self.isArray(obj[p])) {
                                obj[p].length = 0;
                            }
                            obj[p] = null;
                        }
                    }
                }
            }
        },
        isNetworkOnline: function () {
            var self = this;

            if ((navigator) && (navigator.connection)) {
                var networkState = navigator.connection.type;
                return !(networkState === navigator.connection.NONE);
            } else {
                return true;
            }
        }
    };

})();
