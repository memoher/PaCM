(function () {

angular.module('starter.services', [])

    .factory('dbContext', function () {
        
        var debugEnabled = false;
        var databaseInst = window.openDatabase('mydb', '1.0', 'Test DB', 5 * 1024 * 1024);

        return {
            beginTransaction: function (callback) {
                debugEnabled = (window.debugMode);
                databaseInst.transaction(function (tx) {
                    callback({
                        executeSql: function (sqlStatement, parameters, successCallback, errorCallback) {
                            var self = this;

                            tx.executeSql(
                                sqlStatement, 
                                parameters, 
                                function (tx1, sqlResultSet) {
                                    if (debugEnabled)
                                        console.debug(new Date(), sqlStatement, parameters, sqlResultSet);
                                    if (successCallback)
                                        successCallback(sqlResultSet);
                                }, 
                                function (tx1, sqlError) {
                                    if (debugEnabled)
                                        console.debug(new Date(), sqlStatement, parameters, sqlError);
                                    if (errorCallback)
                                        errorCallback(sqlError);
                                    else
                                        throw sqlError.code + ': ' + sqlError.message;
                                });
                                
                            return self;
                        },
                        createTable: function (table, fields, options) {
                            var self = this;
                            
                            var successCallback = null;
                            var errorCallback = null;
                            
                            var arrFields = [];
                            for (var i = 0; i < fields.length; i++) {
                                var f = fields[i];
                                var s = f.name
                                    + (f.type ? ' ' + f.type : '')
                                    + (f.required ? ' NOT NULL' : ' NULL')
                                    + (f.primaryKey ? ' PRIMARY KEY' : '')
                                    + (f.autoIncrement ? ' AUTOINCREMENT' : '')
                                    + (f.unique ? ' UNIQUE' : '')
                                    + (f.default ? ' ' + f.default : '');
                                arrFields.push(s);
                            }

                            var sqlStatement = 'CREATE TABLE IF NOT EXISTS ' + table + ' (@fields)'
                                .replace('@fields', arrFields.join(', '));

                            delete arrFields;
                            
                            if (options) {
                                if (options.dropIfExist) {
                                    self.dropTable(table, options);
                                }
                                if (options.successCallback) {
                                    successCallback = options.successCallback;
                                }
                                if (options.errorCallback) {
                                    errorCallback = options.errorCallback;
                                }
                            }
                            
                            self.executeSql(sqlStatement, null, successCallback, errorCallback);
                                
                            return self;
                        },
                        dropTable: function (table, options) {
                            var self = this;
                            
                            var successCallback = null;
                            var errorCallback = null;
                            
                            var sqlStatement = 'DROP TABLE IF EXISTS ' + table;
                            
                            if (options) {
                                if (options.successCallback) {
                                    successCallback = options.successCallback;
                                }
                                if (options.errorCallback) {
                                    errorCallback = options.errorCallback;
                                }
                            }
                            
                            self.executeSql(sqlStatement, null, successCallback, errorCallback);
                                
                            return self;
                        },
                        select: function (table, options) {
                            var self = this;
                            
                            var parameters = null;
                            var successCallback = null;
                            var errorCallback = null;
                            
                            var sqlStatement = 'SELECT * FROM ' + table;
                            if (options) {
                                if (options.where) {
                                    sqlStatement += ' WHERE ' + options.where.conditions;
                                    if (options.where.parameters) {
                                        parameters = options.where.parameters;
                                    }
                                }
                                if (options.orderBy) {
                                    sqlStatement += ' ORDER BY ' + options.orderBy;
                                }
                                if (options.limit) {
                                    sqlStatement += ' LIMIT ' + options.limit;
                                }
                                if (options.successCallback) {
                                    successCallback = options.successCallback;
                                }
                                if (options.errorCallback) {
                                    errorCallback = options.errorCallback;
                                }
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        },
                        first: function (table, options) {
                            var self = this;
                            
                            options = options || {};
                            options.limit = 1;
                            
                            self.select(table, options);
                        },
                        insert: function (table, values, options) {
                            var self = this;
                            
                            var parameters = [];
                            var successCallback = null;
                            var errorCallback = null;
                            
                            var arrFields = [];
                            var parFields = [];
                            for (var val in values) {
                                if (values.hasOwnProperty(val)) {
                                    arrFields.push(val);
                                    parFields.push('?');
                                    parameters.push(values[val]);
                                }
                            }

                            var sqlStatement = 'INSERT INTO ' + table + ' (@fields) VALUES (@values)'
                                .replace('@fields', arrFields.join(', '))
                                .replace('@values', parFields.join(', '));

                            delete arrFields;
                            delete parFields;
                            
                            if (options) {
                                if (options.successCallback) {
                                    successCallback = options.successCallback;
                                }
                                if (options.errorCallback) {
                                    errorCallback = options.errorCallback;
                                }
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        },
                        update: function (table, values, options) {
                            var self = this;
                            
                            var parameters = [];
                            var successCallback = null;
                            var errorCallback = null;

                            var arrFields = [];
                            for (var val in values) {
                                if (values.hasOwnProperty(val)) {
                                    arrFields.push(val + '=?');
                                    parameters.push(values[val]);
                                }
                            }

                            var sqlStatement = 'UPDATE ' + table + ' SET ' + arrFields.join(', ');

                            delete arrFields;
                            
                            if (options) {
                                if (options.where) {
                                    sqlStatement += ' WHERE ' + options.where.conditions;
                                    if (options.where.parameters) {
                                        for (var i = 0; i < options.where.parameters.length; i++) {
                                            parameters.push(options.where.parameters[i]);
                                        }
                                    }
                                }
                                if (options.successCallback) {
                                    successCallback = options.successCallback;
                                }
                                if (options.errorCallback) {
                                    errorCallback = options.errorCallback;
                                }
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        },
                        delete: function (table, options) {
                            var self = this;
                            
                            var parameters = null;
                            var successCallback = null;
                            var errorCallback = null;

                            var sqlStatement = 'DELETE FROM ' + table;
                            if (options) {
                                if (options.where) {
                                    sqlStatement += ' WHERE ' + options.where.conditions;
                                    if (options.where.parameters) {
                                        parameters = options.where.parameters;
                                    }
                                }
                                if (options.successCallback) {
                                    successCallback = options.successCallback;
                                }
                                if (options.errorCallback) {
                                    errorCallback = options.errorCallback;
                                }
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        }
                    });
                });
            }
        };
        
    })

    .factory('entityService', function (dbContext) {
        
        return {
            
        };

    })
    
    .factory('synchronizeDataService', function ($http, dbContext) {
        
        //El proceso de sincronización, inicia subiendo los registros que no
        //tienen id, en un orden específico, todos los registros que suban sin
        //inconvenientes, obtendrán del servidor el respectivo id, y se
        //actualizarán los ids de los registros locales, esto aplica para una
        //lista reducida de tablas
        
        //Aquellas tablas que solo proveen información serán sincronizadas antes de
        //obtener los nuevos registros
        
        //Una vez los datos sean guardados, se procede a eliminar las mismas tablas
        //que previamente fueron sincronizadas, y se obtienen todos los datos
        //desde el servidor para guardarlos localmente
        
        var server = 'http://192.168.0.102:57080/';
        var tables = ['CfgCountries'];
        
        return {
            run: function () {
                dbContext.beginTransaction(function (tx) {
                    var tablesWithNewData = [];
                    for (var i = 0; i < tables.length; i++) {
                        var t = tables[i];
                        tx.select(t, {
                            where: { conditions: 'Id is null' }, 
                            successCallback: function (sqlResultSet) {
                                if (sqlResultSet.rows.length > 0) {
                                    tablesWithNewData.push(t);
                                    $http.post(server + t + 'ApiController/Upload', sqlResultSet.rows)
                                        .success(function (response) {
                                            console.debug(response);
//                                            for (var j = 0; j < sqlResultSet.rows.length; j++) {
//                                                var r = sqlResultSet.rows[j];
//                                            }
                                        });
                                }
                            }});
                    }
                });
            }
        };
        
    })

    .factory('Chats', function () {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
                id: 0,
                name: 'Ben Sparrow',
                lastText: 'You on your way?',
                face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
            }, {
                id: 1,
                name: 'Max Lynx',
                lastText: 'Hey, it\'s me',
                face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
            }, {
                id: 2,
                name: 'Adam Bradleyson',
                lastText: 'I should buy a boat',
                face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
            }, {
                id: 3,
                name: 'Perry Governor',
                lastText: 'Look at my mukluks!',
                face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
            }, {
                id: 4,
                name: 'Mike Harrington',
                lastText: 'This is wicked good ice cream.',
                face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
            }];

        return {
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    });
    
})();
