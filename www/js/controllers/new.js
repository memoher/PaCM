(function () {
    
    PaCM.controllersModule.controller('newCtrl', function ($window, $scope, $state, $stateParams, $ionicModal, $ionicTabsDelegate, dataContext, userSession) {

        if (!userSession.isLogged()) {
            $state.go('app.login');
        }

        var _self = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.dev_width = $window.innerWidth;
        $scope.dev_height = $window.innerHeight;        
        
        $scope.tabs = {
            starterTab: true,
            batteryTab: false,
            chargerTab: false,
            machineTab: function () {
                return (this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage);
            },
            workToBeDoneTab: function () {
                return (this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage);
            },
            physicalInspectionTab: function () {
                return (this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage);
            },
            cellInspectionTab: function () {
                return (this.batteryTab === true && $scope.battery.typeId);
            },
            suppliesTab: function () {
                return ($scope.maintenance.corrective === true) && ((this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage));
            },
            technicalReportTab: function () {
                return (this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage);
            },
            endingTab: function () {
                return ($scope.maintenance.technicalReport) && ((this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage));
            }
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

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        // Create the modal popup searcher
        $scope.searcher = {};
        $ionicModal.fromTemplateUrl('templates/searcher.html', {
            scope: $scope,
            focusFirstInput: false
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.searcher.open = function (type, title, data, search, onSelect) {
                var self = this;
                
                self.type = type;
                self.title = title;
                self.data = data;
                self.search = search ? search : '';
                self.selectRecord = onSelect;
                
                $scope.modal.show();
            };
            $scope.searcher.close = function () {
                var self = this;
                
                delete self.type;
                delete self.title;
                PaCM.cleaner(self.data); delete self.data;
                delete self.search;
                delete self.selectRecord;
                
                $scope.modal.hide();
            };
        });
        
        $scope.filters = {
            customerSearch: null,
            objectTypeTrademarkSearch: null,
            objectTypeModelSearch: null,
            objectTypeSearch: null,
            machineTrademarkSearch: null,
            machineModelSearch: null,
            machineSearch: null
        };
        
        $scope.searchCustomer = function () {
            dataContext.list('Customer', 'r.Name', function (customers) {
                if ($scope.maintenance.customerId != null) {
                    PaCM.eachArray(customers, function (inx, c) {
                        if (c.Id == $scope.maintenance.customerId) {
                            c.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'Customer',
                    'Buscar cliente',
                    customers,
                    $scope.filters.customerSearch,
                    function (r) {
                        $scope.maintenance.customerId = r.Id;
                        $scope.maintenance.customerName = r.Name;
                        $scope.filters.customerSearch = $scope.searcher.search;
                        $scope.resetObjectType(true);
                        $scope.resetObjectType(false);
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetCustomer = function () {
            $scope.maintenance.customerId = null;
            $scope.maintenance.customerName = null;
            $scope.filters.customerSearch = null;
            $scope.resetObjectType(true);
            $scope.resetObjectType(false);
        };
        
        $scope.searchObjectTypeTrademark = function (applyForBattery) {
            dataContext.list('ObjectTypeTrademark', 'r.Name', function (trademarks) {
                if ($scope.battery.trademarkId != null || $scope.charger.trademarkId != null) {
                    PaCM.eachArray(trademarks, function (inx, t) {
                        if (t.Id == (applyForBattery === true ? $scope.battery.trademarkId : $scope.charger.trademarkId)) {
                            t.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'ObjectTypeTrademark',
                    'Buscar marca',
                    trademarks,
                    $scope.filters.objectTypeTrademarkSearch,
                    function (r) {
                        if (applyForBattery === true) {
                            $scope.battery.trademarkId = r.Id;
                            $scope.battery.trademarkName = r.Name;
                        } else {
                            $scope.charger.trademarkId = r.Id;
                            $scope.charger.trademarkName = r.Name;
                        }
                        $scope.filters.objectTypeTrademarkSearch = $scope.searcher.search;
                        $scope.resetObjectTypeModel(applyForBattery);
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
            $scope.filters.objectTypeTrademarkSearch = null;
            $scope.resetObjectTypeModel(applyForBattery);
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
                if ($scope.battery.modelId != null || $scope.charger.modelId != null) {
                    PaCM.eachArray(models, function (inx, m) {
                        if (m.Id == (applyForBattery === true ? $scope.battery.modelId : $scope.charger.modelId)) {
                            m.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'ObjectTypeModel',
                    'Buscar modelo',
                    models,
                    $scope.filters.objectTypeModelSearch,
                    function (r) {
                        if (applyForBattery === true) {
                            $scope.battery.modelId = r.Id;
                            $scope.battery.modelName = r.Name;
                        } else {
                            $scope.charger.modelId = r.Id;
                            $scope.charger.modelName = r.Name;
                        }
                        $scope.filters.objectTypeModelSearch = $scope.searcher.search;
                        dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                            if (applyForBattery === true) {
                                $scope.battery.trademarkId = t.Id;
                                $scope.battery.trademarkName = t.Name;
                            } else {
                                $scope.charger.trademarkId = t.Id;
                                $scope.charger.trademarkName = t.Name;
                            }
                        });
                        $scope.resetObjectType(applyForBattery);
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
            $scope.filters.objectTypeModelSearch = null;
            $scope.resetObjectType(applyForBattery);
        };
        
        $scope.searchObjectType = function (applyForBattery) {

            var where = {};
            if ($scope.maintenance.customerId)
                where.CustomerId = $scope.maintenance.customerId;
            if (applyForBattery === true) {
                if ($scope.battery.trademarkId)
                    where.TrademarkId = $scope.battery.trademarkId;
                if ($scope.battery.modelId)
                    where.ModelId = $scope.battery.modelId;
            } else {
                if ($scope.charger.trademarkId)
                    where.TrademarkId = $scope.charger.trademarkId;
                if ($scope.charger.modelId)
                    where.ModelId = $scope.charger.modelId;
            }
            
            dataContext.find2(applyForBattery ? 'Battery' : 'Charger', where, function (objects) {
                if ($scope.maintenance.batteryId != null || $scope.maintenance.chargerId != null) {
                    PaCM.eachArray(objects, function (inx, ot) {
                        if (ot.Id == (applyForBattery === true ? $scope.maintenance.batteryId : $scope.maintenance.chargerId)) {
                            ot.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'ObjectType',
                    applyForBattery ? 'Buscar bateria' : 'Buscar cargador',
                    objects,
                    $scope.filters.objectTypeSearch,
                    function (r) {
                        if (applyForBattery === true) {
                            $scope.maintenance.batteryId = r.Id;
                            _self.getBattery();
                        } else {
                            $scope.maintenance.chargerId = r.Id;
                            _self.getCharger();
                        }
                        $scope.filters.objectTypeSearch = $scope.searcher.search;
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetObjectType = function (applyForBattery) {
            if (applyForBattery === true) {
                $scope.maintenance.batteryId = null;
                $scope.battery.serial = null;
                $scope.battery.customerReference = null;
                $scope.battery.typeId = null;
                $scope.battery.amperage = null;
                $scope.battery.connectorTypeId = null;
                $scope.battery.connectorId = null;
                $scope.battery.connectorColorId = null;
                $scope.battery.standarBox = false;
                $scope.battery.cover = false;
                $scope.battery.drainHoles = false;
                $scope.battery.minimunWeight = null;
                $scope.battery.maximunWeight = null;
                $scope.battery.length = null;
                $scope.battery.width = null;
                $scope.battery.handleHeight = null;
                $scope.battery.boxHeight = null;
            } else {
                $scope.maintenance.chargerId = null;
                $scope.charger.serial = null;
                $scope.charger.customerReference = null;
                $scope.charger.voltage = null;
                $scope.charger.amperage = null;
            }
            $scope.filters.objectTypeSearch = null;
        };
        
        $scope.searchMachineTrademark = function () {
            dataContext.list('MachineTrademark', 'r.Name', function (trademarks) {
                if ($scope.machine.trademarkId != null) {
                    PaCM.eachArray(trademarks, function (inx, t) {
                        if (t.Id == $scope.machine.trademarkId) {
                            t.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'MachineTrademark',
                    'Buscar marca',
                    trademarks,
                    $scope.filters.machineTrademarkSearch,
                    function (r) {
                        $scope.machine.trademarkId = r.Id;
                        $scope.machine.trademarkName = r.Name;
                        $scope.filters.machineTrademarkSearch = $scope.searcher.search;
                        $scope.resetMachineModel();
                        $scope.searcher.close();
                    }); 
            });
        };
        $scope.resetMachineTrademark = function () {
            $scope.machine.trademarkId = null;
            $scope.machine.trademarkName = null;
            $scope.filters.machineTrademarkSearch = null;
            $scope.resetMachineModel();
        };
        
        $scope.searchMachineModel = function () {
            
            var where = {};
            if ($scope.machine.trademarkId)
                where.TrademarkId = $scope.machine.trademarkId;
            
            dataContext.find2('MachineModel', where, function (models) {
                if ($scope.machine.modelId != null) {
                    PaCM.eachArray(models, function (inx, m) {
                        if (m.Id == $scope.machine.modelId) {
                            m.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'MachineModel',
                    'Buscar modelo',
                    models,
                    $scope.filters.machineModelSearch,
                    function (r) {
                        $scope.machine.modelId = r.Id;
                        $scope.machine.modelName = r.Name;
                        $scope.machine.compartmentLength = r.CompartmentLength;
                        $scope.machine.compartmentWidth = r.CompartmentWidth;
                        $scope.machine.compartmentHeight = r.CompartmentHeight;
                        $scope.filters.machineModelSearch = $scope.searcher.search;
                        dataContext.get('MachineTrademark', r.TrademarkId, function (t) {
                            $scope.machine.trademarkId = t.Id;
                            $scope.machine.trademarkName = t.Name;
                        });
                        $scope.resetMachine();
                        $scope.searcher.close();
                    }); 
            });
            
        };
        $scope.resetMachineModel = function () {
            $scope.machine.modelId = null;
            $scope.machine.modelName = null;
            $scope.machine.compartmentLength = null;
            $scope.machine.compartmentWidth = null;
            $scope.machine.compartmentHeight = null;
            $scope.filters.machineModelSearch = null;
            $scope.resetMachine();
        };
        
        $scope.searchMachine = function () {
            
            var where = {};
            if ($scope.maintenance.customerId)
                where.CustomerId = $scope.maintenance.customerId;
            if ($scope.machine.trademarkId)
                where.TrademarkId = $scope.machine.trademarkId;
            if ($scope.machine.modelId)
                where.ModelId = $scope.machine.modelId;
            
            dataContext.find2('Machine', where, function (machines) {
                if ($scope.maintenance.machineId != null) {
                    PaCM.eachArray(machines, function (inx, m) {
                        if (m.Id == $scope.maintenance.machineId) {
                            m.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'Machine',
                    'Buscar máquina',
                    machines,
                    $scope.filters.machineSearch,
                    function (r) {
                        $scope.maintenance.machineId = r.Id;
                        _self.getMachine();
                        $scope.filters.machineSearch = $scope.searcher.search;
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetMachine = function () {
            $scope.maintenance.machineId = null;
            $scope.machine.serial = null;
            $scope.machine.customerReference = null;
            $scope.filters.machineSearch = null;
        };
        
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

        $scope.newMaintenance = false;
        $scope.maintenance = {
            id: ($stateParams.maintenanceId) ? $stateParams.maintenanceId : null,
            uniqueCode: null,
            date: null,
            preventive: false,
            corrective: false,
            customerId: ($stateParams.customerId) ? $stateParams.customerId : null,
            customerName: null,
            batteryId: $stateParams.elmType === 'battery' ? $stateParams.elmId : null,
            chargerId: $stateParams.elmType === 'charger' ? $stateParams.elmId : null,
            machineId: null,
            workToBeDone: null,
            technicalReport: null,
            statusId: null,
            statusDescription: null,
            executedById: null,
            executedByUsername: null,
            acceptedBy: null
        };
        _self.getMaintenance = function () {
            if ($scope.maintenance.id != null) {
                dataContext.get('Maintenance', $scope.maintenance.id, function (r) {
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
                    if ($scope.maintenance.batteryId != null) {
                        $scope.tabs.batteryTab = true;
                        _self.getBattery();
                    }
                    if ($scope.maintenance.chargerId != null) {
                        $scope.tabs.chargerTab = true;
                        _self.getCharger();
                    }
                    if ($scope.maintenance.machineId != null) {
                        _self.getMachine();
                    }
                    _self.refreshUI();
                });
            }
        };
        _self.saveMaintenance = function (onSuccess) {
            var m = {
                UniqueCode: $scope.maintenance.uniqueCode,
                Date: $scope.maintenance.date,
                Preventive: $scope.maintenance.preventive,
                Corrective: $scope.maintenance.corrective,
                CustomerId: $scope.maintenance.customerId,
                Type: $scope.maintenance.batteryId != null ? 'BatteryMaintenance' : 'ChargerMaintenance',
                ObjectTypeId: $scope.maintenance.batteryId != null ? $scope.maintenance.batteryId : $scope.maintenance.chargerId,
                MachineId: $scope.maintenance.machineId,
                WorkToBeDone: $scope.maintenance.workToBeDone,
                TechnicalReport: $scope.maintenance.technicalReport,
                ExecutedById: $scope.maintenance.executedById,
                StatusId: $scope.maintenance.statusId,
                AcceptedBy: $scope.maintenance.acceptedBy
            };
            dataContext.save('Maintenance', $scope.maintenance.id, m, function () {
                $scope.maintenance.id = m.Id;
                onSuccess();
            });
        };
        
        $scope.battery = {
            //id: null,
            description: null,
            trademarkId: null,
            trademarkName: null,
            modelId: null,
            modelName: null,
            serial: null,
            //customerId: null,
            customerReference: null,
            typeId: null,
            amperage: null,
            connectorTypeId: null,
            connectorId: null,
            connectorColorId: null,
            standardBox: false,
            minimunWeight: null,
            maximunWeight: null,
            length: null,
            width: null,
            boxHeight: null,
            handleHeight: null,
            cover: false,
            drainHoles: false            
        };
        _self.getBattery = function () {
            if ($scope.maintenance.batteryId != null) {
                dataContext.get('Battery', $scope.maintenance.batteryId, function (r) {
                    //$scope.battery.id = r.Id;
                    $scope.battery.description = r.Description;
                    $scope.battery.trademarkId = r.TrademarkId;
                    $scope.battery.modelId = r.ModelId;
                    $scope.battery.serial = r.Serial;
                    //$scope.battery.customerId = r.CustomerId;
                    $scope.battery.customerReference = r.CustomerReference;
                    $scope.battery.typeId = r.TypeId;
                    $scope.battery.amperage = r.Amperage;
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
                    dataContext.get('Connector', $scope.battery.connectorId, function (c) {
                        $scope.battery.connectorTypeId = c.TypeId;
                    });
                    dataContext.get('ObjectTypeModel', $scope.battery.modelId, function (m) {
                        $scope.battery.modelName = m.Name;
                    });
                    dataContext.get('ObjectTypeTrademark', $scope.battery.trademarkId, function (t) {
                        $scope.battery.trademarkName = t.Name;
                    });
                    _self.refreshUI();
                    _self.getCheckList();
                    _self.getReviewOfCells();
                });
            }
        };
        _self.saveBatteryTrademark = function (onSuccess) {
            if ($scope.battery.trademarkId == null) {
                var r = {
                    Name: $scope.battery.trademarkName
                };
                dataContext.insert('ObjectypeTrademark', r, function () {
                    $scope.battery.trademarkId = r.Id;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        };
        _self.saveBatteryModel = function (onSuccess) {
            if ($scope.battery.modelId == null) {
                var r = {
                    Name: $scope.battery.modelName,
                    TrademarkId: $scope.battery.trademarkId
                };
                dataContext.insert('ObjectypeModel', r, function () {
                    $scope.battery.modelId = r.Id;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        };
        _self.saveBattery = function (onSuccess) {
            var ot = {
                ModelId: $scope.battery.modelId,
                Serial: $scope.battery.serial,
                CustomerId: $scope.maintenance.customerId,
                CustomerReference: $scope.battery.customerReference,
                Enabled: true
            };
            dataContext.save('ObjectType', $scope.maintenance.batteryId, ot, function () {
                var b = {
                    Id: ot.Id,
                    TypeId: $scope.battery.typeId,
                    Amperage: $scope.battery.amperage,
                    ConnectorId: $scope.battery.connectorId,
                    ConnectorColorId: $scope.battery.connectorColorId,
                    StandardBox: $scope.battery.standardBox,
                    Cover: $scope.battery.cover,
                    DrainHoles: $scope.battery.drainHoles,
                    MinimunWeight: $scope.battery.minimunWeight,
                    MaximunWeight: $scope.battery.maximunWeight,
                    Length: $scope.battery.length,
                    Width: $scope.battery.width,
                    BoxHeight: $scope.battery.boxHeight,
                    HandleHeight: $scope.battery.handleHeight
                };
                dataContext.save('Battery', $scope.maintenance.batteryId, b, function () {
                    $scope.maintenance.batteryId = b.Id;
                    onSuccess();
                });
            });
        };

        $scope.showConnectorColorList = function () {
            var result = 
            PaCM.eachArray($scope.resources.connectorTypes, function (inx, ct) {
                if (ct.id === $scope.battery.connectorTypeId) {
                    return ct.colorRequired;
                }
            });
            return (result === true);
        };
        
        $scope.charger = {
            //id: null,
            description: null,
            trademarkId: null,
            trademarkName: null,
            modelId: null,
            modelName: null,
            serial: null,
            //customerId: null,
            customerReference: null,
            voltage: null,
            amperage: null
        };
        _self.getCharger = function () {
            if ($scope.maintenance.chargerId != null) {
                dataContext.get('Charger', $scope.maintenance.chargerId, function (r) {
                    //$scope.charger.id = r.Id;
                    $scope.charger.description = r.Description;
                    $scope.charger.trademarkId = r.TrademarkId;
                    $scope.charger.modelId = r.ModelId;
                    $scope.charger.serial = r.Serial;
                    //$scope.charger.customerId = r.CustomerId;
                    $scope.charger.customerReference = r.CustomerReference;
                    $scope.charger.voltage = r.Voltage;
                    $scope.charger.amperage = r.Amperage;
                    dataContext.get('ObjectTypeModel', $scope.charger.modelId, function (m) {
                        $scope.charger.modelName = m.Name;
                    });
                    dataContext.get('ObjectTypeTrademark', $scope.charger.trademarkId, function (t) {
                        $scope.charger.trademarkName = t.Name;
                    });
                    _self.refreshUI();
                    _self.getCheckList();
                });
            }
        };
        _self.saveChargerTrademark = function (onSuccess) {
            if ($scope.charger.trademarkId == null) {
                var r = {
                    Name: $scope.charger.trademarkName
                };
                dataContext.insert('ObjectypeTrademark', r, function () {
                    $scope.charger.trademarkId = r.Id;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        };
        _self.saveChargerModel = function (onSuccess) {
            if ($scope.charger.modelId == null) {
                var r = {
                    Name: $scope.charger.modelName,
                    TrademarkId: $scope.charger.trademarkId
                };
                dataContext.insert('ObjectypeModel', r, function () {
                    $scope.charger.modelId = r.Id;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        };
        _self.saveCharger = function (onSuccess) {
            var ot = {
                ModelId: $scope.charger.modelId,
                Serial: $scope.charger.serial,
                CustomerId: $scope.maintenance.customerId,
                CustomerReference: $scope.charger.customerReference,
                Enabled: true
            };
            dataContext.save('ObjectType', $scope.maintenance.chargerId, ot, function () {
                var c = {
                    Id: ot.Id,
                    Voltage: $scope.charger.voltage,
                    Amperage: $scope.charger.amperage,
                };
                dataContext.save('Charger', $scope.maintenance.chargerId, c, function () {
                    $scope.maintenance.chargerId = c.Id;
                    onSuccess();
                });
            });
        };
        
        $scope.machine = {
            //id: null,
            description: null,
            trademarkId: null,
            trademarkName: null,
            modelId: null,
            modelName: null,
            serial: null,
            //customerId: null,
            customerReference: null,
            compartmentLength: null,
            compartmentWidth: null,
            compartmentHeight: null
        };
        _self.getMachine = function () {
            if ($scope.maintenance.machineId != null) {
                dataContext.get('Machine', $scope.maintenance.machineId, function (r) {
                    //$scope.machine.id = r.Id;
                    $scope.machine.description = r.Description;
                    $scope.machine.trademarkId = r.TrademarkId;
                    $scope.machine.modelId = r.ModelId;
                    $scope.machine.serial = r.Serial;
                    //$scope.machine.customerId = r.CustomerId;
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
                    _self.refreshUI();
                });
            }
        };
        _self.saveMachineTrademark = function (onSuccess) {
            if ($scope.machine.trademarkId == null) {
                var r = {
                    Name: $scope.machine.trademarkName
                };
                dataContext.insert('MachineTrademark', r, function () {
                    $scope.machine.trademarkId = r.Id;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        };
        _self.saveMachineModel = function (onSuccess) {
            if ($scope.machine.modelId == null) {
                var r = {
                    Name: $scope.machine.modelName,
                    TrademarkId: $scope.machine.trademarkId,
                    CompartmentLength: $scope.machine.compartmentLength,
                    CompartmentWidth: $scope.machine.compartmentWidth,
                    CompartmentHeight: $scope.machine.compartmentHeight
                };
                dataContext.insert('MachineModel', r, function () {
                    $scope.machine.modelId = r.Id;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        };
        _self.saveMachine = function (onSuccess) {
            var m = {
                ModelId: $scope.machine.modelId,
                Serial: $scope.machine.serial,
                CustomerId: $scope.maintenance.customerId,
                CustomerReference: $scope.machine.customerReference
            };
            dataContext.save('Machine', $scope.maintenance.machineId, m, function () {
                $scope.maintenance.machineId = m.Id;
                onSuccess();
            });
        };

        $scope.checkList = [];
        _self.getCheckList = function () {
            var arr1 = [];
            var arr2 = [];

            var actions = [];
            actions.push(function (onSuccess) {
                var where = { EnabledBatteries: false, EnabledChargers: false };
                if ($scope.battery.typeId != null) {
                    where = { EnabledBatteries: true };
                }
                if ($scope.charger.voltage != null) {
                    where = { EnabledChargers: true };
                }
                dataContext.find2('Check', where, function (checks) {
                    PaCM.eachArray(checks, function (inx, c) {
                        arr1.push({
                            id: null,
                            checkId: c.Id,
                            checkName: c.Name,
                            checkOrder: c.Order,
                            diagnosticTypeId: c.DiagnosticTypeId,
                            diagnosticId: null,
                            comments: null
                        });
                    });
                    onSuccess();
                });
            });
            actions.push(function (onSuccess) {
                if ($scope.maintenance.id != null) {
                    dataContext.find2('MaintenanceCheck', { MaintenanceId: $scope.maintenance.id }, function (maintenanceChecks) {
                        PaCM.eachArray(maintenanceChecks, function (inx, mc) {
                            arr2.push({
                                id: mc.Id,
                                checkId: mc.CheckId,
                                checkName: mc.CheckName,
                                checkOrder: mc.CheckOrder,
                                diagnosticTypeId: mc.DiagnosticTypeId,
                                diagnosticId: mc.DiagnosticId,
                                comments: mc.Comments
                            });
                        });
                        onSuccess();
                    });
                } else {
                    onSuccess();
                }
            });
            PaCM.execute(actions, function () {
                var arrDef = [];
                PaCM.mergeArray(['checkId'], arrDef, arr1, arr2);
                PaCM.cleaner(arr1); delete arr1;
                PaCM.cleaner(arr2); delete arr2;
                PaCM.syncronizeArray(['checkId'], $scope.checkList, arrDef);
                PaCM.cleaner(arrDef); delete arrDef;
                _self.refreshUI();
            });
        };
        _self.saveCheckList = function (onSuccess) {

            var _saveFnc = function (c) {
                return function (onSuccess) {
                    if (c.diagnosticId != null) {
                        var mc = {
                            MaintenanceId: $scope.maintenance.id,
                            CheckId: c.checkId,
                            DiagnosticId: c.diagnosticId,
                            Comments: c.comments
                        };
                        dataContext.save('MaintenanceCheck', c.id, mc, function () {
                            c.id = mc.Id;
                            onSuccess();
                        });
                    } else {
                        onSuccess();
                    }
                };
            };

            var actions = [];
            PaCM.eachArray($scope.checkList, function (inx, c) {
                actions.push(_saveFnc(c));
            });

            PaCM.execute(actions, onSuccess);
        };

        $scope.reviewOfCells = [];
        _self.getReviewOfCells = function () {
            var arr1 = [];
            var arr2 = [];
            var arr3 = [];

            var actions = [];
            actions.push(function (onSuccess) {
                var numberOfCells =
                PaCM.eachArray($scope.resources.batteryTypes, function (inx, bt) {
                    if (bt.id === $scope.battery.typeId) {
                        return bt.numberOfCells;
                    }
                });
                for (var i = 1; i <= numberOfCells; i++) {
                    arr1.push({
                        id: null,
                        cellId: null,
                        cellOrder: i,
                        voltage: null,
                        density: null,
                        comments: null
                    });
                }
                onSuccess();
            });
            actions.push(function (onSuccess) {
                if ($scope.maintenance.batteryId != null) {
                    dataContext.find2('Cell', { BatteryId: $scope.maintenance.batteryId }, function (cells) {
                        PaCM.eachArray(cells, function (inx, c) {
                            arr2.push({
                                id: null,
                                cellId: c.Id,
                                cellOrder: c.Order,
                                voltage: null,
                                density: null,
                                comments: null
                            });
                        });
                        onSuccess();
                    });
                } else {
                    onSuccess();
                }
            });
            actions.push(function (onSuccess) {
                if ($scope.maintenance.id != null) {
                    dataContext.find2('CellReview', { MaintenanceId: $scope.maintenance.id }, function (reviewOfCells) {
                        PaCM.eachArray(reviewOfCells, function (inx, cr) {
                            arr3.push({
                                id: cr.Id,
                                cellId: cr.CellId,
                                cellOrder: cr.CellOrder,
                                voltage: cr.Voltage,
                                density: cr.Density,
                                comments: cr.Comments
                            });
                        });
                        onSuccess();
                    });
                } else {
                    onSuccess();
                }
            });
            PaCM.execute(actions, function () {
                var arrDef = [];
                PaCM.mergeArray(['cellOrder'], arrDef, arr1, arr2, arr3);
                PaCM.cleaner(arr1); delete arr1;
                PaCM.cleaner(arr2); delete arr2;
                PaCM.cleaner(arr3); delete arr3;
                PaCM.syncronizeArray(['cellOrder'], $scope.reviewOfCells, arrDef);
                PaCM.cleaner(arrDef); delete arrDef;
                _self.refreshUI();
            });
        };
        _self.saveReviewOfCells = function (onSuccess) {

            var _saveFnc01 = function (c) {
                return function (onSuccess) {
                    if (c.cellId == null) {
                        var cr = {
                            BatteryId: $scope.maintenance.batteryId,
                            Order: c.cellOrder
                        };
                        dataContext.insert('Cell', cr, function () {
                            c.cellId = cr.Id;
                            onSuccess();
                        });
                    } else {
                        onSuccess();
                    }
                };
            };

            var _saveFnc02 = function (c) {
                return function (onSuccess) {
                    if (c.voltage != null && c.density != null) {
                        var cr = {
                            MaintenanceId: $scope.maintenance.id,
                            CellId: c.cellId,
                            Voltage: c.voltage,
                            Density: c.density,
                            Comments: c.comments
                        };
                        dataContext.save('CellReview', c.id, cr, function () {
                            c.id = cr.Id;
                            onSuccess();
                        });
                    } else {
                        onSuccess();
                    }
                };
            };

            var actions = [];
            PaCM.eachArray($scope.reviewOfCells, function (inx, c) {
                actions.push(_saveFnc01(c));
                actions.push(_saveFnc02(c));
            });

            PaCM.execute(actions, onSuccess);
        };

        $scope.articlesOutputs = [];
        _self.getArticlesOutpus = function () {
            
        };
        _self.saveArticlesOutpus = function (onSuccess) {
            
        };

        $scope.getMaintenanceInfo = function () {
            _self.getCheckList();
            _self.getReviewOfCells();
        }

        
        $scope.newBatteryMaintenance = function () {
            $scope.tabs.chargerTab = false;
            $scope.selectTab('batteryTab');
        };
        $scope.newChargerMaintenance = function () {
            $scope.tabs.batteryTab = false;
            $scope.selectTab('chargerTab');
        };

        
        $scope.saveMaintenance = function () {
            var actions = [];

            if ($scope.battery.typeId) {
                actions.push(_self.saveBatteryTrademark);
                actions.push(_self.saveBatteryModel);
                actions.push(_self.saveBattery);
            }
            if ($scope.charger.voltage) {
                actions.push(_self.saveChargerTrademark);
                actions.push(_self.saveChargerModel);
                actions.push(_self.saveCharger);
            }
            if ($scope.machine.serial || $scope.machine.customerReference) {
                actions.push(_self.saveMachineTrademark);
                actions.push(_self.saveMachineModel);
                actions.push(_self.saveMachine);
            }
            actions.push(_self.saveMaintenance);
            actions.push(_self.saveCheckList);
            actions.push(_self.saveReviewOfCells);

            PaCM.execute(actions, function () {
                alert('Registro guardado con éxito');
            });
        };

        $scope.resources = {
            batteryTypes: [],
            connectorTypes: [],
            connectors: [],
            connectorColors: [],
            diagnostics: []
        };
        _self.getResources = function () {
            dataContext.list('BatteryType', 'r.Voltage, r.NumberOfCells', function (batteryTypes) {
                PaCM.eachArray(batteryTypes, function (inx, bt) {
                    $scope.resources.batteryTypes.push({
                        id: bt.Id,
                        description: bt.Voltage + 'V (' + bt.NumberOfCells + ' Celdas)',
                        voltage: bt.Voltage,
                        numberOfCells: bt.NumberOfCells
                    });
                });
            });
            dataContext.list('ConnectorType', 'r.Name', function (connectorTypes) {
                PaCM.eachArray(connectorTypes, function (inx, ct) {
                    $scope.resources.connectorTypes.push({
                        id: ct.Id,
                        name: ct.Name,
                        colorRequired: ct.ColorRequired
                    });
                });
            });
            dataContext.list('Connector', 'r.Name', function (connector) {
                PaCM.eachArray(connector, function (inx, c) {
                    $scope.resources.connectors.push({
                        id: c.Id,
                        name: c.Name,
                        typeId: c.TypeId
                    });
                });
            });
            dataContext.list('Color', 'r.Name', function (connectorColors) {
                PaCM.eachArray(connectorColors, function (inx, cc) {
                    $scope.resources.connectorColors.push({
                        id: cc.Id,
                        name: cc.Name
                    });
                });
            });
            dataContext.list('Diagnostic', 'r.Name' , function (diagnostics) {
                PaCM.eachArray(diagnostics, function (inx, d) {
                    $scope.resources.diagnostics.push({
                        id: d.Id,
                        name: d.Name,
                        typeId: d.TypeId
                    });
                });
            });
        }

        _self.timeoutRefreshUI = null;
        _self.refreshUI = function () {
            if (_self.timeoutRefreshUI != null) {
                clearTimeout(_self.timeoutRefreshUI);
                _self.timeoutRefreshUI = null;
            }
            _self.timeoutRefreshUI = setTimeout(function () {
                _self.timeoutRefreshUI = null;
                $scope.$digest();
            }, 100);
        }


        $scope.prepareCanvas = function () {
            if (PaCM.isUndefined(_self.canvas)) {
                setTimeout(function () {
                    _self.canvas = document.getElementById('signatureCanvas');
                    var signaturePad = new SignaturePad(_self.canvas);
                    $scope.clearCanvas = function() {
                        signaturePad.clear();
                    }
                    $scope.saveCanvas = function() {
                        $scope.signature = signaturePad.toDataURL();
                    }
                }, 250);
            }
        }


        if ($scope.maintenance.id != null) {
            $scope.newMaintenance = false;
            _self.getMaintenance();
        } else {
            $scope.newMaintenance = true;
            $scope.maintenance.uniqueCode = PaCM.newGuid().substring(0,5);
            $scope.maintenance.date = new Date();
            $scope.maintenance.preventive = true;
            $scope.maintenance.corrective = false;
            $scope.maintenance.statusId = 'InCapture';
            dataContext.get('MaintenanceStatus', $scope.maintenance.statusId, function (ms) {
                $scope.maintenance.statusDescription = ms.Description;
            });
            $scope.maintenance.executedById = userSession.user.Id;
            $scope.maintenance.executedByUsername = userSession.user.Username;
            $scope.maintenance.acceptedBy = null;
        }
        _self.getResources();
        _self.refreshUI();

        $scope.$on('$destroy', function() {

            if (_self.timeoutRefreshUI != null) {
                clearTimeout(_self.timeoutRefreshUI);
                _self.timeoutRefreshUI = null;
            }

            $scope.searcher.close();
            $scope.modal.remove();

            PaCM.eachProperties($scope, function (key, value) {
                if (!(key.substring(0, 1) === '$')) {
                    //PaCM.cleaner(value);
                    delete $scope[key];
                }
            });

            PaCM.eachProperties(_self, function (key, value) {
                //PaCM.cleaner(value);
                delete _self[key];
            });
            delete _self;
            
        });
        
    });
    
})();
