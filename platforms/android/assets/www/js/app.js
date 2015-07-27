(function () {

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.home', {
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-home.html',
                        controller: 'homeCtrl'
                    }
                }
            })

            .state('tab.maintenance', {
                url: '/maintenance',
                views: {
                    'tab-maintenance': {
                        templateUrl: 'templates/tab-maintenance.html',
                        controller: 'maintenanceCtrl'
                    }
                }
            })

            .state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/home');

    })

    .run(function ($ionicPlatform, dbContext) {

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
        
window.debugMode = true;

        dbContext.beginTransaction(function (tx) {
            
            tx
            
    .executeSql('drop table if exists MntArticles')

    .executeSql('drop table if exists MntArticlesOutputs')

    .executeSql('drop table if exists MntAssemblies')

    .executeSql('drop table if exists MntAssemblyStatus')

    .executeSql('drop table if exists MntBatteryTypes')

    .executeSql('drop table if exists MntCells')

    .executeSql('drop table if exists MntCellsReviews')

    .executeSql('drop table if exists MntCheckList')

    .executeSql('drop table if exists CfgCities')

    .executeSql('drop table if exists CfgColors')

    .executeSql('drop table if exists CfgCompany')

    .executeSql('drop table if exists MntConnectors')

    .executeSql('drop table if exists MntConnectorTypes')

    .executeSql('drop table if exists CfgCountries')

    .executeSql('drop table if exists CfgCustomers')

    .executeSql('drop table if exists MntDiagnostics')

    .executeSql('drop table if exists MntDiagnosticTypes')

    .executeSql('drop table if exists SysFiles')

    .executeSql('drop table if exists CfgIdentityTypes')

    .executeSql('drop table if exists SysKeys')

    .executeSql('drop table if exists MntMachines')

    .executeSql('drop table if exists MntMachineModels')

    .executeSql('drop table if exists MntMaintenanceCheckList')

    .executeSql('drop table if exists MntMaintenances')

    .executeSql('drop table if exists MntMaintenanceStatus')

    .executeSql('drop table if exists MntObjects')

    .executeSql('drop table if exists MntBatteries')

    .executeSql('drop table if exists MntChargers')

    .executeSql('drop table if exists MntObjectTypeModels')

    .executeSql('drop table if exists SysSettings')

    .executeSql('drop table if exists CfgStates')

    .executeSql('drop table if exists CfgTrademarks')

    .executeSql('drop table if exists SysUsers')

    .executeSql('drop table if exists SysUserSessions')

    .executeSql('create table MntArticles (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       InventoryCode TEXT,       EnabledBatteries BOOL not null,       EnabledChargers BOOL not null,       CorrectiveMaintenanceEnabled BOOL not null    )')

    .executeSql('create table MntArticlesOutputs (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Quantity NUMERIC not null,       ArticleId BIGINT not null,       MaintenanceId BIGINT,       AssemblyId BIGINT,       constraint FK_ArticleOutput_ArticleId foreign key (ArticleId) references MntArticles,       constraint FK_ArticleOutput_MaintenanceId foreign key (MaintenanceId) references MntMaintenances,       constraint FK_ArticleOutput_AssemblyId foreign key (AssemblyId) references MntAssemblies    )')

    .executeSql('create table MntAssemblies (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Type TEXT not null,       UniqueCode TEXT not null,       Date DATETIME not null,       Comments TEXT,       CustomerId BIGINT not null,       ObjectTypeId BIGINT not null,       ExecutedById BIGINT not null,       StatusId BIGINT not null,       constraint FK_Assembly_CustomerId foreign key (CustomerId) references CfgCustomers,       constraint FK_Assembly_ObjectTypeId foreign key (ObjectTypeId) references MntObjects,       constraint FK_Assembly_ExecutedById foreign key (ExecutedById) references SysUsers,       constraint FK_Assembly_StatusId foreign key (StatusId) references MntAssemblyStatus    )')

    .executeSql('create table MntAssemblyStatus (        Id BIGINT not null,       Description TEXT,       primary key (Id)    )')

    .executeSql('create table MntBatteryTypes (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Voltage INT not null,       NumberOfCells INT not null    )')

    .executeSql('create table MntCells (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       "Order" INT not null,       BatteryId BIGINT not null,       constraint FK_Cell_BatteryId foreign key (BatteryId) references MntBatteries    )')

    .executeSql('create table MntCellsReviews (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Voltage NUMERIC not null,       Density NUMERIC not null,       Comments TEXT,       CellId BIGINT not null,       MaintenanceId BIGINT,       AssemblyId BIGINT,       constraint FK_CellReview_CellId foreign key (CellId) references MntCells,       constraint FK_CellReview_MaintenanceId foreign key (MaintenanceId) references MntMaintenances,       constraint FK_CellReview_AssemblyId foreign key (AssemblyId) references MntAssemblies    )')

    .executeSql('create table MntCheckList (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       "Order" INT not null,       EnabledBatteries BOOL not null,       EnabledChargers BOOL not null,       DiagnosticTypeId BIGINT not null,       constraint FK_Check_DiagnosticTypeId foreign key (DiagnosticTypeId) references MntDiagnosticTypes    )')

    .executeSql('create table CfgCities (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       StateId BIGINT not null,       constraint FK_City_StateId foreign key (StateId) references CfgStates    )')

    .executeSql('create table CfgColors (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       HEX TEXT,       RGB TEXT    )')

    .executeSql('create table CfgCompany (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Identity TEXT not null,       Name TEXT not null,       ShortName TEXT,       Address TEXT not null,       PostalCode TEXT,       PhoneNumber TEXT not null,       WebSite TEXT,       Slogan TEXT,       IdentityTypeId BIGINT not null,       CityId BIGINT not null,       LogoId BIGINT,       constraint FK_Company_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes,       constraint FK_Company_CityId foreign key (CityId) references CfgCities,       constraint FK_Company_LogoId foreign key (LogoId) references SysFiles    )')

    .executeSql('create table MntConnectors (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       TypeId BIGINT not null,       constraint FK_Connector_TypeId foreign key (TypeId) references MntConnectorTypes    )')

    .executeSql('create table MntConnectorTypes (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       ColorRequired BOOL not null,       ImageId BIGINT not null,       constraint FK_ConnectorType_ImageId foreign key (ImageId) references SysFiles    )')

    .executeSql('create table CfgCountries (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null    )')

    .executeSql('create table CfgCustomers (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Identity TEXT not null,       Name TEXT not null,       ShortName TEXT,       Address TEXT,       PostalCode TEXT,       PhoneNumber TEXT,       WebSite TEXT,       ContactName TEXT,       ContactEmailAddress TEXT,       Comments TEXT,       Enabled BOOL not null,       IdentityTypeId BIGINT not null,       CityId BIGINT not null,       constraint FK_Customer_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes,       constraint FK_Customer_CityId foreign key (CityId) references CfgCities    )')

    .executeSql('create table MntDiagnostics (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       TypeId BIGINT not null,       constraint FK_Diagnostic_TypeId foreign key (TypeId) references MntDiagnosticTypes    )')

    .executeSql('create table MntDiagnosticTypes (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null    )')

    .executeSql('create table SysFiles (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       LocalName TEXT not null,       Name TEXT not null,       Extension TEXT,       Size INT not null,       MIMEType TEXT,       Encoding TEXT not null    )')

    .executeSql('create table CfgIdentityTypes (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       ShortName TEXT not null    )')

    .executeSql('create table SysKeys (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Salt TEXT not null,       Hash TEXT not null    )')

    .executeSql('create table MntMachines (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Serial TEXT,       CustomerReference TEXT,       Location TEXT,       LicensePlate TEXT,       ModelId BIGINT not null,       CustomerId BIGINT not null,       constraint FK_Machine_ModelId foreign key (ModelId) references MntMachineModels,       constraint FK_Machine_CustomerId foreign key (CustomerId) references CfgCustomers    )')

    .executeSql('create table MntMachineModels (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       CompartmentLength NUMERIC,       CompartmentWidth NUMERIC,       CompartmentHeight NUMERIC,       TrademarkId BIGINT not null,       constraint FK_MachineModel_TrademarkId foreign key (TrademarkId) references CfgTrademarks    )')

    .executeSql('create table MntMaintenanceCheckList (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Comments TEXT,       MaintenanceId BIGINT not null,       CheckId BIGINT not null,       DiagnosticId BIGINT not null,       constraint FK_MaintenanceCheck_MaintenanceId foreign key (MaintenanceId) references MntMaintenances,       constraint FK_MaintenanceCheck_CheckId foreign key (CheckId) references MntCheckList,       constraint FK_MaintenanceCheck_DiagnosticId foreign key (DiagnosticId) references MntDiagnostics    )')

    .executeSql('create table MntMaintenances (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Type TEXT not null,       UniqueCode TEXT not null,       Date DATETIME not null,       Preventive BOOL not null,       Corrective BOOL not null,       AcceptedBy TEXT not null,       WorkToBeDone TEXT,       TechnicalReport TEXT,       CustomerId BIGINT not null,       MachineId BIGINT,       ObjectTypeId BIGINT not null,       ExecutedById BIGINT not null,       ExecutedByDigitalSignatureId BIGINT,       AcceptedByDigitalSignatureId BIGINT,       StatusId BIGINT not null,       constraint FK_Maintenance_CustomerId foreign key (CustomerId) references CfgCustomers,       constraint FK_Maintenance_MachineId foreign key (MachineId) references MntMachines,       constraint FK_Maintenance_ObjectTypeId foreign key (ObjectTypeId) references MntObjects,       constraint FK_Maintenance_ExecutedById foreign key (ExecutedById) references SysUsers,       constraint FK_Maintenance_ExecutedByDigitalSignatureId foreign key (ExecutedByDigitalSignatureId) references SysFiles,       constraint FK_Maintenance_AcceptedByDigitalSignatureId foreign key (AcceptedByDigitalSignatureId) references SysFiles,       constraint FK_Maintenance_StatusId foreign key (StatusId) references MntMaintenanceStatus    )')

    .executeSql('create table MntMaintenanceStatus (        Id BIGINT not null,       Description TEXT,       primary key (Id)    )')

    .executeSql('create table MntObjects (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Serial TEXT,       CustomerReference TEXT,       Enabled BOOL not null,       ModelId BIGINT not null,       CustomerId BIGINT not null,       constraint FK_ObjectType_ModelId foreign key (ModelId) references MntObjectTypeModels,       constraint FK_ObjectType_CustomerId foreign key (CustomerId) references CfgCustomers    )')

    .executeSql('create table MntBatteries (        ObjectType_id BIGINT not null,       Amperage TEXT not null,       StandardBox BOOL not null,       Cover BOOL not null,       DrainHoles BOOL not null,       MinimunWeight NUMERIC,       MaximunWeight NUMERIC,       Length NUMERIC,       Width NUMERIC,       BoxHeight NUMERIC,       HandleHeight NUMERIC,       TypeId BIGINT not null,       ConnectorId BIGINT not null,       ConnectorColorId BIGINT,       primary key (ObjectType_id),       constraint FKF520AC82D3509F01 foreign key (ObjectType_id) references MntObjects,       constraint FK_Battery_TypeId foreign key (TypeId) references MntBatteryTypes,       constraint FK_Battery_ConnectorId foreign key (ConnectorId) references MntConnectors,       constraint FK_Battery_ConnectorColorId foreign key (ConnectorColorId) references CfgColors    )')

    .executeSql('create table MntChargers (        ObjectType_id BIGINT not null,       Voltage TEXT not null,       Amperage TEXT not null,       primary key (ObjectType_id),       constraint FKB35EAA92D3509F01 foreign key (ObjectType_id) references MntObjects    )')

    .executeSql('create table MntObjectTypeModels (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       TrademarkId BIGINT not null,       constraint FK_ObjectTypeModel_TrademarkId foreign key (TrademarkId) references CfgTrademarks    )')

    .executeSql('create table SysSettings (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       SMTPServerDomain TEXT,       SMTPServerHost TEXT not null,       SMTPServerPort INT not null,       SMTPServerAccount TEXT not null,       SMTPServerPassword TEXT not null,       SMTPServerEnableSsl BOOL not null    )')

    .executeSql('create table CfgStates (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null,       CountryId BIGINT not null,       constraint FK_State_CountryId foreign key (CountryId) references CfgCountries    )')

    .executeSql('create table CfgTrademarks (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Name TEXT not null    )')

    .executeSql('create table SysUsers (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Username TEXT not null,       FirstName TEXT not null,       LastName TEXT not null,       EmailAddress TEXT not null,       Administrator BOOL not null,       Enabled BOOL not null,       PasswordId BIGINT not null,       constraint FK_User_PasswordId foreign key (PasswordId) references SysKeys    )')

    .executeSql('create table SysUserSessions (        LocalId  integer primary key autoincrement, Id integer null,       Guid TEXT not null,       Session TEXT not null,       Host TEXT not null,       Agent TEXT not null,       LocalAddress TEXT not null,       UserAddress TEXT not null,       Started DATETIME not null,       Ended DATETIME,       UserId BIGINT not null,       constraint FK_UserSession_UserId foreign key (UserId) references SysUsers    )')

;
    
        });
        
        dbContext.beginTransaction(function (tx) {
            tx
            .insert('CfgCountries', { name: 'Colombia', guid: '123' })
            .insert('CfgCountries', { name: 'Perú', guid: '456' })
            .insert('CfgCountries', { name: 'Argentina', guid: '456' })
            .insert('CfgCountries', { name: 'Venezuela', guid: '456' })
            .insert('CfgCountries', { name: 'Panamá', guid: '456' });
        });

//        dbContext.beginTransaction(function (tx) {
//            console.debug(new Date(), 1);
//            tx
//            .dropTable('LOGS')
//            .createTable('LOGS', [{
//                name: 'id',
//                type: 'integer',
//                primaryKey: true,
//                autoIncrement: true,
//                required: true
//            }, {
//                name: 'log',
//                required: true
//            }])
//            .executeSql('INSERT INTO LOGS (id, log) VALUES (1, "foobar")')
//            .executeSql('INSERT INTO LOGS (id, log) VALUES (2, "foobar")')
//            .executeSql('INSERT INTO LOGS (id, log) VALUES (3, "foobar")')
//            .executeSql('SELECT * FROM LOGS')
//            .select('LOGS')
//            .insert('LOGS', {id: 4, log:'123'})
//            .update('LOGS', {log:'123'}, { where: { conditions: 'id=?', parameters: [3] }})
//            .select('LOGS', { where: { conditions: 'log=?', parameters: ["foobar"] }})
//            .delete('LOGS', { where: { conditions: 'id=?', parameters: [1] }})
//            .select('LOGS');
//            console.debug(new Date(), 2);
//        });
        

    });

})();