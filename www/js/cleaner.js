//Elimina todas las referencias públicas

(function () {
	"use strict";

	window.PaCM.constants = null; delete window.PaCM.constants;
	window.PaCM.services = null; delete window.PaCM.services;
	window.PaCM.controllers = null; delete window.PaCM.controllers;

})();