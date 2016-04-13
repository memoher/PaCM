//Este servicio detecta los cambios de conexión en la red, con el objetivo de
//sincronizar de manera silenciosa los registros de la base de datos

(function () {

	PaCM.services.factory('dbSynchronizer', function (dbContext, $http) {

		var debugMode = 1;

        var addressServer = 'http://localhost:8100/api/' //'http://192.168.1.37:60080/'; //;

        var tablesForImport = [
            'AppSettings', 'AppFiles', 'AppKeys', 
            'CfgCountries', 'CfgStates', 'CfgCities', 'CfgColors', 'CfgIdentityTypes', 
            'CfgCompany', 'CfgCustomers', 'CfgCustomerBranches', 'AppUsers',
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntConnectorTypes', 'MntConnectors', 'MntBatteryTypes',
            'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntArticles', 'MntDiagnosticTypes', 'MntDiagnostics', 'MntCheckList', 'MntAssemblyStatus', 'MntMaintenanceStatus', 
            'MntAssemblies', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
        ];
        var tablesForExport = [
            'AppFiles',
            'CfgCountries', 'CfgStates', 'CfgCities',
            'CfgCustomers', 'CfgCustomerBranches', 
            'MntMachineTrademarks', 'MntMachineModels', 'MntMachines',
            'MntObjectTrademarks', 'MntObjectModels', 'MntObjects', 'MntBatteries', 'MntChargers', 'MntCells',
            'MntAssemblies', 'MntMaintenances', 'MntMaintenanceCheckList', 'MntCellsReviews', 'MntArticlesOutputs'
        ];
        var tablesInheritedOfMntObjects = [
            'MntBatteries', 'MntChargers'
        ];

        var importData = function (onSuccess, onError, debugMode) {
            var localData = [];
            var hasNewData = false;
            
            //Obtiene todos los registros con fecha mas reciente en el servidor, 
            //o que aún no existen localmente

            var fnc01 = function (tx) {
                fnc01 = null;

                var sqlCommands = [];
                PaCM.eachArray(tablesForImport, function (inx, t) {
                    var command = null;
                    if (tablesInheritedOfMntObjects.indexOf(t) >= 0) {
                        command = 'SELECT "' + t + '" Tb, t.Id, p.LastModified FROM ' + t + ' t INNER JOIN MntObjects p ON p.Id = t.Id';
                    } else {
                        command = 'SELECT "' + t + '" Tb, t.Id, t.LastModified FROM ' + t + ' t';
                    }
                    sqlCommands.push(command);
                });
                tx.executeBacthSql(sqlCommands, function (tx1, sqlResultSet1) {
                    PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                        localData.push({
                            Tb: r.Tb,
                            Id: r.Id,
                            Lm: r.LastModified
                        });
                    });
                });
            };
            var fnc02 = function () {
                fnc02 = null;

                if (tablesForImport.length > 0) {
                    $http.post(addressServer + 'SyncronizeData/GetData', {
                        tables: tablesForImport,
                        records: localData
                    }).then(function (response) {
                        localData.length = 0; localData = null;
                        fnc03(response.data);
                    }, onError)
                    .catch(onError);
                } else {
                    success(false);
                }
            };
            var fnc03 = function (data) {
                fnc03 = null;

                dbContext.beginTransaction(function (tx) {
                    PaCM.eachArray(data.Records, function (inx, r) {
                        switch (r.Ac) {
                            case 'c':
                                PaCM.eachProperties(r.Dt, function (key, val) {
                                    var date = PaCM.parseDateString(val);
                                    if (date) {
                                        r.Dt[key] = date;
                                    };
                                });
                                if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                                    r.Dt.ReplicationStatus = 1;
                                }
                                tx.insert(r.Tb, r.Dt);
                                hasNewData = true;
                                break;
                            case 'u':
                                PaCM.eachProperties(r.Dt, function (key, val) {
                                    var date = PaCM.parseDateString(val);
                                    if (date) {
                                        r.Dt[key] = date;
                                    };
                                });
                                if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                                    r.Dt.ReplicationStatus = 1;
                                }
                                tx.update(r.Tb, r.Dt, 'Id="' + r.Id + '"');
                                hasNewData = true;
                                break;
                            case 'd':
                                tx.delete(r.Tb, 'Id="' + r.Id + '"');
                                hasNewData = true;
                                break;
                            default:
                                throw 'Action not support';
                        }
                    });
                    data.Records.length = 0; data.Records = null;
                }, fnc04, onError, debugMode);
            };
            var fnc04 = function () {
                fnc04 = null;

                if (PaCM.isFunction(onSuccess))
                    onSuccess(hasNewData === true);
            };
            
            dbContext.beginTransaction(fnc01, fnc02, onError, debugMode);
        };

        var exportData = function (onSuccess, onError, debugMode) {
            var localData = [];
            
            //Obtiene todos los registros donde ReplicationStatus sea igual a 0 para 
            //enviar la nueva información al servidor
            
            var fnc01 = function (tx) {
                fnc01 = null;

                var sqlCommands = [];
                PaCM.eachArray(tablesForExport, function (inx, t) {
                    var command = null;
                    if (tablesInheritedOfMntObjects.indexOf(t) >= 0) {
                        command = 'SELECT "' + t + '" Tb, t.*, p.ReplicationStatus FROM ' + t + ' t INNER JOIN MntObjects p ON p.Id = t.Id WHERE p.ReplicationStatus = 0';
                    } else {
                        command = 'SELECT "' + t + '" Tb, t.* FROM ' + t + ' t WHERE t.ReplicationStatus = 0';
                    }
                    sqlCommands.push(command);
                });
                tx.executeBacthSql(sqlCommands, function (tx1, sqlResultSet1) {
                    PaCM.eachSqlRS(sqlResultSet1, function (inx, r) {
                        var dt = { Tb: r.Tb, FS: {}, FI: {}, FN: {}, FD: {}, FB: {}, FO: {} };
                        delete r.Tb;
                        delete r.ReplicationStatus;
                        PaCM.eachProperties(r, function (key, val) {
                            if (PaCM.isString(val)) {
                                dt.FS[key] = val;
                            } else if (PaCM.isBoolean(val)) {
                                dt.FB[key] = val;
                            } else if (PaCM.isNumber(val)) {
                                if (PaCM.isInteger(val)) {
                                    dt.FI[key] = val;
                                } else {
                                    dt.FN[key] = val;
                                }
                            } else if (PaCM.isDate(val)) {
                                dt.FD[key] = val;
                            } else {
                                dt.FO[key] = val;
                            }
                        });
                        localData.push(dt);
                    });
                });
            };
            var fnc02 = function () {
                fnc02 = null;

                if (localData.length > 0) {
                    $http.post(addressServer + 'SyncronizeData/SetData', {
                        records: localData
                    }).then(function (response) {
                        fnc03(response.data);
                    }, onError)
                    .catch(onError);;
                } else {
                    onSuccess(false);
                }
            };
            var fnc03 = function (data) {
                fnc03 = null;

                dbContext.beginTransaction(function (tx) {
                    PaCM.eachArray(localData, function (inx, r) {
                        if (tablesInheritedOfMntObjects.indexOf(r.Tb) < 0) {
                            tx.update(r.Tb, { ReplicationStatus: 1 }, 'Id="' + r.FS.Id + '"');
                        }
                    });
                    localData.length = 0; localData = null;
                },
                function () {
                    onSuccess(true);
                }, onError, debugMode);
            };
            
            dbContext.beginTransaction(fnc01, fnc02, onError, debugMode);
        };


		var synchronizerInterval = 1000 * 60 * 5; /* 5 minutos */
		var synchronizerTask = null;
		var synchronizerFnc = function (onSucess, onError) {

			if (synchronizerTask != null) {
				clearInterval(synchronizerTask);
				synchronizerTask = setInterval(synchronizerFnc, synchronizerInterval);
			}

			if (!PaCM.isNetworkOnline()) {
				onRuningFnc(2, 'Sin conexión con el servidor');
				if (PaCM.isFunction(onSucess))
            		onSucess();
				return;
			}

			onRuningFnc(3, 'Inicia proceso de sincronización con el servidor');
			onRuningFnc(3, 'Subiendo datos nuevos al servidor');
			exportData(
                function (uploadedData) {
                	if (uploadedData === true)
                		onRuningFnc(3, 'Datos subidos correctamente');
                	else
                		onRuningFnc(3, 'No hay datos nuevos por subir');

					onRuningFnc(3, 'Descargando datos nuevos del servidor');
                    importData(
		                function (downloadedData) {
		                	if (downloadedData === true)
		                		onRuningFnc(3, 'Datos descargados correctamente');
		                	else
		                		onRuningFnc(3, 'No hay datos nuevos por descargar');

		                	if (PaCM.isFunction(onSucess))
		                		onSucess();
		                },
		                function (err) {
		                	onRuningFnc(1, PaCM.prepareErrorMessage(err, 'Errores durante el proceso: '));

		                	if (PaCM.isFunction(onError))
		                		onError();
		                },
		                debugMode);
                },
                function (err) {
                	onRuningFnc(1, PaCM.prepareErrorMessage(err, 'Errores durante el proceso: '));

					onRuningFnc(3, 'Descargando datos nuevos del servidor');
                    importData(
		                function (downloadedData) {
		                	if (downloadedData === true)
		                		onRuningFnc(3, 'Datos descargados correctamente');
		                	else
		                		onRuningFnc(3, 'No hay datos nuevos por descargar');

		                	if (PaCM.isFunction(onError))
		                		onError();
		                },
		                function (err) {
		                	onRuningFnc(1, PaCM.prepareErrorMessage(err, 'Errores durante el proceso: '));

		                	if (PaCM.isFunction(onError))
		                		onError();
		                },
		                debugMode);
                },
                debugMode);
		};
		
		var onLineFnc = function () {

			if (synchronizerTask == null) {
				synchronizerTask = setInterval(synchronizerFnc, 100 /* De inmediato */);
			}
			
			onRuningFnc(3, 'En linea');
		};

		var offLineFnc = function () {
			
			if (synchronizerTask != null) {
				clearInterval(synchronizerTask);
				synchronizerTask = null;
			}

			onRuningFnc(2, 'Fuera de linea');
		};

		var eventsOnRuning = [];
		var onRuningFnc = function (level, msg) {
			switch (level) {
				case 1:
					if (debugMode >= 1) {
						console.error(msg);
                    }
					break;
				case 2:
					if (debugMode >= 2)
						console.warn(msg);
					break;
				case 3:
					if (debugMode >= 3)
						console.info(msg);
					break;
			}
			PaCM.eachArray(eventsOnRuning, function (inx, fnc) {
				fnc(level, msg);
			});
		}

		return {
			start: function () {
				onLineFnc();
				document.addEventListener("online", onLineFnc, false);
				document.addEventListener("offline", offLineFnc, false);
			},
			run: function (onSucess, onError) {
				synchronizerFnc(onSucess, onError);
			},
			stop: function () {
				document.removeEventListener("online", onLineFnc, false);
				document.removeEventListener("offline", offLineFnc, false);
				offLineFnc();
			},
            addEventOnRuning: function (fnc) {
                if (PaCM.isFunction(fnc))
                    eventsOnRuning.push(fnc);
            },
            removeEventOnRuning: function (fnc) {
            	var i = eventsOnRuning.indexOf(fnc);
            	if (i >= 0)
            		eventsOnRuning.splice(i, 1);
            }
		};
        
	});

})();