(function () {
    
    PaCM.controllersModule.controller('loginCtrl', function ($scope, $state, userSession) {

        $scope.runningProcess = false;

        $scope.login = {
            emailAddress: null,
            password: null
        };
        $scope.sigIn = function () {
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
                    PaCM.showError(err);
                });
        };
        $scope.sigOut = function () {
            userSession.sigOut();
        };
    });
    
})();