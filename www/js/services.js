(function () {

angular.module('starter.services', [])

    .factory('guidGenerator', function () {

        var _s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        
        return {
            new: function () {
                return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + _s4() + _s4();
            }
        };
    })
    
    .factory('dbContext', function ($http, guidGenerator) {
        
        var addressServer = 'http://192.168.0.12:57080/'; //'http://localhost:8100/api/'; //
        var tablesForImport = [
            'AppSettings', 'AppFiles', 'AppKeys', 'AppUsers', 'CfgCountries', 'CfgStates', 'CfgCities', 'CfgColors', 'CfgIdentityTypes', 'CfgCompany', 'CfgCustomers',
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntConnectorTypes', 'MntConnectors', 'MntBatteryTypes', 'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntArticles', 'MntDiagnosticTypes', 'MntDiagnostics', 'MntCheckList', 'MntAssemblyStatus', 'MntAssemblies', 'MntMaintenanceStatus', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
        ];
        var tablesForExport = [
            'AppFiles',
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntAssemblies', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
        ];
        var tablesInheritedOfMntObjects = [
            'MntBatteries', 'MntChargers'
        ];
        
        return {
            beginTransaction: function (scope, onSuccess, onError, debugMode) {
                
                var _sqlError = null;
                var _onSuccess = function () {
                    if (_sqlError) {
                        _onError(_sqlError);
                    } else {
                        if (debugMode >= 4)
                            console.info("Successful transaction");
                        
                        if (PaCM.isFunction(onSuccess))
                            onSuccess();
                    }
                };
                var _onError = function (sqlError) {
                    if (debugMode >= 1)
                        console.error("Failed transaction", sqlError);
                    
                    if (PaCM.isFunction(onError)) {
                        onError(sqlError);
                    } else {
                        throw sqlError;
                    }
                };
                
                var db = window.openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
                db.transaction(function (tx) {
                    scope({
                        executeSql: function (sqlCommand, sqlParameters, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            var _onSuccessCommand = function (tx1, sqlResultSet) {
                                if (debugMode >= 4)
                                    console.info(new Date(), sqlCommand, sqlParameters, sqlResultSet);
                                
                                if (PaCM.isFunction(onSuccessCommand))
                                    onSuccessCommand(self, sqlResultSet);
                            };
                            var _onErrorCommand = function (tx1, sqlError) {
                                if (debugMode >= 1)
                                    console.error(new Date(), sqlCommand, sqlParameters, sqlError);
                                
                                _sqlError = null;
                                if (PaCM.isFunction(onErrorCommand))
                                    onErrorCommand(self, sqlError);
                                else
                                    _sqlError = sqlError;
                            };
                            
                            tx.executeSql(sqlCommand, sqlParameters, _onSuccessCommand, _onErrorCommand);
                            
                            return self;
                        },
                        executeMultiSql: function (sqlCommands, onSuccessIterator, onSuccellCommands, onErrorCommands) {
                            var self = this;

                            if (sqlCommands && sqlCommands.length > 0) {
                                var _sqlCommands = sqlCommands.reverse();
                                
                                var _buildFnc = null;
                                if (PaCM.isFunction(onSuccessIterator)) {
                                    _buildFnc = function (sqlCommand, nextFnc) {
                                        return function (tx1, sqlResultSet1) {
                                            onSuccessIterator(tx1, sqlResultSet1);
                                            tx1.executeSql(sqlCommand, null, nextFnc, onErrorCommands);
                                        };
                                    }
                                } else {
                                    _buildFnc = function (sqlCommand, nextFnc) {
                                        return function (tx1, sqlResultSet1) {
                                            tx1.executeSql(sqlCommand, null, nextFnc, onErrorCommands);
                                        };
                                    }
                                }
                                
                                var sqlFncs = [];
                                for (var i = 0; i < _sqlCommands.length; i++) {
                                    var sqlCmd = _sqlCommands[i];

                                    if (i > 0 && i < _sqlCommands.length - 1) {
                                        sqlFncs.push(_buildFnc(sqlCmd, sqlFncs[i - 1]));
                                    }
                                    else if (i == (_sqlCommands.length - 1)) {
                                        self.executeSql(sqlCmd, null, sqlFncs[i - 1], onErrorCommands);
                                    }
                                    else if (i == 0) {
                                        sqlFncs.push(_buildFnc(sqlCmd, function (tx1, sqlResultSet1) {
                                            if (PaCM.isFunction(onSuccessIterator))
                                                onSuccessIterator(tx1, sqlResultSet1);
                                            if (PaCM.isFunction(onSuccellCommands))
                                                onSuccellCommands(tx1);
                                        }));
                                    }
                                }
                            } else {
                                self.executeSql("SELECT 1", null, onSuccellCommands, onErrorCommands);
                            }
                            
                            return self;
                        },
                        createTable: function (table, fields, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var arrFields = [];
                            PaCM.eachArray(fields, function (inx, f) {
                                var s = '[' + f.name + ']'
                                    + (f.type ? ' ' + f.type : '')
                                    + (f.required ? ' NOT NULL' : ' NULL')
                                    + (f.primaryKey ? ' PRIMARY KEY' : '')
                                    + (f.autoIncrement ? ' AUTOINCREMENT' : '')
                                    + (f.unique ? ' UNIQUE' : '')
                                    + (f.default ? ' ' + f.default : '');
                                arrFields.push(s);
                            });

                            var sqlCommand = 'CREATE TABLE ' + table + ' (@fields)'
                                .replace('@fields', arrFields.join(', '));

                            delete arrFields;

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
                            
                            var parameters = null;
                            var sqlCommand = 'SELECT * FROM ' + table;
                            if (options) {
                                if (options.fields) {
                                    sqlCommand = sqlCommand.replace('*', options.fields);
                                }
                                if (options.where) {
                                    sqlCommand += ' WHERE ' + options.where.conditions;
                                    if (options.where.parameters
                                     && options.where.parameters.length > 0) {
                                        parameters = options.where.parameters;
                                    }
                                }
                                if (options.orderBy) {
                                    sqlCommand += ' ORDER BY ' + options.orderBy;
                                }
                                if (options.limit) {
                                    sqlCommand += ' LIMIT ' + options.limit;
                                }
                            }
                            
                            self.executeSql(sqlCommand, parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        first: function (table, options, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            options = options || {};
                            options.limit = 1;
                            
                            self.select(table, options, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        insert: function (table, values, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            if (tablesInheritedOfMntObjects.indexOf(table) < 0) {
                                values.Guid = values.Guid || guidGenerator.new();
                                values.LastModified = values.LastModified || new Date();
                            }

                            var parameters = [];
                            var arrFields = [];
                            var parFields = [];
                            for (var val in values) {
                                if (values.hasOwnProperty(val)) {
                                    arrFields.push(val);
                                    parFields.push('?');
                                    if (typeof(values[val]) === 'string' && values[val].indexOf('/Date(') >= 0) {
                                        parameters.push(new Date(parseInt(values[val].replace('/Date(', '').replace(')/', ''))));
                                    } else {
                                        parameters.push(values[val]);
                                    }
                                }
                            }

                            var sqlStatement = 'INSERT INTO ' + table + ' ([@fields]) VALUES (@values)'
                                .replace('@fields', arrFields.join('], ['))
                                .replace('@values', parFields.join(', '));

                            delete arrFields;
                            delete parFields;

                            self.executeSql(sqlStatement, parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        update: function (table, values, where, parameters, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            if (tablesInheritedOfMntObjects.indexOf(table) < 0) {
                                values.Guid = values.Guid || guidGenerator.new();
                                values.LastModified = new Date();
                            }

                            var _parameters = [];
                            var arrFields = [];
                            for (var val in values) {
                                if (values.hasOwnProperty(val)) {
                                    arrFields.push('[' + val + ']=?');
                                    if (typeof(values[val]) === 'string' && values[val].indexOf('/Date(') >= 0) {
                                        _parameters.push(new Date(parseInt(values[val].replace('/Date(', '').replace(')/', ''))));
                                    } else {
                                        _parameters.push(values[val]);
                                    }
                                }
                            }

                            var sqlStatement = 'UPDATE ' + table + ' SET ' + arrFields.join(', ');
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }
                            
                            PaCM.eachArray(parameters, function (inx, p) {
                                _parameters.push(p);
                            });

                            delete arrFields;

                            self.executeSql(sqlStatement, _parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        delete: function (table, where, parameters, onSuccessCommand, onErrorCommand) {
                            var self = this;

                            var _parameters = [];
                            var sqlStatement = 'DELETE FROM ' + table;
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }
                            
                            PaCM.eachArray(parameters, function (inx, p) {
                                _parameters.push(p);
                            });

                            self.executeSql(sqlStatement, _parameters, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        }
                    });
                }, _onError, _onSuccess);
            },
            installDatabase: function (onSuccess, onError, debugMode) {
                var self = this;
                
                var fnc01 = function (tx) {
                    tx.executeSql('SELECT name FROM sqlite_master WHERE type="table" and (name like "App%" or name like "Cfg%" or name like "Mnt%")', null, fnc02);
                };
                var fnc02 = function (tx, sqlResultSet) {
                    var sqlCommands = [];
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sqlCommands.push('DROP TABLE ' + r.name);
                    });
                    tx.executeMultiSql(sqlCommands, null, fnc03);
                };
                var fnc03 = function (tx, sqlResultSet) {
                    var sqlCommands = [
                        'create table AppSettings ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, SMTPServerDomain TEXT, SMTPServerHost TEXT not null, SMTPServerPort INT not null, SMTPServerAccount TEXT not null, SMTPServerPassword TEXT not null, SMTPServerEnableSsl BOOL not null )',
                        'create table AppFiles ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, LocalName TEXT not null, Name TEXT not null, Extension TEXT, Size INT not null, MIMEType TEXT, Encoding TEXT not null )',
                        'create table AppKeys ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Salt TEXT not null, Hash TEXT not null )',
                        'create table AppUsers ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Username TEXT not null, FirstName TEXT not null, LastName TEXT not null, EmailAddress TEXT not null, Administrator BOOL not null, Enabled BOOL not null, PasswordId BIGINT not null, constraint FK_User_PasswordId foreign key (PasswordId) references AppKeys )',
                        'create table AppUserSessions ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Session TEXT not null, Host TEXT not null, Agent TEXT not null, LocalAddress TEXT not null, UserAddress TEXT not null, Started DATETIME not null, Ended DATETIME, UserId BIGINT not null, constraint FK_UserSession_UserId foreign key (UserId) references AppUsers )',
                        'create table CfgCountries ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )',
                        'create table CfgStates ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, CountryId BIGINT not null, constraint FK_State_CountryId foreign key (CountryId) references CfgCountries )',
                        'create table CfgCities ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, StateId BIGINT not null, constraint FK_City_StateId foreign key (StateId) references CfgStates )',
                        'create table CfgColors ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, HEX TEXT, RGB TEXT )',
                        'create table CfgIdentityTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, ShortName TEXT not null )',
                        'create table CfgCompany ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, WebSite TEXT, Slogan TEXT, IdentityTypeId BIGINT not null, CityId BIGINT not null, LogoId BIGINT, constraint FK_Company_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Company_CityId foreign key (CityId) references CfgCities, constraint FK_Company_LogoId foreign key (LogoId) references AppFiles )',
                        'create table CfgCustomers ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT, PostalCode TEXT, PhoneNumber TEXT, WebSite TEXT, ContactName TEXT, ContactEmailAddress TEXT, Comments TEXT, Enabled BOOL not null, IdentityTypeId BIGINT not null, CityId BIGINT not null, constraint FK_Customer_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Customer_CityId foreign key (CityId) references CfgCities )',
                        'create table MntMachineTrademarks ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )',
                        'create table MntMachineModels ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, CompartmentLength NUMERIC, CompartmentWidth NUMERIC, CompartmentHeight NUMERIC, TrademarkId BIGINT not null, constraint FK_MachineModel_TrademarkId foreign key (TrademarkId) references MntMachineTrademarks )',
                        'create table MntMachines ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Serial TEXT, CustomerReference TEXT, ModelId BIGINT not null, CustomerId BIGINT not null, constraint FK_Machine_ModelId foreign key (ModelId) references MntMachineModels, constraint FK_Machine_CustomerId foreign key (CustomerId) references CfgCustomers )',
                        'create table MntConnectorTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, ColorRequired BOOL not null, ImageId BIGINT not null, constraint FK_ConnectorType_ImageId foreign key (ImageId) references AppFiles )',
                        'create table MntConnectors ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, TypeId BIGINT not null, constraint FK_Connector_TypeId foreign key (TypeId) references MntConnectorTypes )',
                        'create table MntBatteryTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Voltage INT not null, NumberOfCells INT not null )',
                        'create table MntObjectTrademarks ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )',
                        'create table MntObjectModels ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, TrademarkId BIGINT not null, constraint FK_ObjectTypeModel_TrademarkId foreign key (TrademarkId) references MntObjectTrademarks )',
                        'create table MntObjects ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Serial TEXT, CustomerReference TEXT, Enabled BOOL not null, ModelId BIGINT not null, CustomerId BIGINT not null, constraint FK_ObjectType_ModelId foreign key (ModelId) references MntObjectModels, constraint FK_ObjectType_CustomerId foreign key (CustomerId) references CfgCustomers )',
                        'create table MntBatteries ( Id BIGINT not null, Amperage TEXT not null, StandardBox BOOL not null, Cover BOOL not null, DrainHoles BOOL not null, MinimunWeight NUMERIC, MaximunWeight NUMERIC, Length NUMERIC, Width NUMERIC, BoxHeight NUMERIC, HandleHeight NUMERIC, TypeId BIGINT not null, ConnectorId BIGINT not null, ConnectorColorId BIGINT, primary key (Id), constraint FKF520AC824409B984 foreign key (Id) references MntObjects, constraint FK_Battery_TypeId foreign key (TypeId) references MntBatteryTypes, constraint FK_Battery_ConnectorId foreign key (ConnectorId) references MntConnectors, constraint FK_Battery_ConnectorColorId foreign key (ConnectorColorId) references CfgColors )',
                        'create table MntChargers ( Id BIGINT not null, Voltage TEXT not null, Amperage TEXT not null, primary key (Id), constraint FKB35EAA924409B984 foreign key (Id) references MntObjects )',
                        'create table MntCells ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, "Order" INT not null, BatteryId BIGINT not null, constraint FK_Cell_BatteryId foreign key (BatteryId) references MntBatteries )',
                        'create table MntArticles ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, InventoryCode TEXT, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, CorrectiveMaintenanceEnabled BOOL not null )',
                        'create table MntDiagnosticTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )',
                        'create table MntDiagnostics ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, TypeId BIGINT not null, constraint FK_Diagnostic_TypeId foreign key (TypeId) references MntDiagnosticTypes )',
                        'create table MntCheckList ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, "Order" INT not null, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, DiagnosticTypeId BIGINT not null, constraint FK_Check_DiagnosticTypeId foreign key (DiagnosticTypeId) references MntDiagnosticTypes )',
                        'create table MntAssemblyStatus ( Id BIGINT not null, Guid TEXT not null, LastModified DATETIME not null, Description TEXT, primary key (Id) )',
                        'create table MntAssemblies ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Type TEXT not null, UniqueCode TEXT not null, Date DATETIME not null, Comments TEXT, CustomerId BIGINT not null, ObjectTypeId BIGINT not null, ExecutedById BIGINT not null, StatusId BIGINT not null, constraint FK_Assembly_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Assembly_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Assembly_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Assembly_StatusId foreign key (StatusId) references MntAssemblyStatus )',
                        'create table MntMaintenanceStatus ( Id BIGINT not null, Guid TEXT not null, LastModified DATETIME not null, Description TEXT, primary key (Id) )',
                        'create table MntMaintenances ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Type TEXT not null, UniqueCode TEXT not null, Date DATETIME not null, Preventive BOOL not null, Corrective BOOL not null, AcceptedBy TEXT not null, WorkToBeDone TEXT, TechnicalReport TEXT, CustomerId BIGINT not null, MachineId BIGINT, ObjectTypeId BIGINT not null, ExecutedById BIGINT not null, ExecutedByDigitalSignatureId BIGINT, AcceptedByDigitalSignatureId BIGINT, StatusId BIGINT not null, constraint FK_Maintenance_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Maintenance_MachineId foreign key (MachineId) references MntMachines, constraint FK_Maintenance_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Maintenance_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Maintenance_ExecutedByDigitalSignatureId foreign key (ExecutedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_AcceptedByDigitalSignatureId foreign key (AcceptedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_StatusId foreign key (StatusId) references MntMaintenanceStatus )',
                        'create table MntMaintenanceCheckList ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Comments TEXT, MaintenanceId BIGINT not null, CheckId BIGINT not null, DiagnosticId BIGINT not null, constraint FK_MaintenanceCheck_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_MaintenanceCheck_CheckId foreign key (CheckId) references MntCheckList, constraint FK_MaintenanceCheck_DiagnosticId foreign key (DiagnosticId) references MntDiagnostics )',
                        'create table MntCellsReviews ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Voltage NUMERIC not null, Density NUMERIC not null, Comments TEXT, CellId BIGINT not null, MaintenanceId BIGINT, AssemblyId BIGINT, constraint FK_CellReview_CellId foreign key (CellId) references MntCells, constraint FK_CellReview_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_CellReview_AssemblyId foreign key (AssemblyId) references MntAssemblies )',
                        'create table MntArticlesOutputs ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Quantity NUMERIC not null, ArticleId BIGINT not null, MaintenanceId BIGINT, AssemblyId BIGINT, constraint FK_ArticleOutput_ArticleId foreign key (ArticleId) references MntArticles, constraint FK_ArticleOutput_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_ArticleOutput_AssemblyId foreign key (AssemblyId) references MntAssemblies )'                        
                    ];
                    tx.executeMultiSql(sqlCommands);
                };
                
                self.beginTransaction(function (tx) {
                    fnc01(tx);
                }, onSuccess, onError, debugMode);
            },
            importData: function (onSuccess, onError, debugMode) {
                var self = this;
                
                var localData = [];
                
                var fnc01 = function (tx) {
                    var sqlCommands = [];
                    PaCM.eachArray(tablesForImport, function (inx, t) {
                        var command = null;
                        if (tablesInheritedOfMntObjects.indexOf(t) >= 0) {
                            command = 'SELECT "' + t + '" Tb, t.Id, p.LastModified FROM ' + t + ' t INNER JOIN MntObjects p ON p.Id = t.Id';
                        } else {
                            command = 'SELECT "' + t + '" Tb, t.Id, t.LastModified FROM ' + t + ' t';
                        }
                        sqlCommands.push(command);
                    });
                    tx.executeMultiSql(sqlCommands, function (tx1, sqlResultSet1) {
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            localData.push({
                                Tb: r.Tb,
                                Id: r.Id,
                                Lm: new Date(r.LastModified)
                            });
                        });
                    });
                };
                var fnc02 = function () {
                    $http.post(addressServer + 'SyncronizeData/GetData', {
                        tables: tablesForImport,
                        records: localData
                    })
                    .success(function (response) {
                        fnc03(response);
                    })
                    .error(function (response) {
                        onError(response);
                    });
                };
                var fnc03 = function (response) {
                    self.beginTransaction(function (tx) {
                        PaCM.eachArray(response.Records, function (inx, r) {
                            switch (r.Ac) {
                                case 'c':
                                    tx.insert(r.Tb, r.Dt);
                                    break;
                                case 'u':
                                    tx.update(r.Tb, r.Dt, "Id=" + r.Id);
                                    break;
                                case 'd':
                                    tx.delete(r.Tb, "Id=" + r.Id);
                                    break;
                                default:
                                    throw 'Action not support';
                            }
                        });
                    }, onSuccess, onError, debugMode);
                };
                
                self.beginTransaction(function (tx) {
                    fnc01(tx);
                }, fnc02, onError, debugMode);
            },
            exportData: function (onSuccess, onError, debugMode) {
                
            }
        };
    })
    
    .factory('dbSelects', function (dbContext) {
        
        var _entities = {
            Settings: 'AppSettings',
            File: 'AppFiles',
            Key: 'AppKeys',
            User: 'AppUsers',
            UserSession: 'AppUserSessions',
            Country: 'CfgCountries',
            State: 'CfgStates',
            City: 'CfgCities',
            Color: 'CfgColors',
            IdentityType: 'CfgIdentityTypes',
            Company: 'CfgCompany',
            Customer: 'CfgCustomers',
            MachineTrademark: 'MntMachineTrademarks',
            MachineModel: 'MntMachineModels',
            Machine: 'MntMachines',
            ConnectorType: 'MntConnectorTypes',
            Connector: 'MntConnectors',
            BatteryType: 'MntBatteryTypes',
            ObjectTypeTrademark: 'MntObjectTrademarks',
            ObjectTypeModel: 'MntObjectModels',
            ObjectType: 'MntObjects',
            Battery: 'MntBatteries',
            Cell: 'MntCells',
            Charger: 'MntChargers',
            Article: 'MntArticles',
            DiagnosticType: 'MntDiagnosticTypes',
            Diagnostic: 'MntDiagnostics',
            Check: 'MntCheckList',
            AssemblyStatus: 'MntAssemblyStatus',
            Assembly: 'MntAssemblies',
            MaintenanceStatus: 'MntMaintenanceStatus',
            Maintenance: 'MntMaintenances',
            MaintenanceCheck: 'MntMaintenanceCheckList',
            CellReview: 'MntCellsReviews',
            ArticleOutput: 'MntArticlesOutputs'
        };
        
        var _queries = {
            Battery: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId] FROM MntBatteries r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Charger: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId] FROM MntChargers  r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Machine: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || r.[Serial], '') || IFNULL(' / # Interno: ' || r.[CustomerReference], '')) [Description], m.[TrademarkId], m.[CompartmentLength], m.[CompartmentWidth], m.[CompartmentHeight] FROM MntMachines r INNER JOIN MntMachineModels m ON r.ModelId = m.Id INNER JOIN MntMachineTrademarks t ON t.Id = m.TrademarkId"
        };
        
        return {
            get: function (entity, id, onSuccess, onErrror, debugMode) {
                var sqlQuery = null;
                if (PaCM.isDefined(_queries[entity])) {
                    sqlQuery = _queries[entity];
                } else {
                    sqlQuery = 'SELECT r.* FROM ' + _entities[entity] + ' r';
                }
                sqlQuery += ' WHERE r.Id = ?';
                
                dbContext.beginTransaction(function (tx) {
                    tx.executeSql(sqlQuery, [ id ], function (tx1, sqlResultSet1) {
                        if (PaCM.isFunction(onSuccess))
                            onSuccess(sqlResultSet1);
                    });
                }, null, onErrror, debugMode);
            },
            list: function (entity, onSuccess, onErrror, debugMode) {
                var sqlQuery = null;
                if (PaCM.isDefined(_queries[entity])) {
                    sqlQuery = _queries[entity];
                } else {
                    sqlQuery = 'SELECT r.* FROM ' + _entities[entity] + ' r';
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.executeSql(sqlQuery, null, function (tx1, sqlResultSet1) {
                        if (PaCM.isFunction(onSuccess))
                            onSuccess(sqlResultSet1);
                    });
                }, null, onErrror, debugMode);
            },
            find: function (entity, where, parameters, onSuccess, onErrror, debugMode) {
                var sqlQuery = null;
                if (typeof(_queries[entity]) === 'undefined') {
                    sqlQuery = 'SELECT r.* FROM ' + _entities[entity] + ' r';
                } else {
                    sqlQuery = _queries[entity];
                }
                sqlQuery += ' WHERE ' + where;
                
                dbContext.beginTransaction(function (tx) {
                    tx.executeSql(sqlQuery, parameters, function (tx1, sqlResultSet1) {
                        if (PaCM.isFunction(onSuccess))
                            onSuccess(sqlResultSet1);
                    });
                }, null, onErrror, debugMode);
            }
        };
        
    });
    
})();
