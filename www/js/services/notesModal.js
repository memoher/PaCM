(function () {
    "use strict";
    
    // Servicio que permite el trabajo con el popup de notas

    PaCM.services.factory('notesModal', function ($ionicModal) {
        
        return {
            initialize: function ($scope) {

                // Create the modal popup notes
                $ionicModal.fromTemplateUrl('templates/notesModal.html', {
                    scope: $scope,
                    focusFirstInput: false
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

                            modal.hide();
                            modal.remove();
                            $scope.notes = null;
                            PaCM.cleaner(self);
                        }
                    };
                });

            }
        };
        
    });
    
})();