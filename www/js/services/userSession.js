//Este servicio permite mantener la sesión de los usuarios activa

(function () {
    
    PaCM.servicesModule.factory('userSession', function ($rootScope, crytographySHA1, dataContext) {
        
        var userSession = $rootScope.userSession = {
            user: null,
            isLogged: false,
            sigIn: function (emailAddress, password, onSuccess, onError) {
                var self = this;

                dataContext.first('User', { where: 'EmailAddress = ? and Enabled = ?', parameters: [emailAddress, true] }, function (user) {
                    if (user == null)
                        throw 'El usuario o la contraseña no es válido';
                    
                    dataContext.get('Key', user.PasswordId, function (pass) {
                        var hash = crytographySHA1.getHash(password, pass.Salt);
                        if (hash != pass.Hash)
                            throw 'El usuario o la contraseña no es válido';
                        self.user = user;
                        self.isLogged = true;
                        onSuccess();
                    }, onError);
                    
                }, onError);
            },
            sigOut: function () {
                var self = this;
                
                self.user = null;
                self.isLogged = false;
            }
        };

        return userSession;
        
    });
    
})();