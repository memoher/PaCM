(function () {

angular.module('starter.services', [])

    .factory('dbContext', function ($http) {

        var databaseInst = window.openDatabase('mydb', '1.0', 'Test DB', 10 * 1024 * 1024);
        //var addressServer = 'http://192.168.0.102:57080/';
        var addressServer = 'api/';
        var importTables = [
            'SysFiles', 'SysKeys', 'SysUsers', 
            'CfgCountries', 'CfgStates', 'CfgCities', 'CfgIdentityTypes', 'CfgCompany', 'CfgCustomers',
            'CfgTrademarks','CfgColors', 'MntBatteryTypes', 'MntConnectorTypes', 'MntConnectors',
            'MntAssemblyStatus', 'MntMaintenanceStatus',
            'MntDiagnosticTypes', 'MntDiagnostics',  /*'MntCheckList',*/ 'MntArticles',
            'MntMachineModels', 'MntMachines',
            'MntObjectTypeModels', 'MntObjects' /*, 'MntBatteries', 'MntChargers', 'MntCells',
            'MntAssemblies', 'MntMaintenances',
            'MntCellsReviews', 'MntArticlesOutputs', 'MntMaintenanceCheckList'*/
        ];
        
        var _getSuccessCallback = function (options) {
            if (options && options.successCallback) {
                return options.successCallback;
            }
            return null;
        };
        var _getErrorCallback = function (options) {
            if (options && options.errorCallback) {
                return options.errorCallback;
            }
            return null;
        };

        return {
            beginTransaction: function (callback, onError, debugEnabled) {
                
                debugEnabled = (debugEnabled == true);
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
                                    
                                    var errorMessage = sqlError.code + ': ' + sqlError.message;
                                    if (errorCallback) {
                                        errorCallback(sqlError, errorMessage);
                                    } else if (onError) {
                                        onError(sqlError, errorMessage);
                                    } else {
                                        alert(errorMessage);
                                    }
                                    throw errorMessage;
                                });
                                
                            return self;
                        },
                        createTable: function (table, fields, options) {
                            var self = this;
                            
                            var successCallback = _getSuccessCallback(options);
                            var errorCallback = _errorCallback(options);
                            
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
                                    self.dropTable(table);
                                }
                            }
                            
                            self.executeSql(sqlStatement, null, successCallback, errorCallback);
                                
                            return self;
                        },
                        dropTable: function (table, options) {
                            var self = this;
                            
                            var successCallback = _getSuccessCallback(options);
                            var errorCallback = _getErrorCallback(options);
                            
                            var sqlStatement = 'DROP TABLE IF EXISTS ' + table;
                            
                            self.executeSql(sqlStatement, null, successCallback, errorCallback);
                                
                            return self;
                        },
                        select: function (table, options) {
                            var self = this;
                            
                            var parameters = null;
                            var successCallback = _getSuccessCallback(options);
                            var errorCallback = _getErrorCallback(options);
                            
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
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        },
                        first: function (table, options) {
                            var self = this;
                            
                            options = options || {};
                            options.limit = 1;
                            
                            self.select(table, options);
                            
                            return self;
                        },
                        insert: function (table, values, options) {
                            var self = this;
                            
                            var parameters = [];
                            var successCallback = _getSuccessCallback(options);
                            var errorCallback = _getErrorCallback(options);
                            
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
                            
                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        },
                        update: function (table, values, options) {
                            var self = this;
                            
                            var parameters = [];
                            var successCallback = _getSuccessCallback(options);
                            var errorCallback = _getErrorCallback(options);

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
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        },
                        delete: function (table, options) {
                            var self = this;
                            
                            var parameters = null;
                            var successCallback = _getSuccessCallback(options);
                            var errorCallback = _getErrorCallback(options);

                            var sqlStatement = 'DELETE FROM ' + table;
                            
                            if (options) {
                                if (options.where) {
                                    sqlStatement += ' WHERE ' + options.where.conditions;
                                    if (options.where.parameters) {
                                        parameters = options.where.parameters;
                                    }
                                }
                            }

                            self.executeSql(sqlStatement, parameters, successCallback, errorCallback);
                                
                            return self;
                        }
                    });
                });
            },
            installDatabase: function (onSuccess, onError, debugMode) {
                var _dbContext = this;

                _dbContext.beginTransaction(function (tx) {
                    
                    tx
                    .executeSql('drop table if exists MntArticles')
                    .executeSql('drop table if exists MntArticlesOutputs')
                    .executeSql('drop table if exists MntAssemblies')
                    .executeSql('drop table if exists MntAssemblyStatus')
                    .executeSql('drop table if exists MntBatteryTypes')
                    .executeSql('drop table if exists MntCells')
                    .executeSql('drop table if exists MntCellsReviews')
                    .executeSql('drop table if exists MntCheckList')
                    .executeSql('drop table if exists CfgCities')
                    .executeSql('drop table if exists CfgColors')
                    .executeSql('drop table if exists CfgCompany')
                    .executeSql('drop table if exists MntConnectors')
                    .executeSql('drop table if exists MntConnectorTypes')
                    .executeSql('drop table if exists CfgCountries')
                    .executeSql('drop table if exists CfgCustomers')
                    .executeSql('drop table if exists MntDiagnostics')
                    .executeSql('drop table if exists MntDiagnosticTypes')
                    .executeSql('drop table if exists SysFiles')
                    .executeSql('drop table if exists CfgIdentityTypes')
                    .executeSql('drop table if exists SysKeys')
                    .executeSql('drop table if exists MntMachines')
                    .executeSql('drop table if exists MntMachineModels')
                    .executeSql('drop table if exists MntMaintenanceCheckList')
                    .executeSql('drop table if exists MntMaintenances')
                    .executeSql('drop table if exists MntMaintenanceStatus')
                    .executeSql('drop table if exists MntObjects')
                    .executeSql('drop table if exists MntBatteries')
                    .executeSql('drop table if exists MntChargers')
                    .executeSql('drop table if exists MntObjectTypeModels')
                    .executeSql('drop table if exists SysSettings')
                    .executeSql('drop table if exists CfgStates')
                    .executeSql('drop table if exists CfgTrademarks')
                    .executeSql('drop table if exists SysUsers')
                    .executeSql('drop table if exists SysUserSessions')
                    .executeSql('create table MntArticles (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       InventoryCode TEXT,       EnabledBatteries BOOL not null,       EnabledChargers BOOL not null,       CorrectiveMaintenanceEnabled BOOL not null    )')
                    .executeSql('create table MntArticlesOutputs (        Id integer primary key autoincrement,       Guid TEXT not null,       Quantity NUMERIC not null,       ArticleId BIGINT not null,       MaintenanceId BIGINT,       AssemblyId BIGINT,       constraint FK_ArticleOutput_ArticleId foreign key (ArticleId) references MntArticles,       constraint FK_ArticleOutput_MaintenanceId foreign key (MaintenanceId) references MntMaintenances,       constraint FK_ArticleOutput_AssemblyId foreign key (AssemblyId) references MntAssemblies    )')
                    .executeSql('create table MntAssemblies (        Id integer primary key autoincrement,       Guid TEXT not null,       Type TEXT not null,       UniqueCode TEXT not null,       Date DATETIME not null,       Comments TEXT,       CustomerId BIGINT not null,       ObjectTypeId BIGINT not null,       ExecutedById BIGINT not null,       StatusId BIGINT not null,       constraint FK_Assembly_CustomerId foreign key (CustomerId) references CfgCustomers,       constraint FK_Assembly_ObjectTypeId foreign key (ObjectTypeId) references MntObjects,       constraint FK_Assembly_ExecutedById foreign key (ExecutedById) references SysUsers,       constraint FK_Assembly_StatusId foreign key (StatusId) references MntAssemblyStatus    )')
                    .executeSql('create table MntAssemblyStatus (        Id BIGINT not null,       Description TEXT,       primary key (Id)    )')
                    .executeSql('create table MntBatteryTypes (        Id integer primary key autoincrement,       Guid TEXT not null,       Voltage INT not null,       NumberOfCells INT not null    )')
                    .executeSql('create table MntCells (        Id integer primary key autoincrement,       Guid TEXT not null,       "Order" INT not null,       BatteryId BIGINT not null,       constraint FK_Cell_BatteryId foreign key (BatteryId) references MntBatteries    )')
                    .executeSql('create table MntCellsReviews (        Id integer primary key autoincrement,       Guid TEXT not null,       Voltage NUMERIC not null,       Density NUMERIC not null,       Comments TEXT,       CellId BIGINT not null,       MaintenanceId BIGINT,       AssemblyId BIGINT,       constraint FK_CellReview_CellId foreign key (CellId) references MntCells,       constraint FK_CellReview_MaintenanceId foreign key (MaintenanceId) references MntMaintenances,       constraint FK_CellReview_AssemblyId foreign key (AssemblyId) references MntAssemblies    )')
                    .executeSql('create table MntCheckList (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       "Order" INT not null,       EnabledBatteries BOOL not null,       EnabledChargers BOOL not null,       DiagnosticTypeId BIGINT not null,       constraint FK_Check_DiagnosticTypeId foreign key (DiagnosticTypeId) references MntDiagnosticTypes    )')
                    .executeSql('create table CfgCities (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       StateId BIGINT not null,       constraint FK_City_StateId foreign key (StateId) references CfgStates    )')
                    .executeSql('create table CfgColors (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       HEX TEXT,       RGB TEXT    )')
                    .executeSql('create table CfgCompany (        Id integer primary key autoincrement,       Guid TEXT not null,       Identity TEXT not null,       Name TEXT not null,       ShortName TEXT,       Address TEXT not null,       PostalCode TEXT,       PhoneNumber TEXT not null,       WebSite TEXT,       Slogan TEXT,       IdentityTypeId BIGINT not null,       CityId BIGINT not null,       LogoId BIGINT,       constraint FK_Company_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes,       constraint FK_Company_CityId foreign key (CityId) references CfgCities,       constraint FK_Company_LogoId foreign key (LogoId) references SysFiles    )')
                    .executeSql('create table MntConnectors (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       TypeId BIGINT not null,       constraint FK_Connector_TypeId foreign key (TypeId) references MntConnectorTypes    )')
                    .executeSql('create table MntConnectorTypes (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       ColorRequired BOOL not null,       ImageId BIGINT not null,       constraint FK_ConnectorType_ImageId foreign key (ImageId) references SysFiles    )')
                    .executeSql('create table CfgCountries (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null    )')
                    .executeSql('create table CfgCustomers (        Id integer primary key autoincrement,       Guid TEXT not null,       Identity TEXT not null,       Name TEXT not null,       ShortName TEXT,       Address TEXT,       PostalCode TEXT,       PhoneNumber TEXT,       WebSite TEXT,       ContactName TEXT,       ContactEmailAddress TEXT,       Comments TEXT,       Enabled BOOL not null,       IdentityTypeId BIGINT not null,       CityId BIGINT not null,       constraint FK_Customer_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes,       constraint FK_Customer_CityId foreign key (CityId) references CfgCities    )')
                    .executeSql('create table MntDiagnostics (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       TypeId BIGINT not null,       constraint FK_Diagnostic_TypeId foreign key (TypeId) references MntDiagnosticTypes    )')
                    .executeSql('create table MntDiagnosticTypes (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null    )')
                    .executeSql('create table SysFiles (        Id integer primary key autoincrement,       Guid TEXT not null,       LocalName TEXT not null,       Name TEXT not null,       Extension TEXT,       Size INT not null,       MIMEType TEXT,       Encoding TEXT not null    )')
                    .executeSql('create table CfgIdentityTypes (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       ShortName TEXT not null    )')
                    .executeSql('create table SysKeys (        Id integer primary key autoincrement,       Guid TEXT not null,       Salt TEXT not null,       Hash TEXT not null    )')
                    .executeSql('create table MntMachines (        Id integer primary key autoincrement,       Guid TEXT not null,       Serial TEXT,       CustomerReference TEXT,       Location TEXT,       LicensePlate TEXT,       ModelId BIGINT not null,       CustomerId BIGINT not null,       constraint FK_Machine_ModelId foreign key (ModelId) references MntMachineModels,       constraint FK_Machine_CustomerId foreign key (CustomerId) references CfgCustomers    )')
                    .executeSql('create table MntMachineModels (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       CompartmentLength NUMERIC,       CompartmentWidth NUMERIC,       CompartmentHeight NUMERIC,       TrademarkId BIGINT not null,       constraint FK_MachineModel_TrademarkId foreign key (TrademarkId) references CfgTrademarks    )')
                    .executeSql('create table MntMaintenanceCheckList (        Id integer primary key autoincrement,       Guid TEXT not null,       Comments TEXT,       MaintenanceId BIGINT not null,       CheckId BIGINT not null,       DiagnosticId BIGINT not null,       constraint FK_MaintenanceCheck_MaintenanceId foreign key (MaintenanceId) references MntMaintenances,       constraint FK_MaintenanceCheck_CheckId foreign key (CheckId) references MntCheckList,       constraint FK_MaintenanceCheck_DiagnosticId foreign key (DiagnosticId) references MntDiagnostics    )')
                    .executeSql('create table MntMaintenances (        Id integer primary key autoincrement,       Guid TEXT not null,       Type TEXT not null,       UniqueCode TEXT not null,       Date DATETIME not null,       Preventive BOOL not null,       Corrective BOOL not null,       AcceptedBy TEXT not null,       WorkToBeDone TEXT,       TechnicalReport TEXT,       CustomerId BIGINT not null,       MachineId BIGINT,       ObjectTypeId BIGINT not null,       ExecutedById BIGINT not null,       ExecutedByDigitalSignatureId BIGINT,       AcceptedByDigitalSignatureId BIGINT,       StatusId BIGINT not null,       constraint FK_Maintenance_CustomerId foreign key (CustomerId) references CfgCustomers,       constraint FK_Maintenance_MachineId foreign key (MachineId) references MntMachines,       constraint FK_Maintenance_ObjectTypeId foreign key (ObjectTypeId) references MntObjects,       constraint FK_Maintenance_ExecutedById foreign key (ExecutedById) references SysUsers,       constraint FK_Maintenance_ExecutedByDigitalSignatureId foreign key (ExecutedByDigitalSignatureId) references SysFiles,       constraint FK_Maintenance_AcceptedByDigitalSignatureId foreign key (AcceptedByDigitalSignatureId) references SysFiles,       constraint FK_Maintenance_StatusId foreign key (StatusId) references MntMaintenanceStatus    )')
                    .executeSql('create table MntMaintenanceStatus (        Id BIGINT not null,       Description TEXT,       primary key (Id)    )')
                    .executeSql('create table MntObjects (        Id integer primary key autoincrement,       Guid TEXT not null,       Serial TEXT,       CustomerReference TEXT,       Enabled BOOL not null,       ModelId BIGINT not null,       CustomerId BIGINT not null,       constraint FK_ObjectType_ModelId foreign key (ModelId) references MntObjectTypeModels,       constraint FK_ObjectType_CustomerId foreign key (CustomerId) references CfgCustomers    )')
                    .executeSql('create table MntBatteries (        ObjectType_id BIGINT not null,       Amperage TEXT not null,       StandardBox BOOL not null,       Cover BOOL not null,       DrainHoles BOOL not null,       MinimunWeight NUMERIC,       MaximunWeight NUMERIC,       Length NUMERIC,       Width NUMERIC,       BoxHeight NUMERIC,       HandleHeight NUMERIC,       TypeId BIGINT not null,       ConnectorId BIGINT not null,       ConnectorColorId BIGINT,       primary key (ObjectType_id),       constraint FKF520AC82D3509F01 foreign key (ObjectType_id) references MntObjects,       constraint FK_Battery_TypeId foreign key (TypeId) references MntBatteryTypes,       constraint FK_Battery_ConnectorId foreign key (ConnectorId) references MntConnectors,       constraint FK_Battery_ConnectorColorId foreign key (ConnectorColorId) references CfgColors    )')
                    .executeSql('create table MntChargers (        ObjectType_id BIGINT not null,       Voltage TEXT not null,       Amperage TEXT not null,       primary key (ObjectType_id),       constraint FKB35EAA92D3509F01 foreign key (ObjectType_id) references MntObjects    )')
                    .executeSql('create table MntObjectTypeModels (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       TrademarkId BIGINT not null,       constraint FK_ObjectTypeModel_TrademarkId foreign key (TrademarkId) references CfgTrademarks    )')
                    .executeSql('create table SysSettings (        Id integer primary key autoincrement,       Guid TEXT not null,       SMTPServerDomain TEXT,       SMTPServerHost TEXT not null,       SMTPServerPort INT not null,       SMTPServerAccount TEXT not null,       SMTPServerPassword TEXT not null,       SMTPServerEnableSsl BOOL not null    )')
                    .executeSql('create table CfgStates (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null,       CountryId BIGINT not null,       constraint FK_State_CountryId foreign key (CountryId) references CfgCountries    )')
                    .executeSql('create table CfgTrademarks (        Id integer primary key autoincrement,       Guid TEXT not null,       Name TEXT not null    )')
                    .executeSql('create table SysUsers (        Id integer primary key autoincrement,       Guid TEXT not null,       Username TEXT not null,       FirstName TEXT not null,       LastName TEXT not null,       EmailAddress TEXT not null,       Administrator BOOL not null,       Enabled BOOL not null,       PasswordId BIGINT not null,       constraint FK_User_PasswordId foreign key (PasswordId) references SysKeys    )')
                    .executeSql('create table SysUserSessions (        Id integer primary key autoincrement,       Guid TEXT not null,       Session TEXT not null,       Host TEXT not null,       Agent TEXT not null,       LocalAddress TEXT not null,       UserAddress TEXT not null,       Started DATETIME not null,       Ended DATETIME,       UserId BIGINT not null,       constraint FK_UserSession_UserId foreign key (UserId) references SysUsers    )')
                    .executeSql('SELECT 1', null, function (sqlResultSet) { onSuccess(); })
                    ;
                    
                }, onError, debugMode);
            },
            importData: function (onSuccess, onError, debugMode) {
                var _dbContext = this;
                
                //Este método sirve para obtener los nuevos registros y los registros
                //modificados recientemente desde el servidor de todas las tablas de parametrización
                //simplemente, hay que enviar por cada tabla, el guid y la fecha de
                //actualización de los registros que existan localmente
                
                //Para evitar problemas con las operaciones asyncronas, lo mejor es enviar un solo
                //paquete de datos, y esperar una sola respuesta del servidor
                
                var _localData = [];
                var _addRecord = function (record) {
                    _localData.push(record);
                }
                var _getRecords = function () {
                    return _localData;
                }
                
                _dbContext.beginTransaction(function (tx) {
                    for (var i = 0; i < importTables.length; i++) {
                        var t = importTables[i];
                        tx.select(t, {
                            successCallback: function (sqlResultSet) {
                                for (var j = 0; j < sqlResultSet.rows.length; j++) {
                                    var r = sqlResultSet.rows.item(j);
                                    _addRecord({
                                        table: t,
                                        id: r.Id,
                                        lastChange: r.LastChange
                                    });
                                }
                            }});
                    }
                    tx.executeSql("SELECT 1", null,
                        function (sqlResultSet) {
                            //En este punto se supone, tenemos la lista de todas las tablas con
                            //los valores actuales, ahora se procede a conectarse con el servidor
                            //para que retorne los nuevos registros
                            $http.post(addressServer + 'SyncronizeData/GetData', {
                                    tables: importTables,
                                    records: _getRecords()
                                })
                                .success(function (response) {
                                    if (response && response.length > 0) {
                                        _dbContext.beginTransaction(function (tx) {
                                            for(var i = 0; i < response.length; i++) {
                                                var r = response[i];
                                                switch (r.Action)
                                                {
                                                    case 'c':
                                                        tx.insert(r.Table, r.Data);
                                                        break;
                                                    case 'u':
                                                        tx.update(r.Table, r.Data, {
                                                            where: {
                                                                conditions: "Id=" + r.Id
                                                            }
                                                        });
                                                        break;
                                                    case 'd':
                                                        tx.delete(r.Table, {
                                                            where: {
                                                                conditions: "Id=" + r.Id
                                                            }
                                                        });
                                                        break;
                                                    default:
                                                        onError('Action not support');
                                                        return;
                                                }
                                            }
                                            tx.executeSql('SELECT 1', null, function (sqlResultSet) { onSuccess(); });
                                        }, onError, debugMode);
                                    }
                                })
                                .error(onError);
                        });
                }, onError, debugMode);
                
            },
            exportData: function (onSuccess, onError, debugMode) {
                var _dbContext = this;
                
                //Este método sirve para subir al servidor todos los registros capturados en el
                //dispositivo
                
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
