(function () {
    
    PaCM.controllersModule.controller('loginCtrl', function ($scope, $state, $ionicHistory, userSession) {

        var _self = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;

        $scope.login = {
            emailAddress: null,
            password: null
        };
        $scope.sigIn = function (formValid) {

            if (!(formValid === true)) {
                $scope.showErrors = true;
                return false;
            }

            $scope.runningProcess = true;
            userSession.sigIn($scope.login.emailAddress, $scope.login.password,
                function () {
                    $scope.runningProcess = false;
                    $scope.$digest();
                    $state.go('app.records');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$digest();
                    PaCM.showErrorMessage(err);
                });
        };

        $ionicHistory.clearHistory();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {

            PaCM.eachProperties($scope, function (key, value) {
                if (!(key.substring(0, 1) === '$')) {
                    //PaCM.cleaner(value);
                    delete $scope[key];
                }
            });

            PaCM.eachProperties(_self, function (key, value) {
                //PaCM.cleaner(value);
                delete _self[key];
            });
            delete _self;
            
        });

    });
    
})();