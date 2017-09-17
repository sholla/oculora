
//REST service calls code

'use strict';

/* Services */

var oculoraServices = angular.module('oculoraServices', ['ngResource']);

oculoraServices.factory('OculoraLogin', ['$resource',
  function($resource){
    //adid = '@adid';
    return $resource(AbsoluteOculoraURL(OculoraURLs.Login), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraProfile', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.Profile), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraRemoveUser', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.ProfileRemove), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraProfileRetrieve', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.ProfileRetrieve), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraUserList', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.UserList), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraRoom', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.Room), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraFollower', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.Follower), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraRemoveRoom', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.RoomRemove), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraListRoom', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.RoomList), {}, {query: {method:'GET', params:{}, isArray:false}
    });
  }]);

oculoraServices.factory('OculoraPubList', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.PubList), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraActiveSubList', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.ActiveSubList), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraStartSession', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.StartSession), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraSubscribeSession', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.SubscriberSession), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraEndSession', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.EndSession), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraNotificationRegId', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.NotificationRegId), {}, {query: {method:'GET', params:{}}
    });
  }]);

oculoraServices.factory('OculoraCredits', ['$resource',
  function($resource){
    return $resource(AbsoluteOculoraURL(OculoraURLs.Credits), {}, {query: {method:'GET', params:{}}
    });
  }]);