
// Este servicio provee todos los datos, se encarga de mantenerlos en memoria para
// un rápido acceso, y se mantiene en contacto con el servicio dbContext, para refrescar
// la información cuando esta ha cambiado

(function () {

    PaCM.servicesModule.factory('dataContext', function (dbContext) {

        var debugMode = 1;

        var entities = {
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
        var queries = {
            Battery: "r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId], p.[LastModified] FROM MntBatteries r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Charger: "r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId], p.[LastModified] FROM MntChargers  r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Machine: "r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || r.[Serial], '') || IFNULL(' / # Interno: ' || r.[CustomerReference], '')) [Description], m.[TrademarkId], m.[CompartmentLength], m.[CompartmentWidth], m.[CompartmentHeight] FROM MntMachines r INNER JOIN MntMachineModels m ON r.ModelId = m.Id INNER JOIN MntMachineTrademarks t ON t.Id = m.TrademarkId"
        };
        var dataCached = {};
        var dataDictionaryCached = {};
        
        PaCM.eachProperties(entities, function (entity, table) {
            dataCached[entity] = [];
            dataDictionaryCached[entity] = {};
        });

        var refreshDataCached = function () {

            var newData = [];
            PaCM.eachProperties(entities, function (entity, table) {
                newData[entity] = [];
            });
            
            var fnc01 = function (tx) {
                
                var sqlCommands = [];
                PaCM.eachProperties(entities, function (entity, table) {
                    if (PaCM.isDefined(queries[entity])) {
                        sqlCommands.push('SELECT "' + entity + '" EntityName, ' + queries[entity]);
                    } else {
                        sqlCommands.push('SELECT "' + entity + '" EntityName, r.* FROM ' + table + ' r');
                    }
                });
                tx.executeMultiSql(sqlCommands, function (tx1, sqlResultSet1) {

                    // Inserta o actualiza valores nuevos
                    PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {

                        var entity = null;
                        var cached = false;
                        if (PaCM.isDefined(dataDictionaryCached[r.EntityName][r.Id])) {
                            entity = dataDictionaryCached[r.EntityName][r.Id];
                            cached = true;
                        } else {
                            entity = {};
                        }

                        // Si las fechas son distintas, actualiza datos locales
                        if (entity.LastModified != r.LastModified) {
                            PaCM.eachProperties(r, function (field, value) {
                                entity[field] = value;
                            });
                            if (cached === false) {
                                dataDictionaryCached[r.EntityName][r.Id] = entity;
                                dataCached[r.EntityName].push(entity);
                            }
                        }

                        // LLena lista con ids
                        newData[r.EntityName].push(entity.Id);
                    });
                });
            };
            var fnc02 = function () {

                // Recorre el cache, para eliminar elementos que ya 
                // no existen en la base de datos
                PaCM.eachProperties(entities, function (entity, table) {
                    PaCM.eachArrayInvert(dataCached[entity], function (inx, record) {
                        var _index = newData[entity].indexOf(record.Id);
                        if (_index < 0) {
                            dataCached[entity].splice(inx, 1);
                            delete dataDictionaryCached[entity][record.Id];
                        } else {
                            newData[entity].splice(_index, 1);
                        }
                    });
                    delete newData[entity];
                });
                                    
            };

            dbContext.beginTransaction(fnc01, fnc02, null, debugMode);
        };
        refreshDataCached();
        dbContext.onDataChanged(refreshDataCached);

        return {
            get: function (entity, id) {
                return dataDictionaryCached[entity][id];
            },
            list: function (entity) {
                return dataCached[entity];
            } /*,
            find: function (entity, where, parameters, onSuccess, onError) {
                refreshDataCached(function () {
                    onSuccess(dataCached[entity]);
                }, onError);
            }*/
        };
    });

})();
