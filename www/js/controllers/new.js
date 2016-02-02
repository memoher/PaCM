(function () {
    
    PaCM.controllersModule.controller('newCtrl', function ($scope, $state, $stateParams, searcherPopup, notesPopup, $ionicTabsDelegate, dataContext, userSession) {

        if (!(userSession.isLogged === true)) {
            $state.go('app.login');
        }

        var _this = this; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;

        _this.onSqlError = function (err) {
            $scope.runningProcess = false;
            $scope.$digest();
            PaCM.showErrorMessage(err);
            throw err;
        }

        $scope.preloadData = false;
        if ($stateParams.elmType) {
            if ($stateParams.elmId)
                $scope.preloadData = true;
        }
        
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

                var validObjectType = (self.batteryTab === true && $scope.battery.typeId) || (self.chargerTab === true && $scope.charger.voltage);
                self.machineTab = validObjectType;
                self.workToBeDoneTab = validObjectType;
                self.physicalInspectionTab = validObjectType;
                self.cellInspectionTab = (validObjectType && $scope.battery.typeId);
                self.suppliesTab = (validObjectType && $scope.maintenance.corrective === true);
                self.technicalReportTab = validObjectType;
                self.endingTab = (validObjectType && ($scope.maintenance.technicalReport));
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

        // Create the modal popup notes
        notesPopup.initialize($scope);
        
        // Create the modal popup searcher
        searcherPopup.initialize($scope);
        
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
            if ($scope.readOnlyLinks === true || $scope.maintenance.id) {
                return;
            }

            dataContext.find('Customer', { orderBy: 'Name' }, function (customers) {
                if ($scope.maintenance.customerId) {
                    var val = $scope.maintenance.customerId;
                    PaCM.eachArray(customers, function (inx, c) {
                        if (c.Id == val) {
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
                        $scope.resetCustomer();
                        $scope.maintenance.customerId = r.Id;
                        $scope.maintenance.customerName = r.Name;
                        $scope.filters.customerSearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetCustomer = function () {
            $scope.maintenance.customerId = null;
            $scope.maintenance.customerName = null;
            $scope.filters.customerSearch = null;
            $scope.resetObjectType(true);
            $scope.resetObjectType(false);
            $scope.resetMachine();
        };
        
        $scope.searchObjectTypeTrademark = function (applyForBattery) {
            if ($scope.readOnlyLinks === true) {
                return;
            }

            dataContext.find('ObjectTypeTrademark', { orderBy: 'Name' }, function (trademarks) {
                if ($scope.battery.trademarkId || $scope.charger.trademarkId) {
                    var val = applyForBattery === true ? $scope.battery.trademarkId : $scope.charger.trademarkId;
                    PaCM.eachArray(trademarks, function (inx, t) {
                        if (t.Id == val) {
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
                        $scope.resetObjectTypeTrademark(applyForBattery);
                        if (applyForBattery === true) {
                            if (r === $scope.searcher.search) {
                                $scope.battery.trademarkName = r;
                            } else {
                                $scope.battery.trademarkId = r.Id;
                                $scope.battery.trademarkName = r.Name;
                            }
                        } else {
                            if (r === $scope.searcher.search) {
                                $scope.charger.trademarkName = r;
                            } else {
                                $scope.charger.trademarkId = r.Id;
                                $scope.charger.trademarkName = r.Name;
                            }
                        }
                        $scope.filters.objectTypeTrademarkSearch = $scope.searcher.search;
                    }, true); 
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
            if ($scope.readOnlyLinks === true) {
                return;
            }

            var options = {
                where: {},
                orderBy: 'Name'
            };
            if (applyForBattery === true) {
                if ($scope.battery.trademarkName)
                    options.where.TrademarkId = -1;
                if ($scope.battery.trademarkId)
                    options.where.TrademarkId = $scope.battery.trademarkId;
            } else {
                if ($scope.charger.trademarkName)
                    options.where.TrademarkId = -1;
                if ($scope.charger.trademarkId)
                    options.where.TrademarkId = $scope.charger.trademarkId;
            }
            
            dataContext.find('ObjectTypeModel', options, function (models) {

                options.orderBy = 'ModelId';
                dataContext.find(!(applyForBattery === true) ? 'Battery' : 'Charger', options, function (objects) {
                    //Debe filtrar los modelos, dependiendo de si aplica a baterías o a cargadores
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

                    if ($scope.battery.modelId || $scope.charger.modelId) {
                        var val = applyForBattery === true ? $scope.battery.modelId : $scope.charger.modelId;
                        PaCM.eachArray(models, function (inx, m) {
                            if (m.Id == val) {
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
                            $scope.resetObjectTypeModel(applyForBattery);
                            if (applyForBattery === true) {
                                if (r === $scope.searcher.search) {
                                    $scope.battery.modelName = r;
                                } else {
                                    $scope.battery.modelId = r.Id;
                                    $scope.battery.modelName = r.Name;
                                    dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                        $scope.battery.trademarkId = t.Id;
                                        $scope.battery.trademarkName = t.Name;
                                    });
                                }
                            } else {
                                if (r === $scope.searcher.search) {
                                    $scope.charger.modelName = r;
                                } else {
                                    $scope.charger.modelId = r.Id;
                                    $scope.charger.modelName = r.Name;
                                    dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                        $scope.charger.trademarkId = t.Id;
                                        $scope.charger.trademarkName = t.Name;
                                    });
                                }
                            }
                            $scope.filters.objectTypeModelSearch = $scope.searcher.search;
                        }, true); 
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
            if ($scope.readOnlyLinks === true) {
                return;
            }

            var options = {
                where: {},
                orderBy: 't.Name, m.Name, p.Serial, p.CustomerReference'
            };
            if ($scope.maintenance.customerId)
                options.where.CustomerId = $scope.maintenance.customerId;
            if (applyForBattery === true) {
                if ($scope.battery.trademarkName)
                    options.where.TrademarkId = -1;
                if ($scope.battery.trademarkId)
                    options.where.TrademarkId = $scope.battery.trademarkId;
                if ($scope.battery.modelName)
                    options.where.ModelId = -1;
                if ($scope.battery.modelId)
                    options.where.ModelId = $scope.battery.modelId;
            } else {
                if ($scope.charger.trademarkName)
                    options.where.TrademarkId = -1;
                if ($scope.charger.trademarkId)
                    options.where.TrademarkId = $scope.charger.trademarkId;
                if ($scope.charger.modelName)
                    options.where.ModelId = -1;
                if ($scope.charger.modelId)
                    options.where.ModelId = $scope.charger.modelId;
            }
            
            dataContext.find(applyForBattery === true ? 'Battery' : 'Charger', options, function (objects) {
                if ($scope.maintenance.batteryId || $scope.maintenance.chargerId) {
                    var val = applyForBattery === true ? $scope.maintenance.batteryId : $scope.maintenance.chargerId;
                    PaCM.eachArray(objects, function (inx, ot) {
                        if (ot.Id == val) {
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
                        $scope.resetObjectType(applyForBattery);
                        if (applyForBattery === true) {
                            $scope.maintenance.batteryId = r.Id;
                            _this.getBattery();
                        } else {
                            $scope.maintenance.chargerId = r.Id;
                            _this.getCharger();
                        }
                        $scope.filters.objectTypeSearch = $scope.searcher.search;
                    }, true);
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
            if ($scope.readOnlyMode === true) {
                return;
            }

            dataContext.find('MachineTrademark', { orderBy: 'Name' }, function (trademarks) {
                if ($scope.machine.trademarkId) {
                    var val = $scope.machine.trademarkId;
                    PaCM.eachArray(trademarks, function (inx, t) {
                        if (t.Id == val) {
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
                        $scope.resetMachineTrademark();
                        if (r === $scope.searcher.search) {
                            $scope.machine.trademarkName = r;
                        } else {
                            $scope.machine.trademarkId = r.Id;
                            $scope.machine.trademarkName = r.Name;
                        }
                        $scope.filters.machineTrademarkSearch = $scope.searcher.search;
                    }, true); 
            });
        };
        $scope.resetMachineTrademark = function () {
            $scope.machine.trademarkId = null;
            $scope.machine.trademarkName = null;
            $scope.filters.machineTrademarkSearch = null;
            $scope.resetMachineModel();
        };
        
        $scope.searchMachineModel = function () {
            if ($scope.readOnlyMode === true) {
                return;
            }
            
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if ($scope.machine.trademarkName)
                options.where.TrademarkId = -1;
            if ($scope.machine.trademarkId)
                options.where.TrademarkId = $scope.machine.trademarkId;
            
            dataContext.find('MachineModel', options, function (models) {
                if ($scope.machine.modelId) {
                    var val = $scope.machine.modelId;
                    PaCM.eachArray(models, function (inx, m) {
                        if (m.Id == val) {
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
                        $scope.resetMachineModel();
                        if (r === $scope.searcher.search) {
                            $scope.machine.modelName = r;
                        } else {
                            $scope.machine.modelId = r.Id;
                            $scope.machine.modelName = r.Name;
                            $scope.machine.compartmentLength = r.CompartmentLength;
                            $scope.machine.compartmentWidth = r.CompartmentWidth;
                            $scope.machine.compartmentHeight = r.CompartmentHeight;
                            dataContext.get('MachineTrademark', r.TrademarkId, function (t) {
                                $scope.machine.trademarkId = t.Id;
                                $scope.machine.trademarkName = t.Name;
                            });
                        }
                        $scope.filters.machineModelSearch = $scope.searcher.search;
                    }, true); 
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
            if ($scope.readOnlyMode === true) {
                return;
            }
            
            var options = {
                where: {},
                orderBy: 't.Name, m.Name, r.Serial, r.CustomerReference'
            };
            if ($scope.maintenance.customerId)
                options.where.CustomerId = $scope.maintenance.customerId;
            if ($scope.machine.trademarkName)
                options.where.TrademarkId = -1;
            if ($scope.machine.trademarkId)
                options.where.TrademarkId = $scope.machine.trademarkId;
            if ($scope.machine.modelName)
                options.where.ModelId = -1;
            if ($scope.machine.modelId)
                options.where.ModelId = $scope.machine.modelId;
            
            dataContext.find('Machine', options, function (machines) {
                if ($scope.maintenance.machineId) {
                    var val = $scope.maintenance.machineId;
                    PaCM.eachArray(machines, function (inx, m) {
                        if (m.Id == val) {
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
                        $scope.resetMachine();
                        $scope.maintenance.machineId = r.Id;
                        _this.getMachine();
                        $scope.filters.machineSearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetMachine = function () {
            $scope.maintenance.machineId = null;
            $scope.machine.serial = null;
            $scope.machine.customerReference = null;
            $scope.filters.machineSearch = null;
        };

        $scope.searchArticle = function (ao) {
            if ($scope.readOnlyMode === true) {
                return;
            }
            
            var options = {
                where: { EnabledBatteries: false, EnabledChargers: false }
            };
            if ($scope.battery.typeId) {
                options.where = { EnabledBatteries: true };
            }
            if ($scope.charger.voltage) {
                options.where = { EnabledChargers: true };
            }
            options.where.CorrectiveMaintenanceEnabled = true;

            dataContext.find('Article', options, function (articles) {
                if (ao.articleId) {
                    var val = ao.articleId;
                    PaCM.eachArray(articles, function (inx, a) {
                        if (a.Id == val) {
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
        _this.getMaintenance = function () {
            if ($scope.maintenance.id) {
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
                            _this.signatureData = 'data:image/png;base64,' + f.Base64Str;
                        }
                    });
                    if ($scope.maintenance.batteryId) {
                        $scope.tabs.batteryTab = true;
                        _this.getBattery();
                    }
                    if ($scope.maintenance.chargerId) {
                        $scope.tabs.chargerTab = true;
                        _this.getCharger();
                    }
                    if ($scope.maintenance.machineId) {
                        _this.getMachine();
                    }
                    _this.refreshUI();
                });
            }
        };
        _this.saveSignature = function (onSuccess) {
            if (!_this.signature.isEmpty()) {
                $scope.saveCanvas();
                var f = {
                    Name: 'Signature_accepted_by.png',
                    Extension: 'png',
                    Base64Str: _this.signatureData.substring('data:image/png;base64,'.length)
                };
                if (!($scope.maintenance.acceptedByDigitalSignatureId)) {
                    f.LocalName = PaCM.newGuid();
                }
                dataContext.save('File', $scope.maintenance.acceptedByDigitalSignatureId, f, function () {
                    $scope.maintenance.acceptedByDigitalSignatureId = f.Id;
                    PaCM.cleaner(f); f = null;
                    onSuccess();
                });
            } else {
                onSuccess();
            }
        }
        _this.saveMaintenance = function (onSuccess) {
            var m = {
                UniqueCode: $scope.maintenance.uniqueCode,
                Date: $scope.maintenance.date,
                Preventive: $scope.maintenance.preventive,
                Corrective: $scope.maintenance.corrective,
                CustomerId: $scope.maintenance.customerId,
                Type: $scope.maintenance.batteryId ? 'BatteryMaintenance' : 'ChargerMaintenance',
                ObjectTypeId: $scope.maintenance.batteryId ? $scope.maintenance.batteryId : $scope.maintenance.chargerId,
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
                PaCM.cleaner(m); m = null;
                onSuccess();
            }, _this.onSqlError);
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
        _this.getBattery = function () {
            if ($scope.maintenance.batteryId) {
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
        _this.saveBatteryTrademark = function (onSuccess) {
            var r = {
                Name: $scope.battery.trademarkName
            };
            dataContext.save('ObjectTypeTrademark', $scope.battery.trademarkId, r, function () {
                $scope.battery.trademarkId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        };
        _this.saveBatteryModel = function (onSuccess) {
            var r = {
                Name: $scope.battery.modelName,
                TrademarkId: $scope.battery.trademarkId
            };
            dataContext.save('ObjectTypeModel', $scope.battery.modelId, r, function () {
                $scope.battery.modelId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        };
        _this.saveBattery = function (onSuccess) {
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
                    PaCM.cleaner(ot); ot = null;
                    PaCM.cleaner(b); b = null;
                    onSuccess();
                }, _this.onSqlError);
            }, _this.onSqlError);
        };

        $scope.refreshConnectorColorList = function () {
            if ($scope.battery.connectorTypeId) {
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
        _this.getCharger = function () {
            if ($scope.maintenance.chargerId) {
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
        _this.saveChargerTrademark = function (onSuccess) {
            var r = {
                Name: $scope.charger.trademarkName
            };
            dataContext.save('ObjectTypeTrademark', $scope.charger.trademarkId, r, function () {
                $scope.charger.trademarkId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        };
        _this.saveChargerModel = function (onSuccess) {
            var r = {
                Name: $scope.charger.modelName,
                TrademarkId: $scope.charger.trademarkId
            };
            dataContext.save('ObjectTypeModel', $scope.charger.modelId, r, function () {
                $scope.charger.modelId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        };
        _this.saveCharger = function (onSuccess) {
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
                    PaCM.cleaner(ot); ot = null;
                    PaCM.cleaner(c); c = null;
                    onSuccess();
                }, _this.onSqlError);
            }, _this.onSqlError);
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
        _this.getMachine = function () {
            if ($scope.maintenance.machineId) {
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
        _this.saveMachineTrademark = function (onSuccess) {
            var r = {
                Name: $scope.machine.trademarkName
            };
            dataContext.save('MachineTrademark', $scope.machine.trademarkId, r, function () {
                $scope.machine.trademarkId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        };
        _this.saveMachineModel = function (onSuccess) {
            var r = {
                Name: $scope.machine.modelName,
                TrademarkId: $scope.machine.trademarkId,
                CompartmentLength: $scope.machine.compartmentLength,
                CompartmentWidth: $scope.machine.compartmentWidth,
                CompartmentHeight: $scope.machine.compartmentHeight
            };
            dataContext.save('MachineModel', $scope.machine.modelId, r, function () {
                $scope.machine.modelId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        };
        _this.saveMachine = function (onSuccess) {
            var m = {
                ModelId: $scope.machine.modelId,
                Serial: $scope.machine.serial,
                CustomerId: $scope.maintenance.customerId,
                CustomerReference: $scope.machine.customerReference
            };
            dataContext.save('Machine', $scope.maintenance.machineId, m, function () {
                $scope.maintenance.machineId = m.Id;
                PaCM.cleaner(m); m = null;
                onSuccess();
            }, _this.onSqlError);
        };

        $scope.checkList = [];
        _this.getCheckList = function () {
            var arr1 = [];
            var arr2 = [];

            var actions = [];
            actions.push(function (onSuccess) {
                var options = {
                    where: { EnabledBatteries: false, EnabledChargers: false }
                };
                if ($scope.battery.typeId) {
                    options.where = { EnabledBatteries: true };
                }
                if ($scope.charger.voltage) {
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
                if ($scope.maintenance.id) {
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
                PaCM.mergeArray(['checkId'], arr1, arr2);
                PaCM.syncronizeArray(['checkId'], $scope.checkList, arr1);
                arr1.length = 0; arr1 = null;
                arr2.length = 0; arr2 = null;
            });
        };
        _this.saveCheckList = function (onSuccess) {

            var _saveFnc = function (c) {
                return function (onSuccess) {
                    if (c.diagnosticId) {
                        var mc = {
                            MaintenanceId: $scope.maintenance.id,
                            CheckId: c.checkId,
                            DiagnosticId: c.diagnosticId,
                            Comments: c.comments
                        };
                        dataContext.save('MaintenanceCheck', c.id, mc, function () {
                            c.id = mc.Id;
                            PaCM.cleaner(mc); mc = null;
                            onSuccess();
                        }, _this.onSqlError);
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
        $scope.setCheckComment = function (check) {
            $scope.notes.open('Comentarios', $scope.readOnlyMode, check.comments, function (comment) {
                check.comments = comment;
            });
        }

        $scope.reviewOfCells = [];
        _this.getReviewOfCells = function () {
            var arr1 = [];
            var arr2 = [];
            var arr3 = [];

            var actions = [];
            actions.push(function (onSuccess) {
                if ($scope.battery.typeId) {
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
                if ($scope.maintenance.batteryId) {
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
                if ($scope.maintenance.id) {
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
                PaCM.mergeArray(['cellOrder'], arr1, arr2);
                PaCM.mergeArray(['cellOrder'], arr1, arr3);
                PaCM.syncronizeArray(['cellOrder'], $scope.reviewOfCells, arr1);
                arr1.length = 0; arr1 = null;
                arr2.length = 0; arr2 = null;
                arr3.length = 0; arr3 = null;
            });
        };
        _this.saveReviewOfCells = function (onSuccess) {

            var _saveFnc01 = function (c) {
                return function (onSuccess) {
                    var cr = {
                        BatteryId: $scope.maintenance.batteryId,
                        Order: c.cellOrder
                    };
                    dataContext.save('Cell', c.cellId, cr, function () {
                        c.cellId = cr.Id;
                        PaCM.cleaner(cr); cr = null;
                        onSuccess();
                    }, _this.onSqlError);
                };
            };

            var _saveFnc02 = function (c) {
                return function (onSuccess) {
                    if (c.voltage && c.density) {
                        var cr = {
                            MaintenanceId: $scope.maintenance.id,
                            CellId: c.cellId,
                            Voltage: c.voltage,
                            Density: c.density,
                            Comments: c.comments
                        };
                        dataContext.save('CellReview', c.id, cr, function () {
                            c.id = cr.Id;
                            PaCM.cleaner(cr); cr = null;
                            onSuccess();
                        }, _this.onSqlError);
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
        $scope.setCellComment = function (cell) {
            $scope.notes.open('Comentarios', $scope.readOnlyMode, cell.comments, function (comment) {
                cell.comments = comment;
            });
        }

        $scope.articlesOutputs = [];
        _this.getArticlesOutputs = function () {
            if ($scope.maintenance.id) {
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
                    PaCM.cleaner(articles); articles = null;

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
        _this.saveArticlesOutpus = function (onSuccess) {

            var _saveFnc01 = function (a) {
                return function (onSuccess) {
                    if (a.articleId && a.quantity) {
                        var ao = {
                            MaintenanceId: $scope.maintenance.id,
                            ArticleId: a.articleId,
                            Quantity: a.quantity
                        };
                        dataContext.save('ArticleOutput', a.id, ao, function () {
                            a.id = ao.Id;
                            PaCM.cleaner(ao); ao = null;
                            onSuccess();
                        }, _this.onSqlError);
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
            _this.getCheckList();
            _this.getReviewOfCells();
            _this.getArticlesOutputs();
            _this.refreshUI();
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
                actions.push(_this.saveBatteryTrademark);
                actions.push(_this.saveBatteryModel);
                actions.push(_this.saveBattery);
            }
            if ($scope.charger.voltage) {
                actions.push(_this.saveChargerTrademark);
                actions.push(_this.saveChargerModel);
                actions.push(_this.saveCharger);
            }
            if ($scope.machine.serial || $scope.machine.customerReference) {
                actions.push(_this.saveMachineTrademark);
                actions.push(_this.saveMachineModel);
                actions.push(_this.saveMachine);
            }
            actions.push(_this.saveSignature);
            actions.push(_this.saveMaintenance);
            actions.push(_this.saveCheckList);
            actions.push(_this.saveReviewOfCells);
            actions.push(_this.saveArticlesOutpus);

            $scope.runningProcess = true;
            PaCM.execute(actions, function () {
                $scope.runningProcess = false;
                $scope.title = 'Mantenimiento';
                _this.refreshUI();
                alert('Registro guardado con éxito');
            });
        };

        $scope.prepareCanvas = function () {
            if (PaCM.isUndefined(_this.canvas)) {

                //Initialize canvas
                _this.canvas = document.getElementById('signatureCanvas');
                _this.signature = new SignaturePad(_this.canvas);

                //Load image
                if (_this.signatureData) {
                    _this.signature.fromDataURL(_this.signatureData);
                }

                //Declare public methods
                $scope.clearCanvas = function() {
                    _this.signature.clear();
                }
                $scope.saveCanvas = function() {
                    _this.signatureData = _this.signature.toDataURL('image/png');
                }
            }
        }

        $scope.resources = {
            batteryTypes: [],
            connectorTypes: [],
            connectors: [],
            connectorColors: [],
            diagnostics: []
        };
        _this.getResources = function () {
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

        if ($scope.maintenance.id) {
            $scope.title = 'Mantenimiento';
            _this.getMaintenance();
        } else {
            $scope.title = 'Nuevo mantenimiento';
            $scope.maintenance.uniqueCode = PaCM.newGuid().substring(0,5);
            $scope.maintenance.date = new Date();
            $scope.maintenance.preventive = true;
            $scope.maintenance.corrective = false;
            if ($scope.maintenance.customerId) {
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
            if ($scope.maintenance.batteryId) {
                $scope.tabs.batteryTab = true;
                _this.getBattery();
            }
            if ($scope.maintenance.chargerId) {
                $scope.tabs.chargerTab = true;
                _this.getCharger();
            }
        }

        _this.getResources();


        _this.timeoutRefreshUI = null;
        _this.onRefreshUI = function () {
            _this.timeoutRefreshUI = null;

            $scope.readOnlyMode = false;
            if ($scope.maintenance.id) {
                if (!($scope.maintenance.statusId === 'InCapture'))
                    $scope.readOnlyMode = true;
                else if (!($scope.maintenance.executedById === userSession.user.Id))
                    $scope.readOnlyMode = true;
            }

            $scope.readOnlyLinks = $scope.preloadData === true || $scope.readOnlyMode === true;

            $scope.tabs.refreshTabs();
            $scope.$digest();
        };
        _this.refreshUI = function () {
            if (_this.timeoutRefreshUI) {
                clearTimeout(_this.timeoutRefreshUI);
                _this.timeoutRefreshUI = null;
            }
            _this.timeoutRefreshUI = setTimeout(_this.onRefreshUI, 200);
        }        
        _this.refreshUI();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

        $scope.$on('$destroy', function() {

            if (_this.timeoutRefreshUI) {
                clearTimeout(_this.timeoutRefreshUI);
                _this.timeoutRefreshUI = null;
            }

            $scope.searcher.destroy();
            PaCM.cleaner($scope);
            PaCM.cleaner(_this); _this = null;
            
        });
        
    });
    
})();
