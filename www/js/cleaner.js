//Elimina todas las referencias públicas

(function () {

	PaCM.services = null; delete PaCM.services;
	PaCM.controllers = null; delete PaCM.controllers;

})();