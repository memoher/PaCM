(function () {

angular.module('starter.controllers', [])

    .controller('appCtrl', function ($scope) {

        $scope.model = {};
    })

    .controller('detailsCtrl', function ($scope, $stateParams, $ionicTabsDelegate, dbContext, dbSelects) {
        
        var debugMode = 1;
        
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
            onError: function (err) {
                console.debug(err);
            },
            getMaintenance: function (id) {
                var self = this;
                
                var _onSuccess = function (sqlResultSet) {
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
                };
                dbSelects.get('Maintenance', id, _onSuccess, self.onError, debugMode);
            },
            getCustomer: function (id) {
                var self = this;
                
                var _onSuccess = function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {

                    });
                };
                dbSelects.get('Customer', id, _onSuccess, self.onError, debugMode);
            },
            getBattery: function (id) {
                var self = this;
                
                var _onSuccess = function (sqlResultSet) {
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
                };
                dbSelects.get('Battery', id, _onSuccess, self.onError, debugMode);
            },
            getCharger: function (id) {
                var self = this;
                
                var _onSuccess = function (sqlResultSet) {
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
                };
                dbSelects.get('Charger', id, _onSuccess, self.onError, debugMode);
            },
            getMachine: function (id) {
                var self = this;
                
                var _onSuccess = function (sqlResultSet) {
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
                };
                dbSelects.get('Machine', id, _onSuccess, self.onError, debugMode);
            },
            getBatteryResources: function () {
                var self = this;
                
                dbSelects.list('ObjectTypeTrademark', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.trademarks.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
                dbSelects.list('ObjectTypeModel', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.models.push({
                            id: r.Id,
                            trademarkId: r.TrademarkId,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
                dbSelects.list('ConnectorType', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.connectorTypes.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
                dbSelects.list('Connector', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.connectors.push({
                            id: r.Id,
                            typeId: r.TypeId,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
                dbSelects.list('Color', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.connectorColors.push({
                            id: r.Id,
                            name: r.Name,
                            HEX: r.HEX
                        });
                    });
                }, self.onError, debugMode);
            },
            getChargerResources: function () {
                var self = this;
                
                dbSelects.list('ObjectTypeTrademark', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.trademarks.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
                dbSelects.list('ObjectTypeModel', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.models.push({
                            id: r.Id,
                            trademarkId: r.TrademarkId,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
            },
            getMachineResources: function () {
                var self = this;
                
                dbSelects.list('MachineTrademark', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.trademarks.push({
                            id: r.Id,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
                dbSelects.list('MachineModel', function (sqlResultSet) {
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        sbr.models.push({
                            id: r.Id,
                            trademarkId: r.TrademarkId,
                            name: r.Name
                        });
                    });
                }, self.onError, debugMode);
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
            dbSelects.list('Customer', function (sqlResultSet) {
                console.debug(sqlResultSet);
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    
                    ss.customers.push({
                        id: r.Id,
                        name: r.Name
                    });
                });
            }, dbSelectsFncs.onError, debugMode);
            dbSelects.list('Battery', function (sqlResultSet) {
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    ss.batteries.push({
                        id: r.Id,
                        customerId: r.CustomerId,
                        description: r.Description
                    });
                });
            }, dbSelectsFncs.onError, debugMode);
            dbSelects.list('Charger', function (sqlResultSet) {
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    ss.chargers.push({
                        id: r.Id,
                        customerId: r.CustomerId,
                        description: r.Description
                    });
                });
            }, dbSelectsFncs.onError, debugMode);
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
                function () {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert('Database installed successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    PaCM.showError(err, 'Failure during installation of the database');
                },
                1 /*Error*/);
        };

        $scope.importData = function () {
            $scope.runningProcess = true;
            dbContext.importData(
                function () {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert('Data imported successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    PaCM.showError(err, 'Fails during data import');
                },
                1 /*Error*/);
        };
    });

})();