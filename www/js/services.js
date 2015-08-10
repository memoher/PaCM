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

        var addressServer = 'http://192.168.0.102:57080/';
        var _importTables = [
            'AppSettings', 'AppFiles', 'AppKeys', 'AppUsers', 'CfgCountries', 'CfgStates', 'CfgCities', 'CfgColors', 'CfgIdentityTypes', 'CfgCompany', 'CfgCustomers',
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntConnectorTypes', 'MntConnectors', 'MntBatteryTypes', 'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntArticles', 'MntDiagnosticTypes', 'MntDiagnostics', 'MntCheckList', 'MntAssemblyStatus', 'MntAssemblies', 'MntMaintenanceStatus', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
        ];
        var _exportTables = [
            'AppFiles',
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntAssemblies', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
        ];
        var _tablesInheritedOfMntObjects = [
            'MntBatteries', 'MntChargers'
        ];
        
        var _databaseInstance = null;
        var _openDatabase = function () {
            if (!_databaseInstance) {
                _databaseInstance = window.openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
            }
            return _databaseInstance;
        };
        
        return {
            beginTransaction: function(scope, debugMode) {
                debugMode = (debugMode === true);

                _openDatabase().transaction(function (tx) {
                    scope({
                        executeSql: function (sqlStatement, parameters) {
                            var self = this;

                            return new Promise(function (resolve, reject) {
                                tx.executeSql(
                                    sqlStatement, 
                                    parameters, 
                                    function (tx1, sqlResultSet) {
                                        if (debugMode)
                                            console.debug(new Date(), sqlStatement, parameters, sqlResultSet);
                                        resolve(sqlResultSet);
                                    }, 
                                    function (tx1, sqlError) {
                                        if (debugMode)
                                            console.debug(new Date(), sqlStatement, parameters, sqlError);
                                        reject(sqlError);
                                    });
                                });
                        },
                        createTable: function (table, fields) {
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

                            var sqlStatement = 'CREATE TABLE ' + table + ' (@fields)'
                                .replace('@fields', arrFields.join(', '));

                            delete arrFields;

                            return self.executeSql(sqlStatement);
                        },
                        dropTable: function (table) {
                            var self = this;

                            var sqlStatement = 'DROP TABLE IF EXISTS ' + table;

                            return self.executeSql(sqlStatement);
                        },
                        select: function (table, options) {
                            var self = this;

                            var parameters = null;
                            var sqlStatement = 'SELECT * FROM ' + table;
                            if (options) {
                                if (options.fields) {
                                    sqlStatement = sqlStatement.replace('*', options.fields);
                                }
                                if (options.where) {
                                    sqlStatement += ' WHERE ' + options.where.conditions;
                                    if (options.where.parameters
                                     && options.where.parameters.length > 0) {
                                        parameters = options.where.parameters;
                                    }
                                }
                                if (options.orderBy) {
                                    sqlStatement += ' ORDER BY ' + options.orderBy;
                                }
                                if (options.limit) {
                                    sqlStatement += ' LIMIT ' + options.limit;
                                }
                            }

                            return self.executeSql(sqlStatement, parameters);
                        },
                        first: function (table, options) {
                            var self = this;

                            options = options || {};
                            options.limit = 1;

                            return self.select(table, options);
                        },
                        insert: function (table, values) {
                            var self = this;
                            
                            if (_tablesInheritedOfMntObjects.indexOf(table) < 0) {
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

                            return self.executeSql(sqlStatement, parameters);
                        },
                        update: function (table, values, where, parameters) {
                            var self = this;
                            
                            if (_tablesInheritedOfMntObjects.indexOf(table) < 0) {
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

                            return self.executeSql(sqlStatement, _parameters);
                        },
                        delete: function (table, where, parameters) {
                            var self = this;

                            var _parameters = [];
                            var sqlStatement = 'DELETE FROM ' + table;
                            if (where) {
                                sqlStatement += ' WHERE ' + where;
                            }
                            
                            PaCM.eachArray(parameters, function (inx, p) {
                                _parameters.push(p);
                            });

                            return self.executeSql(sqlStatement, _parameters);
                        }
                    });
                });
            },
            installDatabase: function (onSuccess, onError, debugMode) {
                var _dbContext = this;
                
                //Este método se encarga de generar todas las tablas en la base de datos
                
                _dbContext.beginTransaction(function (tx) {
                    tx
                    .executeSql("SELECT 1")
                    .then(function () { return tx.executeSql('SELECT name FROM sqlite_master WHERE type="table" and (name like "App%" or name like "Cfg%" or name like "Mnt%")'); })
                    .then(function (sqlResultSet) {
                        //Elimina todas las tablas
                        var promises = [];
                        PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                            promises.push(
                                tx.dropTable(r.name)
                            );
                        });
                        return Promise.all(promises);
                    })
                    .then(function () { return tx.executeSql('create table AppSettings ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, SMTPServerDomain TEXT, SMTPServerHost TEXT not null, SMTPServerPort INT not null, SMTPServerAccount TEXT not null, SMTPServerPassword TEXT not null, SMTPServerEnableSsl BOOL not null )'); })
                    .then(function () { return tx.executeSql('create table AppFiles ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, LocalName TEXT not null, Name TEXT not null, Extension TEXT, Size INT not null, MIMEType TEXT, Encoding TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table AppKeys ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Salt TEXT not null, Hash TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table AppUsers ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Username TEXT not null, FirstName TEXT not null, LastName TEXT not null, EmailAddress TEXT not null, Administrator BOOL not null, Enabled BOOL not null, PasswordId BIGINT not null, constraint FK_User_PasswordId foreign key (PasswordId) references AppKeys )'); })
                    .then(function () { return tx.executeSql('create table AppUserSessions ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Session TEXT not null, Host TEXT not null, Agent TEXT not null, LocalAddress TEXT not null, UserAddress TEXT not null, Started DATETIME not null, Ended DATETIME, UserId BIGINT not null, constraint FK_UserSession_UserId foreign key (UserId) references AppUsers )'); })
                    .then(function () { return tx.executeSql('create table CfgCountries ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table CfgStates ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, CountryId BIGINT not null, constraint FK_State_CountryId foreign key (CountryId) references CfgCountries )'); })
                    .then(function () { return tx.executeSql('create table CfgCities ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, StateId BIGINT not null, constraint FK_City_StateId foreign key (StateId) references CfgStates )'); })
                    .then(function () { return tx.executeSql('create table CfgColors ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, HEX TEXT, RGB TEXT )'); })
                    .then(function () { return tx.executeSql('create table CfgIdentityTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, ShortName TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table CfgCompany ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, WebSite TEXT, Slogan TEXT, IdentityTypeId BIGINT not null, CityId BIGINT not null, LogoId BIGINT, constraint FK_Company_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Company_CityId foreign key (CityId) references CfgCities, constraint FK_Company_LogoId foreign key (LogoId) references AppFiles )'); })
                    .then(function () { return tx.executeSql('create table CfgCustomers ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT, PostalCode TEXT, PhoneNumber TEXT, WebSite TEXT, ContactName TEXT, ContactEmailAddress TEXT, Comments TEXT, Enabled BOOL not null, IdentityTypeId BIGINT not null, CityId BIGINT not null, constraint FK_Customer_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Customer_CityId foreign key (CityId) references CfgCities )'); })
                    .then(function () { return tx.executeSql('create table MntMachineTrademarks ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table MntMachineModels ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, CompartmentLength NUMERIC, CompartmentWidth NUMERIC, CompartmentHeight NUMERIC, TrademarkId BIGINT not null, constraint FK_MachineModel_TrademarkId foreign key (TrademarkId) references MntMachineTrademarks )'); })
                    .then(function () { return tx.executeSql('create table MntMachines ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Serial TEXT, CustomerReference TEXT, ModelId BIGINT not null, CustomerId BIGINT not null, constraint FK_Machine_ModelId foreign key (ModelId) references MntMachineModels, constraint FK_Machine_CustomerId foreign key (CustomerId) references CfgCustomers )'); })
                    .then(function () { return tx.executeSql('create table MntConnectorTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, ColorRequired BOOL not null, ImageId BIGINT not null, constraint FK_ConnectorType_ImageId foreign key (ImageId) references AppFiles )'); })
                    .then(function () { return tx.executeSql('create table MntConnectors ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, TypeId BIGINT not null, constraint FK_Connector_TypeId foreign key (TypeId) references MntConnectorTypes )'); })
                    .then(function () { return tx.executeSql('create table MntBatteryTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Voltage INT not null, NumberOfCells INT not null )'); })
                    .then(function () { return tx.executeSql('create table MntObjectTrademarks ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table MntObjectModels ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, TrademarkId BIGINT not null, constraint FK_ObjectTypeModel_TrademarkId foreign key (TrademarkId) references MntObjectTrademarks )'); })
                    .then(function () { return tx.executeSql('create table MntObjects ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Serial TEXT, CustomerReference TEXT, Enabled BOOL not null, ModelId BIGINT not null, CustomerId BIGINT not null, constraint FK_ObjectType_ModelId foreign key (ModelId) references MntObjectModels, constraint FK_ObjectType_CustomerId foreign key (CustomerId) references CfgCustomers )'); })
                    .then(function () { return tx.executeSql('create table MntBatteries ( Id BIGINT not null, Amperage TEXT not null, StandardBox BOOL not null, Cover BOOL not null, DrainHoles BOOL not null, MinimunWeight NUMERIC, MaximunWeight NUMERIC, Length NUMERIC, Width NUMERIC, BoxHeight NUMERIC, HandleHeight NUMERIC, TypeId BIGINT not null, ConnectorId BIGINT not null, ConnectorColorId BIGINT, primary key (Id), constraint FKF520AC824409B984 foreign key (Id) references MntObjects, constraint FK_Battery_TypeId foreign key (TypeId) references MntBatteryTypes, constraint FK_Battery_ConnectorId foreign key (ConnectorId) references MntConnectors, constraint FK_Battery_ConnectorColorId foreign key (ConnectorColorId) references CfgColors )'); })
                    .then(function () { return tx.executeSql('create table MntChargers ( Id BIGINT not null, Voltage TEXT not null, Amperage TEXT not null, primary key (Id), constraint FKB35EAA924409B984 foreign key (Id) references MntObjects )'); })
                    .then(function () { return tx.executeSql('create table MntCells ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, "Order" INT not null, BatteryId BIGINT not null, constraint FK_Cell_BatteryId foreign key (BatteryId) references MntBatteries )'); })
                    .then(function () { return tx.executeSql('create table MntArticles ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, InventoryCode TEXT, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, CorrectiveMaintenanceEnabled BOOL not null )'); })
                    .then(function () { return tx.executeSql('create table MntDiagnosticTypes ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null )'); })
                    .then(function () { return tx.executeSql('create table MntDiagnostics ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, TypeId BIGINT not null, constraint FK_Diagnostic_TypeId foreign key (TypeId) references MntDiagnosticTypes )'); })
                    .then(function () { return tx.executeSql('create table MntCheckList ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Name TEXT not null, "Order" INT not null, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, DiagnosticTypeId BIGINT not null, constraint FK_Check_DiagnosticTypeId foreign key (DiagnosticTypeId) references MntDiagnosticTypes )'); })
                    .then(function () { return tx.executeSql('create table MntAssemblyStatus ( Id BIGINT not null, Guid TEXT not null, LastModified DATETIME not null, Description TEXT, primary key (Id) )'); })
                    .then(function () { return tx.executeSql('create table MntAssemblies ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Type TEXT not null, UniqueCode TEXT not null, Date DATETIME not null, Comments TEXT, CustomerId BIGINT not null, ObjectTypeId BIGINT not null, ExecutedById BIGINT not null, StatusId BIGINT not null, constraint FK_Assembly_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Assembly_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Assembly_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Assembly_StatusId foreign key (StatusId) references MntAssemblyStatus )'); })
                    .then(function () { return tx.executeSql('create table MntMaintenanceStatus ( Id BIGINT not null, Guid TEXT not null, LastModified DATETIME not null, Description TEXT, primary key (Id) )'); })
                    .then(function () { return tx.executeSql('create table MntMaintenances ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Type TEXT not null, UniqueCode TEXT not null, Date DATETIME not null, Preventive BOOL not null, Corrective BOOL not null, AcceptedBy TEXT not null, WorkToBeDone TEXT, TechnicalReport TEXT, CustomerId BIGINT not null, MachineId BIGINT, ObjectTypeId BIGINT not null, ExecutedById BIGINT not null, ExecutedByDigitalSignatureId BIGINT, AcceptedByDigitalSignatureId BIGINT, StatusId BIGINT not null, constraint FK_Maintenance_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Maintenance_MachineId foreign key (MachineId) references MntMachines, constraint FK_Maintenance_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Maintenance_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Maintenance_ExecutedByDigitalSignatureId foreign key (ExecutedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_AcceptedByDigitalSignatureId foreign key (AcceptedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_StatusId foreign key (StatusId) references MntMaintenanceStatus )'); })
                    .then(function () { return tx.executeSql('create table MntMaintenanceCheckList ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Comments TEXT, MaintenanceId BIGINT not null, CheckId BIGINT not null, DiagnosticId BIGINT not null, constraint FK_MaintenanceCheck_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_MaintenanceCheck_CheckId foreign key (CheckId) references MntCheckList, constraint FK_MaintenanceCheck_DiagnosticId foreign key (DiagnosticId) references MntDiagnostics )'); })
                    .then(function () { return tx.executeSql('create table MntCellsReviews ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Voltage NUMERIC not null, Density NUMERIC not null, Comments TEXT, CellId BIGINT not null, MaintenanceId BIGINT, AssemblyId BIGINT, constraint FK_CellReview_CellId foreign key (CellId) references MntCells, constraint FK_CellReview_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_CellReview_AssemblyId foreign key (AssemblyId) references MntAssemblies )'); })
                    .then(function () { return tx.executeSql('create table MntArticlesOutputs ( Id integer primary key autoincrement, Guid TEXT not null, LastModified DATETIME not null, Quantity NUMERIC not null, ArticleId BIGINT not null, MaintenanceId BIGINT, AssemblyId BIGINT, constraint FK_ArticleOutput_ArticleId foreign key (ArticleId) references MntArticles, constraint FK_ArticleOutput_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_ArticleOutput_AssemblyId foreign key (AssemblyId) references MntAssemblies )'); })
                    .then(function () {
                        if (typeof(onSuccess) === 'function') {
                            onSuccess('Database installed successfully');
                        }
                    })
                    .catch(function (sqlError) {
                        if (typeof(onError) === 'function') {
                            if (sqlError && sqlError.code) {
                                var errorMessage = 'ERROR: ' + sqlError.code + ': ' + sqlError.message;
                                onError(errorMessage);
                            } else {
                                onError(sqlError);
                            }
                        } else {
                            throw sqlError;
                        }
                    });
                }, debugMode);
            },
            importData: function (onSuccess, onError, debugMode) {
                var _dbContext = this;
                
                //Este método sirve para obtener los nuevos registros y los registros
                //modificados recientemente desde el servidor de todas las tablas de parametrización
                //simplemente, hay que enviar por cada tabla, el guid y la fecha de
                //actualización de los registros que existan localmente
                
                //Para evitar problemas con las operaciones asyncronas, lo mejor es enviar un solo
                //paquete de datos, y esperar una sola respuesta del servidor
                
                var localData = [];
                
                Promise.resolve()
                .then(function () {
                    return new Promise(function (resolve, reject) {
                        _dbContext.beginTransaction(function (tx) {
                            var promises = [];
                            PaCM.eachArray(_importTables, function (inx, t) {
                                var command = null;
                                if (_tablesInheritedOfMntObjects.indexOf(t) >= 0) {
                                    command = 'SELECT "' + t + '" Tb, t.Id, p.LastModified FROM ' + t + ' t INNER JOIN MntObjects p ON p.Id = t.Id';
                                } else {
                                    command = 'SELECT "' + t + '" Tb, t.Id, t.LastModified FROM ' + t + ' t';
                                }
                                promises.push(
                                    tx.executeSql(command)
                                    .then(function (sqlResultSet) {
                                        PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                                            localData.push({
                                                Tb: r.Tb,
                                                Id: r.Id,
                                                Lm: new Date(r.LastModified)
                                            });
                                        });
                                    })
                                );
                            });
                            Promise.all(promises)
                            .then(function () {
                                resolve();
                            })
                            .catch(function (sqlError) {
                                reject(sqlError);
                            });
                        }, debugMode);
                    });
                })
                //Envia datos al servidor
                .then(function () {
                    return new Promise(function (resolve, reject) {
                        $http.post(addressServer + 'SyncronizeData/GetData', {
                            tables: _importTables,
                            records: localData
                        })
                        .success(function (response) {
                            resolve(response);
                        })
                        .error(function (response) {
                            reject(response);
                        });
                    });                    
                })
                //Procesa la información que ha sido devuelta por el servidor
                .then(function (response) {
                    return new Promise(function (resolve, reject) {
                        _dbContext.beginTransaction(function (tx1) {
                            var promises = [];
                            PaCM.eachArray(response.Records, function (inx, r) {
                                switch (r.Ac) {
                                    case 'c':
                                        promises.push(
                                            tx1.insert(r.Tb, r.Dt)
                                        );
                                        break;
                                    case 'u':
                                        promises.push(
                                            tx1.update(r.Tb, r.Dt, "Id=" + r.Id)
                                        );
                                        break;
                                    case 'd':
                                        promises.push(
                                            tx1.delete(r.Tb, "Id=" + r.Id)
                                        );
                                        break;
                                    default:
                                        onError('Action not support');
                                        return;
                                }
                            });
                            Promise.all(promises)
                            .then(function () {
                                resolve();
                            })
                            .catch(function (sqlError) {
                                reject(sqlError);
                            });
                        }, debugMode);
                    });
                })
                .then(function () {
                    if (typeof(onSuccess) === 'function') {
                        onSuccess('Data imported successfully');
                    }
                })
                .catch(function (sqlError) {
                    if (typeof(onError) === 'function') {
                        if (sqlError && sqlError.code) {
                            var errorMessage = 'ERROR: ' + sqlError.code + ': ' + sqlError.message;
                            onError(errorMessage);
                        } else {
                            onError(sqlError);
                        }
                    } else {
                        throw sqlError;
                    }
                });
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
            get: function (entity, id, debugMode) {
                var sqlQuery = null;
                if (typeof(_queries[entity]) === 'undefined') {
                    sqlQuery = 'SELECT r.* FROM ' + _entities[entity] + ' r';
                } else {
                    sqlQuery = _queries[entity];
                }
                sqlQuery += ' WHERE r.Id = ?';
                var promise = new Promise(function (resolve, reject) {
                    dbContext.beginTransaction(function (tx) {
                        tx.executeSql(sqlQuery, [ id ]).then(function (sqlResultSet) {
                            resolve(sqlResultSet);
                        });
                    }, debugMode);
                });
                return promise;
            },
            list: function (entity, debugMode) {
                var sqlQuery = null;
                if (typeof(_queries[entity]) === 'undefined') {
                    sqlQuery = 'SELECT r.* FROM ' + _entities[entity] + ' r';
                } else {
                    sqlQuery = _queries[entity];
                }
                var promise = new Promise(function (resolve, reject) {
                    dbContext.beginTransaction(function (tx) {
                        tx.executeSql(sqlQuery).then(function (sqlResultSet) {
                            resolve(sqlResultSet);
                        });
                    }, debugMode);
                });
                return promise;
            },
            find: function (entity, where, parameters, debugMode) {
                var sqlQuery = null;
                if (typeof(_queries[entity]) === 'undefined') {
                    sqlQuery = 'SELECT r.* FROM ' + _entities[entity] + ' r';
                } else {
                    sqlQuery = _queries[entity];
                }
                sqlQuery += ' WHERE ' + where;
                var promise = new Promise(function (resolve, reject) {
                    dbContext.beginTransaction(function (tx) {
                        tx.executeSql(sqlQuery, parameters).then(function (sqlResultSet) {
                            resolve(sqlResultSet);
                        });
                    }, debugMode);
                });
                return promise;
            }
        };
        
    });
    
})();
