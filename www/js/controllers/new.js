(function () {
    
    PaCM.controllersModule.controller('newCtrl', function ($scope, $stateParams, $ionicModal, $ionicTabsDelegate, dataContext, userSession) {

        var debugMode = 4;
        
        $scope.runningProcess = false;
        
        $scope.tabs = {
            starterTab: true,
            batteryTab: false,
            chargerTab: false,
            machineTab: false,
            workToBeDoneTab: false,
            physicalInspectionTab: false,
            cellInspectionTab: false,
            suppliesTab: false,
            technicalReportTab: false
        };
        $scope.selectTab = function (tabName) {
            var i = 0;
            PaCM.eachProperties($scope.tabs, function (key, val) {
                if (key === tabName) {
                    $scope.tabs[key] = true;
                    $ionicTabsDelegate.select(i);
                    return i;
                }
                i += 1;
            });
        };
        
        // Create the login modal that we will use later
        $scope.searcher = {};
        $ionicModal.fromTemplateUrl('templates/searcher.html', {
            scope: $scope,
            focusFirstInput: false
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.searcher.open = function (type, title, data, onSelect) {
                var self = this;
                
                self.type = type;
                self.data = data;
                self.title = title;
                self.search = '';
                self.selectRecord = onSelect;
                
                $scope.modal.show();
            };
            $scope.searcher.close = function () {
                var self = this;
                
                self.type = null;
                self.data = null;
                self.title = null;
                self.search = null;
                self.selectRecord = null;
                
                $scope.modal.hide();
            };
        });
        
        $scope.searchCustomer = function () {
            dataContext.list('Customer', function (customers) {
                $scope.searcher.open(
                    'Customer',
                    'Buscar cliente',
                    customers,
                    function (r) {
                        $scope.maintenance.customerId = r.Id;
                        $scope.maintenance.customerName = r.Name;
                        //$scope.resetObjectType();
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetCustomer = function () {
            $scope.maintenance.customerId = null;
            $scope.maintenance.customerName = null;
            //$scope.resetObjectType();
        };
        
        $scope.searchObjectTypeTrademark = function (applyForBattery) {
            dataContext.list('ObjectTypeTrademark', function (trademarks) {
                $scope.searcher.open(
                    'ObjectTypeTrademark',
                    'Buscar marca',
                    trademarks,
                    function (r) {
                        if (applyForBattery === true) {
                            $scope.battery.trademarkId = r.Id;
                            $scope.battery.trademarkName = r.Name;
                        } else {
                            $scope.charger.trademarkId = r.Id;
                            $scope.charger.trademarkName = r.Name;
                        }
                        //$scope.resetObjectTypeModel(applyForBattery);
                        $scope.searcher.close();
                    }); 
            });
        };
        $scope.resetObjectTypeTrademark = function (applyForBattery) {
            if (applyForBattery === true) {
                $scope.battery.trademarkId = r.Id;
                $scope.battery.trademarkName = r.Name;
            } else {
                $scope.charger.trademarkId = r.Id;
                $scope.charger.trademarkName = r.Name;
            }
            //$scope.resetObjectTypeModel(applyForBattery);
        };
        
        $scope.searchObjectTypeModel = function (applyForBattery) {
            
            var where = {};
            if (applyForBattery === true) {
                if ($scope.battery.trademarkId)
                    where.TrademarkId = $scope.battery.trademarkId;
            } else {
                if ($scope.charger.trademarkId)
                    where.TrademarkId = $scope.charger.trademarkId;
            }
            
            dataContext.find2('ObjectTypeModel', where, function (models) {
                $scope.searcher.open(
                    'ObjectTypeModel',
                    'Buscar modelo',
                    models,
                    function (r) {
                        if (applyForBattery === true) {
                            $scope.battery.modelId = r.Id;
                            $scope.battery.modelName = r.Name;
                        } else {
                            $scope.charger.modelId = r.Id;
                            $scope.charger.modelName = r.Name;
                        }
                        dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                            if (applyForBattery === true) {
                                $scope.battery.trademarkId = t.Id;
                                $scope.battery.trademarkName = t.Name;
                            } else {
                                $scope.charger.trademarkId = t.Id;
                                $scope.charger.trademarkName = t.Name;
                            }
                        });
                        //$scope.resetObjectType(applyForBattery);
                        $scope.searcher.close();
                    }); 
            });
            
        };
        $scope.resetObjectTypeModel = function (applyForBattery) {
            if (applyForBattery === true) {
                $scope.battery.modelId = null;
                $scope.battery.modelName = null;
            } else {
                $scope.charger.modelId = null;
                $scope.charger.modelName = null;
            }
            //$scope.resetObjectType(applyForBattery);
        };
        
        
        $scope.newMaintenance = false;
        $scope.maintenance = {
            id: ($stateParams.maintenanceId) ? parseInt($stateParams.maintenanceId) : null,
            uniqueCode: null,
            date: new Date(),
            preventive: true,
            corrective: false,
            customerId: ($stateParams.customerId) ? parseInt($stateParams.customerId) : null,
            customerName: null,
            batteryId: $stateParams.elmType === 'battery' ? parseInt($stateParams.elmId) : null,
            chargerId: $stateParams.elmType === 'charger' ? parseInt($stateParams.elmId) : null,
            machineId: null,
            workToBeDone: null,
            checkList: null,
            reviewOfCells: null,
            articleOutput: null,
            technicalReport: null,
            statusId: 'InCapture',
            statusDescription: null,
            executedById: null,
            executedByUsername: null,
            acceptedBy: null
        };
        var getMaintenance = function () {
            if ($scope.maintenance.id != null) {
                dataContext.get('Maintenance', $scope.maintenance.id, function (r) {
                    if (r) {
                        $scope.maintenance.id = r.Id;
                        $scope.maintenance.uniqueCode = r.UniqueCode;
                        $scope.maintenance.date = r.Date;
                        $scope.maintenance.preventive = r.Preventive;
                        $scope.maintenance.corrective = r.Corrective;
                        $scope.maintenance.customerId = r.CustomerId;
                        $scope.maintenance.batteryId = (r.Type.indexOf('Battery') >= 0 ? r.ObjectTypeId : null );
                        $scope.maintenance.chargerId = (r.Type.indexOf('Charger') >= 0 ? r.ObjectTypeId : null );
                        $scope.maintenance.machineId = r.MachineId;
                        $scope.maintenance.workToBeDone = r.WorkToBeDone;
                        $scope.maintenance.checkList = [];
                        $scope.maintenance.reviewOfCells = [];
                        $scope.maintenance.articleOutput = [];
                        $scope.maintenance.technicalReport = r.TechnicalReport;
                        $scope.maintenance.statusId = r.StatusId;
                        $scope.maintenance.executedById = r.ExecutedById;
                        $scope.maintenance.acceptedBy = r.AcceptedBy;
                        dataContext.get('Customer', $scope.maintenance.customerId, function (c) {
                            $scope.maintenance.customerName = c.Name;
                        });
                        dataContext.get('MaintenanceStatus', $scope.maintenance.statusId, function (ms) {
                            $scope.maintenance.statusDescription = ms.Description;
                        });
                        dataContext.get('User', $scope.maintenance.executedById, function (u) {
                            $scope.maintenance.executedByUsername = u.Username;
                        });
                        getBattery();
                        getCharger();
                        getMachine();
                    }
                });
            }
        };
        var saveMaintenance = function () {
            
        };
        var finalizeMaintenance = function () {
            
        };
        
        $scope.battery = {
            id: null,
            description: null,
            trademarkId: null,
            trademarkName: null,
            modelId: null,
            modelName: null,
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
        var getBattery = function () {
            if ($scope.maintenance.batteryId != null) {
                dataContext.get('Battery', $scope.maintenance.batteryId, function (r) {
                    if (r) {
                        $scope.battery.id = r.Id;
                        $scope.battery.description = r.Description;
                        $scope.battery.trademarkId = r.TrademarkId;
                        $scope.battery.modelId = r.ModelId;
                        $scope.battery.serial = r.Serial;
                        $scope.battery.customerId = r.CustomerId;
                        $scope.battery.customerReference = r.CustomerReference;
                        $scope.battery.voltage = null;
                        $scope.battery.amperage = r.Amperage;
                        $scope.battery.connectorTypeId = r.ConnectorTypeId;
                        $scope.battery.connectorId = r.ConnectorId;
                        $scope.battery.connectorColorId = r.ConnectorColorId;
                        $scope.battery.standardBox = r.StandardBox;
                        $scope.battery.minimunWeight = r.MinimunWeight;
                        $scope.battery.maximunWeight = r.MaximunWeight;
                        $scope.battery.length = r.Length;
                        $scope.battery.width = r.Width;
                        $scope.battery.boxHeight = r.BoxHeight;
                        $scope.battery.handleHeight = r.HandleHeight;
                        $scope.battery.cover = r.Cover;
                        $scope.battery.drainHoles = r.DrainHoles;
                        dataContext.get('ObjectTypeModel', $scope.battery.modelId, function (m) {
                            $scope.battery.modelName = m.Name;
                        });
                        dataContext.get('ObjectTypeTrademark', $scope.battery.trademarkId, function (t) {
                            $scope.battery.trademarkName = t.Name;
                        });
                    }
                });
            }
        };
        var saveBattery = function () {
            
        };
        
        $scope.charger = {
            id: null,
            description: null,
            trademarkId: null,
            trademarkName: null,
            modelId: null,
            modelName: null,
            serial: null,
            customerId: null,
            customerReference: null,
            voltage: null,
            amperage: null
        };
        var getCharger = function () {
            if ($scope.maintenance.chargerId != null) {
                dataContext.get('Charger', $scope.maintenance.chargerId, function (r) {
                    if (r) {
                        $scope.charger.id = r.Id;
                        $scope.charger.description = r.Description;
                        $scope.charger.trademarkId = r.TrademarkId;
                        $scope.charger.modelId = r.ModelId;
                        $scope.charger.serial = r.Serial;
                        $scope.charger.customerId = r.CustomerId;
                        $scope.charger.customerReference = r.CustomerReference;
                        $scope.charger.voltage = r.Voltage;
                        $scope.charger.amperage = r.Amperage;
                        dataContext.get('ObjectTypeModel', $scope.charger.modelId, function (m) {
                            $scope.charger.modelName = m.Name;
                        });
                        dataContext.get('ObjectTypeTrademark', $scope.charger.trademarkId, function (t) {
                            $scope.charger.trademarkName = t.Name;
                        });
                    }
                });
            }
        };
        var saveCharger = function () {
            
        };
        
        $scope.machine = {
            id: null,
            description: null,
            trademarkId: null,
            trademarkName: null,
            modelId: null,
            modelName: null,
            serial: null,
            customerId: null,
            customerReference: null,
            compartmentLength: null,
            compartmentWidth: null,
            compartmentHeight: null
        };
        var getMachine = function () {
            if ($scope.maintenance.machineId != null) {
                dataContext.get('Machine', $scope.maintenance.machineId, function (r) {
                    if (r) {
                        $scope.machine.id = r.Id;
                        $scope.machine.description = r.Description;
                        $scope.machine.trademarkId = r.TrademarkId;
                        $scope.machine.modelId = r.ModelId;
                        $scope.machine.serial = r.Serial;
                        $scope.machine.customerId = r.CustomerId;
                        $scope.machine.customerReference = r.CustomerReference;
                        dataContext.get('MachineModel', $scope.machine.modelId, function (m) {
                            $scope.machine.modelName = m.Name;
                            $scope.machine.compartmentLength = m.CompartmentLength;
                            $scope.machine.compartmentWidth = m.CompartmentWidth;
                            $scope.machine.compartmentHeight = m.CompartmentHeight;
                        });
                        dataContext.get('MachineTrademark', $scope.machine.trademarkId, function (t) {
                            $scope.machine.trademarkName = t.Name;
                        });
                    }
                });
            }
        };
        var saveMachine = function () {
            
        };
        
        $scope.newBatteryMaintenance = function () {
            $scope.tabs.chargerTab = false;
            $scope.selectTab('batteryTab');
        };
        $scope.newChargerMaintenance = function () {
            $scope.tabs.batteryTab = false;
            $scope.tabs.cellInspectionTab = false;
            $scope.selectTab('chargerTab');
        };
        
        if ($scope.maintenance.id != null) {
            getMaintenance();
        } else {
            $scope.newMaintenance = true;
            if (userSession.isLogged()) {
                $scope.maintenance.executedById = userSession.user.Id;
                $scope.maintenance.executedByUsername = userSession.user.Username;
            }
            dataContext.get('MaintenanceStatus', $scope.maintenance.statusId, function (ms) {
                console.debug(ms);
                $scope.maintenance.statusDescription = ms.Description;
            });
            getBattery();
            getCharger();
            getMachine();
        }
        
    });
    
})();