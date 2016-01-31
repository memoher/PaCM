//Este servicio permite el trabajo con el popup de busquedas

(function () {
    
    PaCM.servicesModule.factory('searcherPopup', function ($ionicModal, $filter) {
        
        return {
            initialize: function ($scope) {

                // Create the modal popup searcher
                $ionicModal.fromTemplateUrl('templates/searcherPopup.html', {
                    scope: $scope,
                    focusFirstInput: true
                }).then(function(modal) {
                    $scope.searcher = {
                        open: function (type, title, data, search, onSelect, canAdd) {
                            var self = this;

                            self.group = null;
                            if (['Country', 'State', 'City', 'ObjectTypeTrademark', 'ObjectTypeModel', 'MachineTrademark', 'MachineModel'].indexOf(type)>=0)
                                self.group = 1;
                            else if (['ObjectType', 'Battery', 'Charger', 'Machine'].indexOf(type)>=0)
                                self.group = 2;
                            else if (type === 'Article')
                                self.group = 3;
                            else if (type === 'Customer')
                                self.group = 4;
                            //
                            self.type = type;
                            self.title = title;
                            self.search = search ? search : PaCM.getStringEmpty();
                            self.onSelect = onSelect;
                            self.canAdd = canAdd;
                            self.showAddButton = false;
                            self.data = data;
                            self.dataFiltered = data.slice(0);
                            modal.show();
                        },
                        filter: function () {
                            var self = this;
                            
                            self.showAddButton = false;
                            if (self.search) {
                                var filter = null;
                                switch (self.group) {
                                    case 1:
                                        filter = { Name: self.search };
                                        break;
                                    case 2:
                                        filter = { Description: self.search };
                                        break;
                                    case 3:
                                        filter = self.search;
                                        break;
                                    case 4:
                                        filter = { Name: self.search };
                                        break;
                                }
                                var result = $filter('filter')(self.data, filter);
                                PaCM.syncronizeArray(['Id'], self.dataFiltered, result);

                                if (self.dataFiltered.length == 0 && self.canAdd) {
                                    self.showAddButton = true;
                                }
                            } else {
                                PaCM.syncronizeArray(['Id'], self.dataFiltered, []);
                            }

                        },
                        select: function (item) {
                            var self = this;

                            self.onSelect(item);
                            self.close();
                        },
                        close: function () {
                            var self = this;
                            
                            self.group = null;
                            self.type = null;
                            self.title = null;
                            self.search = null;
                            self.onSelect = null;
                            self.canAdd = null;
                            self.showAddButton = null;
                            PaCM.cleaner(self.data); self.data = null;
                            PaCM.cleaner(self.dataFiltered); self.dataFiltered = null;
                            modal.hide();
                        },
                        destroy: function () {
                            var self = this;

                            self.close();
                            modal.remove();
                            $scope.searcher = null;
                        }
                    };
                });

            }
        };
        
    });
    
})();