//Este servicio detecta los cambios de conección en la red, con el objetivo de
//sincronizar de manera silenciosa los registros de la base de datos

(function () {

	PaCM.servicesModule.factory('synchronizer', function (dbContext) {

		var debugMode = 3;

		var _synchronizerInterval = null;
		var onLineFnc = function () {
			if (_synchronizerInterval != null) {
				clearInterval(_synchronizerInterval);
				_synchronizerInterval = null;
			}
			_synchronizerInterval = setInterval(synchronizeFnc, 1000 /*seg*/ * 60 /*min*/ * 5);
			synchronizeFnc();
		};

		var offLineFnc = function () {
			if (_synchronizerInterval != null) {
				clearInterval(_synchronizerInterval);
				_synchronizerInterval = null;
			}
		};

		var eventsOnRuning = [];
		var onRuningFnc = function (level, msg) {
			switch (level) {
				case 1:
					if (debugMode >= 1)
						console.error(msg);
				break;
				case 2:
					if (debugMode >= 2)
						console.warn(msg);
				break;
				case 3:
					if (debugMode >= 3)
						console.info(msg);
				break;
				default:
				break;
			}
			PaCM.eachArray(eventsOnRuning, function (inx, fnc) {
				fnc(level, msg);
			});
		}

		var synchronizeFnc = function (onSucess, onError) {
			onRuningFnc(3, 'Inicia proceso de sincronización con el servidor');
			onRuningFnc(3, 'Subiendo datos nuevos al servidor');
			dbContext.exportData(
                function (uploadedData) {
                	if (uploadedData === true)
                		onRuningFnc(3, 'Datos subidos correctamente');
                	else
                		onRuningFnc(3, 'No hay datos nuevos por subir');

					onRuningFnc(3, 'Descargando datos nuevos del servidor');
                    dbContext.importData(
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
                    dbContext.importData(
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

		return {
			start: function () {
				onLineFnc();
				document.addEventListener("online", onLineFnc, false);
				document.addEventListener("offline", offLineFnc, false);
			},
			run: function (onSucess, onError) {
				synchronizeFnc(onSucess, onError);
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