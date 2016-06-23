(function () {
    "use strict";
    
    PaCM.controllers.controller('recordsCtrl', function ($scope, $state, $stateParams, userSession, dbRepository, searcherPopup) {

        if (!(userSession.isLogged === true)) {
            $state.go('login');
            return false;
        }
        
        $scope.objectTypeLabel = null;
        switch ($stateParams.type)
        {
            case 'Battery':
                $scope.objectTypeLabel = 'Batería';
            break;
            case 'Charger':
                $scope.objectTypeLabel = 'Cargador';
            break;
            default:
                throw 'Object type is not valid';
        }


        var _priv = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;
        
        // Create the modal popup searcher
        searcherPopup.initialize($scope);
        
        $scope.filters = {
            customerId: null,
            customerName: null,
            customerSearch: null,
            objectTypeTrademarkId: null,
            objectTypeTrademarkName: null,
            objectTypeTrademarkSearch: null,
            objectTypeModelId: null,
            objectTypeModelName: null,
            objectTypeModelSearch: null,
            objectTypeId: null,
            objectTypeDescription: null,
            objectTypeSearch: null
        };
        
        $scope.searchCustomer = function () {
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if (!(userSession.isEscolUser === true)) {
                options.where.Id = userSession.user.CustomerId;
            }
            dbRepository.find('Customer', options, function (customers) {
                if ($scope.filters.customerId) {
                    var val = $scope.filters.customerId;
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
                        if (!(r.Selected === true)) {
                            $scope.filters.customerId = r.Id;
                            $scope.filters.customerName = r.Name;
                            $scope.filters.customerSearch = $scope.searcher.search;
                            $scope.resetObjectType();
                        }
                    });
            });

            return false;
        };
        $scope.resetCustomer = function () {
            $scope.filters.customerId = null;
            $scope.filters.customerName = null;
            $scope.filters.customerSearch = null;
            $scope.resetObjectType();
        };
        
        $scope.searchObjectTypeTrademark = function () {
            dbRepository.find('ObjectTypeTrademark', { orderBy: 'Name' }, function (trademarks) {

                dbRepository.find($stateParams.type, { fields: 'TrademarkId', groupBy: 'TrademarkId' }, function (objects) {
                    
                    //Debe filtrar las marcas, dependiendo de si aplica a baterías o a cargadores
                    //se deberán mostrar sólo aquellas marcas que tengan al menos un dispositivo
                    PaCM.eachArrayInvert(trademarks, function (inxT, t) {
                        var valid = false;
                        PaCM.eachArrayInvert(objects, function (inxO, o) {
                            if (t.Id === o.TrademarkId) {
                                valid = true;
                                objects.splice(inxO, 1);
                            }
                        });
                        if (!(valid === true)) {
                            trademarks.splice(inxT, 1);
                        }
                    });

                    if ($scope.filters.objectTypeTrademarkId) {
                        var val = $scope.filters.objectTypeTrademarkId;
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
                            if (!(r.Selected === true)) {
                                $scope.filters.objectTypeTrademarkId = r.Id;
                                $scope.filters.objectTypeTrademarkName = r.Name;
                                $scope.filters.objectTypeTrademarkSearch = $scope.searcher.search;
                                $scope.resetObjectTypeModel();
                            }
                        });
                });
                 
            });

            return false;
        };
        $scope.resetObjectTypeTrademark = function () {
            $scope.filters.objectTypeTrademarkId = null;
            $scope.filters.objectTypeTrademarkName = null;
            $scope.filters.objectTypeTrademarkSearch = null;
            $scope.resetObjectTypeModel();
        };
        
        $scope.searchObjectTypeModel = function () {
            
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if ($scope.filters.objectTypeTrademarkId)
                options.where.TrademarkId = $scope.filters.objectTypeTrademarkId;
            
            dbRepository.find('ObjectTypeModel', options, function (models) {
                
                dbRepository.find($stateParams.type, { fields: 'ModelId', groupBy: 'ModelId' }, function (objects) {
                    
                    //Debe filtrar los modelos, dependiendo de si aplica a baterías o a cargadores
                    //se deberán mostrar sólo aquellos modelos que tengan al menos un dispositivo
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

                    if ($scope.filters.objectTypeModelId) {
                        var val = $scope.filters.objectTypeModelId;
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
                            if (!(r.Selected === true)) {
                                $scope.filters.objectTypeModelId = r.Id;
                                $scope.filters.objectTypeModelName = r.Name;
                                $scope.filters.objectTypeModelSearch = $scope.searcher.search;
                                dbRepository.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                    $scope.filters.objectTypeTrademarkId = t.Id;
                                    $scope.filters.objectTypeTrademarkName = t.Name;
                                    _priv.refreshUI();
                                });
                                $scope.resetObjectType();
                            }
                        });                    
                });
 
            });

            return false;
        };
        $scope.resetObjectTypeModel = function () {
            $scope.filters.objectTypeModelId = null;
            $scope.filters.objectTypeModelName = null;
            $scope.filters.objectTypeModelSearch = null;
            $scope.resetObjectType();
        };
        
        $scope.searchObjectType = function (filterValid) {
            if (!(filterValid === true)) {
                $scope.showErrors = true;
                return false;
            }

            var options = {
                where: {},
                orderBy: 't.Name, m.Name, p.Serial, p.CustomerReference'
            };
            if ($scope.filters.customerId)
                options.where.CustomerId = $scope.filters.customerId;
            if ($scope.filters.objectTypeTrademarkId)
                options.where.TrademarkId = $scope.filters.objectTypeTrademarkId;
            if ($scope.filters.objectTypeModelId)
                options.where.ModelId = $scope.filters.objectTypeModelId;
            
            dbRepository.find($stateParams.type, options, function (objects) {
                if ($scope.filters.objectTypeId) {
                    var val = $scope.filters.objectTypeId;
                    PaCM.eachArray(objects, function (inx, ot) {
                        if (ot.Id == val) {
                            ot.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'ObjectType',
                    'Buscar ' + $scope.objectTypeLabel,
                    objects,
                    $scope.filters.objectTypeSearch,
                    function (r) {
                        if (!(r.Selected === true)) {
                            $scope.filters.objectTypeId = r.Id;
                            $scope.filters.objectTypeDescription = r.Description;
                            $scope.filters.objectTypeSearch = $scope.searcher.search;
                            dbRepository.get('Customer', r.CustomerId, function (c) {
                                $scope.filters.customerId = c.Id;
                                $scope.filters.customerName = c.Name;
                                _priv.refreshUI();
                            });
                            dbRepository.get('ObjectTypeModel', r.ModelId, function (m) {
                                $scope.filters.objectTypeModelId = m.Id;
                                $scope.filters.objectTypeModelName = m.Name;
                                _priv.refreshUI();
                            });
                            dbRepository.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                $scope.filters.objectTypeTrademarkId = t.Id;
                                $scope.filters.objectTypeTrademarkName = t.Name;
                                _priv.refreshUI();
                            });
                            $scope.searchHistory();
                        }
                    });
            });

            return false;
        };
        $scope.resetObjectType = function () {
            $scope.filters.objectTypeId = null;
            $scope.filters.objectTypeDescription = null;
            $scope.filters.objectTypeSearch = null;
            $scope.resetHistory();
        };
        
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.maintenances = [];
        $scope.assemblies = [];
        $scope.searchHistory = function () {
            
            var options = {
                where: {},
                orderBy: 'r.Date DESC',
                limit: 5
            };
            if ($scope.filters.customerId)
                options.where['r.CustomerId'] = $scope.filters.customerId;
            if ($scope.filters.objectTypeTrademarkId)
                options.where.ObjectTypeTrademarkId = $scope.filters.objectTypeTrademarkId;
            if ($scope.filters.objectTypeModelId)
                options.where.ObjectTypeModelId = $scope.filters.objectTypeModelId;
            if ($scope.filters.objectTypeId)
                options.where.ObjectTypeId = $scope.filters.objectTypeId;

            $scope.runningProcess = true;
            dbRepository.find('Maintenance', options, function (maintenances) {
                PaCM.syncronizeArray(['Id'], $scope.maintenances, maintenances);
                maintenances.length = 0; maintenances = null;
                //
                dbRepository.find('Assembly', options, function (assemblies) {
                    PaCM.syncronizeArray(['Id'], $scope.assemblies, assemblies);
                    assemblies.length = 0; assemblies = null;
                    $scope.runningProcess = false;
                    _priv.refreshUI();
                });
            });
        };
        $scope.resetHistory = function () {
            $scope.assemblies.length = 0;
            $scope.maintenances.length = 0;
        }


        _priv.timeoutRefreshUI = null;
        _priv.onRefreshUI = function () {
            _priv.timeoutRefreshUI = null;
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
            PaCM.cleaner($scope);
            PaCM.cleaner(_priv); _priv = null;
            
        });
        
    });
    
})();