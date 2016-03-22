
// Este servicio provee todos métodos para consultar, insertar, editar y eliminar
// registros, de una manera mas comoda que permite usar el nombre de las entidades

(function () {

    PaCM.services.factory('dbRepository', function (dbContext) {

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
            BranchCustomer: 'CfgCustomerBranches',
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
        var entitiesInheritedOfObjectType = [
            'Battery', 'Charger'
        ];
        var queries = {
            City: "SELECT r.*, s.CountryId FROM CfgCities r INNER JOIN CfgStates s ON s.Id = r.StateId",
            ObjectType: "SELECT r.*, (IFNULL('Serial: ' || r.[Serial], '') || IFNULL(' / # Interno: ' || r.[CustomerReference], '')) [Description], m.[TrademarkId] FROM MntObjects r INNER JOIN MntObjectModels m ON r.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Battery: "SELECT r.*, (IFNULL('Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId], p.[CreatedOn], p.[LastModified] FROM MntBatteries r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Charger: "SELECT r.*, (IFNULL('Serial: ' || p.[Serial], '') || IFNULL(' / # Interno: ' || p.[CustomerReference], '')) [Description], p.[Enabled], p.[Serial], p.[CustomerReference], p.[ModelId], p.[CustomerId], m.[TrademarkId], p.[CreatedOn], p.[LastModified] FROM MntChargers  r INNER JOIN MntObjects p ON r.Id = p.Id INNER JOIN MntObjectModels m ON p.ModelId = m.Id INNER JOIN MntObjectTrademarks t ON t.Id = m.TrademarkId",
            Machine: "SELECT r.*, (IFNULL('Serial: ' || r.[Serial], '') || IFNULL(' / # Interno: ' || r.[CustomerReference], '')) [Description], m.[TrademarkId], m.[CompartmentLength], m.[CompartmentWidth], m.[CompartmentHeight] FROM MntMachines r INNER JOIN MntMachineModels m ON r.ModelId = m.Id INNER JOIN MntMachineTrademarks t ON t.Id = m.TrademarkId",
            Assembly: "SELECT r.*, (IFNULL('Serial: ' || o.[Serial], '') || IFNULL(' / # Interno: ' || o.[CustomerReference], '')) [ObjectTypeDescription], o.[ModelId] ObjectTypeModelId, om.[TrademarkId] ObjectTypeTrademarkId FROM MntAssemblies r INNER JOIN MntObjects o ON r.ObjectTypeId = o.Id INNER JOIN MntObjectModels om ON o.ModelId = om.Id INNER JOIN MntObjectTrademarks ot ON om.TrademarkId = ot.Id",
            Maintenance: "SELECT r.*, (IFNULL('Serial: ' || o.[Serial], '') || IFNULL(' / # Interno: ' || o.[CustomerReference], '')) [ObjectTypeDescription], o.[ModelId] ObjectTypeModelId, om.[TrademarkId] ObjectTypeTrademarkId, m.[ModelId] MachineModelId, mm.[TrademarkId] MachineTrademarkId FROM MntMaintenances r INNER JOIN MntObjects o ON r.ObjectTypeId = o.Id INNER JOIN MntObjectModels om ON o.ModelId = om.Id INNER JOIN MntObjectTrademarks ot ON om.TrademarkId = ot.Id LEFT  JOIN MntMachines m ON r.MachineId = m.Id LEFT  JOIN MntMachineModels mm ON m.ModelId = mm.Id",
            MaintenanceCheck: "SELECT r.*, cl.[Name] [CheckName], cl.[Order] [CheckOrder], cl.[DiagnosticTypeId] FROM MntMaintenanceCheckList r INNER JOIN MntCheckList cl ON cl.Id = r.CheckId",
            CellReview: "SELECT r.*, c.[Id] [CellId], c.[Order] [CellOrder], c.BatteryId FROM MntCellsReviews r INNER JOIN MntCells c ON c.Id = r.CellId",
            ArticleOutput: "SELECT r.*, a.[Name] [ArticleName], a.[InventoryCode] FROM [MntArticlesOutputs] r INNER JOIN [MntArticles] a ON a.[Id] = r.[ArticleId]"
        };

        var onSqlError = function (err) {
            PaCM.showErrorMessage(err);
            throw err;
        }
        
        return {
            get: function (entity, id, onSuccess, onError) {
                var options = {
                    where: 'r.Id = ?',
                    parameters: [ id ]
                };
                if (PaCM.isDefined(queries[entity])) {
                    options.select = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.first(entities[entity], options, function (tx1, sqlResultSet1) {
                        var result = null;
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            result = r;
                        });
                        onSuccess(result);
                    });
                }, null, PaCM.isFunction(onError) ? onError : onSqlError, debugMode);
            },
            first: function (entity, options, onSuccess, onError) {
                options = options ? options : {};
                if (PaCM.isDefined(queries[entity])) {
                    options.select = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.first(entities[entity], options, function (tx1, sqlResultSet1) {
                        var result = null;
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            result = r;
                        });
                        onSuccess(result);
                    });
                }, null, PaCM.isFunction(onError) ? onError : onSqlError, debugMode);
            },
            find: function (entity, options, onSuccess, onError) {
                options = options ? options : {};
                if (PaCM.isDefined(queries[entity])) {
                    options.select = queries[entity];
                }
                
                dbContext.beginTransaction(function (tx) {
                    tx.select(entities[entity], options, function (tx1, sqlResultSet1) {
                        var results = [];
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            results.push(r);
                        });
                        onSuccess(results);
                    });
                }, null, PaCM.isFunction(onError) ? onError : onSqlError, debugMode);
                
            },
            insert: function (entity, values, onSuccess, onError) {
                if (entitiesInheritedOfObjectType.indexOf(entity) < 0) {
                    values.Id = PaCM.newGuid();
                    values.CreatedOn = new Date();
                    values.LastModified = new Date();
                    values.ReplicationStatus = 0;
                }
                dbContext.beginTransaction(function (tx) {
                    tx.insert(entities[entity], values);
                }, onSuccess, PaCM.isFunction(onError) ? onError : onSqlError, debugMode);
            },
            update: function (entity, values, where, parameters, onSuccess, onError) {
                var options = {
                    where: where,
                    parameters: parameters
                };

                dbContext.beginTransaction(function (tx) {
                    tx.select(entities[entity], options, function (tx1, sqlResultSet1) {
                        //Determina si el objeto ha cambiado
                        var changed =
                        PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                            var valid =
                            PaCM.eachProperties(values, function (key, val) {
                                var vlr = r[key];
                                if (!(vlr === val)) {
                                    if (PaCM.isDate(vlr) && PaCM.isDate(val)) {
                                        return !((vlr - val) === 0); //Break;
                                    } else {
                                        return true; //Break;
                                    }
                                }
                            });
                            if (valid === true)
                                return valid; //Break;
                        });
                        if (changed === true) {
                            if (entitiesInheritedOfObjectType.indexOf(entity) < 0) {
                                values.LastModified = new Date();
                                values.ReplicationStatus = 0;
                            }
                            tx.update(entities[entity], values, where, parameters);
                        }
                    });
                }, onSuccess, PaCM.isFunction(onError) ? onError : onSqlError, debugMode);
            },
            save: function (entity, id, values, onSuccess, onError) {
                var self = this;

                if (id) {
                    if (!(values.Id)) {
                        values.Id = id;
                    }
                    self.update(entity, values, 'Id = ?', [ id ], onSuccess, PaCM.isFunction(onError) ? onError : onSqlError);
                } else {
                    self.insert(entity, values, onSuccess, PaCM.isFunction(onError) ? onError : onSqlError);
                }
            },
            delete: function (entity, where, parameters, onSuccess, onError) {
                dbContext.beginTransaction(function (tx) {
                    tx.delete(entities[entity], where, parameters);
                }, onSuccess, PaCM.isFunction(onError) ? onError : onSqlError, debugMode);
            }
        };
    });

})();
