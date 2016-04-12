
// Este servicio permite leer y guardar datos en una base de datos local
// Tambien permite sincronizar información con el servidor

(function () {
    
    PaCM.services.factory('dbContext', function () {

        var STRING_EMPTY = '';

        var _database = null;
        var getDatabase = function () {
            if (_database === null) {
                _database = window.openDatabase('mydb', '1.0', 'PaCM_DB', 25 * 1024 * 1024 /* 25Mb */);
            };
            return _database;
        };

        return {
            beginTransaction: function (scope, onSuccessTransaction, onErrorTransaction, debugMode) {
                
                var _sqlError = null;

                var callback = function (tx) {
                    scope({
                        executeSql: function (sqlCommand, sqlParameters, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var _onSuccessCommand = function (_tx, sqlResultSet) {
                                _onSuccessCommand = null;
                                _onErrorCommand = null;

                                if (debugMode >= 3)
                                    console.info(new Date(), sqlCommand, sqlParameters, sqlResultSet);
                                
                                if (PaCM.isFunction(onSuccessCommand)) {
                                    try {
                                        onSuccessCommand(self, sqlResultSet);
                                    } catch (ex) {
                                        _sqlError = ex;
                                        return true; //ROLLBACK   
                                    }
                                }
                            };

                            var _onErrorCommand = function (_tx, sqlError) {
                                _onSuccessCommand = null;
                                _onErrorCommand = null;

                                if (debugMode >= 1)
                                    console.error(new Date(), sqlCommand, sqlParameters, sqlError);
                                
                                if (PaCM.isFunction(onErrorCommand))
                                    return !(onErrorCommand(self, sqlError) === false); //ROLLBACK CONDITIONAL
                                else {
                                    _sqlError = sqlError;
                                    return true; //ROLLBACK
                                }
                            };
                            
                            if (sqlParameters) {
                                PaCM.eachArray(sqlParameters, function (inx, p) {
                                    if (PaCM.isDate(p)) {
                                        sqlParameters[inx] = p.toISOString();
                                    }
                                });
                            }

                            tx.executeSql(sqlCommand, sqlParameters, _onSuccessCommand, _onErrorCommand);
                        },
                        executeBacthSql: function (sqlCommands, onSuccessCommand, onSuccellCommands, onErrorCommands) {
                            var self = this;

                            if (PaCM.isArray(sqlCommands) && sqlCommands.length > 0) {
                                var _buildFnc = null;
                                if (PaCM.isFunction(onSuccessCommand)) {
                                    _buildFnc = function (sqlCommand, nextFnc) {
                                        return function (_self1) {
                                            _self1.executeSql(sqlCommand, null, function (_self2, sqlResultSet2) {
                                                onSuccessCommand(_self2, sqlResultSet2);
                                                nextFnc(_self2);
                                            }, onErrorCommands);
                                        };
                                    }
                                } else {
                                    _buildFnc = function (sqlCommand, nextFnc) {
                                        return function (_self1) {
                                            _self1.executeSql(sqlCommand, null, nextFnc, onErrorCommands);
                                        };
                                    }
                                }

                                var lastCommandInx = sqlCommands.length - 1;
                                var sqlFncs = [];
                                PaCM.eachArrayInvert(sqlCommands, function (inx, c) {
                                    // Todos menos el último
                                    if (inx < lastCommandInx) {
                                        sqlFncs.push(_buildFnc(c, sqlFncs[sqlFncs.length - 1]));
                                    }
                                    //Último (primera función en la pila, última en ejecutarse)
                                    else {
                                        sqlFncs.push(_buildFnc(c, function (_self1) {
                                            if (PaCM.isFunction(onSuccellCommands))
                                                onSuccellCommands(_self1);
                                        }));
                                    }
                                });
                                
                                _buildFnc = null;
                                self.executeSql('SELECT 1', null, sqlFncs[sqlFncs.length - 1], onErrorCommands);
                                sqlFncs.length = 0; sqlFncs = null;
                            } else {
                                throw 'sqlCommands: Argument is not valid';
                            }
                        },
                        createTable: function (table, fields, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var arrFields = [];
                            PaCM.eachArray(fields, function (inx, f) {
                                var s = '[' + f.name + ']'
                                    + (f.type ? ' ' + f.type : STRING_EMPTY)
                                    + (f.required ? ' NOT NULL' : ' NULL')
                                    + (f.primaryKey ? ' PRIMARY KEY' : STRING_EMPTY)
                                    + (f.autoIncrement ? ' AUTOINCREMENT' : STRING_EMPTY)
                                    + (f.unique ? ' UNIQUE' : STRING_EMPTY)
                                    + (f.default ? ' ' + f.default : STRING_EMPTY);
                                arrFields.push(s);
                            });

                            var sqlCommand = 'CREATE IF NOT EXISTS TABLE ' + table + ' (' + arrFields.join(', ') + ')';
                            arrFields.length = 0; arrFields = null;

                            self.executeSql(sqlCommand, null, onSuccessCommand, onErrorCommand);
                        },
                        dropTable: function (table, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var sqlCommand = 'DROP TABLE IF EXISTS ' + table;
                            
                            self.executeSql(sqlCommand, null, onSuccessCommand, onErrorCommand);
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
                            
                            if (_parameters.length === 0)
                                _parameters = null;
                            
                            self.executeSql(sqlCommand, _parameters, onSuccessCommand, onErrorCommand);
                        },
                        first: function (table, options, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            options = (options) ? options : {};
                            options.limit = 1;
                            
                            self.select(table, options, onSuccessCommand, onErrorCommand);
                        },
                        insert: function (table, values, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var parameters = [];
                            var arrFields = [];
                            var parFields = [];
                            PaCM.eachProperties(values, function (key, val) {
                                arrFields.push(key);
                                parFields.push('?');
                                parameters.push(val);
                            });

                            var sqlStatement = 'INSERT INTO ' + table + ' ([' + arrFields.join('], [') + ']) VALUES (' + parFields.join(', ') + ')';
                            arrFields.length = 0; arrFields = null;
                            parFields.length = 0; parFields = null;

                            self.executeSql(sqlStatement, parameters, onSuccessCommand, onErrorCommand);
                        },
                        update: function (table, values, where, parameters, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var _parameters = [];
                            var arrFields = [];
                            PaCM.eachProperties(values, function (key, val) {
                                arrFields.push('[' + key + '] = ?');
                                _parameters.push(val);
                            });

                            var sqlStatement = 'UPDATE ' + table + ' SET ' + arrFields.join(', ');
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }
                            arrFields.length = 0; arrFields = null;
                            
                            if (parameters) {
                                PaCM.eachArray(parameters, function (inx, p) {
                                    _parameters.push(p);
                                });
                            }

                            if (_parameters.length === 0)
                                _parameters = null;

                            self.executeSql(sqlStatement, _parameters, onSuccessCommand, onErrorCommand);
                        },
                        delete: function (table, where, parameters, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var sqlStatement = 'DELETE FROM ' + table;
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }

                            self.executeSql(sqlStatement, parameters, onSuccessCommand, onErrorCommand);
                        }
                    });
                };

                var errorCallback = function (sqlError) {
                    _sqlError = null;
                    successCallback = null;
                    errorCallback = null;

                    if (debugMode >= 1)
                        console.error(new Date(), 'Failed transaction', sqlError);
                    
                    if (PaCM.isFunction(onErrorTransaction)) {
                        onErrorTransaction(sqlError);
                    } else {
                        throw sqlError;
                    }
                };

                var successCallback = function () {
                    if (_sqlError) {
                        errorCallback(_sqlError);
                    } else {
                        successCallback = null;
                        errorCallback = null;

                        if (debugMode >= 3)
                            console.info(new Date(), 'Successful transaction');
                        
                        if (PaCM.isFunction(onSuccessTransaction))
                            onSuccessTransaction();
                    }
                };

                getDatabase().transaction(callback, errorCallback, successCallback);

            }
        };
        
    });
    
})();
