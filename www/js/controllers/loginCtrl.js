(function () {
    
    PaCM.controllersModule.controller('loginCtrl', function ($scope, $state, userSession) {

        $scope.runningProcess = false;

        $scope.login = {
            emailAddress: null,
            password: null
        };
        $scope.sigIn = function () {
            var fncOnSuccess = function () {
                $state.go('app.records');
            };
            var fncOnError = function (err) {
                PaCM.showError(err);
            };
            userSession.sigIn($scope.login.emailAddress, $scope.login.password, fncOnSuccess, fncOnError);
        };
        $scope.sigOut = function () {
            userSession.sigOut();
        };
    });
    
})();