//Este servicio detecta los cambios de conección en la red, con el objetivo de
//sincronizar de manera silenciosa los registros de la base de datos

(function () {

	PaCM.servicesModule.factory('synchronizer', function (dbContext) {

		var debugMode = 1;

		var _synchronizerInterval = 1000 * 60 * 5; /* 5 minutos */
		var _synchronizerTask = null;
		
		var _onLineFnc = function () {

			if (_synchronizerTask == null) {
				_synchronizerTask = setInterval(_synchronizeFnc, _synchronizerInterval);
			}
			
			_onRuningFnc(3, 'En linea');
			_synchronizeFnc();
		};

		var _offLineFnc = function () {
			
			if (_synchronizerTask != null) {
				clearInterval(_synchronizerTask);
				_synchronizerTask = null;
			}

			_onRuningFnc(3, 'Fuera de linea');
		};

		var _synchronizeFnc = function (onSucess, onError) {

			if (_synchronizerTask != null) {
				clearInterval(_synchronizerTask);
				_synchronizerTask = setInterval(_synchronizeFnc, _synchronizerInterval);
			}

			if (!PaCM.isNetworkOnline()) {
				_onRuningFnc(3, 'Sin conexión con el servidor');
				if (PaCM.isFunction(onSucess))
            		onSucess();
				return;
			}

			_onRuningFnc(3, 'Inicia proceso de sincronización con el servidor');
			_onRuningFnc(3, 'Subiendo datos nuevos al servidor');
			dbContext.exportData(
                function (uploadedData) {
                	if (uploadedData === true)
                		_onRuningFnc(3, 'Datos subidos correctamente');
                	else
                		_onRuningFnc(3, 'No hay datos nuevos por subir');

					_onRuningFnc(3, 'Descargando datos nuevos del servidor');
                    dbContext.importData(
		                function (downloadedData) {
		                	if (downloadedData === true)
		                		_onRuningFnc(3, 'Datos descargados correctamente');
		                	else
		                		_onRuningFnc(3, 'No hay datos nuevos por descargar');

		                	if (PaCM.isFunction(onSucess))
		                		onSucess();
		                },
		                function (err) {
		                	_onRuningFnc(1, PaCM.prepareErrorMessage(err, 'Errores durante el proceso: '));

		                	if (PaCM.isFunction(onError))
		                		onError();
		                },
		                debugMode);
                },
                function (err) {
                	_onRuningFnc(1, PaCM.prepareErrorMessage(err, 'Errores durante el proceso: '));

					_onRuningFnc(3, 'Descargando datos nuevos del servidor');
                    dbContext.importData(
		                function (downloadedData) {
		                	if (downloadedData === true)
		                		_onRuningFnc(3, 'Datos descargados correctamente');
		                	else
		                		_onRuningFnc(3, 'No hay datos nuevos por descargar');

		                	if (PaCM.isFunction(onError))
		                		onError();
		                },
		                function (err) {
		                	_onRuningFnc(1, PaCM.prepareErrorMessage(err, 'Errores durante el proceso: '));

		                	if (PaCM.isFunction(onError))
		                		onError();
		                },
		                debugMode);
                },
                debugMode);
		};

		var _eventsOnRuning = [];
		var _onRuningFnc = function (level, msg) {
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
			PaCM.eachArray(_eventsOnRuning, function (inx, fnc) {
				fnc(level, msg);
			});
		}

		return {
			start: function () {
				_onLineFnc();
				document.addEventListener("online", _onLineFnc, false);
				document.addEventListener("offline", _offLineFnc, false);
			},
			run: function (onSucess, onError) {
				_synchronizeFnc(onSucess, onError);
			},
			stop: function () {
				document.removeEventListener("online", _onLineFnc, false);
				document.removeEventListener("offline", _offLineFnc, false);
				_offLineFnc();
			},
            addEventOnRuning: function (fnc) {
                if (PaCM.isFunction(fnc))
                    _eventsOnRuning.push(fnc);
            },
            removeEventOnRuning: function (fnc) {
            	var i = _eventsOnRuning.indexOf(fnc);
            	if (i >= 0)
            		_eventsOnRuning.splice(i, 1);
            }
		};
	});

})();