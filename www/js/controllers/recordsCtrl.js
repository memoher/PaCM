(function () {
    
    PaCM.controllersModule.controller('recordsCtrl', function ($scope, $ionicModal, dataContext) {

        $scope.runningProcess = false;
        
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
                delete self.data;
                delete self.search;
                delete self.selectRecord;
                
                $scope.modal.hide();
            };
        });
        
        $scope.filters = {
            customerId: null,
            customerName: null,
            customerSearch: null,
            executedById: null,
            executedByUsername: null,
            executedBySearch: null,
            objectTypeTrademarkId: null,
            objectTypeTrademarkName: null,
            objectTypeTrademarkSearch: null,
            objectTypeModelId: null,
            objectTypeModelName: null,
            objectTypeModelSearch: null,
            objectTypeId: null,
            objectTypeDescription: null,
            objectTypeSearch: null,
            applyForBattery: true,
            applyForCharger: true
        };
        
        $scope.history = [];
        $scope.searchHistory = function () {
            
            var where = {};
            if ($scope.filters.customerId)
                where['r.CustomerId'] = $scope.filters.customerId;
            else {
                PaCM.showErrorMessage('Cliente es obligatorio');
                return false;
            }
            if ($scope.filters.executedById)
                where.ExecutedById = $scope.filters.executedById;
            if ($scope.filters.objectTypeTrademarkId)
                where.ObjectTypeTrademarkId = $scope.filters.objectTypeTrademarkId;
            if ($scope.filters.objectTypeModelId)
                where.ObjectTypeModelId = $scope.filters.objectTypeModelId;
            if ($scope.filters.objectTypeId)
                where.ObjectTypeId = $scope.filters.objectTypeId;
            if ($scope.filters.applyForBattery === true && $scope.filters.applyForCharger === true) {
                //Nothing
            } else if ($scope.filters.applyForBattery === true) {
                where.Type = 'BatteryMaintenance';
            } else if ($scope.filters.applyForCharger === true) {
                where.Type = 'ChargerMaintenance';
            } else {
                where.Type = '-1';
            }
            
            $scope.runningProcess = true;
            dataContext.find2('Assembly', where, function (assemblies) {
                dataContext.find2('Maintenance', where, function (maintenances) {
                    var records = [];
                    PaCM.mergeArray(['Id'], records, assemblies, maintenances);
                    PaCM.syncronizeArray(['Id'], $scope.history, records);
                    $scope.runningProcess = false;
                    $scope.$digest();
                });
            });
        };
        
        $scope.searchCustomer = function () {
            dataContext.list('Customer', 'r.Name', function (customers) {
                if ($scope.filters.customerId != null) {
                    PaCM.eachArray(customers, function (inx, c) {
                        if (c.Id == $scope.filters.customerId) {
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
                        $scope.filters.customerId = r.Id;
                        $scope.filters.customerName = r.Name;
                        $scope.filters.customerSearch = $scope.searcher.search;
                        $scope.resetObjectType();
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetCustomer = function () {
            $scope.filters.customerId = null;
            $scope.filters.customerName = null;
            $scope.filters.customerSearch = null;
            $scope.resetObjectType();
        };
        
        $scope.searchExecutedBy = function () {
            dataContext.list('User', 'r.Username', function (users) {
                if ($scope.filters.executedById != null) {
                    PaCM.eachArray(users, function (inx, u) {
                        if (u.Id == $scope.filters.executedById) {
                            u.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'User',
                    'Buscar usuario',
                    users,
                    $scope.filters.executedBySearch,
                    function (r) {
                        $scope.filters.executedById = r.Id;
                        $scope.filters.executedByUsername = r.Username;
                        $scope.filters.executedBySearch = $scope.searcher.search;
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetExecutedBy = function () {
            $scope.filters.executedById = null;
            $scope.filters.executedByUsername = null;
            $scope.filters.executedBySearch = null;
        };
        
        $scope.searchObjectTypeTrademark = function () {
            dataContext.list('ObjectTypeTrademark', 'r.Name', function (trademarks) {
                if ($scope.filters.objectTypeTrademarkId != null) {
                    PaCM.eachArray(trademarks, function (inx, t) {
                        if (t.Id == $scope.filters.objectTypeTrademarkId) {
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
                        $scope.filters.objectTypeTrademarkId = r.Id;
                        $scope.filters.objectTypeTrademarkName = r.Name;
                        $scope.filters.objectTypeTrademarkSearch = $scope.searcher.search;
                        $scope.resetObjectTypeModel();
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
            
            var where = {};
            if ($scope.filters.objectTypeTrademarkId)
                where.TrademarkId = $scope.filters.objectTypeTrademarkId;
            
            dataContext.find2('ObjectTypeModel', where, function (models) {
                if ($scope.filters.objectTypeModelId != null) {
                    PaCM.eachArray(models, function (inx, m) {
                        if (m.Id == $scope.filters.objectTypeModelId) {
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
                        $scope.filters.objectTypeModelId = r.Id;
                        $scope.filters.objectTypeModelName = r.Name;
                        $scope.filters.objectTypeModelSearch = $scope.searcher.search;
                        dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                            $scope.filters.objectTypeTrademarkId = t.Id;
                            $scope.filters.objectTypeTrademarkName = t.Name;
                        });
                        $scope.resetObjectType();
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
            
            var where = {};
            if ($scope.filters.customerId)
                where.CustomerId = $scope.filters.customerId;
            if ($scope.filters.objectTypeTrademarkId)
                where.TrademarkId = $scope.filters.objectTypeTrademarkId;
            if ($scope.filters.objectTypeModelId)
                where.ModelId = $scope.filters.objectTypeModelId;
            
            dataContext.find2('ObjectType', where, function (objects) {
                if ($scope.filters.objectTypeId != null) {
                    PaCM.eachArray(objects, function (inx, ot) {
                        if (ot.Id == $scope.filters.objectTypeId) {
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
                        $scope.filters.objectTypeId = r.Id;
                        $scope.filters.objectTypeDescription = r.Description;
                        $scope.filters.objectTypeSearch = $scope.searcher.search;
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
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetObjectType = function () {
            $scope.filters.objectTypeId = null;
            $scope.filters.objectTypeDescription = null;
            $scope.filters.objectTypeSearch = null;
        };

        $scope.$on('$destroy', function() {
            delete $scope.resetObjectType;
            delete $scope.searchObjectType;
            delete $scope.resetObjectTypeModel;
            delete $scope.searchObjectTypeModel;
            delete $scope.resetObjectTypeTrademark;
            delete $scope.searchObjectTypeTrademark;
            delete $scope.resetExecutedBy;
            delete $scope.searchExecutedBy;
            delete $scope.resetCustomer;
            delete $scope.searchCustomer;
            delete $scope.searchHistory;
            delete $scope.history;
            delete $scope.filters;
            $scope.searcher.close();
            $scope.modal.remove();
            //delete $scope.modal.scope;
            delete $scope.modal;
            delete $scope.searcher;
            delete $scope.runningProcess;
        });
        
    });
    
})();