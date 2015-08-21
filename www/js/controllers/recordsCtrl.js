(function () {
    
    PaCM.controllersModule.controller('recordsCtrl', function ($scope, $state, $ionicModal, dataContext, userSession) {

        $scope.runningProcess = false;
        
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
            objectTypeDescription: null
        };
        if (userSession.isLogged()) {
            $scope.filters.executedById = userSession.user.Id;
            $scope.filters.executedByUsername = userSession.user.Username;
        }
        
        $scope.history = [];
        $scope.searchHistory = function () {
            
            var where = {};
            if ($scope.filters.customerId)
                where.CustomerId = $scope.filters.customerId;
            if ($scope.filters.executedById)
                where.ExecutedById = $scope.filters.executedById;
            if ($scope.filters.objectTypeTrademarkId)
                where.ObjectTypeTrademarkId = $scope.filters.objectTypeTrademarkId;
            if ($scope.filters.objectTypeModelId)
                where.ObjectTypeModelId = $scope.filters.objectTypeModelId;
            if ($scope.filters.objectTypeId)
                where.ObjectTypeId = $scope.filters.objectTypeId;
            
            var assemblies = dataContext.find('Assembly', where);
            var maintenances = dataContext.find('Maintenance', where);
            PaCM.syncronizeArray(["Id"], $scope.history, assemblies, maintenances);
        };
        
        $scope.searcher = {};
        
        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/searcher.html', {
            scope: $scope,
            focusFirstInput: true
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
            $scope.searcher.open(
                'Customer',
                'Buscar cliente',
                dataContext.list('Customer'),
                function (r) {
                    $scope.filters.customerId = r.Id;
                    $scope.filters.customerName = r.Name;
                    $scope.searcher.close();
                });
        };
        $scope.resetCustomer = function () {
            $scope.filters.customerId = null;
            $scope.filters.customerName = null;
            $scope.resetObjectType();
        };
        
        $scope.searchExecutedBy = function () {
            $scope.searcher.open(
                'User',
                'Buscar usuario',
                dataContext.list('User'),
                function (r) {
                    $scope.filters.executedById = r.Id;
                    $scope.filters.executedByUsername = r.Username;
                    $scope.searcher.close();
                });
        };
        $scope.resetExecutedBy = function () {
            $scope.filters.executedById = null;
            $scope.filters.executedByUsername = null;
        };
        
        $scope.searchObjectTypeTrademark = function () {
            $scope.searcher.open(
                'ObjectTypeTrademark',
                'Buscar marca',
                dataContext.list('ObjectTypeTrademark'),
                function (r) {
                    $scope.filters.objectTypeTrademarkId = r.Id;
                    $scope.filters.objectTypeTrademarkName = r.Name;
                    $scope.filters.objectTypeModelId = null;
                    $scope.filters.objectTypeModelName = null;
                    $scope.searcher.close();
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
            
            $scope.searcher.open(
                'ObjectTypeModel',
                'Buscar modelo',
                dataContext.find('ObjectTypeModel', where),
                function (r) {
                    $scope.filters.objectTypeModelId = r.Id;
                    $scope.filters.objectTypeModelName = r.Name;
                    var t = dataContext.get('ObjectTypeTrademark', r.TrademarkId);
                    $scope.filters.objectTypeTrademarkId = t.Id;
                    $scope.filters.objectTypeTrademarkName = t.Name;
                    $scope.searcher.close();
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
            
            $scope.searcher.open(
                'ObjectType',
                'Buscar bateria / cargador',
                dataContext.find('ObjectType', where),
                function (r) {
                    $scope.filters.objectTypeId = r.Id;
                    $scope.filters.objectTypeDescription = r.Description;
                    var c = dataContext.get('Customer', r.CustomerId);
                    $scope.filters.customerId = c.Id;
                    $scope.filters.customerName = c.Name;
                    var m = dataContext.get('ObjectTypeModel', r.ModelId);
                    $scope.filters.objectTypeModelId = m.Id;
                    $scope.filters.objectTypeModelName = m.Name;
                    var t = dataContext.get('ObjectTypeTrademark', m.TrademarkId);
                    $scope.filters.objectTypeTrademarkId = t.Id;
                    $scope.filters.objectTypeTrademarkName = t.Name;
                    $scope.searcher.close();
                });
        };
        $scope.resetObjectType = function () {
            $scope.filters.objectTypeId = null;
            $scope.filters.objectTypeDescription = null;
        };
        
    });
    
})();