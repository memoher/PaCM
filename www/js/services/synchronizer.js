//Este servicio detecta los cambios de conección en la red, con el objetivo de
//sincronizar de manera silenciosa los registros de la base de datos

(function () {

	PaCM.servicesModule.factory('synchronizer', function (dbContext) {

		var debugMode = 1;

		var _synchronizerInterval = 1000 * 60 * 5; /* 5 minutos */
		var _synchronizerTask = null;
		
		var onLineFnc = function () {

			if (_synchronizerTask == null) {
				_synchronizerTask = setInterval(synchronizeFnc, _synchronizerInterval);
			}
			
			onRuningFnc(3, 'En linea');
			synchronizeFnc();
		};

		var offLineFnc = function () {
			
			if (_synchronizerTask != null) {
				clearInterval(_synchronizerTask);
				_synchronizerTask = null;
			}

			onRuningFnc(3, 'Fuera de linea');
		};

		var synchronizeFnc = function (onSucess, onError) {

			if (_synchronizerTask != null) {
				clearInterval(_synchronizerTask);
				_synchronizerTask = setInterval(synchronizeFnc, _synchronizerInterval);
			}

			if (!PaCM.isNetworkOnline()) {
				onRuningFnc(3, 'Sin conexión con el servidor');
				if (PaCM.isFunction(onSucess))
            		onSucess();
				return;
			}

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