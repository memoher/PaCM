(function () {
    
    PaCM.controllersModule.controller('toolsCtrl', function ($scope, dbContext) {

        var debugMode = 1;
        
        $scope.runningProcess = false;

        $scope.installDatabase = function () {
            $scope.runningProcess = true;
            dbContext.installDatabase(
                function () {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert('Database installed successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    PaCM.showError(err, 'Failure during installation of the database');
                },
                debugMode);
        };

        $scope.importData = function () {
            $scope.runningProcess = true;
            dbContext.importData(
                function () {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    alert('Data imported successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$apply();
                    PaCM.showError(err, 'Fails during data import');
                },
                debugMode);
        };
    });
    
})();