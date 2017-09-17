// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

var OculoraApp = angular.module('Oculora', ['ionic', 'ngCordova', 'ngResource', 'ngTagsInput'/*, 'hmTouchEvents' */, 'ngFileUpload', 'opentok', 'opentok-whiteboard', 'oculoraServices'])

    .run(function($ionicPlatform, $rootScope, $cordovaPush, $cordovaMedia) {
      $ionicPlatform.ready(function() {
      //alert("foo");
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
		$.event.props.push("touches");
        if(Oculora_PayDeploy < 2) {
            if(google.payments.billingAvailable != true) {
                alert("Your device does not support in-app billing. Sorry - but Oculora cannot be used. Aborting...");
                navigator.app.exitApp();
            }
        }
		
		
        $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
            //$scope.$broadcast('NotificationMsg', notification);
            switch(notification.event) {
                case 'registered':
                  if (notification.regid.length > 0 ) {
                    //alert('registration ID = ' + notification.regid);
                    //save the ID on server in the adid map
                    //$rootScope[FieldNames.Oculora_RegId] = notification.regid;

                    $rootScope.$broadcast('NotificationReg', notification.regid);
                  }
                  break;

                case 'message':
                  // this is the actual push notification. its format depends on the data model from the push server
                  //alert(angular.toJson(notification));
                  //alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                  $rootScope.$broadcast('NotificationMessage', notification);
                  if(notification.foreground) {
                     var soundfile = notification.soundname || notification.payload.sound;
                      // if the notification contains a soundname, play it.
                      // playing a sound also requires the org.apache.cordova.media plugin
                      if(soundfile) {
                        var my_media = new Media("/android_asset/www/"+ soundfile);
                        my_media.play();
                      }

                  }


                  break;

                case 'error':
                  alert('GCM error = ' + notification.msg);
                  break;

                default:
                  alert('An unknown GCM event has occurred');
                  break;
            }
            });




      });
    });

/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
OculoraApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

