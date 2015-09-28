
// Este servicio provee todos métodos para consultar, insertar, editar y eliminar
// registros, de una manera mas comoda que permite usar el nombre de las entidades

(function () {

    PaCM.servicesModule.factory('dataContext', function (dbContext) {

        var debugMode = 4;

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
            ObjectType: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || r.[Serial], '') || IFNULL(' / # Interno: ' || r.[CustomerReference], '')) [Description], m.[TrademarkId] FROM MntObjects r INNER JOIN MntObjectModels m ON r.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Battery: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId], p.[CreatedOn], p.[LastModified] FROM MntBatteries r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Charger: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId], p.[CreatedOn], p.[LastModified] FROM MntChargers  r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Machine: "SELECT r.*, (t.[Name] || ' / ' || m.[Name] || IFNULL(' / Serial: ' || r.[Serial], '') || IFNULL(' / # Interno: ' || r.[CustomerReference], '')) [Description], m.[TrademarkId], m.[CompartmentLength], m.[CompartmentWidth], m.[CompartmentHeight] FROM MntMachines r INNER JOIN MntMachineModels m ON r.ModelId = m.Id INNER JOIN MntMachineTrademarks t ON t.Id = m.TrademarkId",
            Assembly: "SELECT r.*, (ot.[Name] || ' / ' || om.[Name] || IFNULL(' / Serial: ' || o.[Serial], '') || IFNULL(' / # Interno: ' || o.[CustomerReference], '')) [ObjectTypeDescription], o.[ModelId] ObjectTypeModelId, om.[TrademarkId] ObjectTypeTrademarkId FROM MntAssemblies r INNER JOIN MntObjects o ON r.ObjectTypeId = o.Id INNER JOIN MntObjectModels om ON o.ModelId = om.Id INNER JOIN MntObjectTrademarks ot ON om.TrademarkId = ot.Id",
            Maintenance: "SELECT r.*, (ot.[Name] || ' / ' || om.[Name] || IFNULL(' / Serial: ' || o.[Serial], '') || IFNULL(' / # Interno: ' || o.[CustomerReference], '')) [ObjectTypeDescription], o.[ModelId] ObjectTypeModelId, om.[TrademarkId] ObjectTypeTrademarkId, m.[ModelId] MachineModelId, mm.[TrademarkId] MachineTrademarkId FROM MntMaintenances r INNER JOIN MntObjects o ON r.ObjectTypeId = o.Id INNER JOIN MntObjectModels om ON o.ModelId = om.Id INNER JOIN MntObjectTrademarks ot ON om.TrademarkId = ot.Id LEFT  JOIN MntMachines m ON r.MachineId = m.Id LEFT  JOIN MntMachineModels mm ON m.ModelId = mm.Id",
            MaintenanceCheck: "SELECT r.*, cl.[Name] [CheckName], cl.[Order] [CheckOrder], cl.[DiagnosticTypeId] FROM MntMaintenanceCheckList r INNER JOIN MntCheckList cl ON cl.Id = r.CheckId",
            CellReview: "SELECT r.*, c.[Id] [CellId], c.[Order] [CellOrder], c.BatteryId FROM MntCellsReviews r INNER JOIN MntCells c ON c.Id = r.CellId"
        };
        
        return {
            get: function (entity, id, onSuccess, onError) {
                var options = {
                    where: {
                        conditions: 'r.[Id] = ?',
                        parameters: [ id ]
                    }
                };
                if (PaCM.isDefined(queries[entity])) {
                    options.fields = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.first(entities[entity], options, function (tx1, sqlResultSet1) {
                        var result = null;
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            result = r;
                        });
                        onSuccess(result);
                    });
                }, null, onError, debugMode);
            },
            list: function (entity, onSuccess, onError) {
                var options = {};
                if (PaCM.isDefined(queries[entity])) {
                    options.fields = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.select(entities[entity], options, function (tx1, sqlResultSet1) {
                        var results = [];
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            results.push(r);
                        });
                        onSuccess(results);
                    });
                }, null, onError, debugMode);
            },
            first: function (entity, where, parameters, onSuccess, onError) {
                var options = {};
                if (where) {
                    options.where = {
                        conditions: where
                    };
                }
                if (parameters) {
                    options.where.parameters = parameters;
                }
                if (PaCM.isDefined(queries[entity])) {
                    options.fields = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.first(entities[entity], options, function (tx1, sqlResultSet1) {
                        var result = null;
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            result = r;
                        });
                        onSuccess(result);
                    });
                }, null, onError, debugMode);
            },
            first2: function (entity, where, onSuccess, onError) {
                var self = this;
                
                var fields = [];
                var parameters = [];
                PaCM.eachProperties(where, function (key, value) {
                    fields.push(key + ' = ?');
                    parameters.push(value);
                });
                
                if (fields.length > 0) {
                    self.first(entity, fields.join(' AND '), parameters, onSuccess, onError);
                } else {
                    self.first(entity, null, null, onSuccess, onError);
                }
            },
            find: function (entity, where, parameters, onSuccess, onError) {
                var options = {};
                if (where) {
                    options.where = {
                        conditions: where
                    };
                }
                if (parameters) {
                    options.where.parameters = parameters;
                }
                if (PaCM.isDefined(queries[entity])) {
                    options.fields = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.select(entities[entity], options, function (tx1, sqlResultSet1) {
                        var results = [];
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            results.push(r);
                        });
                        onSuccess(results);
                    });
                }, null, onError, debugMode);
                
            },
            find2: function (entity, where, onSuccess, onError) {
                var self = this;
                
                var fields = [];
                var parameters = [];
                PaCM.eachProperties(where, function (key, value) {
                    fields.push(key + ' = ?');
                    parameters.push(value);
                });
                
                if (fields.length > 0) {
                    self.find(entity, fields.join(' AND '), parameters, onSuccess, onError);
                } else {
                    self.list(entity, onSuccess, onError);
                }
            },
            insert: function (entity, values, onSuccess, onError) {
                dbContext.beginTransaction(function (tx) {
                    tx.insert(entities[entity], values);
                }, onSuccess, onError, debugMode);
            },
            update: function (entity, values, where, parameters, onSuccess, onError) {
                dbContext.beginTransaction(function (tx) {
                    tx.update(entities[entity], values, where, parameters);
                }, onSuccess, onError, debugMode);
            },
            delete: function (entity, where, parameters, onSuccess, onError) {
                dbContext.beginTransaction(function (tx) {
                    tx.delete(entities[entity], where, parameters);
                }, onSuccess, onError, debugMode);
            }
        };
    });

})();
