(function () {
    
    PaCM.controllers.controller('loginCtrl', function ($scope, $state, $ionicHistory, userSession) {

        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();

        var _priv = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;


        // Modelo

        $scope.login = {
            emailAddress: null,
            password: null
        };
        $scope.sigIn = function () {
            $scope.runningProcess = true;
            userSession.sigIn($scope.login.emailAddress, $scope.login.password,
                function () {
                    $scope.runningProcess = false;
                    $scope.login.emailAddress = null;
                    $scope.login.password = null;
                    _priv.refreshUI();
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    });
                    $state.go('home');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.login.password = null;
                    _priv.refreshUI();
                    PaCM.showErrorMessage(err);
                });
        };


        _priv.timeoutRefreshUI = null;
        _priv.onRefreshUI = function () {
            _priv.timeoutRefreshUI = null;
            $scope.$digest();
        }
        _priv.refreshUI = function () {
            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }
            _priv.timeoutRefreshUI = setTimeout(_priv.onRefreshUI, 100);
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