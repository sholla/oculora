
OculoraApp.controller('Page3Ctrl', function($scope, $rootScope, $ionicPlatform, $timeout) {
              $ionicPlatform.ready(function() {

              });

              $scope.$on("OnFocusPage3", function() {
                  //alert("focussed");
                  //alert(JSON.stringify($rootScope.access));
                  //$scope.getRooms();
              });
              $scope.swipeact = function() {
                  alert("swiped");
              }
              $scope.test1 = function($event) {
                  alert("ok");
                  // Prevent bubbling to showItem.
                  // On recent browsers, only $event.stopPropagation() is needed
                  if ($event.stopPropagation) $event.stopPropagation();
                  if ($event.preventDefault) $event.preventDefault();
                  $event.cancelBubble = true;
                  $event.returnValue = false;
              }

                  $scope.test2 = function($event) {
                      //alert("ok");
                      // Prevent bubbling to showItem.
                      // On recent browsers, only $event.stopPropagation() is needed
                      if ($event.stopPropagation) $event.stopPropagation();
                      //if ($event.preventDefault) $event.preventDefault();
                      //$event.cancelBubble = true;
                      //$event.returnValue = false;
                  }
              $scope.doRefresh = function() {
                  alert("ok");
                  $timeout( function() {
          $scope.$broadcast('scroll.infiniteScrollComplete');
                      //Stop the ion-refresher from spinning
                      $scope.$broadcast('scroll.refreshComplete');
                  }, 1000);
              }

          $scope.items = [];
                  for (var i = 0; i < 4; i++) {
                      var item = {img: 'img/oculora.png'};
                      $scope.items.push(item);
                  }
                  //alert($scope.items.length);

          });