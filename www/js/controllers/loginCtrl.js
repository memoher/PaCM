(function () {
    
    PaCM.controllersModule.controller('loginCtrl', function ($scope, $state, $ionicHistory, userSession) {

        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();

        var _this = this; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;

        $scope.login = {
            emailAddress: 'julian_her@hotmail.com',
            password: 123456
        };
        $scope.sigIn = function (loginValid) {

            if (!(loginValid === true)) {
                $scope.showErrors = true;
                return false;
            }

            $scope.runningProcess = true;
            userSession.sigIn($scope.login.emailAddress, $scope.login.password,
                function () {
                    $scope.runningProcess = false;
                    $scope.login.emailAddress = null;
                    $scope.login.password = null;
                    $scope.$digest();
                    
                    $ionicHistory.nextViewOptions({
                        historyRoot: true
                    });
                    $state.go('app.records');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.login.password = null;
                    $scope.$digest();
                    PaCM.showErrorMessage(err);
                });
        };

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {

            PaCM.cleaner($scope);
            PaCM.cleaner(_this); delete _this;
            
        });

    });
    
})();