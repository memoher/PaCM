
// Este servicio permite leer y guardar datos en una base de datos local
// Tambien permite sincronizar información con el servidor

(function () {
    
    PaCM.servicesModule.factory('dbContext', function ($http, guidGenerator) {
        
        var addressServer = 'http://192.168.0.12:57080/'; //'http://localhost:8100/api/'; //
        var tablesForImport = [
            'AppSettings', 'AppFiles', 'AppKeys', 
            'CfgCountries', 'CfgStates', 'CfgCities', 'CfgColors', 'CfgIdentityTypes', 
            'CfgCompany', 'CfgCustomers', 'CfgCustomerBranches', 'AppUsers',
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntConnectorTypes', 'MntConnectors', 'MntBatteryTypes',
            'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntArticles', 'MntDiagnosticTypes', 'MntDiagnostics', 'MntCheckList', 'MntAssemblyStatus', 'MntMaintenanceStatus', 
            'MntAssemblies', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
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
        
        var eventsOnDataChanged = [];
        
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
                                
                                if (PaCM.isFunction(onSuccessCommand)) {
                                    try {
                                        onSuccessCommand(self, sqlResultSet);
                                    }
                                    catch (err) {
                                        _sqlError = null;
                                        if (PaCM.isFunction(onErrorCommand))
                                            onErrorCommand(self, err);
                                        else
                                            _sqlError = err; 
                                    }
                                }
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
                                
                                var _sqlCommands = sqlCommands.reverse();
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
                            var sqlCommand = 'SELECT * FROM ' + table + ' r ';
                            if (options) {
                                if (options.fields) {
                                    if (options.fields.indexOf(' FROM ') >= 0) {
                                        sqlCommand = options.fields;
                                    } else {
                                        sqlCommand = sqlCommand.replace('SELECT * FROM', 'SELECT ' + options.fields + ' FROM');
                                    }
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
                            
                            options = (options) ? options : {};
                            options.limit = 1;
                            
                            self.select(table, options, onSuccessCommand, onErrorCommand);
                            
                            return self;
                        },
                        insert: function (table, values, onSuccessCommand, onErrorCommand) {
                            var self = this;
                            
                            values.Id = (values.Id) ? values.Id : guidGenerator.new();
                            if (tablesInheritedOfMntObjects.indexOf(table) < 0) {
                                values.CreatedOn = (values.CreatedOn) ? values.CreatedOn : new Date();
                                values.LastModified = (values.LastModified) ? values.LastModified : new Date();
                                if (PaCM.isUndefined(values.ReplicationStatus)) {
                                    values.ReplicationStatus = 0;
                                }
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
                                values.LastModified = (values.LastModified) ? values.LastModified : new Date();
                                if (PaCM.isUndefined(values.ReplicationStatus)) {
                                    values.ReplicationStatus = 0;
                                }
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
                var fnc03 = function (tx) {
                    var sqlCommands = [
    'create table AppSettings ( Id TEXT not null, SMTPServerDomain TEXT, SMTPServerHost TEXT not null, SMTPServerPort INT not null, SMTPServerAccount TEXT not null, SMTPServerPassword TEXT not null, SMTPServerEnableSsl BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table AppFiles ( Id TEXT not null, LocalName TEXT not null, Name TEXT not null, Extension TEXT, Size INT not null, MIMEType TEXT, Encoding TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table AppKeys ( Id TEXT not null, Salt TEXT not null, Hash TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table CfgCountries ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table CfgStates ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CountryId TEXT not null, primary key (Id), constraint FK_State_CountryId foreign key (CountryId) references CfgCountries )',
    'create table CfgCities ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, StateId TEXT not null, primary key (Id), constraint FK_City_StateId foreign key (StateId) references CfgStates )',
    'create table CfgColors ( Id TEXT not null, Name TEXT not null, HEX TEXT, RGB TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table CfgIdentityTypes ( Id TEXT not null, Name TEXT not null, ShortName TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table CfgCompany ( Id TEXT not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, WebSite TEXT, Slogan TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, IdentityTypeId TEXT not null, CityId TEXT not null, LogoId TEXT, primary key (Id), constraint FK_Company_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Company_CityId foreign key (CityId) references CfgCities, constraint FK_Company_LogoId foreign key (LogoId) references AppFiles )',
    'create table CfgCustomers ( Id TEXT not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, WebSite TEXT, ContactName TEXT, ContactEmailAddress TEXT, Comments TEXT, Enabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, IdentityTypeId TEXT not null, CityId TEXT not null, primary key (Id), constraint FK_Customer_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Customer_CityId foreign key (CityId) references CfgCities )',
    'create table CfgCustomerBranches ( Id TEXT not null, Name TEXT not null, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, ContactName TEXT, ContactEmailAddress TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CustomerId TEXT not null, CityId TEXT not null, primary key (Id), constraint FK_BranchCustomer_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_BranchCustomer_CityId foreign key (CityId) references CfgCities )',
    'create table AppUsers ( Id TEXT not null, Username TEXT not null, FirstName TEXT not null, LastName TEXT not null, EmailAddress TEXT not null, Administrator BOOL not null, Enabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, PasswordId TEXT not null, CustomerId TEXT, primary key (Id), constraint FK_User_PasswordId foreign key (PasswordId) references AppKeys, constraint FK_User_CustomerId foreign key (CustomerId) references CfgCustomers )',
    'create table AppUserSessions ( Id TEXT not null, Session TEXT not null, Host TEXT not null, Agent TEXT not null, LocalAddress TEXT not null, UserAddress TEXT not null, Started DATETIME not null, Ended DATETIME, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, UserId TEXT not null, primary key (Id), constraint FK_UserSession_UserId foreign key (UserId) references AppUsers )',
    'create table MntMachineTrademarks ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntMachineModels ( Id TEXT not null, Name TEXT not null, CompartmentLength NUMERIC, CompartmentWidth NUMERIC, CompartmentHeight NUMERIC, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TrademarkId TEXT not null, primary key (Id), constraint FK_MachineModel_TrademarkId foreign key (TrademarkId) references MntMachineTrademarks )',
    'create table MntMachines ( Id TEXT not null, Serial TEXT, CustomerReference TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ModelId TEXT not null, CustomerId TEXT not null, primary key (Id), constraint FK_Machine_ModelId foreign key (ModelId) references MntMachineModels, constraint FK_Machine_CustomerId foreign key (CustomerId) references CfgCustomers )',
    'create table MntConnectorTypes ( Id TEXT not null, Name TEXT not null, ColorRequired BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ImageId TEXT not null, primary key (Id), constraint FK_ConnectorType_ImageId foreign key (ImageId) references AppFiles )',
    'create table MntConnectors ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TypeId TEXT not null, primary key (Id), constraint FK_Connector_TypeId foreign key (TypeId) references MntConnectorTypes )',
    'create table MntBatteryTypes ( Id TEXT not null, Voltage INT not null, NumberOfCells INT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntObjectTrademarks ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntObjectModels ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TrademarkId TEXT not null, primary key (Id), constraint FK_ObjectTypeModel_TrademarkId foreign key (TrademarkId) references MntObjectTrademarks )',
    'create table MntObjects ( Id TEXT not null, Serial TEXT, CustomerReference TEXT, Enabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ModelId TEXT not null, CustomerId TEXT not null, primary key (Id), constraint FK_ObjectType_ModelId foreign key (ModelId) references MntObjectModels, constraint FK_ObjectType_CustomerId foreign key (CustomerId) references CfgCustomers )',
    'create table MntBatteries ( Id TEXT not null, Amperage TEXT not null, StandardBox BOOL not null, Cover BOOL not null, DrainHoles BOOL not null, MinimunWeight NUMERIC, MaximunWeight NUMERIC, Length NUMERIC, Width NUMERIC, BoxHeight NUMERIC, HandleHeight NUMERIC, TypeId TEXT not null, ConnectorId TEXT not null, ConnectorColorId TEXT, primary key (Id), constraint FKF520AC824409B984 foreign key (Id) references MntObjects, constraint FK_Battery_TypeId foreign key (TypeId) references MntBatteryTypes, constraint FK_Battery_ConnectorId foreign key (ConnectorId) references MntConnectors, constraint FK_Battery_ConnectorColorId foreign key (ConnectorColorId) references CfgColors )',
    'create table MntChargers ( Id TEXT not null, Voltage TEXT not null, Amperage TEXT not null, primary key (Id), constraint FKB35EAA924409B984 foreign key (Id) references MntObjects )',
    'create table MntCells ( Id TEXT not null, "Order" INT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, BatteryId TEXT not null, primary key (Id), constraint FK_Cell_BatteryId foreign key (BatteryId) references MntBatteries )',
    'create table MntArticles ( Id TEXT not null, Name TEXT not null, InventoryCode TEXT, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, CorrectiveMaintenanceEnabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntDiagnosticTypes ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntDiagnostics ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TypeId TEXT not null, primary key (Id), constraint FK_Diagnostic_TypeId foreign key (TypeId) references MntDiagnosticTypes )',
    'create table MntCheckList ( Id TEXT not null, Name TEXT not null, "Order" INT not null, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, DiagnosticTypeId TEXT not null, primary key (Id), constraint FK_Check_DiagnosticTypeId foreign key (DiagnosticTypeId) references MntDiagnosticTypes )',
    'create table MntAssemblyStatus ( Id TEXT not null, Description TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntAssemblies ( Id TEXT not null, Type TEXT not null, UniqueCode TEXT not null, Date DATETIME not null, Comments TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CustomerId TEXT not null, BranchCustomerId TEXT, ObjectTypeId TEXT not null, ExecutedById TEXT not null, StatusId TEXT not null, primary key (Id), constraint FK_Assembly_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Assembly_BranchCustomerId foreign key (BranchCustomerId) references CfgCustomerBranches, constraint FK_Assembly_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Assembly_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Assembly_StatusId foreign key (StatusId) references MntAssemblyStatus )',
    'create table MntMaintenanceStatus ( Id TEXT not null, Description TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
    'create table MntMaintenances ( Id TEXT not null, Type TEXT not null, UniqueCode TEXT not null, Date DATETIME not null, Preventive BOOL not null, Corrective BOOL not null, AcceptedBy TEXT not null, WorkToBeDone TEXT, TechnicalReport TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CustomerId TEXT not null, BranchCustomerId TEXT, MachineId TEXT, ObjectTypeId TEXT not null, ExecutedById TEXT not null, ExecutedByDigitalSignatureId TEXT, AcceptedByDigitalSignatureId TEXT, StatusId TEXT not null, primary key (Id), constraint FK_Maintenance_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Maintenance_BranchCustomerId foreign key (BranchCustomerId) references CfgCustomerBranches, constraint FK_Maintenance_MachineId foreign key (MachineId) references MntMachines, constraint FK_Maintenance_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Maintenance_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Maintenance_ExecutedByDigitalSignatureId foreign key (ExecutedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_AcceptedByDigitalSignatureId foreign key (AcceptedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_StatusId foreign key (StatusId) references MntMaintenanceStatus )',
    'create table MntMaintenanceCheckList ( Id TEXT not null, Comments TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, MaintenanceId TEXT not null, CheckId TEXT not null, DiagnosticId TEXT not null, primary key (Id), constraint FK_MaintenanceCheck_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_MaintenanceCheck_CheckId foreign key (CheckId) references MntCheckList, constraint FK_MaintenanceCheck_DiagnosticId foreign key (DiagnosticId) references MntDiagnostics )',
    'create table MntCellsReviews ( Id TEXT not null, Voltage NUMERIC not null, Density NUMERIC not null, Comments TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CellId TEXT not null, MaintenanceId TEXT, AssemblyId TEXT, primary key (Id), constraint FK_CellReview_CellId foreign key (CellId) references MntCells, constraint FK_CellReview_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_CellReview_AssemblyId foreign key (AssemblyId) references MntAssemblies )',
    'create table MntArticlesOutputs ( Id TEXT not null, Quantity NUMERIC not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ArticleId TEXT not null, MaintenanceId TEXT, AssemblyId TEXT, primary key (Id), constraint FK_ArticleOutput_ArticleId foreign key (ArticleId) references MntArticles, constraint FK_ArticleOutput_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_ArticleOutput_AssemblyId foreign key (AssemblyId) references MntAssemblies )'
                    ];
                    tx.executeMultiSql(sqlCommands, null, fnc04);
                };
                var fnc04 = function () {
                    PaCM.eachArray(eventsOnDataChanged, function (inx, fnc) {
                        fnc();
                    });
                };
                
                self.beginTransaction(fnc01, onSuccess, onError, debugMode);
            },
            importData: function (onSuccess, onError, debugMode) {
                var self = this;
                
                var localData = [];
                var hasNewData = false;
                
                //Obtiene todos los registros con fecha mas reciente en el servidor
                
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
                                Lm: r.LastModified
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
                    .error(function (err) {
                        onError(err);
                    });
                };
                var fnc03 = function (response) {
                    self.beginTransaction(function (tx) {
                        PaCM.eachArray(response.Records, function (inx, r) {
                            switch (r.Ac) {
                                case 'c':
                                    if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                                        r.Dt.ReplicationStatus = 1;
                                    }
                                    tx.insert(r.Tb, r.Dt);
                                    hasNewData = true;
                                    break;
                                case 'u':
                                    if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                                        r.Dt.ReplicationStatus = 1;
                                    }
                                    tx.update(r.Tb, r.Dt, 'Id="' + r.Id + '"');
                                    hasNewData = true;
                                    break;
                                case 'd':
                                    tx.delete(r.Tb, 'Id="' + r.Id + '"');
                                    hasNewData = true;
                                    break;
                                default:
                                    throw 'Action not support';
                            }
                        });
                    }, fnc04, onError, debugMode);
                };
                var fnc04 = function () {
                    if (hasNewData === true) {
                        PaCM.eachArray(eventsOnDataChanged, function (inx, fnc) {
                            fnc();
                        });
                    }
                    onSuccess();
                };
                
                self.beginTransaction(fnc01, fnc02, onError, debugMode);
            },
            exportData: function (onSuccess, onError, debugMode) {
                var self = this;
                
                var localData = [];
                
                //Obtiene todos los registros donde ReplicationStatus sea igual a 0
                
                var fnc01 = function (tx) {
                    var sqlCommands = [];
                    PaCM.eachArray(tablesForExport, function (inx, t) {
                        var command = null;
                        if (tablesInheritedOfMntObjects.indexOf(t) >= 0) {
                            command = 'SELECT "' + t + '" Tb, t.* FROM ' + t + ' t INNER JOIN MntObjects p ON p.Id = t.Id WHERE p.ReplicationStatus = 0';
                        } else {
                            command = 'SELECT "' + t + '" Tb, t.* FROM ' + t + ' t WHERE t.ReplicationStatus = 0';
                        }
                        sqlCommands.push(command);
                    });
                    tx.executeMultiSql(sqlCommands, function (tx1, sqlResultSet1) {
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            var dt = { Tb: r.Tb, FS: {}, FI: {}, FN: {}, FD: {}, FB: {}, FO: {} };
                            delete r.Tb;
                            if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                                delete r.ReplicationStatus;
                            }
                            PaCM.eachProperties(r, function (key, val) {
                                if (PaCM.isString(val)) {
                                    dt.FS[key] = val;
                                } else if (PaCM.isInteger(val)) {
                                    dt.FI[key] = val;
                                } else if (PaCM.isNumber(val)) {
                                    dt.FN[key] = val;
                                } else if (PaCM.isDate(val)) {
                                    dt.FD[key] = val;
                                } else if (PaCM.isBoolean(val)) {
                                    dt.FB[key] = val;
                                } else if (val == null) {
                                    dt.FO[key] = val;
                                }
                            });
                            localData.push(dt);
                        });
                    });
                };
                var fnc02 = function () {
                    if (localData.length > 0) {
                        $http.post(addressServer + 'SyncronizeData/SetData', {
                            records: localData
                        })
                        .success(function (response) {
                            fnc03(response);
                        })
                        .error(function (err) {
                            onError(err);
                        });
                    } else {
                        onSuccess();
                    }
                };
                var fnc03 = function (response) {
                    self.beginTransaction(function (tx) {
                        PaCM.eachArray(localData, function (inx, r) {
                            if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                                tx.update(r.Tb, { ReplicationStatus: 1 }, 'Id="' + r.FS.Id + '"');
                            }
                        });
                    }, onSuccess, onError, debugMode);
                };
                
                self.beginTransaction(fnc01, fnc02, onError, debugMode);
            },
            onDataChanged: function (fnc) {
                if (PaCM.isFunction(fnc))
                    eventsOnDataChanged.push(fnc);
            }
        };
    });
    
})();