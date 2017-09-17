OculoraApp.controller('HomeCtrl', function($scope, $rootScope, $ionicPlatform, $ionicModal, $http, Upload, $cordovaDialogs, $cordovaPush, $ionicPopover, $cordovaDevice, $ionicLoading, OculoraLogin, OculoraProfile, OculoraRemoveUser, OculoraPubList, OculoraStartSession) {


    $scope.pageTitle = "Oculora - Home";

    $scope.newUser = false;
	var imageChanged = false;
	
    $scope.$on("OnFocusHome", function() {
        /*if($scope.initComplete != false) {
            $scope.page = 0;
            $scope.getPubList($scope.page);
        }*/
    });

    $scope.$on("NotificationReg", function(ev, regid) {
        //alert(regid);
        $scope.profile[FieldNames.notifyregid] = regid;
        if($scope.newUser != true)
            $scope.login();
    });
       
    $ionicModal.fromTemplateUrl('templates/profilenew.html', {
        scope: $scope, focusFirstInput: true, hardwareBackButtonClose: false
    }).then(function(modal) {
        $scope.profilemodal = modal;

        var profileStr = window.localStorage['profile'];
        if(profileStr) {
            //alert(profileStr);
            $scope.profile = angular.fromJson(profileStr);
        }
        else {
            $scope.profile =
                { fullName: ''  , nickName:'', imageURL:'img/oculora.png'};
            $scope.profile.tags = [
                          { text: 'shirts' },
                          { text: 'jeans' },
                          { text: 'tops' },
                          { text: 'purse' }
                        ];
        }

    });
/*$scope.picFile = [];
	
	$scope.$watch('picFile', function(files) {
		//$scope.formUpload = false;
		if (files != null) {
			for (var i = 0; i < files.length; i++) {
				//$scope.errorMsg = null;
				(function(file) {
					alert(file);
				})(files[i]);
				alert(files[i]);
			}
		}
	});*/

    $scope.$on("NewProfileImage", function(event, file) {
            //alert(url);
//        $scope.$apply(function () {
			/*if(($scope.profile.imageEntry != undefined) || ($scope.profile.imageEntry != null)){
				$scope.clearTmpFile($scope.profile.imageEntry);
			}*/
	
            //$scope.profile.imageEntry = url;
			imageChanged = true;
			$scope.profile.imageURL = file;
			/*var reader = new FileReader();
					reader.onload = function(event){
					the_url = event.target.result
					alert(the_url);
					$scope.profile.imageURL = the_url;
				}
			reader.readAsDataURL(file);*/
                                        //$scope.newroom.images.push({src: url});
                                                                            //alert($scope.newroom.images[1].src);
//        });
    });


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
        //newUser[FieldNames.notifyregid] = $scope.profile[FieldNames.notifyregid];
        //alert(newUser.tags);
        userprofileedit(newUser);
        //$scope.userprofileedit2();
    };



    $scope.userremove = function() {
                        //alert($scope.newroom.publishers.mode);
                        //$scope.roomcandidates.hide();
        var user = new OculoraRemoveUser();
        //user[FieldNames.id] = id;
        $ionicLoading.show({
            template: 'Connecting...'
        });
        user.$save({}, function(resObj, st) {
                        //alert(st);
            $ionicLoading.hide();
            //var resObj = angular.fromJson(res2);
            if(resObj.result != 2) {
                                         //alert(resObj.message);
                $cordovaDialogs.confirm(resObj.message, "User Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            $scope.userremove();
                        }


                    });
            }
            else {
                navigator.app.exitApp();
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
                        $scope.userremove();
                    }


                });
        });

    }

    var userprofileedit1 = function(newUser) {
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
				if(resObj.result == 4) {
					$scope.profile.nickName = "";
					$scope.profileForm.nickName.$setValidity("server", false);
					return;
				}
                $cordovaDialogs.confirm(resObj.message, "Access Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            userprofileedit1(newUser1);
                        }
                        else
                            navigator.app.exitApp();

                    });
            }
            else {
                //$scope.access = angular.fromJson(resObj.message);
                //var res2 = angular.fromJson(resObj.message);

                //$rootScope.profile[FieldNames.id] = res2[FieldNames.id];
				if(imageChanged != false)
					userprofileedit2();
				else {
					_userprofileedit2();
				}
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
                            userprofileedit1(newUser1);
                        }
                        else
                            navigator.app.exitApp();

                });
        });

    }

	var _userprofileedit2 = function(msg) {
		$scope.profilemodal.hide();
		if(msg != null)
			angular.extend($scope.profile, angular.fromJson(msg));
		else {
			alert("System Error");
                        navigator.app.exitApp();
		}
		//$scope.profile.imageURL = $scope.profile[FieldNames.];
		var jsonProfile = angular.toJson($scope.profile);
		//alert(jsonProfile);
		window.localStorage['profile'] = jsonProfile;
		$scope.login();
	}
	
	var userprofileedit2 = function() {
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
                                navigator.app.exitApp();
                            }
                        });
                }
                else {
                    var resObj = r;
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
                                    navigator.app.exitApp();
                                }

                            });
                    }
                    else {
			_userprofileedit2(resObj.message);
                        
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
                            navigator.app.exitApp();
                        }
                    });
            }/*, function (progress) {
                // constant progress updates
                //alert(progress);
                //alert((progress.loaded / progress.total) * 100);
            }*/);
    }
    

    /*
        newUser: user object

    */
    var userprofileedit = function(newUser) {

        userprofileedit1(newUser);

    }

    $scope.login = function() {

        $ionicLoading.show({
            template: 'Connecting...'
        });
        var newuserObj = new OculoraLogin();
        newuserObj[FieldNames.notifyregid] = $scope.profile[FieldNames.notifyregid];
        newuserObj.$save({}, function(resObj, st) {
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
                            $scope.login();
                          }
                          else
                            navigator.app.exitApp();

                    });
            }
            else {
                //$ionicLoading.hide();
                $rootScope.access = angular.fromJson(resObj.message);
                $rootScope.initComplete = true;
                $scope.$emit("LoginEvent", $scope.profile);
                $scope.$broadcast('AuthComplete');
				//window.location.reload(true);
				$scope.paymentStateSetup();
                //$scope.getPubList();
//alert("success");
                //$scope.profile = null;
                //alert(JSON.stringify($scope.access));
            }

       }, function(st) {
            //alert("fail");
        //alert("Error in accessing service. Retry");
            $ionicLoading.hide();
            $cordovaDialogs.confirm("Error in accessing service. Retry", "Access Error", ['Exit','Retry'])
                .then(function(buttonIndex) {
                // no button = 0, 'OK' = 1, 'Cancel' = 2
                var btnIndex = buttonIndex;
                if(btnIndex == 2)
                {
                    $scope.login();
                }
                else
                    navigator.app.exitApp();

                });
       });
    }

    $ionicPlatform.ready(function() {
		//$scope.setupStorage();
        var newUser = false;
		if($scope.profile == undefined) {
			$scope.profile = {};
		}
		
        if($scope.profile.adid == undefined) {
            newUser = true;
            $scope.profile.adid = $cordovaDevice.getUUID();
			//$scope.setupStorage();
			//alert($scope.profile.adid);
        }
       $http.defaults.headers.common.adid = $scope.profile.adid;

        var androidConfig = {
                    "senderID": Oculora_NotificationSenderId,
                };

                $cordovaPush.register(androidConfig).then(function(result) {
                    // Success
                    }, function(err) {
                    // Error
					alert(err);
                });
        //$scope.enableRoom = true;
       if(newUser != false) {

        $scope.newUser = true;
        $scope.profilemodal.show();
       }
       //else
            //$scope.login();

    })
});

