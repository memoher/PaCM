//Este servicio permite mantener la sesión de los usuarios activa

(function () {
    
    PaCM.services.factory('userSession', function ($rootScope, crytographySHA1, dbRepository) {
        
        return $rootScope.userSession = {
            user: null,
            isLogged: false,
            sigIn: function (emailAddress, password, onSuccess, onError) {
                var self = this;

                dbRepository.first('User', { where: 'lower(EmailAddress) = lower(?) and Enabled = ?', parameters: [emailAddress, true] }, function (user) {
                    if (user == null)
                        throw '1 - El usuario o la contraseña no es válido';
                    
                    dbRepository.get('Key', user.PasswordId, function (pass) {
                        if (crytographySHA1.getHash(password, pass.Salt) != pass.Hash)
                            throw '2 - El usuario o la contraseña no es válido';
                        
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
        
    });
    
})();