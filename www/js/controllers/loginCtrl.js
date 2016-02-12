(function () {
    
    PaCM.controllersModule.controller('loginCtrl', function ($scope, $state, $ionicHistory, userSession) {

        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();

        var _this = this; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = true;

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
                    _this.refreshUI();
                    
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    });
                    $state.go('app.records');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.login.password = null;
                    _this.refreshUI();
                    PaCM.showErrorMessage(err);
                });
        };


        _this.timeoutRefreshUI = null;
        _this.onRefreshUI = function () {
            _this.timeoutRefreshUI = null;
            $scope.$digest();
        }
        _this.refreshUI = function () {
            if (_this.timeoutRefreshUI) {
                clearTimeout(_this.timeoutRefreshUI);
                _this.timeoutRefreshUI = null;
            }
            _this.timeoutRefreshUI = setTimeout(_this.onRefreshUI, 100);
        }
        _this.refreshUI();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {

            PaCM.cleaner($scope);
            PaCM.cleaner(_this); _this = null;
            
        });

    });
    
})();