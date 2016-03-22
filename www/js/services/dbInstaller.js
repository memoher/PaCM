//Este servicio se encarga de hacer la instalación y configuración de la base de datos

(function () {

	PaCM.services.factory('dbInstaller', function (dbContext) {

        var debugMode = 1;

        var dbVersion = '2016.03.13.17.30';

		var installDatabase = function (onSuccess, onError, debugMode) {
                
            var fnc01 = function (tx) {
                fnc01 = null;
                tx.executeSql('SELECT name FROM sqlite_master WHERE type="table" and (name like "App%" or name like "Cfg%" or name like "Mnt%")', null, fnc02);
            };
            var fnc02 = function (tx, sqlResultSet) {
                fnc02 = null;

                var sqlCommands = [];
                PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                    sqlCommands.push('DROP TABLE ' + r.name);
                });
                if (sqlCommands.length > 0) {
                    tx.executeBacthSql(sqlCommands, null, fnc03);
                } else {
                    fnc03(tx);
                }
            };
            var fnc03 = function (tx) {
                fnc03 = null;

                var sqlCommands = [
				    'create table AppVersion ( DbVersion TEXT not null )',
				    'create table AppSettings ( Id TEXT not null, SMTPServerDomain TEXT, SMTPServerHost TEXT not null, SMTPServerPort INT not null, SMTPServerAccount TEXT not null, SMTPServerPassword TEXT not null, SMTPServerEnableSsl BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table AppFiles ( Id TEXT not null, LocalName TEXT not null, Name TEXT not null, Extension TEXT, Size INT, MIMEType TEXT, Encoding TEXT, Base64Str TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table AppKeys ( Id TEXT not null, Salt TEXT not null, Hash TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table CfgCountries ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table CfgStates ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CountryId TEXT not null, primary key (Id), constraint FK_State_CountryId foreign key (CountryId) references CfgCountries )',
				    'create table CfgCities ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, StateId TEXT not null, primary key (Id), constraint FK_City_StateId foreign key (StateId) references CfgStates )',
				    'create table CfgColors ( Id TEXT not null, Name TEXT not null, HEX TEXT, RGB TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table CfgIdentityTypes ( Id TEXT not null, Name TEXT not null, ShortName TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table CfgCompany ( Id TEXT not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, WebSite TEXT, Slogan TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, IdentityTypeId TEXT not null, CityId TEXT not null, LogoId TEXT, primary key (Id), constraint FK_Company_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Company_CityId foreign key (CityId) references CfgCities, constraint FK_Company_LogoId foreign key (LogoId) references AppFiles )',
				    'create table CfgCustomers ( Id TEXT not null, Identity TEXT not null, Name TEXT not null, ShortName TEXT, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, WebSite TEXT, ContactName TEXT, ContactEmailAddress TEXT, Comments TEXT, Enabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, IdentityTypeId TEXT not null, CityId TEXT not null, primary key (Id), constraint FK_Customer_IdentityTypeId foreign key (IdentityTypeId) references CfgIdentityTypes, constraint FK_Customer_CityId foreign key (CityId) references CfgCities )',
				    'create table CfgCustomerBranches ( Id TEXT not null, Name TEXT not null, Address TEXT not null, PostalCode TEXT, PhoneNumber TEXT not null, ContactName TEXT, ContactEmailAddress TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CustomerId TEXT not null, CityId TEXT not null, primary key (Id), constraint FK_BranchCustomer_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_BranchCustomer_CityId foreign key (CityId) references CfgCities )',
				    'create table AppUsers ( Id TEXT not null, Username TEXT not null, FirstName TEXT not null, LastName TEXT not null, EmailAddress TEXT not null, Administrator BOOL not null, Enabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, PasswordId TEXT not null, CustomerId TEXT, primary key (Id), constraint FK_User_PasswordId foreign key (PasswordId) references AppKeys, constraint FK_User_CustomerId foreign key (CustomerId) references CfgCustomers )',
				    'create table AppUserSessions ( Id TEXT not null, Session TEXT not null, Host TEXT not null, Agent TEXT not null, LocalAddress TEXT not null, UserAddress TEXT not null, Started DATETIME not null, Ended DATETIME, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, UserId TEXT not null, primary key (Id), constraint FK_UserSession_UserId foreign key (UserId) references AppUsers )',
				    'create table MntMachineTrademarks ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntMachineModels ( Id TEXT not null, Name TEXT not null, CompartmentLength NUMERIC, CompartmentWidth NUMERIC, CompartmentHeight NUMERIC, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TrademarkId TEXT not null, primary key (Id), constraint FK_MachineModel_TrademarkId foreign key (TrademarkId) references MntMachineTrademarks )',
				    'create table MntMachines ( Id TEXT not null, Serial TEXT, CustomerReference TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ModelId TEXT not null, CustomerId TEXT not null, primary key (Id), constraint FK_Machine_ModelId foreign key (ModelId) references MntMachineModels, constraint FK_Machine_CustomerId foreign key (CustomerId) references CfgCustomers )',
				    'create table MntConnectorTypes ( Id TEXT not null, Name TEXT not null, ColorRequired BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ImageId TEXT not null, primary key (Id), constraint FK_ConnectorType_ImageId foreign key (ImageId) references AppFiles )',
				    'create table MntConnectors ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TypeId TEXT not null, primary key (Id), constraint FK_Connector_TypeId foreign key (TypeId) references MntConnectorTypes )',
				    'create table MntBatteryTypes ( Id TEXT not null, Voltage INT not null, NumberOfCells INT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntObjectTrademarks ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntObjectModels ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TrademarkId TEXT not null, primary key (Id), constraint FK_ObjectTypeModel_TrademarkId foreign key (TrademarkId) references MntObjectTrademarks )',
				    'create table MntObjects ( Id TEXT not null, Serial TEXT, CustomerReference TEXT, Enabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ModelId TEXT not null, CustomerId TEXT not null, primary key (Id), constraint FK_ObjectType_ModelId foreign key (ModelId) references MntObjectModels, constraint FK_ObjectType_CustomerId foreign key (CustomerId) references CfgCustomers )',
				    'create table MntBatteries ( Id TEXT not null, Amperage TEXT not null, StandardBox BOOL not null, Cover BOOL not null, DrainHoles BOOL not null, MinimunWeight NUMERIC, MaximunWeight NUMERIC, Length NUMERIC, Width NUMERIC, BoxHeight NUMERIC, HandleHeight NUMERIC, TypeId TEXT not null, ConnectorId TEXT not null, ConnectorColorId TEXT, primary key (Id), constraint FKF520AC824409B984 foreign key (Id) references MntObjects, constraint FK_Battery_TypeId foreign key (TypeId) references MntBatteryTypes, constraint FK_Battery_ConnectorId foreign key (ConnectorId) references MntConnectors, constraint FK_Battery_ConnectorColorId foreign key (ConnectorColorId) references CfgColors )',
				    'create table MntChargers ( Id TEXT not null, Voltage TEXT not null, Amperage TEXT not null, primary key (Id), constraint FKB35EAA924409B984 foreign key (Id) references MntObjects )',
				    'create table MntCells ( Id TEXT not null, "Order" INT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, BatteryId TEXT not null, primary key (Id), constraint FK_Cell_BatteryId foreign key (BatteryId) references MntBatteries )',
				    'create table MntArticles ( Id TEXT not null, Name TEXT not null, InventoryCode TEXT, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, CorrectiveMaintenanceEnabled BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntDiagnosticTypes ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntDiagnostics ( Id TEXT not null, Name TEXT not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, TypeId TEXT not null, primary key (Id), constraint FK_Diagnostic_TypeId foreign key (TypeId) references MntDiagnosticTypes )',
				    'create table MntCheckList ( Id TEXT not null, Name TEXT not null, "Order" INT not null, EnabledBatteries BOOL not null, EnabledChargers BOOL not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, DiagnosticTypeId TEXT not null, primary key (Id), constraint FK_Check_DiagnosticTypeId foreign key (DiagnosticTypeId) references MntDiagnosticTypes )',
				    'create table MntAssemblyStatus ( Id TEXT not null, Description TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntAssemblies ( Id TEXT not null, Type TEXT not null, Date DATETIME not null, Comments TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CustomerId TEXT not null, BranchCustomerId TEXT, ObjectTypeId TEXT not null, ExecutedById TEXT not null, StatusId TEXT not null, primary key (Id), constraint FK_Assembly_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Assembly_BranchCustomerId foreign key (BranchCustomerId) references CfgCustomerBranches, constraint FK_Assembly_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Assembly_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Assembly_StatusId foreign key (StatusId) references MntAssemblyStatus )',
				    'create table MntMaintenanceStatus ( Id TEXT not null, Description TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, primary key (Id) )',
				    'create table MntMaintenances ( Id TEXT not null, Type TEXT not null, Date DATETIME not null, Preventive BOOL not null, Corrective BOOL not null, AcceptedBy TEXT not null, WorkToBeDone TEXT, TechnicalReport TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CustomerId TEXT not null, BranchCustomerId TEXT, MachineId TEXT, ObjectTypeId TEXT not null, ExecutedById TEXT not null, ExecutedByDigitalSignatureId TEXT, AcceptedByDigitalSignatureId TEXT, StatusId TEXT not null, primary key (Id), constraint FK_Maintenance_CustomerId foreign key (CustomerId) references CfgCustomers, constraint FK_Maintenance_BranchCustomerId foreign key (BranchCustomerId) references CfgCustomerBranches, constraint FK_Maintenance_MachineId foreign key (MachineId) references MntMachines, constraint FK_Maintenance_ObjectTypeId foreign key (ObjectTypeId) references MntObjects, constraint FK_Maintenance_ExecutedById foreign key (ExecutedById) references AppUsers, constraint FK_Maintenance_ExecutedByDigitalSignatureId foreign key (ExecutedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_AcceptedByDigitalSignatureId foreign key (AcceptedByDigitalSignatureId) references AppFiles, constraint FK_Maintenance_StatusId foreign key (StatusId) references MntMaintenanceStatus )',
				    'create table MntMaintenanceCheckList ( Id TEXT not null, Comments TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, MaintenanceId TEXT not null, CheckId TEXT not null, DiagnosticId TEXT not null, primary key (Id), constraint FK_MaintenanceCheck_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_MaintenanceCheck_CheckId foreign key (CheckId) references MntCheckList, constraint FK_MaintenanceCheck_DiagnosticId foreign key (DiagnosticId) references MntDiagnostics )',
				    'create table MntCellsReviews ( Id TEXT not null, Voltage NUMERIC not null, Density NUMERIC not null, Comments TEXT, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, CellId TEXT not null, MaintenanceId TEXT, AssemblyId TEXT, primary key (Id), constraint FK_CellReview_CellId foreign key (CellId) references MntCells, constraint FK_CellReview_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_CellReview_AssemblyId foreign key (AssemblyId) references MntAssemblies )',
				    'create table MntArticlesOutputs ( Id TEXT not null, Quantity NUMERIC not null, CreatedOn DATETIME not null, LastModified DATETIME not null, ReplicationStatus BOOL not null, ArticleId TEXT not null, MaintenanceId TEXT, AssemblyId TEXT, primary key (Id), constraint FK_ArticleOutput_ArticleId foreign key (ArticleId) references MntArticles, constraint FK_ArticleOutput_MaintenanceId foreign key (MaintenanceId) references MntMaintenances, constraint FK_ArticleOutput_AssemblyId foreign key (AssemblyId) references MntAssemblies )'
                ];
                tx.executeBacthSql(sqlCommands, null, fnc04);
            };
            var fnc04 = function (tx) {
                fnc04 = null;

                tx.insert('AppVersion', { DbVersion: dbVersion });
            };
            var fnc05 = function () {
                fnc05 = null;

                if (PaCM.isFunction(onSuccess))
                    onSuccess();
            };
            
            dbContext.beginTransaction(fnc01, fnc05, onError, debugMode);
        };

        return {
        	checkDatabase: function (onSuccess, onError) {
                
                var dbInstalled = false;
                var fnc01 = function (tx) {
                    fnc01 = null;

                    tx.executeSql('SELECT name FROM sqlite_master WHERE type="table" and name = "AppVersion" LIMIT 1', null, fnc02);
                }
                var fnc02 = function (tx, sqlResultSet) {
                    fnc02 = null;

                    dbInstalled = 
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        return true;
                    });
                    if (dbInstalled === true) {
                        tx.executeSql('SELECT DbVersion FROM AppVersion LIMIT 1', null, fnc03);
                    }
                }
                var fnc03 = function (tx, sqlResultSet) {
                    fnc03 = null;

                    dbInstalled = 
                    PaCM.eachSqlRS(sqlResultSet, function (inx, r) {
                        return r.DbVersion === dbVersion;
                    });
                }
                var fnc04 = function () {
                    fnc04 = null;

                    if (dbInstalled === true) {
                        if (PaCM.isFunction(onSuccess))
                            onSuccess();
                    } else {
                        installDatabase(onSuccess, onError, debugMode);
                    }
                }

                dbContext.beginTransaction(fnc01, fnc04, onError, debugMode);
            }
        };

	});

})();