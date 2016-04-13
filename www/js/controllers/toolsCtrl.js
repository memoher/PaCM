(function () {
    
    PaCM.controllers.controller('toolsCtrl', function ($scope, $state, dbSynchronizer, userSession) {

        if (!(userSession.isLogged === true)) {
            $state.go('login');
            return false;
        }


        var _priv = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;

        $scope.sigOut = function () {
            userSession.sigOut();
            $state.go('app.login');
        };

        $scope.synchronizeData = function () {
            $scope.runningProcess = true;
            dbSynchronizer.run(
                function () {
                    $scope.runningProcess = false;
                    _priv.refreshUI();
                    alert('Información sincronizada con éxito');
                },
                function (err) {
                    $scope.runningProcess = false;
                    _priv.refreshUI();
                    PaCM.showErrorMessage(err, 'Problemas durante la sincronización');
                });
        };

        $scope.entriesConsoleLog = [];
        _priv.refreshConsoleLog = function (level, msg) {
            $scope.entriesConsoleLog.push({
                dateTime: new Date(),
                level: level,
                message: msg
            });
            if ($scope.entriesConsoleLog.length > 10) {
                $scope.entriesConsoleLog.shift();
            }
            _priv.refreshUI();
        }
        dbSynchronizer.addEventOnRuning(_priv.refreshConsoleLog);


        _priv.timeoutRefreshUI = null;
        _priv._onRefreshUI = function () {
            _priv.timeoutRefreshUI = null;
            $scope.$digest();
        };
        _priv.refreshUI = function () {
            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }
            _priv.timeoutRefreshUI = setTimeout(_priv._onRefreshUI, 100);
        }


        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {

            dbSynchronizer.removeEventOnRuning(_priv.refreshConsoleLog);
            
            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }

            PaCM.cleaner($scope);
            PaCM.cleaner(_priv); _priv = null;
        });
    });
    
})();