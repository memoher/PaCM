(function () {
    
    PaCM.controllersModule.controller('newCtrl', function ($scope, $state, $stateParams, $ionicModal, $ionicTabsDelegate, dataContext, userSession) {

        if (!userSession.isLogged) {
            $state.go('app.login');
        }

        var _self = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;

        _self.onSqlError = function (err) {
            $scope.runningProcess = false;
            $scope.$digest();
            PaCM.showErrorMessage(err);
            throw err;
        }

        $scope.preloadData = PaCM.isDefined($stateParams.elmType);
        
        $scope.tabs = {
            starterTab: true,
            batteryTab: false,
            chargerTab: false,
            machineTab: false,
            workToBeDoneTab: false,
            physicalInspectionTab: false,
            cellInspectionTab: false,
            suppliesTab: false,
            technicalReportTab: false,
            refreshTabs: function () {
                var self = this;

                var validObjectType = (this.batteryTab === true && $scope.battery.typeId) || (this.chargerTab === true && $scope.charger.voltage);
                self.machineTab = validObjectType;
                self.workToBeDoneTab = validObjectType;
                self.physicalInspectionTab = validObjectType;
                self.cellInspectionTab = (this.batteryTab === true && $scope.battery.typeId);
                self.suppliesTab = ($scope.maintenance.corrective === true && validObjectType);
                self.technicalReportTab = validObjectType;
                self.endingTab = (($scope.maintenance.technicalReport) && validObjectType);
                return true;
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
                self.search = search ? search : PaCM.getStringEmpty();
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
            if ($scope.readOnlyMode || $scope.preloadData || $scope.maintenance.id) {
                return;
            }
            dataContext.find('Customer', { orderBy: 'Name' }, function (customers) {
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
                        $scope.resetObjectTypeTrademark(true);
                        $scope.resetObjectTypeTrademark(false);
                        $scope.resetMachineTrademark();
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetCustomer = function () {
            $scope.maintenance.customerId = null;
            $scope.maintenance.customerName = null;
            $scope.filters.customerSearch = null;
            $scope.resetObjectTypeTrademark(true);
            $scope.resetObjectTypeTrademark(false);
            $scope.resetMachineTrademark();
        };
        
        $scope.searchObjectTypeTrademark = function (applyForBattery) {
            dataContext.find('ObjectTypeTrademark', { orderBy: 'Name' }, function (trademarks) {
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
                $scope.battery.trademarkId = null;
                $scope.battery.trademarkName = null;
            } else {
                $scope.charger.trademarkId = null;
                $scope.charger.trademarkName = null;
            }
            $scope.filters.objectTypeTrademarkSearch = null;
            $scope.resetObjectTypeModel(applyForBattery);
        };
        
        $scope.searchObjectTypeModel = function (applyForBattery) {
            
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if (applyForBattery === true) {
                if ($scope.battery.trademarkId)
                    options.where.TrademarkId = $scope.battery.trademarkId;
            } else {
                if ($scope.charger.trademarkId)
                    options.where.TrademarkId = $scope.charger.trademarkId;
            }
            
            dataContext.find('ObjectTypeModel', options, function (models) {

                options.orderBy = 'ModelId';
                dataContext.find(!(applyForBattery === true) ? 'Battery' : 'Charger', options, function (objects) {
                    PaCM.eachArrayInvert(models, function (inxM, m) {
                        var valid = true;
                        PaCM.eachArrayInvert(objects, function (inxO, o) {
                            if (m.Id === o.ModelId) {
                                valid = false;
                                objects.splice(inxO, 1);
                            }
                        });
                        if (!(valid === true)) {
                            models.splice(inxM, 1);
                        }
                    });

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

            var options = {
                where: {},
                orderBy: 't.Name, m.Name, p.Serial, p.CustomerReference'
            };
            if ($scope.maintenance.customerId)
                options.where.CustomerId = $scope.maintenance.customerId;
            if (applyForBattery === true) {
                if ($scope.battery.trademarkId)
                    options.where.TrademarkId = $scope.battery.trademarkId;
                if ($scope.battery.modelId)
                    options.where.ModelId = $scope.battery.modelId;
            } else {
                if ($scope.charger.trademarkId)
                    options.where.TrademarkId = $scope.charger.trademarkId;
                if ($scope.charger.modelId)
                    options.where.ModelId = $scope.charger.modelId;
            }
            
            dataContext.find(applyForBattery === true ? 'Battery' : 'Charger', options, function (objects) {
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
                    applyForBattery === true ? 'Buscar bateria' : 'Buscar cargador',
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
                $scope.battery.connectorColorRequired = null;
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
            $scope.getMaintenanceInfo();
        };
        
        $scope.searchMachineTrademark = function () {
            dataContext.find('MachineTrademark', { orderBy: 'Name' }, function (trademarks) {
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
            
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if ($scope.machine.trademarkId)
                options.where.TrademarkId = $scope.machine.trademarkId;
            
            dataContext.find('MachineModel', options, function (models) {
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
            
            var options = {
                where: {},
                orderBy: 't.Name, m.Name, r.Serial, r.CustomerReference'
            };
            if ($scope.maintenance.customerId)
                options.where.CustomerId = $scope.maintenance.customerId;
            if ($scope.machine.trademarkId)
                options.where.TrademarkId = $scope.machine.trademarkId;
            if ($scope.machine.modelId)
                options.where.ModelId = $scope.machine.modelId;
            
            dataContext.find('Machine', options, function (machines) {
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

        $scope.searchArticle = function (ao) {
            var options = {
                where: { EnabledBatteries: false, EnabledChargers: false }
            };
            if ($scope.battery.typeId != null) {
                options.where = { EnabledBatteries: true };
            }
            if ($scope.charger.voltage != null) {
                options.where = { EnabledChargers: true };
            }
            options.where.CorrectiveMaintenanceEnabled = true;

            dataContext.find('Article', options, function (articles) {
                if (ao.articleId != null) {
                    PaCM.eachArray(articles, function (inx, a) {
                        if (a.Id == ao.articleId) {
                            a.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'Article',
                    'Buscar artículo',
                    articles,
                    null,
                    function (r) {
                        ao.articleId = r.Id;
                        ao.articleName = r.Name + ' (' + r.InventoryCode + ')';
                        $scope.searcher.close();
                    });
            });
        };
        
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

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
            acceptedBy: null,
            acceptedByDigitalSignatureId: null
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
                    $scope.maintenance.acceptedByDigitalSignatureId = r.AcceptedByDigitalSignatureId;
                    dataContext.get('Customer', $scope.maintenance.customerId, function (c) {
                        $scope.maintenance.customerName = c.Name;
                    });
                    dataContext.get('MaintenanceStatus', $scope.maintenance.statusId, function (ms) {
                        $scope.maintenance.statusDescription = ms.Description;
                    });
                    dataContext.get('User', $scope.maintenance.executedById, function (u) {
                        $scope.maintenance.executedByUsername = u.Username;
                    });
                    dataContext.get('File', $scope.maintenance.acceptedByDigitalSignatureId, function (f) {
                        if (f) {
                            _self.signatureData = 'data:image/png;base64,' + f.Base64Str;
                        }
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
        _self.saveSignature = function (onSuccess) {
            if (!$scope.signaturePad.isEmpty()) {
                $scope.saveCanvas();
                var f = {
                    Name: 'Accepted by signature.png',
                    Extension: 'png',
                    Base64Str: _self.signatureData.substring('data:image/png;base64,'.length)
                };
                if (!($scope.maintenance.acceptedByDigitalSignatureId)) {
                    f.LocalName = PaCM.newGuid();
                }
                dataContext.save('File', $scope.maintenance.acceptedByDigitalSignatureId, f, function () {
                    $scope.maintenance.acceptedByDigitalSignatureId = f.Id;
                    PaCM.cleaner(f); delete f;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        }
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
                AcceptedBy: $scope.maintenance.acceptedBy,
                AcceptedByDigitalSignatureId: $scope.maintenance.acceptedByDigitalSignatureId
            };
            dataContext.save('Maintenance', $scope.maintenance.id, m, function () {
                $scope.maintenance.id = m.Id;
                PaCM.cleaner(m); delete m;
                onSuccess();
            }, _self.onSqlError);
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
            connectorColorRequired: null,
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
                        dataContext.get('ConnectorType', $scope.battery.connectorTypeId, function (ct) {
                            $scope.battery.connectorColorRequired = ct.ColorRequired;
                        });
                    });
                    dataContext.get('ObjectTypeModel', $scope.battery.modelId, function (m) {
                        $scope.battery.modelName = m.Name;
                    });
                    dataContext.get('ObjectTypeTrademark', $scope.battery.trademarkId, function (t) {
                        $scope.battery.trademarkName = t.Name;
                    });
                    $scope.getMaintenanceInfo();
                });
            }
        };
        _self.saveBatteryTrademark = function (onSuccess) {
            if ($scope.battery.trademarkId == null) {
                var r = {
                    Name: $scope.battery.trademarkName
                };
                dataContext.insert('ObjectTypeTrademark', r, function () {
                    $scope.battery.trademarkId = r.Id;
                    PaCM.cleaner(r); delete r;
                    onSuccess();
                }, _self.onSqlError);
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
                dataContext.insert('ObjectTypeModel', r, function () {
                    $scope.battery.modelId = r.Id;
                    PaCM.cleaner(r); delete r;
                    onSuccess();
                }, _self.onSqlError);
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
                    PaCM.cleaner(ot); delete ot;
                    PaCM.cleaner(b); delete b;
                    onSuccess();
                }, _self.onSqlError);
            }, _self.onSqlError);
        };

        $scope.refreshConnectorColorList = function () {
            if ($scope.battery.connectorTypeId != null) {
                dataContext.get('ConnectorType', $scope.battery.connectorTypeId, function (ct) {
                    $scope.battery.connectorColorRequired = ct.ColorRequired;
                });
            } else {
                $scope.battery.connectorColorRequired = false;
            }
        }
        
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
                    $scope.getMaintenanceInfo();
                });
            }
        };
        _self.saveChargerTrademark = function (onSuccess) {
            if ($scope.charger.trademarkId == null) {
                var r = {
                    Name: $scope.charger.trademarkName
                };
                dataContext.insert('ObjectTypeTrademark', r, function () {
                    $scope.charger.trademarkId = r.Id;
                    PaCM.cleaner(r); delete r;
                    onSuccess();
                }, _self.onSqlError);
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
                dataContext.insert('ObjectTypeModel', r, function () {
                    $scope.charger.modelId = r.Id;
                    PaCM.cleaner(r); delete r;
                    onSuccess();
                }, _self.onSqlError);
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
                    PaCM.cleaner(ot); delete ot;
                    PaCM.cleaner(c); delete c;
                    onSuccess();
                }, _self.onSqlError);
            }, _self.onSqlError);
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
                    PaCM.cleaner(r); delete r;
                    onSuccess();
                }, _self.onSqlError);
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
                    PaCM.cleaner(r); delete r;
                    onSuccess();
                }, _self.onSqlError);
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
                PaCM.cleaner(m); delete m;
                onSuccess();
            }, _self.onSqlError);
        };

        $scope.checkList = [];
        _self.getCheckList = function () {
            var arr1 = [];
            var arr2 = [];

            var actions = [];
            actions.push(function (onSuccess) {
                var options = {
                    where: { EnabledBatteries: false, EnabledChargers: false }
                };
                if ($scope.battery.typeId != null) {
                    options.where = { EnabledBatteries: true };
                }
                if ($scope.charger.voltage != null) {
                    options.where = { EnabledChargers: true };
                }
                dataContext.find('Check', options, function (checks) {
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
                    dataContext.find('MaintenanceCheck', { where: { MaintenanceId: $scope.maintenance.id } }, function (maintenanceChecks) {
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
                            PaCM.cleaner(mc); delete mc;
                            onSuccess();
                        }, _self.onSqlError);
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
                if ($scope.battery.typeId != null) {
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
                } else {
                    onSuccess();
                }
            });
            actions.push(function (onSuccess) {
                if ($scope.maintenance.batteryId != null) {
                    dataContext.find('Cell', { where: { BatteryId: $scope.maintenance.batteryId } }, function (cells) {
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
                    dataContext.find('CellReview', { where: { MaintenanceId: $scope.maintenance.id } }, function (reviewOfCells) {
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
                            PaCM.cleaner(cr); delete cr;
                            onSuccess();
                        }, _self.onSqlError);
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
                            PaCM.cleaner(cr); delete cr;
                            onSuccess();
                        }, _self.onSqlError);
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
        _self.getArticlesOutputs = function () {
            if ($scope.maintenance.id != null) {
                dataContext.find('ArticleOutput', { where: { MaintenanceId: $scope.maintenance.id } }, function (articlesOutputs) {
                    var articles = [];
                    PaCM.eachArray(articlesOutputs, function (inx, a) {
                        articles.push({
                            id: a.Id,
                            articleId: a.ArticleId,
                            articleName: a.ArticleName + ' (' + a.InventoryCode + ')',
                            quantity: a.Quantity
                        });
                    });
                    PaCM.syncronizeArray(["id"], $scope.articlesOutputs, articles);
                    PaCM.cleaner(articles); delete articles;

                    if ($scope.maintenance.corrective === true) {
                        while ($scope.articlesOutputs.length < 3) {
                            $scope.addArticle();
                        }
                    }
                });
            } else {
                PaCM.cleaner($scope.articlesOutputs);

                if ($scope.maintenance.corrective === true) {
                    while ($scope.articlesOutputs.length < 3) {
                        $scope.addArticle();
                    }
                }
            }
        };
        $scope.addArticle = function () {
            $scope.articlesOutputs.push({
                id: null,
                articleId: null,
                articleName: null,
                quantity: null
            });
        };
        $scope.removeArticle = function (ao) {
            $scope.articlesOutputs.splice($scope.articlesOutputs.indexOf(ao), 1);
        }
        _self.saveArticlesOutpus = function (onSuccess) {

            var _saveFnc01 = function (a) {
                return function (onSuccess) {
                    if (a.articleId != null && a.quantity != null) {
                        var ao = {
                            MaintenanceId: $scope.maintenance.id,
                            ArticleId: a.articleId,
                            Quantity: a.quantity
                        };
                        dataContext.save('ArticleOutput', a.id, ao, function () {
                            a.id = ao.Id;
                            PaCM.cleaner(ao); delete ao;
                            onSuccess();
                        }, _self.onSqlError);
                    } else {
                        onSuccess();
                    }
                };
            };

            var actions = [];
            PaCM.eachArray($scope.articlesOutputs, function (inx, a) {
                actions.push(_saveFnc01(a));
            });
            PaCM.execute(actions, onSuccess);
        };

        $scope.getMaintenanceInfo = function () {
            _self.getCheckList();
            _self.getReviewOfCells();
            _self.getArticlesOutputs();
            _self.refreshUI();
        }

        
        $scope.newBatteryMaintenance = function () {
            $scope.tabs.chargerTab = false;
            $scope.selectTab('batteryTab');
            $scope.resetObjectTypeTrademark(false);
        };
        $scope.newChargerMaintenance = function () {
            $scope.tabs.batteryTab = false;
            $scope.selectTab('chargerTab');
            $scope.resetObjectTypeTrademark(true);
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
            actions.push(_self.saveSignature);
            actions.push(_self.saveMaintenance);
            actions.push(_self.saveCheckList);
            actions.push(_self.saveReviewOfCells);
            actions.push(_self.saveArticlesOutpus);

            $scope.runningProcess = true;
            PaCM.execute(actions, function () {
                $scope.runningProcess = false;
                $scope.title = 'Mantenimiento';
                _self.refreshUI();
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
            dataContext.find('BatteryType', { orderBy: 'Voltage, NumberOfCells' }, function (batteryTypes) {
                PaCM.eachArray(batteryTypes, function (inx, bt) {
                    $scope.resources.batteryTypes.push({
                        id: bt.Id,
                        description: bt.Voltage + 'V (' + bt.NumberOfCells + ' Celdas)',
                        voltage: bt.Voltage,
                        numberOfCells: bt.NumberOfCells
                    });
                });
            });
            dataContext.find('ConnectorType', { orderBy: 'Name' }, function (connectorTypes) {
                PaCM.eachArray(connectorTypes, function (inx, ct) {
                    $scope.resources.connectorTypes.push({
                        id: ct.Id,
                        name: ct.Name,
                        colorRequired: ct.ColorRequired
                    });
                });
            });
            dataContext.find('Connector', { orderBy: 'Name' }, function (connector) {
                PaCM.eachArray(connector, function (inx, c) {
                    $scope.resources.connectors.push({
                        id: c.Id,
                        name: c.Name,
                        typeId: c.TypeId
                    });
                });
            });
            dataContext.find('Color', { orderBy: 'Name' }, function (connectorColors) {
                PaCM.eachArray(connectorColors, function (inx, cc) {
                    $scope.resources.connectorColors.push({
                        id: cc.Id,
                        name: cc.Name,
                        hex: cc.HEX
                    });
                });
            });
            dataContext.find('Diagnostic', { orderBy: 'Name' } , function (diagnostics) {
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
                $scope.readOnlyMode = (!($scope.maintenance.statusId === 'InCapture') || !($scope.maintenance.executedById === userSession.user.Id));
                $scope.tabs.refreshTabs();
                $scope.$digest();
            }, 200);
        }

        $scope.prepareCanvas = function () {
            if (PaCM.isUndefined(_self.canvas)) {
                setTimeout(function () {
                    _self.canvas = document.getElementById('signatureCanvas');
                    $scope.signaturePad = new SignaturePad(_self.canvas);
                    if (_self.signatureData) {
                        $scope.signaturePad.fromDataURL(_self.signatureData);
                    }
                    $scope.clearCanvas = function() {
                        $scope.signaturePad.clear();
                    }
                    $scope.saveCanvas = function() {
                        _self.signatureData = $scope.signaturePad.toDataURL('image/png');
                    }
                }, 20);
            }
        }


        if ($scope.maintenance.id != null) {
            $scope.title = 'Mantenimiento';
            _self.getMaintenance();
        } else {
            $scope.title = 'Nuevo mantenimiento';
            $scope.maintenance.uniqueCode = PaCM.newGuid().substring(0,5);
            $scope.maintenance.date = new Date();
            $scope.maintenance.preventive = true;
            $scope.maintenance.corrective = false;
            if ($scope.maintenance.customerId != null) {
                dataContext.get('Customer', $scope.maintenance.customerId, function (c) {
                    $scope.maintenance.customerName = c.Name;
                });
            }
            $scope.maintenance.statusId = 'InCapture';
            dataContext.get('MaintenanceStatus', $scope.maintenance.statusId, function (ms) {
                $scope.maintenance.statusDescription = ms.Description;
            });
            $scope.maintenance.executedById = userSession.user.Id;
            $scope.maintenance.executedByUsername = userSession.user.Username;
            if ($scope.maintenance.batteryId != null) {
                $scope.tabs.batteryTab = true;
                _self.getBattery();
            }
            if ($scope.maintenance.chargerId != null) {
                $scope.tabs.chargerTab = true;
                _self.getCharger();
            }
            _self.refreshUI();
        }
        _self.getResources();

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
