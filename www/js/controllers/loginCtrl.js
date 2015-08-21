(function () {
    
    PaCM.controllersModule.controller('loginCtrl', function ($scope, $state, userSession) {

        $scope.runningProcess = false;

        $scope.login = {
            emailAddress: null,
            password: null
        };
        $scope.sigIn = function () {
            $scope.runningProcess = true;
            try {
                userSession.sigIn($scope.login.emailAddress, $scope.login.password);
                $state.go('app.records');
            }
            catch (err) {
                PaCM.showError(err);
            }
            finally {
                $scope.runningProcess = false;
            }
        };
        $scope.sigOut = function () {
            $scope.runningProcess = true;
            try {
                userSession.sigOut();
            }
            catch (err) {
                PaCM.showError(err);
            }
            finally {
                $scope.runningProcess = false;
            }
        };
    });
    
})();