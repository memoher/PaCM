(function () {
    
    PaCM.controllersModule.controller('recordsCtrl', function ($scope, $state, $ionicModal, dataContext, userSession) {

        if (!(userSession.isLogged === true)) {
            $state.go('app.login');
        }

        var _this = this; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;
        
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
            objectTypeType: null,
            objectTypeSearch: null
        };
        
        $scope.searchCustomer = function () {
            dataContext.find('Customer', { orderBy: 'Name' }, function (customers) {
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
                            $scope.resetObjectTypeTrademark();
                        }
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetCustomer = function () {
            $scope.filters.customerId = null;
            $scope.filters.customerName = null;
            $scope.filters.customerSearch = null;
            $scope.resetObjectTypeTrademark();
        };
        
        $scope.searchObjectTypeTrademark = function () {
            dataContext.find('ObjectTypeTrademark', { orderBy: 'Name' }, function (trademarks) {
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
                        $scope.searcher.close();
                    }); 
            });
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
            
            dataContext.find('ObjectTypeModel', options, function (models) {
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
                            dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                $scope.filters.objectTypeTrademarkId = t.Id;
                                $scope.filters.objectTypeTrademarkName = t.Name;
                            });
                            $scope.resetObjectType();
                        }
                        $scope.searcher.close();
                    }); 
            });
            
        };
        $scope.resetObjectTypeModel = function () {
            $scope.filters.objectTypeModelId = null;
            $scope.filters.objectTypeModelName = null;
            $scope.filters.objectTypeModelSearch = null;
            $scope.resetObjectType();
        };
        
        $scope.searchObjectType = function () {
            
            var options = {
                where: {},
                orderBy: 't.Name, m.Name, r.Serial, r.CustomerReference'
            };
            if ($scope.filters.customerId)
                options.where.CustomerId = $scope.filters.customerId;
            if ($scope.filters.objectTypeTrademarkId)
                options.where.TrademarkId = $scope.filters.objectTypeTrademarkId;
            if ($scope.filters.objectTypeModelId)
                options.where.ModelId = $scope.filters.objectTypeModelId;
            
            dataContext.find('ObjectType', options, function (objects) {
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
                    'Buscar bateria / cargador',
                    objects,
                    $scope.filters.objectTypeSearch,
                    function (r) {
                        if (!(r.Selected === true)) {
                            $scope.filters.objectTypeId = r.Id;
                            $scope.filters.objectTypeDescription = r.Description;
                            $scope.filters.objectTypeSearch = $scope.searcher.search;
                            dataContext.get('Battery', r.Id, function (b) {
                                if (b) {
                                    $scope.filters.objectTypeType = 'battery';
                                }
                            });
                            dataContext.get('Charger', r.Id, function (c) {
                                if (c) {
                                    $scope.filters.objectTypeType = 'charger';
                                }
                            });
                            dataContext.get('Customer', r.CustomerId, function (c) {
                                $scope.filters.customerId = c.Id;
                                $scope.filters.customerName = c.Name;
                            });
                            dataContext.get('ObjectTypeModel', r.ModelId, function (m) {
                                $scope.filters.objectTypeModelId = m.Id;
                                $scope.filters.objectTypeModelName = m.Name;
                            });
                            dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                                $scope.filters.objectTypeTrademarkId = t.Id;
                                $scope.filters.objectTypeTrademarkName = t.Name;
                            });
                            $scope.searchHistory(true);
                        }
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetObjectType = function () {
            $scope.filters.objectTypeId = null;
            $scope.filters.objectTypeDescription = null;
            $scope.filters.objectTypeType = null;
            $scope.filters.objectTypeSearch = null;
            $scope.resetHistory();
        };
        
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.history = [];
        $scope.searchHistory = function (objectValid) {

            if (!(objectValid === true)) {
                $scope.showErrors = true;
                return false;
            }
            
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
            dataContext.find('Maintenance', options, function (maintenances) {
                dataContext.find('Assembly', options, function (assemblies) {
                    var records = [];
                    PaCM.mergeArray(['Id'], records, maintenances, assemblies);
                    PaCM.cleaner(maintenances); delete maintenances;
                    PaCM.cleaner(assemblies); delete assemblies;
                    PaCM.syncronizeArray(['Id'], $scope.history, records);
                    PaCM.cleaner(records); delete records;
                    $scope.runningProcess = false;
                    $scope.$digest();
                });
            });
        };
        $scope.resetHistory = function () {
            PaCM.cleaner($scope.history);
        }

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {

            $scope.searcher.close();
            $scope.modal.remove();

            PaCM.cleaner($scope);
            PaCM.cleaner(_this); delete _this;
            
        });
        
    });
    
})();