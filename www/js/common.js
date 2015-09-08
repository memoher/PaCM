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
        mergeArray: function (key, arr1, arr2, arr3) {
            var self = this;
            
            var arr1Valid = self.eachArray(arr1, function (inx, e) { return true; });
            var arr2Valid = self.eachArray(arr2, function (inx, e) { return true; });
            var arr3Valid = self.eachArray(arr3, function (inx, e) { return true; });
            
            if (arr1Valid && !arr2Valid && !arr3Valid) {
                return arr1;
            } else {

                var validKey =
                PaCM.eachProperties(key, function (k, v) {
                    return true;
                });

                var result = [];
                self.eachArray(arr1, function (inx, e) {
                    if (validKey) {
                        var i = self.eachArray(result, function (inx2, e2) {
                            var valid = true;
                            self.eachArray(key, function (inx3, v) {
                                if (e[v] != e2[v])
                                    valid = false;
                            });
                            if (valid === true) {
                                return inx2;
                            }
                        });
                        if (i != null) {
                            result[i] = e;
                        } else {
                            result.push(e);
                        }
                    } else {
                        if (result.indexOf(e) < 0) {
                            result.push(e);
                        }   
                    }
                });
                self.eachArray(arr2, function (inx, e) {
                    if (validKey) {
                        var i = self.eachArray(result, function (inx2, e2) {
                            var valid = true;
                            self.eachArray(key, function (inx3, v) {
                                if (e[v] != e2[v])
                                    valid = false;
                            });
                            if (valid === true) {
                                return inx2;
                            }
                        });
                        if (i != null) {
                            result[i] = e;
                        } else {
                            result.push(e);
                        }
                    } else {
                        if (result.indexOf(e) < 0) {
                            result.push(e);
                        }   
                    }
                });
                self.eachArray(arr3, function (inx, e) {
                    if (validKey) {
                        var i = self.eachArray(result, function (inx2, e2) {
                            var valid = true;
                            self.eachArray(key, function (inx3, v) {
                                if (e[v] != e2[v])
                                    valid = false;
                            });
                            if (valid === true) {
                                return inx2;
                            }
                        });
                        if (i != null) {
                            result[i] = e;
                        } else {
                            result.push(e);
                        }
                    } else {
                        if (result.indexOf(e) < 0) {
                            result.push(e);
                        }   
                    }
                });
                return result;
            }
        },
        syncronizeArray: function (key, arr0, arr1, arr2, arr3) {
            var self = this;
            
            var validKey =
            PaCM.eachProperties(key, function (k, v) {
                return true;
            });
            
            var arrT = self.mergeArray(key, arr1, arr2, arr3);
                
            if (validKey) {
                self.eachArrayInvert(arr0, function (inx, e) {
                    var i = self.eachArray(arrT, function (inx2, e2) {
                        var valid = true;
                        self.eachArray(key, function (inx3, v) {
                            if (e[v] != e2[v])
                                valid = false;
                        });
                        if (valid === true) {
                            return inx2;
                        }
                    });
                    if (i != null) {
                        arr0[inx] = arrT[i];
                        arrT.splice(i, 1);
                    } else {
                        arr0.splice(inx, 1);
                    }
                });
                self.eachArrayInvert(arrT, function (inx, e) {
                    var i = self.eachArray(arr0, function (inx2, e2) {
                        var valid = true;
                        self.eachArray(key, function (inx3, v) {
                            if (e[v] != e2[v])
                                valid = false;
                        });
                        if (valid === true) {
                            return inx2;
                        }
                    });
                    if (!(i)) {
                        arr0.push(e);
                    }
                    arrT.splice(inx, 1);
                });
            } else {
                self.eachArrayInvert(arr0, function (inx, e) {
                    var i = arrT.indexOf(e);
                    if (i >= 0) {
                        arrT.splice(i, 1);
                    } else {
                        arr0.splice(inx, 1);
                    }
                });
                self.eachArrayInvert(arrT, function (inx, e) {
                    var i = arr0.indexOf(e);
                    if (i < 0) {
                        arr0.push(e);
                    }
                    arrT.splice(inx, 1);
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
