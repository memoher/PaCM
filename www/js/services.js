(function () {

PaCM.servicesModule = angular.module('pacmApp.services', [])

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
