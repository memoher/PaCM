(function () {

angular.module('starter.controllers', [])

    .controller('appCtrl', function ($scope) {

        $scope.model = {};
    })

    .controller('detailsCtrl', function ($scope, $stateParams, $ionicTabsDelegate, dbContext, dbSelects) {
        
        var debugMode = true;
        
        var sm = $scope.maintenance = {
            id: ($stateParams.maintenanceId) ? parseInt($stateParams.maintenanceId) : null,
            uniqueCode: null,
            date: null,
            preventive: null,
            corrective: null,
            customerId: ($stateParams.customerId) ? parseInt($stateParams.customerId) : null,
            batteryId: $stateParams.elmType === 'battery' ? parseInt($stateParams.elmId) : null,
            chargerId: $stateParams.elmType === 'charger' ? parseInt($stateParams.elmId) : null,
            machineId: null,
            workToBeDone: null,
            checkList: null,
            reviewOfCells: null,
            articleOutput: null,
            technicalReport: null,
            statusId: null,
            executedById: null,
            acceptedBy: null
        };
        var smr = $scope.maintenanceResources = {
            
        };
        var sb = $scope.battery = {
            id: null,
            trademarkId: null,
            modelId: null,
            serial: null,
            customerId: null,
            customerReference: null,
            voltage: null,
            amperage: null,
            connectorTypeId: null,
            connectorId: null,
            connectorColorId: null,
            standardBox: null,
            minimunWeight: null,
            maximunWeight: null,
            length: null,
            width: null,
            boxHeight: null,
            handleHeight: null,
            cover: null,
            drainHoles: null            
        };
        var sbr = $scope.batteryResources = {
            trademarks: [],
            models: [],
            connectorTypes: [],
            connectors: [],
            connectorColors: []
        };
        var sc = $scope.charger = {
            id: null,
            trademarkId: null,
            modelId: null,
            serial: null,
            customerId: null,
            customerReference: null,
            voltage: null,
            amperage: null
        };
        var scr = $scope.chargerResources = {
            trademarks: [],
            models: []
        };
        var sd = $scope.machine = {
            id: null,
            trademarkId: null,
            modelId: null,
            serial: null,
            customerId: null,
            customerReference: null,
            compartmentLength: null,
            compartmentWidth: null,
            compartmentHeight: null
        };
        var sdr = $scope.machineResources = {
            trademarks: [],
            models: []
        };
        
        var loadData = function () {
            if (sm.id) {
                dbSelectsFncs.getMaintenance(sm.id);
            }
            else {
                if (sm.customerId) {
                    dbSelectsFncs.getCustomer(sm.customerId);
                }
                if (sm.batteryId) {
                    dbSelectsFncs.getBattery(sm.batteryId);
                }
                if (sm.chargerId) {
                    dbSelectsFncs.getCharger(sm.chargerId);
                }
                if (sm.machineId) {
                    dbSelectsFncs.getMachine(sm.machineId);
                }
            }
        };
        
        var loadResources = function () {
            dbSelectsFncs.getBatteryResources();
            dbSelectsFncs.getChargerResources();
            dbSelectsFncs.getMachineResources();
        };
        
        var dbSelectsFncs = {
            getMaintenance: function (id) {
                var self = this;
                
                dbSelects.get('Maintenance', id, debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sm.id = r.Id;
                        sm.uniqueCode = r.UniqueCode;
                        sm.date = r.Date;
                        sm.preventive = r.Preventive;
                        sm.corrective = r.Corrective;
                        sm.customerId = r.CustomerId;
                        sm.batteryId = r.BatteryId;
                        sm.chargerId = r.ChargerId;
                        sm.machineId = r.MachineId;
                        sm.workToBeDone = r.WorkToBeDone;
                        sm.checkList = [];
                        sm.reviewOfCells = [];
                        sm.articleOutput = [];
                        sm.technicalReport = r.TechnicalReport;
                        sm.statusId = r.StatusId;
                        sm.executedById = r.ExecutedById;
                        sm.acceptedBy = r.AcceptedBy;
                        
                        if (sm.customerId) {
                            self.getCustomer(sm.customerId);
                        }
                        if (sm.batteryId) {
                            self.getBattery(sm.batteryId);
                        }
                        if (sm.chargerId) {
                            self.getCharger(sm.chargerId);
                        }
                        if (sm.machineId) {
                            self.getMachine(sm.machineId);
                        }
                    });
                });
            },
            getCustomer: function (id) {
                dbSelects.get('Customer', id, debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        console.debug(r);
                    });
                });
            },
            getBattery: function (id) {
                dbSelects.get('Battery', id, debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sb.id = r.Id;
                        sb.trademarkId = r.TrademarkId;
                        sb.modelId = r.ModelId;
                        sb.serial = r.Serial;
                        sb.customerId = r.CustomerId;
                        sb.customerReference = r.CustomerReference;
                        sb.voltage = null;
                        sb.amperage = r.Amperage;
                        sb.connectorTypeId = r.ConnectorTypeId;
                        sb.connectorId = r.ConnectorId;
                        sb.connectorColorId = r.ConnectorColorId;
                        sb.standardBox = r.StandardBox;
                        sb.minimunWeight = r.MinimunWeight;
                        sb.maximunWeight = r.MaximunWeight;
                        sb.length = r.Length;
                        sb.width = r.Width;
                        sb.boxHeight = r.BoxHeight;
                        sb.handleHeight = r.HandleHeight;
                        sb.cover = r.Cover;
                        sb.drainHoles = r.DrainHoles;           
                    });
                });
            },
            getCharger: function (id) {
                dbSelects.get('Charger', id, debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sc.id = r.Id;
                        sc.trademarkId = r.TrademarkId;
                        sc.modelId = r.ModelId;
                        sc.serial = r.Serial;
                        sc.customerId = r.CustomerId;
                        sc.customerReference = r.CustomerReference;
                        sc.voltage = r.Voltage;
                        sc.amperage = r.Amperage;
                    });
                });
            },
            getMachine: function (id) {
                dbSelects.get('Machine', id, debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sd.id = r.Id;
                        sd.trademarkId = r.TrademarkId;
                        sd.modelId = r.ModelId;
                        sd.serial = r.Serial;
                        sd.customerId = r.CustomerId;
                        sd.customerReference = r.CustomerReference;
                        sd.compartmentLength = r.CompartmentLength;
                        sd.compartmentWidth = r.CompartmentWidth;
                        sd.compartmentHeight = r.CompartmentHeight;
                    });
                });
            },
            getBatteryResources: function () {
                dbSelects.list('ObjectTypeTrademark', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.trademarks.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                });
                dbSelects.list('ObjectTypeModel', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.models.push({
                            id: r.Id,
                            trademarkId: r.TrademarkId,
                            name: r.Name
                        });
                    });
                });
                dbSelects.list('ConnectorType', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.connectorTypes.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                });
                dbSelects.list('Connector', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.connectors.push({
                            id: r.Id,
                            typeId: r.TypeId,
                            name: r.Name
                        });
                    });
                });
                dbSelects.list('Color', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.connectorColors.push({
                            id: r.Id,
                            name: r.Name,
                            HEX: r.HEX
                        });
                    });
                });
            },
            getChargerResources: function () {
                dbSelects.list('ObjectTypeTrademark', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.trademarks.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                });
                dbSelects.list('ObjectTypeModel', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.models.push({
                            id: r.Id,
                            trademarkId: r.TrademarkId,
                            name: r.Name
                        });
                    });
                });
            },
            getMachineResources: function () {
                dbSelects.list('MachineTrademark', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.trademarks.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                });
                dbSelects.list('MachineModel', debugMode).then(function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.models.push({
                            id: r.Id,
                            trademarkId: r.TrademarkId,
                            name: r.Name
                        });
                    });
                });
            }
        };
        
        
        var st = $scope.tabs = {
            hideSearcherTab: true,
            hideBatteryTab: true,
            hideChargerTab: true,
            hideMachineTab: true,
            hideWorkToBeDoneTab: true,
            hidePhysicalInspectionTab: true,
            hideCellInspectionTab: true,
            hideSuppliesTab: true,
            hideTechnicalReportTab: true 
        };
        var tabsRefresh = function () {
            if (sm.id) {
                if (st.hideSearcherTab != true)
                    st.hideSearcherTab = true;
            } else {
                if (st.hideSearcherTab != false)
                    st.hideSearcherTab = false;
            }
            if (!(sm.batteryId)) {
                if (st.hideBatteryTab != true)
                    st.hideBatteryTab = true;
                if (st.hideCellInspectionTab != true)
                    st.hideCellInspectionTab = true;
            } else {
                if (st.hideBatteryTab != false)
                    st.hideBatteryTab = false;
                if (st.hideCellInspectionTab != false)
                    st.hideCellInspectionTab = false;
            }
            if (!(sm.chargerId)) {
                if (st.hideChargerTab != true)
                    st.hideChargerTab = true;
            } else {
                if (st.hideChargerTab != false)
                    st.hideChargerTab = false;
            }
            if (sm.corrective != true) {
                if (st.hideSuppliesTab != true)
                    st.hideSuppliesTab = true;
            } else {
                if (st.hideSuppliesTab != false)
                    st.hideSuppliesTab = false;
            }
            if (st.hideBatteryTab == true && st.hideChargerTab == true) {
                st.hideMachineTab = true;
                st.hideWorkToBeDoneTab = true;
                st.hidePhysicalInspectionTab = true;
                st.hideTechnicalReportTab = true;
            } else {
                st.hideMachineTab = false;
                st.hideWorkToBeDoneTab = false;
                st.hidePhysicalInspectionTab = false;
                st.hideTechnicalReportTab = false;
            }
        };
        
        
        var ss = $scope.searcher = {
            search: '',
            customers: [],
            batteries: [],
            chargers: [],
            hideList: true
        };
        var searcherInitialize = function () {
            dbSelects.list('Customer', debugMode).then(function (sqlResultSet) {
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    ss.customers.push({
                        id: r.Id,
                        name: r.Name
                    });
                });
            });
            dbSelects.list('Battery', debugMode).then(function (sqlResultSet) {
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    ss.batteries.push({
                        id: r.Id,
                        customerId: r.CustomerId,
                        description: r.Description
                    });
                });
            });
            dbSelects.list('Charger', debugMode).then(function (sqlResultSet) {
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    ss.chargers.push({
                        id: r.Id,
                        customerId: r.CustomerId,
                        description: r.Description
                    });
                });
            });
        };
        $scope.searcherOnChange = function () {
            if (ss.search == '' || ss.search == null) {
                if (ss.hideList != true)
                    ss.hideList = true;
            } else {
                if (ss.hideList != false)
                    ss.hideList = false;
            }
        };
        
        
        $scope.onSelectCustomer = function (customerId) {
            sm.customerId = customerId;
            sm.batteryId = null;
            sm.chargerId = null;
            tabsRefresh();
        };
        $scope.onSelectBattery = function (customerId, batteryId) {
            sm.customerId = customerId;
            sm.batteryId = batteryId;
            sm.chargerId = null;
            loadData();
            tabsRefresh();
            $ionicTabsDelegate.select(1);
        };
        $scope.onSelectCharger = function (customerId, chargerId) {
            sm.customerId = customerId;
            sm.batteryId = null;
            sm.chargerId = chargerId;
            loadData();
            tabsRefresh();
            $ionicTabsDelegate.select(1);
        };

        
        tabsRefresh();
        if (sm.id) {
            loadData();
        } else {
            searcherInitialize();
        }
        loadResources();
    })

    .controller('recordsCtrl', function ($scope) {

        $scope.model = {};
    })

    .controller('toolsCtrl', function ($scope, dbContext) {

        $scope.runningProcess = false;

        $scope.installDatabase = function () {
            $scope.runningProcess = true;
            dbContext.installDatabase(
                function (successMessage) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert(successMessage);
                },
                function (errorMessage) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert(errorMessage);
                },
                false);
        };

        $scope.importData = function () {
            $scope.runningProcess = true;
            dbContext.importData(
                function (successMessage) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert(successMessage);
                },
                function (errorMessage) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert(errorMessage);
                },
                false);
        };
    });

})();