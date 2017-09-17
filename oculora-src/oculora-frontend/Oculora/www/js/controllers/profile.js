
OculoraApp.controller('ProfileCtrl', function($scope, $rootScope, $ionicPlatform, $ionicModal, $q, $ionicPopup, $ionicActionSheet, Upload, OculoraProfile) {
    $scope.$on("OnFocusProfile", function() {
                      //alert("focussed");
                      //alert(JSON.stringify($rootScope.access));
                      //$scope.getRooms();
        //$scope.getUser();
		//alert($scope.profile.imageURL);
        $scope.template = $scope.templates[0];
    });

    $scope.$on("ChangedProfileImage", function(event, file) {
		/*if(($scope.profile.imageEntry != undefined) || ($scope.profile.imageEntry != null)){
			$scope.clearTmpFile($scope.profile.imageEntry);
		}*/
	
        //$scope.profile.imageEntry = url;
		$scope.$apply(function () {
			$scope.profile.imageURL = file;
			});
		
                    //alert(url);
                //$scope.$apply(function () {
					//if($scope.profile)
                            //$scope.profile.imageURL = url;
                                                //$scope.newroom.images.push({src: url});
                                                                                    //alert($scope.newroom.images[1].src);
                    //                        });
    });

    $scope.pageTitle = "Oculora - Profile";

    $scope.templates =
        [ { title: 'Profile', url: 'templates/profile.html'},
          { title: 'Settings', url: 'templates/settings.html'} ];


                                                                   //alert($scope.newroom.images[1].src);



    // Triggered on a button click, or some other target
     $scope.showOptions = function() {

       // Show the action sheet
       var hideSheet = $ionicActionSheet.show({
         buttons: [
           { text: '<i class="icon ion-share"></i>Profile' },
           { text: '<i class="icon ion-share"></i>Settings' }
         ],

         titleText: 'Options',

         cancel: function() {
              // add cancel code..
            },
         buttonClicked: function(index) {
            $scope.template = $scope.templates[index];
            switch(index) {
                case 0:
                    $scope.getUser();
                    break;
                case 1:
                    break;
            }

            return true;
         }
       });
     }

     $scope.getUser = function() {
        /*if(angular.isUndefined($rootScope.profile) != true)
            return;
        $scope.profile = window.localStorage['profile'];*/
     }

     $scope.profilemanip = function(u) {

         var nameEmpty = isEmpty($scope.profile.nickName);
         if(nameEmpty != false) {
             alert("Nick Name cannot be empty");
             return;
         }
         // we can create an instance as well
         var newUser = new OculoraProfile();
         newUser[FieldNames.fullName] = $scope.profile.fullName;
         newUser[FieldNames.nickName] = $scope.profile.nickName;
         newUser[FieldNames.tags] = [];
         var tagsList = angular.fromJson($scope.profile.tags);

         for( t in tagsList ) {
             newUser[FieldNames.tags].push(tagsList[t].text);
         }
         //alert(newUser.tags);
         $scope.userprofileedit(newUser);
         //$scope.userprofileedit2();
     }

     $scope.userprofileedit = function(newUser) {

        $scope.userprofileedit1(newUser);

     }

     $scope.userprofileedit1 = function(newUser) {
         var newUser1 = angular.copy(newUser);
         $ionicLoading.show({
             template: 'Connecting...'
         });
         newUser.$save({}, function(resObj, st) {
             //alert(st);
             $ionicLoading.hide();
             //var resObj = angular.fromJson(res2);
             if(resObj.result != 2) {
                              //alert(resObj.message);
                 $cordovaDialogs.confirm(resObj.message, "Access Error", ['Exit','Retry'])
                     .then(function(buttonIndex) {
                         // no button = 0, 'OK' = 1, 'Cancel' = 2
                         var btnIndex = buttonIndex;
                         if(btnIndex == 2)
                         {
                             $scope.userprofileedit1(newUser1);
                         }
                         //else
                             //navigator.app.exitApp();

                     });
             }
             else {
                 //$scope.access = angular.fromJson(resObj.message);
                 //var res2 = angular.fromJson(resObj.message);

                 //$rootScope.profile[FieldNames.id] = res2[FieldNames.id];
                 $scope.userprofileedit2();
             }

         }, function(st) {
             //alert("Error in accessing service. Retry");
             $ionicLoading.hide();
             $cordovaDialogs.confirm("Error in accessing service. Retry", "Access Error", ['Exit','Retry'])
                 .then(function(buttonIndex) {
                     // no button = 0, 'OK' = 1, 'Cancel' = 2
                         var btnIndex = buttonIndex;
                         if(btnIndex == 2)
                         {
                             $scope.userprofileedit1(newUser1);
                         }
                         //else
                             //navigator.app.exitApp();

                 });
         });

     }

	 $scope.userprofileedit2 = function() {
        var url = AbsoluteOculoraURL(OculoraURLs.ProfileImage);
        //var filePath = $scope.profile.imageURL;
		//var filePath = $scope.profile.imageEntry.toURL();
        //var trustHosts = true
        //var options = {};
        var headers={'adid':$scope.profile.adid};
		//var headers={'adid':$rootScope.profile.adid, 'mid': newRoom[FieldNames.id]};
        var options = {url: url, file: $scope.profile.imageURL, headers: headers};
			  
        //options.headers = headers;
        //options.fileName=$scope.profile.imageURL.substr($scope.profile.imageURL.lastIndexOf('/')+1);
        $ionicLoading.show({
            template: 'Connecting...'
        });
        Upload.upload(options)
                .success(function (r, status, headers, config) {
                // Success!
                //alert(r.response);
                /*alert("Code = " + r.responseCode);
                    alert("Response = " + r.response);
                    alert("Sent = " + r.bytesSent);*/

                $ionicLoading.hide();
                if(status != 200) {
                    $cordovaDialogs.confirm("Error in accessing service. Retry", "Profile Error", ['Exit','Retry'])
                        .then(function(buttonIndex) {
                            // no button = 0, 'OK' = 1, 'Cancel' = 2
                            var btnIndex = buttonIndex;
                            if(btnIndex == 2)
                            {
                                $ionicLoading.hide();
                                $scope.userprofileedit2();
                            }
                            else if(btnIndex == 1) {
								/*if(($scope.profile.imageEntry != undefined) || ($scope.profile.imageEntry != null)){
									$scope.clearTmpFile($scope.profile.imageEntry);
								}*/
                                $scope.userremove();
                                //navigator.app.exitApp();
                            }
                        });
                }
                else {
                    var resObj = angular.fromJson(r);
                    if(resObj.result != 2) {
                                                     //alert(resObj.message);
                        $cordovaDialogs.confirm(resObj.message, "Save Error", ['Exit','Retry'])
                            .then(function(buttonIndex) {
                                // no button = 0, 'OK' = 1, 'Cancel' = 2
                                var btnIndex = buttonIndex;
                                if(btnIndex == 2)
                                {
                                    $scope.userprofileedit2();
                                }
                                else if(btnIndex == 1) {
									/*if(($scope.profile.imageEntry != undefined) || ($scope.profile.imageEntry != null)){
										$scope.clearTmpFile($scope.profile.imageEntry);
									}*/
                                    $scope.userremove();
                                    //navigator.app.exitApp();
                                }

                            });
                    }
                    else {
                        $scope.profilemodal.hide();
						/*if(($scope.profile.imageEntry != undefined) || ($scope.profile.imageEntry != null)){
							$scope.clearTmpFile($scope.profile.imageEntry);
						}
						$scope.profile.imageEntry = null;*/
                        window.localStorage['profile'] = angular.toJson($scope.profile);
                        //$scope.login();


                                        //$scope.access = angular.fromJson(resObj.message);
                                        //$scope.userprofileedit2(newUser);
                    }
                }
            }).error(function(){

                //alert("An error has occurred: Code = " + err.code);
                // Error
                //alert("error:" + err);
                $ionicLoading.hide();
                $cordovaDialogs.confirm("Error in accessing service. Retry", "Profile Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {

                            $scope.userprofileedit2();
                        }
                        else if(btnIndex == 1) {
							/*if(($scope.profile.imageEntry != undefined) || ($scope.profile.imageEntry != null)){
								$scope.clearTmpFile($scope.profile.imageEntry);
							}*/
                            $scope.userremove();
                            //navigator.app.exitApp();
                        }
                    });
            }/*, function (progress) {
                // constant progress updates
                //alert(progress);
                //alert((progress.loaded / progress.total) * 100);
            }*/);
    }
     
});

