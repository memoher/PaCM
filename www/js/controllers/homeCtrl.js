(function () {
    
    PaCM.controllers.controller('homeCtrl', function ($scope, $state, $ionicHistory, userSession, dbSynchronizer) {

        if (!(userSession.isLogged === true)) {
            $state.go('login');
            return false;
        }


        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();

        var _priv = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;

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

        $scope.sigOut = function () {
            userSession.sigOut();
            $ionicHistory.nextViewOptions({
                historyRoot: true
            });
            $state.go('login');
        };


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

            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }

            PaCM.cleaner($scope);
            PaCM.cleaner(_priv); _priv = null;
            
        });
    });
    
})();