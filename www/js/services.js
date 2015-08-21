(function () {

PaCM.servicesModule = angular.module('pacmApp.services', [])

    .factory('guidGenerator', function () {

        var _s4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        
        return {
            new: function () {
                return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + '-' + _s4() + _s4() + _s4();
            }
        };
    });
    
})();
