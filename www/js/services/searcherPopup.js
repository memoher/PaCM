(function () {
    "use strict";
    
    // Servicio que permite el trabajo con el popup de busquedas

    PaCM.services.factory('searcherPopup', function ($ionicModal, $filter) {

        var STRING_EMPTY = '';
        
        return {
            initialize: function ($scope) {

                // Create the modal popup searcher
                $ionicModal.fromTemplateUrl('templates/searcherPopup.html', {
                    scope: $scope,
                    focusFirstInput: false
                }).then(function(modal) {
                    $scope.searcher = {
                        open: function (type, title, data, search, onSelect, canAdd) {
                            var self = this;

                            switch (type) {
                                case 'Country':
                                case 'State':
                                case 'City':
                                case 'BranchCustomer':
                                case 'ObjectTypeTrademark':
                                case 'ObjectTypeModel':
                                case 'MachineTrademark':
                                case 'MachineModel':
                                    self.group = 1;
                                    break;
                                case 'ObjectType':
                                case 'Battery':
                                case 'Charger':
                                case 'Machine':
                                    self.group = 2;
                                    break;
                                case 'Article':
                                    self.group = 3;
                                    break;
                                case 'Customer':
                                    self.group = 4;
                                    break;
                                default:
                                    throw 'Type not support';
                            }

                            self.type = type;
                            self.title = title;
                            self.search = search ? search : STRING_EMPTY;
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
                                var filter1 = null, filter2 = null;
                                switch (self.group) {
                                    case 1:
                                        filter1 = { Name: self.search };
                                        break;
                                    case 2:
                                        filter1 = { Description: self.search };
                                        break;
                                    case 3:
                                        filter1 = { Name: self.search };
                                        filter2 = { InventoryCode: self.search };
                                        break;
                                    case 4:
                                        filter1 = { Name: self.search,  };
                                        filter2 = { ShortName: self.search };
                                        break;
                                }
                                var result = $filter('filter')(self.data, filter1);
                                if (filter2) {
                                    PaCM.mergeArray(['Id'], result, $filter('filter')(self.data, filter2));
                                }
                                PaCM.syncronizeArray(['Id'], self.dataFiltered, result);

                                if (self.dataFiltered.length === 0 && self.canAdd) {
                                    self.showAddButton = true;
                                }
                            } else {
                                PaCM.syncronizeArray(['Id'], self.dataFiltered, self.data);
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
                            self.data = null;
                            self.dataFiltered.length = 0; self.dataFiltered = null;
                            modal.hide();
                        },
                        destroy: function () {
                            var self = this;

                            modal.hide();
                            modal.remove();
                            $scope.searcher = null;
                            PaCM.cleaner(self);
                        }
                    };
                });

            }
        };
        
    });
    
})();