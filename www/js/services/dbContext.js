
// Este servicio permite leer y guardar datos en una base de datos local
// Tambien permite sincronizar información con el servidor

(function () {
    
    PaCM.services.factory('dbContext', function () {

        var db = null;
        var loadDatabase = function () {
            if (db === null) {
                db = window.openDatabase('mydb', '1.0', 'PaCM_DB', 25 * 1024 * 1024 /* 25Mb */);
            }            
        };
        
        return {
            beginTransaction: function (scope, onSuccess, onError, debugMode) {
                
                var _sqlError = null;
                var _onSuccess = function () {
                    if (_sqlError) {
                        _onError(_sqlError);
                    } else {
                        _onSuccess = null;
                        _onError = null;

                        if (debugMode >= 3)
                            console.info('Successful transaction');
                        
                        if (PaCM.isFunction(onSuccess))
                            onSuccess();
                    }
                };
                var _onError = function (sqlError) {
                    _sqlError = null;
                    _onSuccess = null;
                    _onError = null;

                    if (debugMode >= 1)
                        console.error('Failed transaction', sqlError);
                    
                    if (PaCM.isFunction(onError)) {
                        onError(sqlError);
                    } else {
                        throw sqlError;
                    }
                };
                
                loadDatabase();
                db.transaction(function (tx) {
                    scope({
                        executeSql: function (sqlCommand, sqlParameters, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var _onSuccessCommand = function (tx1, sqlResultSet) {
                                _onSuccessCommand = null;
                                _onErrorCommand = null;

                                if (debugMode >= 3)
                                    console.info(new Date(), sqlCommand, sqlParameters, sqlResultSet);
                                
                                if (PaCM.isFunction(onSuccessCommand)) {
                                    try {
                                        onSuccessCommand(self, sqlResultSet);
                                    }
                                    catch (err) {
                                        if (PaCM.isFunction(onErrorCommand))
                                            onErrorCommand(self, err);
                                        else
                                            _sqlError = err; 
                                    }
                                }
                            };
                            var _onErrorCommand = function (tx1, sqlError) {
                                _onSuccessCommand = null;
                                _onErrorCommand = null;

                                if (debugMode >= 1)
                                    console.error(new Date(), sqlCommand, sqlParameters, sqlError);
                                
                                if (PaCM.isFunction(onErrorCommand))
                                    onErrorCommand(self, sqlError);
                                else
                                    _sqlError = sqlError;
                            };
                            
                            PaCM.eachArray(sqlParameters, function (inx, p) {
                                if (PaCM.isDate(p)) {
                                    sqlParameters[inx] = p.toISOString();
                                }
                            });
                            
                            tx.executeSql(sqlCommand, sqlParameters, _onSuccessCommand, _onErrorCommand);
                            
                            return self;
                        },
                        executeMultiSql: function (sqlCommands, onSuccessIterator, onSuccellCommands, onErrorCommands) {
                            var self = this;

                            if (sqlCommands && sqlCommands.length > 0) {
                                var _buildFnc = null;
                                if (PaCM.isFunction(onSuccessIterator)) {
                                    _buildFnc = function (sqlCommand, nextFnc) {
                                        return function (tx1) {
                                            tx1.executeSql(sqlCommand, null, function (tx2, sqlResultSet2) {
                                                onSuccessIterator(tx2, sqlResultSet2);
                                                nextFnc(tx2);
                                            }, onErrorCommands);
                                        };
                                    }
                                } else {
                                    _buildFnc = function (sqlCommand, nextFnc) {
                                        return function (tx1) {
                                            tx1.executeSql(sqlCommand, null, nextFnc, onErrorCommands);
                                        };
                                    }
                                }

                                var sqlFncs = [];
                                PaCM.eachArrayInvert(sqlCommands, function (inx, c) {
                                    // Todos menos el último
                                    if (inx < (sqlCommands.length - 1)) {
                                        sqlFncs.push(_buildFnc(c, sqlFncs[sqlFncs.length - 1]));
                                    }
                                    //Último (primera función en la pila, última en ejecutarse)
                                    else {
                                        sqlFncs.push(_buildFnc(c, function (tx1) {
                                            if (PaCM.isFunction(onSuccellCommands))
                                                onSuccellCommands(tx1);
                                        }));
                                    }
                                });
                                
                                _buildFnc = null;
                                self.executeSql('SELECT 1', null, sqlFncs[sqlFncs.length - 1], onErrorCommands);
                                sqlFncs.length = 0; sqlFncs = null;
                            } else {
                                throw 'sqlCommands: Argument is not valid';
                            }
                            
                            return self;
                        },
                        createTable: function (table, fields, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var arrFields = [];
                            PaCM.eachArray(fields, function (inx, f) {
                                var s = '[' + f.name + ']'
                                    + (f.type ? ' ' + f.type : PaCM.getStringEmpty())
                                    + (f.required ? ' NOT NULL' : ' NULL')
                                    + (f.primaryKey ? ' PRIMARY KEY' : PaCM.getStringEmpty())
                                    + (f.autoIncrement ? ' AUTOINCREMENT' : PaCM.getStringEmpty())
                                    + (f.unique ? ' UNIQUE' : PaCM.getStringEmpty())
                                    + (f.default ? ' ' + f.default : PaCM.getStringEmpty());
                                arrFields.push(s);
                            });

                            var sqlCommand = 'CREATE IF NOT EXISTS TABLE ' + table + ' (' + arrFields.join(', ') + ')';
                            arrFields.length = 0; arrFields = null;

                            self.executeSql(sqlCommand, null, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        dropTable: function (table, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var sqlCommand = 'DROP TABLE IF EXISTS ' + table;
                            
                            self.executeSql(sqlCommand, null, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        select: function (table, options, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var _parameters = [];
                            var sqlCommand = 'SELECT * FROM ' + table + ' r ';
                            if (options) {
                                if (options.select) {
                                    sqlCommand = options.select;
                                }
                                else if (options.fields) {
                                    sqlCommand = sqlCommand.replace('SELECT * FROM', 'SELECT ' + options.fields + ' FROM');
                                }
                                if (options.where) {
                                    if (PaCM.isString(options.where)) {
                                        sqlCommand += ' WHERE ' + options.where;
                                    } else if (PaCM.isObject(options.where)) {
                                        var fields = [];
                                        PaCM.eachProperties(options.where, function (key, value) {
                                            fields.push(key + ' = ?');
                                            _parameters.push(value);
                                        });
                                        if (fields.length > 0) {
                                            sqlCommand += ' WHERE ' + fields.join(' AND ');
                                        }
                                        fields.length = 0; fields = null;
                                    } else {
                                        throw 'options.where: Argument is not valid';
                                    }
                                }
                                if (options.parameters) {
                                    PaCM.eachArray(options.parameters, function (inx, p) {
                                        _parameters.push(p);
                                    });
                                }
                                if (options.orderBy) {
                                    sqlCommand += ' ORDER BY ' + options.orderBy;
                                }
                                if (options.limit) {
                                    sqlCommand += ' LIMIT ' + options.limit;
                                }
                            }
                            
                            if (_parameters.length == 0)
                                _parameters = null;
                            
                            self.executeSql(sqlCommand, _parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        first: function (table, options, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            options = (options) ? options : {};
                            options.limit = 1;
                            
                            self.select(table, options, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        insert: function (table, values, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var parameters = [];
                            var arrFields = [];
                            var parFields = [];
                            PaCM.eachProperties(values, function (key, val) {
                                arrFields.push(key);
                                parFields.push('?');
                                var date = PaCM.parseDateString(val);
                                if (date) {
                                    parameters.push(date);
                                } else {
                                    parameters.push(val);
                                }
                            });

                            var sqlStatement = 'INSERT INTO ' + table + ' ([' + arrFields.join('], [') + ']) VALUES (' + parFields.join(', ') + ')';
                            arrFields.length = 0; arrFields = null;
                            parFields.length = 0; parFields = null;

                            self.executeSql(sqlStatement, parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        update: function (table, values, where, parameters, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var _parameters = [];
                            var arrFields = [];
                            PaCM.eachProperties(values, function (key, val) {
                                arrFields.push('[' + key + '] = ?');
                                var date = PaCM.parseDateString(val);
                                if (date) {
                                    _parameters.push(date);
                                } else {
                                    _parameters.push(val);
                                }
                            });

                            var sqlStatement = 'UPDATE ' + table + ' SET ' + arrFields.join(', ');
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }
                            arrFields.length = 0; arrFields = null;
                            
                            PaCM.eachArray(parameters, function (inx, p) {
                                _parameters.push(p);
                            });

                            if (_parameters.length == 0)
                                _parameters = null;

                            self.executeSql(sqlStatement, _parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        delete: function (table, where, parameters, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var sqlStatement = 'DELETE FROM ' + table;
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }

                            self.executeSql(sqlStatement, parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        }
                    });
                }, _onError, _onSuccess);
            }
        };
        
    });
    
})();
