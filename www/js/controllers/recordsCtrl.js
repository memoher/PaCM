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
            $scope.searcher.open = function (type, title, data, onSelect) {
                var self = this;
                
                self.type = type;
                self.title = title;
                self.data = data;
                self.selectRecord = onSelect;
                self.search = '';
                
                $scope.modal.show();
            };
            $scope.searcher.close = function () {
                var self = this;
                
                self.type = null;
                self.title = null;
                self.data = null;
                self.selectRecord = null;
                self.search = null;
                
                $scope.modal.hide();
            };
        });
        
        $scope.filters = {
            customerId: null,
            customerName: null,
            executedById: null,
            executedByUsername: null,
            objectTypeTrademarkId: null,
            objectTypeTrademarkName: null,
            objectTypeModelId: null,
            objectTypeModelName: null,
            objectTypeId: null,
            objectTypeDescription: null,
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
                $scope.searcher.open(
                    'Customer',
                    'Buscar cliente',
                    customers,
                    function (r) {
                        $scope.filters.customerId = r.Id;
                        $scope.filters.customerName = r.Name;
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetCustomer = function () {
            $scope.filters.customerId = null;
            $scope.filters.customerName = null;
            $scope.resetObjectType();
        };
        
        $scope.searchExecutedBy = function () {
            dataContext.list('User', 'r.Username', function (users) {
                $scope.searcher.open(
                    'User',
                    'Buscar usuario',
                    users,
                    function (r) {
                        $scope.filters.executedById = r.Id;
                        $scope.filters.executedByUsername = r.Username;
                        $scope.searcher.close();
                    });
            });
        };
        $scope.resetExecutedBy = function () {
            $scope.filters.executedById = null;
            $scope.filters.executedByUsername = null;
        };
        
        $scope.searchObjectTypeTrademark = function () {
            dataContext.list('ObjectTypeTrademark', 'r.Name', function (trademarks) {
                $scope.searcher.open(
                    'ObjectTypeTrademark',
                    'Buscar marca',
                    trademarks,
                    function (r) {
                        $scope.filters.objectTypeTrademarkId = r.Id;
                        $scope.filters.objectTypeTrademarkName = r.Name;
                        $scope.filters.objectTypeModelId = null;
                        $scope.filters.objectTypeModelName = null;
                        $scope.searcher.close();
                    }); 
            });
        };
        $scope.resetObjectTypeTrademark = function () {
            $scope.filters.objectTypeTrademarkId = null;
            $scope.filters.objectTypeTrademarkName = null;
            $scope.resetObjectTypeModel();
        };
        
        $scope.searchObjectTypeModel = function () {
            
            var where = {};
            if ($scope.filters.objectTypeTrademarkId)
                where.TrademarkId = $scope.filters.objectTypeTrademarkId;
            
            dataContext.find2('ObjectTypeModel', where, function (models) {
                $scope.searcher.open(
                    'ObjectTypeModel',
                    'Buscar modelo',
                    models,
                    function (r) {
                        $scope.filters.objectTypeModelId = r.Id;
                        $scope.filters.objectTypeModelName = r.Name;
                        dataContext.get('ObjectTypeTrademark', r.TrademarkId, function (t) {
                            $scope.filters.objectTypeTrademarkId = t.Id;
                            $scope.filters.objectTypeTrademarkName = t.Name;
                        });
                        $scope.searcher.close();
                    }); 
            });
            
        };
        $scope.resetObjectTypeModel = function () {
            $scope.filters.objectTypeModelId = null;
            $scope.filters.objectTypeModelName = null;
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
                $scope.searcher.open(
                    'ObjectType',
                    'Buscar bateria / cargador',
                    objects,
                    function (r) {
                        $scope.filters.objectTypeId = r.Id;
                        $scope.filters.objectTypeDescription = r.Description;
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
            $scope.modal.remove();
            delete $scope.modal.scope;
            delete $scope.modal;
            delete $scope.searcher;
            delete $scope.runningProcess;
        });
        
    });
    
})();