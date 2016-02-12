//Este servicio permite el trabajo con el popup de busquedas

(function () {
    
    PaCM.servicesModule.factory('notesPopup', function ($ionicModal, $filter) {
        
        return {
            initialize: function ($scope) {

                // Create the modal popup notes
                $ionicModal.fromTemplateUrl('templates/notesPopup.html', {
                    scope: $scope,
                    focusFirstInput: true
                }).then(function(modal) {
                    $scope.notes = {
                        open: function (title, readOnly, value, onChange) {
                            var self = this;

                            self.title = title;
                            self.readOnly = readOnly;
                            self.value = value;
                            self.onChange = onChange;
                            modal.show();
                        },
                        close: function () {
                            var self = this;
                            
                            self.title = null;
                            self.readOnly = null;
                            self.value = null;
                            self.onChange = null;
                            modal.hide();
                        },
                        destroy: function () {
                            var self = this;

                            self.close();
                            modal.remove();
                            $scope.notes = null;
                        }
                    };
                });

            }
        };
        
    });
    
})();