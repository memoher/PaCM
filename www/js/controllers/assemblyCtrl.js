(function () {
    "use strict";
    
    PaCM.controllers.controller('assemblyCtrl', function ($scope, $state, $stateParams, $ionicHistory, $ionicTabsDelegate, userSession, dbRepository, dbSynchronizer, searcherPopup, notesPopup) {

        if (!(userSession.isLogged === true)) {
            $state.go('login');
            return false;
        }


        var _priv = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;

        $scope.myGoBack = function () {
            $ionicHistory.goToHistoryRoot($ionicHistory.currentView().historyId);
        };

        _priv.onSqlError = function (err) {
            $scope.runningProcess = false;
            $scope.$digest();
            PaCM.showErrorMessage(err);
            throw err;
        }

        _priv.preloadData = ($stateParams.objectId) ? true : false;

        $scope.title = 'Ensamble';
        $scope.refreshTitle = function () {
            switch ($scope.tabs.selectedTab()) {
                case 'starterTab':
                    $scope.title = 'Ensamble : cliente';
                    break;
                case 'batteryTab':
                    $scope.title = 'Ensamble : batería';
                    break;
                case 'chargerTab':
                    $scope.title = 'Ensamble : cargador';
                    break;
                case 'suppliesTab':
                    $scope.title = 'Ensamble : insumos y repuestos';
                    break;
                case 'cellInspectionTab':
                    $scope.title = 'Ensamble : inspección de celdas';
                    break;
                case 'endingTab':
                    $scope.title = 'Ensamble : comentarios';
                    break;
            }
        };
        
        $scope.tabs = {
            starterTab: true,
            batteryTab: false,
            chargerTab: false,
            suppliesTab: false,
            cellInspectionTab: false,
            endingTab: false,
            refreshTabs: function () {
                var self = this;

                self.batteryTab = (($scope.assembly.id && $scope.assembly.batteryId) || ($scope.assembly.customerId && $stateParams.type === 'Battery')) ? true : false;
                self.chargerTab = (($scope.assembly.id && $scope.assembly.chargerId) || ($scope.assembly.customerId && $stateParams.type === 'Charger')) ? true : false;

                var validObjectType = ((self.batteryTab === true && $scope.battery.typeId) || (self.chargerTab === true && $scope.charger.voltage)) ? true : false;
                self.suppliesTab = validObjectType;
                self.cellInspectionTab = (validObjectType && ($scope.battery.typeId)) ? true : false;
                self.endingTab = validObjectType;
            },
            selectTab: function (tabName) {
                var i = 0;
                return PaCM.eachProperties(this, function (key, val) {
                    if (key === tabName) {
                        if (val === true) {
                            $ionicTabsDelegate.select(i);
                        }
                        return i; //break
                    }
                    i++;
                });
            },
            selectedTab: function () {
                var i = $ionicTabsDelegate.selectedIndex();
                var j = 0;
                return PaCM.eachProperties(this, function (key, val) {
                    if (j === i)
                        return key; //break
                    j++;
                });
            }
        };
        
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

        // Create the modal popup notes
        notesPopup.initialize($scope);
        
        // Create the modal popup searcher
        searcherPopup.initialize($scope);
        
        _priv.filters = {
            customerSearch: null,
            branchCustomerSearch: null,
            objectTypeTrademarkSearch: null,
            objectTypeModelSearch: null,
            objectTypeSearch: null
        };
        
        $scope.searchCustomer = function () {
            if ($scope.readOnlyLinks === true || $scope.assembly.id) {
                return;
            }

            var options = {
                where: {},
                orderBy: 'Name'
            };
            if (!(userSession.isEscolUser === true)) {
                options.where.Id = userSession.user.CustomerId;
            }
            dbRepository.find('Customer', options, function (customers) {
                if ($scope.assembly.customerId) {
                    var val = $scope.assembly.customerId;
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
                    _priv.filters.customerSearch,
                    function (r) {
                        $scope.resetCustomer();
                        if (r == $scope.searcher.search) {
                            $state.go('new-customer2', {
                                name: $scope.searcher.search,
                                redirectTo: 'new-assembly2',
                                redirectParams: 'type' + String.fromCharCode(1) + $stateParams.type,
                            });
                        } else {
                            $scope.assembly.customerId = r.Id;
                            $scope.assembly.customerName = r.Name;
                        }
                        _priv.filters.customerSearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetCustomer = function () {
            $scope.assembly.customerId = null;
            $scope.assembly.customerName = null;
            _priv.filters.customerSearch = null;
            $scope.resetBranchCustomer();
            $scope.resetObjectType(true);
            $scope.resetObjectType(false);
        };

        $scope.searchBranchCustomer = function () {
            if ($scope.readOnlyMode === true || !($scope.assembly.customerId)) {
                return;
            }

            var options = {
                where: {
                    CustomerId: $scope.assembly.customerId
                },
                orderBy: 'Name'
            };

            dbRepository.find('BranchCustomer', options, function (customerBranches) {
                if ($scope.assembly.branchCustomerId) {
                    var val = $scope.assembly.branchCustomerId;
                    PaCM.eachArray(customerBranches, function (inx, bc) {
                        if (bc.Id == val) {
                            bc.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'BranchCustomer',
                    'Buscar sucursal',
                    customerBranches,
                    _priv.filters.branchCustomerSearch,
                    function (r) {
                        $scope.resetBranchCustomer();
                        if (r == $scope.searcher.search) {
                            $scope.assembly.branchCustomerName = r;
                        } else {
                            $scope.assembly.branchCustomerId = r.Id;
                            $scope.assembly.branchCustomerName = r.Name;
                        }
                        _priv.filters.branchCustomerSearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetBranchCustomer = function () {
            $scope.assembly.branchCustomerId = null;
            $scope.assembly.branchCustomerName = null;
            _priv.filters.branchCustomerSearch = null;
        };
        
        $scope.searchObjectTypeTrademark = function (applyForBattery) {
            if ($scope.readOnlyLinks === true) {
                return;
            }

            dbRepository.find('ObjectTypeTrademark', { orderBy: 'Name' }, function (trademarks) {
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
                    _priv.filters.objectTypeTrademarkSearch,
                    function (r) {
                        $scope.resetObjectTypeTrademark(applyForBattery);
                        if (applyForBattery === true) {
                            if (r == $scope.searcher.search) {
                                $scope.battery.trademarkName = r;
                            } else {
                                $scope.battery.trademarkId = r.Id;
                                $scope.battery.trademarkName = r.Name;
                            }
                        } else {
                            if (r == $scope.searcher.search) {
                                $scope.charger.trademarkName = r;
                            } else {
                                $scope.charger.trademarkId = r.Id;
                                $scope.charger.trademarkName = r.Name;
                            }
                        }
                        _priv.filters.objectTypeTrademarkSearch = $scope.searcher.search;
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
            _priv.filters.objectTypeTrademarkSearch = null;
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
            
            dbRepository.find('ObjectTypeModel', options, function (models) {

                dbRepository.find((applyForBattery === true) ? 'Battery' : 'Charger', { fields: 'ModelId', groupBy: 'ModelId' }, function (objects) {

                    //Debe filtrar los modelos, dependiendo de si aplica a baterías o a cargadores
                    PaCM.eachArrayInvert(models, function (inxM, m) {
                        var valid = false;
                        PaCM.eachArrayInvert(objects, function (inxO, o) {
                            if (m.Id === o.ModelId) {
                                valid = true;
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
                        _priv.filters.objectTypeModelSearch,
                        function (r) {
                            $scope.resetObjectTypeModel(applyForBattery);
                            if (applyForBattery === true) {
                                if (r == $scope.searcher.search) {
                                    $scope.battery.modelName = r;
                                } else {
                                    $scope.battery.modelId = r.Id;
                                    $scope.battery.modelName = r.Name;
                                    dbRepository.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                        $scope.battery.trademarkId = t.Id;
                                        $scope.battery.trademarkName = t.Name;
                                        _priv.refreshUI();
                                    });
                                }
                            } else {
                                if (r == $scope.searcher.search) {
                                    $scope.charger.modelName = r;
                                } else {
                                    $scope.charger.modelId = r.Id;
                                    $scope.charger.modelName = r.Name;
                                    dbRepository.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                        $scope.charger.trademarkId = t.Id;
                                        $scope.charger.trademarkName = t.Name;
                                        _priv.refreshUI();
                                    });
                                }
                            }
                            _priv.filters.objectTypeModelSearch = $scope.searcher.search;
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
            _priv.filters.objectTypeModelSearch = null;
            $scope.resetObjectType(applyForBattery);
        };
        
        $scope.searchObjectType = function (applyForBattery) {
            if ($scope.readOnlyLinks === true) {
                return;
            }

            var options = {
                where: {},
                orderBy: 'p.Serial, p.CustomerReference'
            };
            if ($scope.assembly.customerId)
                options.where.CustomerId = $scope.assembly.customerId;
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
            
            dbRepository.find(applyForBattery === true ? 'Battery' : 'Charger', options, function (objects) {
                if ($scope.assembly.batteryId || $scope.assembly.chargerId) {
                    var val = applyForBattery === true ? $scope.assembly.batteryId : $scope.assembly.chargerId;
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
                    _priv.filters.objectTypeSearch,
                    function (r) {
                        $scope.resetObjectType(applyForBattery);
                        if (applyForBattery === true) {
                            if (r == $scope.searcher.search) {
                                $scope.battery.serial = r;
                            } else {
                                $scope.assembly.batteryId = r.Id;
                                _priv.getBattery();
                            }
                        } else {
                            if (r == $scope.searcher.search) {
                                $scope.charger.serial = r;
                            } else {
                                $scope.assembly.chargerId = r.Id;
                                _priv.getCharger();
                            }
                        }
                        _priv.filters.objectTypeSearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetObjectType = function (applyForBattery) {
            if (applyForBattery === true) {
                if ($scope.assembly.batteryId) {
                    $scope.assembly.batteryId = null;
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
                }
            } else {
                if ($scope.assembly.chargerId) {
                    $scope.assembly.chargerId = null;
                    $scope.charger.serial = null;
                    $scope.charger.customerReference = null;
                    $scope.charger.voltage = null;
                    $scope.charger.amperage = null;
                }
            }
            _priv.filters.objectTypeSearch = null;
            $scope.getAssemblyInfo();
        };

        $scope.searchArticle = function (ao) {
            if ($scope.readOnlyMode === true) {
                return;
            }
            
            var options = {
                where: { EnabledBatteries: false, EnabledChargers: false },
                orderBy: 'Name'
            };
            if ($scope.battery.typeId) {
                options.where = { EnabledBatteries: true };
            }
            if ($scope.charger.voltage) {
                options.where = { EnabledChargers: true };
            }

            dbRepository.find('Article', options, function (articles) {
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
                        $scope.addArticle();
                    });
            });
        };
        
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

        $scope.assembly = {
            id: ($stateParams.assemblyId) ? $stateParams.assemblyId : null,
            date: null,
            customerId: ($stateParams.customerId) ? $stateParams.customerId : null,
            customerName: null,
            branchCustomerId: null,
            branchCustomerName: null,
            batteryId: $stateParams.type === 'Battery' ? $stateParams.objectId : null,
            chargerId: $stateParams.type === 'Charger' ? $stateParams.objectId : null,
            comments: null,
            statusId: null,
            statusDescription: null,
            executedById: null,
            executedByUsername: null
        };
        _priv.getAssembly = function () {
            if ($scope.assembly.id) {
                dbRepository.get('Assembly', $scope.assembly.id, function (r) {
                    $scope.assembly.id = r.Id;
                    $scope.assembly.date = r.Date;
                    $scope.assembly.customerId = r.CustomerId;
                    $scope.assembly.branchCustomerId = r.BranchCustomerId;
                    $scope.assembly.batteryId = r.Type.indexOf('Battery') >= 0 ? r.ObjectTypeId : null;
                    $scope.assembly.chargerId = r.Type.indexOf('Charger') >= 0 ? r.ObjectTypeId : null;
                    $scope.assembly.comments = r.Comments;
                    $scope.assembly.statusId = r.StatusId;
                    $scope.assembly.executedById = r.ExecutedById;
                    _priv.refreshUI();
                    dbRepository.get('Customer', $scope.assembly.customerId, function (c) {
                        $scope.assembly.customerName = c.Name;
                        _priv.refreshUI();
                    });
                    if ($scope.assembly.branchCustomerId) {
                        dbRepository.get('BranchCustomer', $scope.assembly.branchCustomerId, function (cb) {
                            $scope.assembly.branchCustomerName = cb.Name;
                            _priv.refreshUI();
                        });
                    }
                    dbRepository.get('AssemblyStatus', $scope.assembly.statusId, function (ms) {
                        $scope.assembly.statusDescription = ms.Description;
                        _priv.refreshUI();
                    });
                    dbRepository.get('User', $scope.assembly.executedById, function (u) {
                        $scope.assembly.executedByUsername = u.Username;
                        _priv.refreshUI();
                    });
                    if ($scope.assembly.batteryId) {
                        _priv.getBattery();
                    }
                    if ($scope.assembly.chargerId) {
                        _priv.getCharger();
                    }
                });
            }
        };
        _priv.saveBranchCustomer = function (onSuccess) {
            dbRepository.get('Customer', $scope.assembly.customerId, function (c) {
                var bc = {
                    CustomerId: c.Id,
                    CityId: c.CityId,
                    Name: $scope.assembly.branchCustomerName,
                    Address: '.',
                    PhoneNumber: '.'
                };
                dbRepository.insert('BranchCustomer', /*$scope.assembly.branchCustomerId,*/ bc, function () {
                    $scope.assembly.branchCustomerId = bc.Id;
                    PaCM.cleaner(bc); bc = null;
                    onSuccess();
                }, _priv.onSqlError);
            });
        };
        _priv.saveAssembly = function (onSuccess) {
            var m = {
                Date: $scope.assembly.date,
                CustomerId: $scope.assembly.customerId,
                BranchCustomerId: $scope.assembly.branchCustomerId,
                Type: $scope.assembly.batteryId ? 'BatteryAssembly' : 'ChargerAssembly',
                ObjectTypeId: $scope.assembly.batteryId ? $scope.assembly.batteryId : $scope.assembly.chargerId,
                Comments: $scope.assembly.comments,
                ExecutedById: $scope.assembly.executedById,
                StatusId: 'Approved'
            };
            dbRepository.save('Assembly', $scope.assembly.id, m, function () {
                $scope.assembly.id = m.Id;
                PaCM.cleaner(m); m = null;
                onSuccess();
            }, _priv.onSqlError);
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
        _priv.getBattery = function () {
            if ($scope.assembly.batteryId) {
                dbRepository.get('Battery', $scope.assembly.batteryId, function (r) {
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
                    dbRepository.get('Connector', $scope.battery.connectorId, function (c) {
                        $scope.battery.connectorTypeId = c.TypeId;
                        _priv.refreshUI();
                        dbRepository.get('ConnectorType', $scope.battery.connectorTypeId, function (ct) {
                            $scope.battery.connectorColorRequired = ct.ColorRequired;
                            _priv.refreshUI();
                        });
                    });
                    dbRepository.get('ObjectTypeModel', $scope.battery.modelId, function (m) {
                        $scope.battery.modelName = m.Name;
                        _priv.refreshUI();
                    });
                    dbRepository.get('ObjectTypeTrademark', $scope.battery.trademarkId, function (t) {
                        $scope.battery.trademarkName = t.Name;
                        _priv.refreshUI();
                    });
                    $scope.getAssemblyInfo();
                });
            }
        };
        _priv.saveBatteryTrademark = function (onSuccess) {
            var r = {
                Name: $scope.battery.trademarkName
            };
            dbRepository.insert('ObjectTypeTrademark', /*$scope.battery.trademarkId,*/ r, function () {
                $scope.battery.trademarkId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        };
        _priv.saveBatteryModel = function (onSuccess) {
            var r = {
                Name: $scope.battery.modelName,
                TrademarkId: $scope.battery.trademarkId
            };
            dbRepository.insert('ObjectTypeModel', /*$scope.battery.modelId,*/ r, function () {
                $scope.battery.modelId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        };
        _priv.saveBattery = function (onSuccess) {
            var ot = {
                ModelId: $scope.battery.modelId,
                Serial: $scope.battery.serial,
                CustomerId: $scope.assembly.customerId,
                CustomerReference: $scope.battery.customerReference,
                Enabled: true
            };
            dbRepository.save('ObjectType', $scope.assembly.batteryId, ot, function () {
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
                dbRepository.save('Battery', $scope.assembly.batteryId, b, function () {
                    $scope.assembly.batteryId = b.Id;
                    PaCM.cleaner(ot); ot = null;
                    PaCM.cleaner(b); b = null;
                    onSuccess();
                }, _priv.onSqlError);
            }, _priv.onSqlError);
        };

        $scope.refreshConnectorColorList = function () {
            if ($scope.battery.connectorTypeId) {
                dbRepository.get('ConnectorType', $scope.battery.connectorTypeId, function (ct) {
                    $scope.battery.connectorColorRequired = ct.ColorRequired;
                    _priv.refreshUI();
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
        _priv.getCharger = function () {
            if ($scope.assembly.chargerId) {
                dbRepository.get('Charger', $scope.assembly.chargerId, function (r) {
                    //$scope.charger.id = r.Id;
                    $scope.charger.description = r.Description;
                    $scope.charger.trademarkId = r.TrademarkId;
                    $scope.charger.modelId = r.ModelId;
                    $scope.charger.serial = r.Serial;
                    //$scope.charger.customerId = r.CustomerId;
                    $scope.charger.customerReference = r.CustomerReference;
                    $scope.charger.voltage = r.Voltage;
                    $scope.charger.amperage = r.Amperage;
                    dbRepository.get('ObjectTypeModel', $scope.charger.modelId, function (m) {
                        $scope.charger.modelName = m.Name;
                        _priv.refreshUI();
                    });
                    dbRepository.get('ObjectTypeTrademark', $scope.charger.trademarkId, function (t) {
                        $scope.charger.trademarkName = t.Name;
                        _priv.refreshUI();
                    });
                    $scope.getAssemblyInfo();
                });
            }
        };
        _priv.saveChargerTrademark = function (onSuccess) {
            var r = {
                Name: $scope.charger.trademarkName
            };
            dbRepository.insert('ObjectTypeTrademark', /*$scope.charger.trademarkId,*/ r, function () {
                $scope.charger.trademarkId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        };
        _priv.saveChargerModel = function (onSuccess) {
            var r = {
                Name: $scope.charger.modelName,
                TrademarkId: $scope.charger.trademarkId
            };
            dbRepository.insert('ObjectTypeModel', /*$scope.charger.modelId,*/ r, function () {
                $scope.charger.modelId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        };
        _priv.saveCharger = function (onSuccess) {
            var ot = {
                ModelId: $scope.charger.modelId,
                Serial: $scope.charger.serial,
                CustomerId: $scope.assembly.customerId,
                CustomerReference: $scope.charger.customerReference,
                Enabled: true
            };
            dbRepository.save('ObjectType', $scope.assembly.chargerId, ot, function () {
                var c = {
                    Id: ot.Id,
                    Voltage: $scope.charger.voltage,
                    Amperage: $scope.charger.amperage,
                };
                dbRepository.save('Charger', $scope.assembly.chargerId, c, function () {
                    $scope.assembly.chargerId = c.Id;
                    PaCM.cleaner(ot); ot = null;
                    PaCM.cleaner(c); c = null;
                    onSuccess();
                }, _priv.onSqlError);
            }, _priv.onSqlError);
        };

        $scope.reviewOfCells = [];
        _priv.getReviewOfCells = function () {
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
                if ($scope.assembly.batteryId) {
                    dbRepository.find('Cell', { where: { BatteryId: $scope.assembly.batteryId }, orderBy: '[Order]' }, function (cells) {
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
                if ($scope.assembly.id) {
                    dbRepository.find('CellReview', { where: { AssemblyId: $scope.assembly.id } }, function (reviewOfCells) {
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
                PaCM.mergeArray(['cellOrder'], arr2, arr3);
                arr3.length = 0; arr3 = null;
                PaCM.mergeArray(['cellOrder'], arr1, arr2);
                arr2.length = 0; arr2 = null;
                PaCM.syncronizeArray(['cellOrder'], $scope.reviewOfCells, arr1);
                arr1.length = 0; arr1 = null;
                $scope.reviewOfCells.sort(function(a, b){return ((a.cellOrder == b.cellOrder) ? 0 : a.cellOrder < b.cellOrder) ? -1 : 1;});
            });
        };
        _priv.saveReviewOfCells = function (onSuccess) {

            var _saveFnc01 = function (c) {
                return function (onSuccess) {
                    var cr = {
                        BatteryId: $scope.assembly.batteryId,
                        Order: c.cellOrder
                    };
                    dbRepository.insert('Cell', /*c.cellId,*/ cr, function () {
                        c.cellId = cr.Id;
                        PaCM.cleaner(cr); cr = null;
                        onSuccess();
                    }, _priv.onSqlError);
                };
            };

            var _saveFnc02 = function (c) {
                return function (onSuccess) {
                    if (c.voltage && c.density) {
                        var cr = {
                            AssemblyId: $scope.assembly.id,
                            CellId: c.cellId,
                            Voltage: c.voltage,
                            Density: c.density,
                            Comments: c.comments
                        };
                        dbRepository.save('CellReview', c.id, cr, function () {
                            c.id = cr.Id;
                            PaCM.cleaner(cr); cr = null;
                            onSuccess();
                        }, _priv.onSqlError);
                    } else {
                        onSuccess();
                    }
                };
            };

            var actions = [];
            PaCM.eachArray($scope.reviewOfCells, function (inx, c) {
                if (!(c.cellId))
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
        _priv.getArticlesOutputs = function () {
            if ($scope.assembly.id) {
                dbRepository.find('ArticleOutput', { where: { AssemblyId: $scope.assembly.id } }, function (articlesOutputs) {
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
                    articles.length = 0; articles = null;
                    $scope.articlesOutputs.sort(function(a, b){return ((a.articleName == b.articleName) ? 0 : a.articleName < b.articleName) ? -1 : 1;});
                    $scope.addArticle();
                });
            } else {
                $scope.articlesOutputs.length = 0;
                $scope.addArticle();
            }
        };
        $scope.addArticle = function () {
            var itemFree = PaCM.eachArray($scope.articlesOutputs, function (inx, ao) {
                if (ao.articleId == null) {
                    return true; //Break
                }
            });
            if (!(itemFree === true)) {
                $scope.articlesOutputs.push({
                    id: null,
                    articleId: null,
                    articleName: null,
                    quantity: null
                });
            }
        };
        $scope.removeArticle = function (ao) {
            $scope.articlesOutputs.splice($scope.articlesOutputs.indexOf(ao), 1);
        }
        _priv.saveArticlesOutpus = function (onSuccess) {

            var _saveFnc01 = function (a) {
                return function (onSuccess) {
                    if (a.articleId && a.quantity) {
                        var ao = {
                            AssemblyId: $scope.assembly.id,
                            ArticleId: a.articleId,
                            Quantity: a.quantity
                        };
                        dbRepository.save('ArticleOutput', a.id, ao, function () {
                            a.id = ao.Id;
                            PaCM.cleaner(ao); ao = null;
                            onSuccess();
                        }, _priv.onSqlError);
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

        $scope.getAssemblyInfo = function () {
            _priv.getReviewOfCells();
            _priv.getArticlesOutputs();
            _priv.refreshUI();
        }


        $scope.save = function () {

            var forms = document.getElementsByClassName('assembly-form');
            for (var i = 0, t = forms.length, f = null; i < t; i ++) {
                f = forms[i];
                if (f.classList.contains('ng-invalid') === true) {
                    $scope.tabs.selectTab(f.getAttribute('name').replace('Form', 'Tab'));
                    alert('Faltan datos obligatorios o tiene algun error. Por favor revise antes de continuar...');
                    return false; //break
                }
            }

            var actions = [];
            if ($scope.assembly.branchCustomerName && !($scope.assembly.branchCustomerId)) {
                actions.push(_priv.saveBranchCustomer);
            }
            if ($scope.battery.typeId) {
                if (!($scope.battery.trademarkId))
                    actions.push(_priv.saveBatteryTrademark);
                if (!($scope.battery.modelId))
                    actions.push(_priv.saveBatteryModel);
                actions.push(_priv.saveBattery);
            }
            if ($scope.charger.voltage) {
                if (!($scope.charger.trademarkId))
                    actions.push(_priv.saveChargerTrademark);
                if (!($scope.charger.modelId))
                    actions.push(_priv.saveChargerModel);
                actions.push(_priv.saveCharger);
            }
            actions.push(_priv.saveAssembly);
            actions.push(_priv.saveArticlesOutpus);
            actions.push(_priv.saveReviewOfCells);

            $scope.runningProcess = true;
            PaCM.execute(actions, function () {
                dbSynchronizer.run(function () { }, function () { });
                $scope.runningProcess = false;
                _priv.refreshUI();
                alert('Registro guardado con éxito');
                $scope.myGoBack();
            });
        };

        $scope.resources = {
            batteryTypes: [],
            connectorTypes: [],
            connectors: [],
            connectorColors: [],
            diagnostics: []
        };
        dbRepository.find('BatteryType', { orderBy: 'Voltage, NumberOfCells' }, function (batteryTypes) {
            PaCM.eachArray(batteryTypes, function (inx, bt) {
                $scope.resources.batteryTypes.push({
                    id: bt.Id,
                    description: bt.Voltage + 'V (' + bt.NumberOfCells + ' Celdas)',
                    voltage: bt.Voltage,
                    numberOfCells: bt.NumberOfCells
                });
            });
            _priv.refreshUI();
        });
        dbRepository.find('ConnectorType', { orderBy: 'Name' }, function (connectorTypes) {
            PaCM.eachArray(connectorTypes, function (inx, ct) {
                $scope.resources.connectorTypes.push({
                    id: ct.Id,
                    name: ct.Name,
                    colorRequired: ct.ColorRequired
                });
            });
            _priv.refreshUI();
        });
        dbRepository.find('Connector', { orderBy: 'Name' }, function (connector) {
            PaCM.eachArray(connector, function (inx, c) {
                $scope.resources.connectors.push({
                    id: c.Id,
                    name: c.Name,
                    typeId: c.TypeId
                });
            });
            _priv.refreshUI();
        });
        dbRepository.find('Color', { orderBy: 'Name' }, function (connectorColors) {
            PaCM.eachArray(connectorColors, function (inx, cc) {
                $scope.resources.connectorColors.push({
                    id: cc.Id,
                    name: cc.Name,
                    hex: cc.HEX
                });
            });
            _priv.refreshUI();
        });
        dbRepository.find('Diagnostic', { orderBy: 'Name' } , function (diagnostics) {
            PaCM.eachArray(diagnostics, function (inx, d) {
                $scope.resources.diagnostics.push({
                    id: d.Id,
                    name: d.Name,
                    typeId: d.TypeId
                });
            });
            _priv.refreshUI();
        });

        if ($scope.assembly.id) {
            _priv.getAssembly();
        } else {
            $scope.assembly.date = new Date();
            if ($scope.assembly.customerId) {
                dbRepository.get('Customer', $scope.assembly.customerId, function (c) {
                    $scope.assembly.customerName = c.Name;
                    _priv.refreshUI();
                });
            }
            $scope.assembly.statusId = 'InCapture';
            dbRepository.get('AssemblyStatus', $scope.assembly.statusId, function (ms) {
                $scope.assembly.statusDescription = ms.Description;
                _priv.refreshUI();
            });
            $scope.assembly.executedById = userSession.user.Id;
            $scope.assembly.executedByUsername = userSession.user.Username;
            if ($scope.assembly.batteryId) {
                _priv.getBattery();
            }
            if ($scope.assembly.chargerId) {
                _priv.getCharger();
            }
            $scope.addArticle();
        }


        _priv.timeoutRefreshUI = null;
        _priv.onRefreshUI = function () {
            _priv.timeoutRefreshUI = null;

            $scope.readOnlyMode = false;
            if ($scope.assembly.id) {
                if (userSession.isAdminUser === true)
                    $scope.readOnlyMode = false;
                else if (!($scope.assembly.statusId === 'InCapture'))
                    $scope.readOnlyMode = true;
                else if (!($scope.assembly.executedById === userSession.user.Id))
                    $scope.readOnlyMode = true;
            }

            $scope.readOnlyLinks = _priv.preloadData === true || $scope.readOnlyMode === true;

            $scope.tabs.refreshTabs();
            $scope.$digest();
        };
        _priv.refreshUI = function () {
            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }
            _priv.timeoutRefreshUI = setTimeout(_priv.onRefreshUI, 100);
        }


        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

        $scope.$on('$destroy', function() {

            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }

            $scope.searcher.destroy();
            $scope.notes.destroy();
            PaCM.cleaner($scope);
            PaCM.cleaner(_priv); _priv = null;

        });
        
    });
    
})();
