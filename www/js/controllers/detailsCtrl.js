(function () {
    
    PaCM.controllersModule.controller('detailsCtrl', function ($scope, $stateParams, $ionicTabsDelegate, dataContext) {

        $scope.maintenance = {
            id: ($stateParams.maintenanceId) ? parseInt($stateParams.maintenanceId) : null,
            uniqueCode: null,
            date: null,
            preventive: null,
            corrective: null,
            customerId: ($stateParams.customerId) ? parseInt($stateParams.customerId) : null,
            batteryId: $stateParams.elmType === 'battery' ? parseInt($stateParams.elmId) : null,
            chargerId: $stateParams.elmType === 'charger' ? parseInt($stateParams.elmId) : null,
            machineId: null,
            workToBeDone: null,
            checkList: null,
            reviewOfCells: null,
            articleOutput: null,
            technicalReport: null,
            statusId: null,
            executedById: null,
            acceptedBy: null
        };
        $scope.maintenanceResources = {
            customers: dataContext.list('Customer')
        };
        var getMaintenance = function (id) {
            var r = dataContext.get('Maintenance', id);
            if (r) {
                $scope.maintenance.id = r.Id;
                $scope.maintenance.uniqueCode = r.UniqueCode;
                $scope.maintenance.date = r.Date;
                $scope.maintenance.preventive = r.Preventive;
                $scope.maintenance.corrective = r.Corrective;
                $scope.maintenance.customerId = r.CustomerId;
                $scope.maintenance.batteryId = (r.Type.indexOf('Battery') >= 0 ? r.ObjectTypeId :null );
                $scope.maintenance.chargerId = (r.Type.indexOf('Charger') >= 0 ? r.ObjectTypeId :null );
                $scope.maintenance.machineId = r.MachineId;
                $scope.maintenance.workToBeDone = r.WorkToBeDone;
                $scope.maintenance.checkList = [];
                $scope.maintenance.reviewOfCells = [];
                $scope.maintenance.articleOutput = [];
                $scope.maintenance.technicalReport = r.TechnicalReport;
                $scope.maintenance.statusId = r.StatusId;
                $scope.maintenance.executedById = r.ExecutedById;
                $scope.maintenance.acceptedBy = r.AcceptedBy;

                if ($scope.maintenance.batteryId) {
                    getBattery($scope.maintenance.batteryId);
                }
                if ($scope.maintenance.chargerId) {
                    getCharger($scope.maintenance.chargerId);
                }
                if ($scope.maintenance.machineId) {
                    getMachine($scope.maintenance.machineId);
                }
            }
        };
        
        $scope.battery = {
            id: null,
            trademarkId: null,
            modelId: null,
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
        $scope.batteryResources = {
            trademarks: dataContext.list('ObjectTypeTrademark'),
            models: dataContext.list('ObjectTypeModel'),
            connectorTypes: dataContext.list('ConnectorType'),
            connectors: dataContext.list('Connector'),
            connectorColors: dataContext.list('Color')
        };
        var getBattery = function (id) {
            var r = dataContext.get('Battery', id);
            if (r) {
                $scope.battery.id = r.Id;
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
            }
        };
        
        $scope.charger = {
            id: null,
            trademarkId: null,
            modelId: null,
            serial: null,
            customerId: null,
            customerReference: null,
            voltage: null,
            amperage: null
        };
        $scope.chargerResources = {
            trademarks: dataContext.list('ObjectTypeTrademark'),
            models: dataContext.list('ObjectTypeModel')
        };
        var getCharger = function (id) {
            var r = dataContext.get('Charger', id);
            if (r) {
                $scope.charger.id = r.Id;
                $scope.charger.trademarkId = r.TrademarkId;
                $scope.charger.modelId = r.ModelId;
                $scope.charger.serial = r.Serial;
                $scope.charger.customerId = r.CustomerId;
                $scope.charger.customerReference = r.CustomerReference;
                $scope.charger.voltage = r.Voltage;
                $scope.charger.amperage = r.Amperage;
            }
        };
        
        $scope.machine = {
            id: null,
            trademarkId: null,
            modelId: null,
            serial: null,
            customerId: null,
            customerReference: null,
            compartmentLength: null,
            compartmentWidth: null,
            compartmentHeight: null
        };
        $scope.machineResources = {
            trademarks: dataContext.list('MachineTrademark'),
            models: dataContext.list('MachineModel')
        };
        var getMachine = function (id) {
            var r = dataContext.get('Machine', id);
            if (r) {
                $scope.machine.id = r.Id;
                $scope.machine.trademarkId = r.TrademarkId;
                $scope.machine.modelId = r.ModelId;
                $scope.machine.serial = r.Serial;
                $scope.machine.customerId = r.CustomerId;
                $scope.machine.customerReference = r.CustomerReference;
                $scope.machine.compartmentLength = r.CompartmentLength;
                $scope.machine.compartmentWidth = r.CompartmentWidth;
                $scope.machine.compartmentHeight = r.CompartmentHeight;
            }
        };
        
        $scope.searcher = {
            search: '',
            customers: dataContext.list('Customer'),
            batteries: dataContext.list('Battery'),
            chargers: dataContext.list('Charger'),
            hideList: true
        };
        $scope.searcherOnChange = function () {
            if (PaCM.isNullOrEmptyString($scope.searcher.search)) {
                if ($scope.searcher.hideList != true)
                    $scope.searcher.hideList = true;
            } else {
                if ($scope.searcher.hideList != false)
                    $scope.searcher.hideList = false;
            }
        };
        $scope.onSelectCustomer = function (customerId) {
            $scope.maintenance.customerId = customerId;
            $scope.maintenance.batteryId = null;
            $scope.maintenance.chargerId = null;
            loadData();
        };
        $scope.onSelectBattery = function (customerId, batteryId) {
            $scope.maintenance.customerId = customerId;
            $scope.maintenance.batteryId = batteryId;
            $scope.maintenance.chargerId = null;
            loadData();
            $ionicTabsDelegate.select($scope.tabs.items.indexOf('BatteryTab'));
        };
        $scope.onSelectCharger = function (customerId, chargerId) {
            $scope.maintenance.customerId = customerId;
            $scope.maintenance.batteryId = null;
            $scope.maintenance.chargerId = chargerId;
            loadData();
            $ionicTabsDelegate.select($scope.tabs.items.indexOf('ChargerTab'));
        };

        $scope.tabs = {
            items: ['SearcherTab', 'BatteryTab', 'ChargerTab', 'MachineTab', 'WorkToBeDoneTab', 'PhysicalInspectionTab', 'CellInspectionTab', 'SuppliesTab', 'TechnicalReportTab'],
            hideSearcherTab: true,
            hideBatteryTab: true,
            hideChargerTab: true,
            hideMachineTab: true,
            hideWorkToBeDoneTab: true,
            hidePhysicalInspectionTab: true,
            hideCellInspectionTab: true,
            hideSuppliesTab: true,
            hideTechnicalReportTab: true 
        };
        var tabsRefresh = function () {
            if ($scope.maintenance.id) {
                if ($scope.tabs.hideSearcherTab != true)
                    $scope.tabs.hideSearcherTab = true;
            } else {
                if ($scope.tabs.hideSearcherTab != false)
                    $scope.tabs.hideSearcherTab = false;
            }
            if (!($scope.maintenance.batteryId)) {
                if ($scope.tabs.hideBatteryTab != true)
                    $scope.tabs.hideBatteryTab = true;
                if ($scope.tabs.hideCellInspectionTab != true)
                    $scope.tabs.hideCellInspectionTab = true;
            } else {
                if ($scope.tabs.hideBatteryTab != false)
                    $scope.tabs.hideBatteryTab = false;
                if ($scope.tabs.hideCellInspectionTab != false)
                    $scope.tabs.hideCellInspectionTab = false;
            }
            if (!($scope.maintenance.chargerId)) {
                if ($scope.tabs.hideChargerTab != true)
                    $scope.tabs.hideChargerTab = true;
            } else {
                if ($scope.tabs.hideChargerTab != false)
                    $scope.tabs.hideChargerTab = false;
            }
            if ($scope.maintenance.corrective != true) {
                if ($scope.tabs.hideSuppliesTab != true)
                    $scope.tabs.hideSuppliesTab = true;
            } else {
                if ($scope.tabs.hideSuppliesTab != false)
                    $scope.tabs.hideSuppliesTab = false;
            }
            if ($scope.tabs.hideBatteryTab == true && $scope.tabs.hideChargerTab == true) {
                $scope.tabs.hideMachineTab = true;
                $scope.tabs.hideWorkToBeDoneTab = true;
                $scope.tabs.hidePhysicalInspectionTab = true;
                $scope.tabs.hideTechnicalReportTab = true;
            } else {
                $scope.tabs.hideMachineTab = false;
                $scope.tabs.hideWorkToBeDoneTab = false;
                $scope.tabs.hidePhysicalInspectionTab = false;
                $scope.tabs.hideTechnicalReportTab = false;
            }
        };
        
        var loadData = function () {
            if ($scope.maintenance.id) {
                getMaintenance($scope.maintenance.id);
            }
            else {
                if ($scope.maintenance.batteryId) {
                    getBattery($scope.maintenance.batteryId);
                }
                if ($scope.maintenance.chargerId) {
                    getCharger($scope.maintenance.chargerId);
                }
                if ($scope.maintenance.machineId) {
                    getMachine($scope.maintenance.machineId);
                }
            }
            tabsRefresh();
        };
        loadData();
        
    });
    
})();
