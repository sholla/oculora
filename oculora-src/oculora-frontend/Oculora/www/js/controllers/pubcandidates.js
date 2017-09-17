
OculoraApp.controller('PubCandidatesCtrl', function($scope, $rootScope, $ionicPlatform, $ionicModal, $ionicLoading, $ionicPopover, $q, $ionicPopup, $ionicActionSheet, $cordovaDialogs, OculoraProfileRetrieve, OculoraStartSession, OculoraPubList, OculoraFollower) {
    $scope.$on("OnFocusP", function() {
                      //alert("focussed");
                      //alert(JSON.stringify($rootScope.access));
                      //$scope.getRooms();
        //$scope.getUser();
    });



    $ionicModal.fromTemplateUrl('templates/roomimagespub.html', {
        scope: $scope
    }).then(function(modal) {
            $scope.roomimagesuser = modal;
    });

    $ionicModal.fromTemplateUrl('templates/roompubview.html', {
        scope: $scope,
		hardwareBackButtonClose: false
    }).then(function(modal) {
            $scope.roompubview = modal;
    });

	$ionicModal.fromTemplateUrl('templates/modal-publisherconfiguration.html', {
        scope: $scope
    }).then(function(modal) {
            $scope.publisherconfiguration = modal;
    });
    
	
	

    $scope.$on("NotifyPub", function(event) {
                                      //alert("pub4");
        if($scope.roompubview.isShown() != false)
            $scope.$broadcast("NotifyPlayPub");
        else
            $scope.$emit("NotifyPubDone");
    });

    $scope.$on("AuthComplete", function(event) {
                                          //alert(d);
        $scope.getPubList(true);
    });

    //$scope.activeSubs = [];
    $scope.items = [];
    $scope.page = 0;
    $scope.userimages = [];


    $scope.followrNotCls = "button button-small icon ion-heart";
    $scope.followrYesCls = $scope.followrNotCls + " button-balanced";

    $scope.sortFilters = [
       {name: "Any"},
       {name: "Matches"},
       {name: "Followers"},
       {name: "Connections"},
       {name: "For me"}
   ];
   $scope.sortFilter = $scope.sortFilters[0];

               $scope.sortOns = [
                   {name: "Date"},
                   {name: "User"},
                   {name: "Name"}
               ];
               $scope.sortOn = $scope.sortOns[0];

               $scope.sortOrders = [
                  {name: "Asc"},
                  {name: "Dec"}
               ];
               $scope.sortOrder = $scope.sortOrders[0];
               $scope.sortData = "";

	
   
    /*$scope.sortAction = function() {

        $scope.getPubList(0)
    }*/

	
	   
	/*$scope.dev = {};
	$scope.dev.inputVideoDeviceSel = null;
	  $scope.dev.inputAudioDeviceSel = null;*/
	  
    $scope.getPubList = function(inReset) {
        if($rootScope.initComplete != true) {
                    return;
        }
        $ionicLoading.show({
            template: 'Connecting...'
        });
        if(inReset != false)
            $scope.page = 0;
        var sortFilter = $scope.sortFilters.indexOf($scope.sortFilter);
        var sortOrder = $scope.sortOrders.indexOf($scope.sortOrder);
        var sortOn = $scope.sortOns.indexOf($scope.sortOn);
        var queryObj = {};
        queryObj[QueryFields.page] = $scope.page;
        queryObj[FieldNames.searchMode] = sortFilter;
        queryObj[QueryFields.sortOrder] = sortOrder;
        queryObj[QueryFields.sortOn] = sortOn;
        //var queryObj = {QueryFields.page: pg, QueryFields.sortOrder: sortOrder, QueryFields.sortOn: sortOn};
        if($scope.sortData.length > 0)
            queryObj[QueryFields.sortData] = $scope.sortData;

        OculoraPubList.get(queryObj, function(resObj, st) {
                  //alert(st);
            $ionicLoading.hide();
                  //var resObj = angular.fromJson(res2);
                  //alert(resObj.result);
			//alert(angular.toJson(resObj));
            if(resObj.result != 2) {
                      //alert(resObj.message);
                if(resObj.result == 3) {
                          //num = 4;
                    $scope.items = [];
                    return;
                }
                $cordovaDialogs.confirm(resObj.message, "Retrieve Access Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            $scope.getPubList(inReset);
                        }
                                //else
                                  //navigator.app.exitApp();

                    });
            }
            else {
                //$ionicLoading.hide();
                      //$rootScope.access = angular.fromJson(resObj.message);

                      //$scope.$emit("LoginEvent", $scope.profile);
                      //$scope.profile = null;
                      /*if(resObj.message == null)
                         break;*/
                      //var rooms = angular.fromJson(resObj.message);
                      /*if(resObj.message.length == 0)
                      {
                          break;
                      }*/
                      //alert(resObj.message);
                var rooms = angular.fromJson(resObj.message);
                for(room in rooms)
                {
                    //alert("1:" + rooms[room].images);
                    if(rooms[room].images == null) {
						rooms[room].imageURL = "img/oculora.png";
						continue;
					}
                        
                    rooms[room].images = OculoraURLs.HostAddress + rooms[room].images;
                    var rm = rooms[room] ;
                    rooms[room].imageURL = ((typeof rooms[room].images) == "string") ? rooms[room].images : rooms[room].images[rm[FieldNames.MainImageIdx]];
                    //alert((typeof rooms[room].images) == "string");
                    /*if(rooms[room].sm == "RoomPairMode_ANY")
                        rooms[room].sm = 0;
                    else if(rooms[room].sm == "RoomPairMode_CONNECTIONS")
                        rooms[room].sm = 1;
                    else if(rooms[room].sm == "RoomPairMode_THISUSERS")
                        rooms[room].sm = 2;*/
                    //alert(rooms[room].follow);
                    rooms[room].followr = ( rooms[room].follow ? $scope.followrYesCls : $scope.followrNotCls);

                  }
                  //$scope.page = pg;
                  if($scope.page == 0)
                    $scope.items = rooms;
                  else
                    $scope.items.concat(rooms);
                  $scope.page++;
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
                        $scope.getPubList(inReset);
                    }
                });
        });
    }

    $scope.startSession = function(pubItem, item) {
        var pubItem1 = angular.copy(pubItem);
        $ionicLoading.show({
            template: 'Connecting...'
        });

        pubItem.$save({}, function(resObj, st) {
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
                            $scope.startSession(pubItem1, item);
                        }
                        //else
                            //navigator.app.exitApp();

                    });
            }
            else {
                //$scope.access = angular.fromJson(resObj.message);
                var res2 = angular.fromJson(resObj.message);
                $scope.publishCreds = res2;
                $scope.publishItem = item;
                $scope.roompubview.show();

                //$rootScope.profile[FieldNames.id] = res2[FieldNames.id];
                //$scope.userprofileedit2();
                //$scope.extprofile = { imageURL: OculoraURLs.HostAddress + res2.imageFile, fullName: res2.fn, nickName: res2.nn, tags: res2.tags};
                //$scope.extprofilemodal.show();
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
                            $scope.startSession(pubItem1, item);
                        }
                        //else
                            //navigator.app.exitApp();

                });
        });
    }

	/*$scope.inputDeviceSelect = function() {
		$scope.media.dirty = true;
	}*/
	$scope.roompublishconfiguration = function() {
		//myPopup.hide();
		if($scope.media.inputVideoDeviceSel != null)
		{
			//$scope.dev.inputVideoDeviceSel = $scope.inputVideoDeviceSel0;
			$scope.publisherconfiguration.show();
			return;
		}
		var devReady = $scope.$watch("media.inputVideoDeviceSel", function(value) {
                if(value != null) {
					$ionicLoading.hide();
					devReady(); //$scope.publisherconfiguration.show();
					//alert(angular.toJson(value));
					//$scope.dev.inputVideoDeviceSel = $scope.inputVideoDeviceSel0;
					$scope.publisherconfiguration.show();
				}
					
				else {
					$ionicLoading.show({
            template: 'Gathering your media access device information...'
        });

				}
		});
	}
	
	$scope.tmpItem = {};
	var hwcomponent = null;
	var hwconfig = function() {
		// Replace this with the ID of the target DOM element for the component
		var element = document.querySelector('#othwconf');
		
		OT.getDevices(function(err, devices) {
			if(err) {
				alert("Could not get devices for input");
				return;
			}
			var vs = {};
			var as = {};
			devices.forEach(function (device) {
					//alert(angular.toJson(device));
                    if($scope.media.inputVideoDeviceSel.did === device.deviceId) {
						vs = device;
					}
					else if($scope.media.inputAudioDeviceSel.did === device.deviceId) {
						as = device;
					}
						

            });
			var options = {
				insertMode: 'append', // Or use another insertMode setting.
				defaultAudioDevice : as,
				defaultVideoDevice  : vs
			};
			//alert(angular.toJson(options));
			hwcomponent = createOpentokHardwareSetupComponent(element, options, function(error) {
				if (error) {
					alert(angular.toJson(error));
					console.error('Error: ', error);
					element.innerHTML = '<strong>Error getting devices</strong>: '
						error.message;
					return;
				}
			// Add a button to call component.destroy() to close the component.
			});
		});
		
	}
	
    $scope.roompublish = function(item, $event) {
                            //alert(item.imageURL);
        if($event) $scope.roomCardFlipSupp($event);
                            //$scope.userimages = ((typeof item.images) == "string") ? [item.images] : item.images;
                            //alert($scope.userimages);
                            //$scope.roomimagesuser.show();
                            //alert("publish");
		if(item == null) item = $scope.tmpItem;
		
		$ionicPopup.show({
            //templateUrl: 'templates/popup-publisherprompt.html',
            title: 'Room Publish Prompt',
            subTitle: 'Are you sure you want to publish to this room?',
            scope: $scope,
            buttons: [
              {
                  text: '<b>NO</b>',
                  type: 'button-negative',
                  onTap: function(e) {
                    //save the response on server
					//alert(angular.toJson($scope.media.inputVideoDeviceSel));
					$scope.tmpItem = {};
                  }
              },
              {
                text: '<b>YES</b>',
                type: 'button-positive',
                onTap: function(e) {
                    
					var pubItem = new OculoraStartSession();
                    pubItem[FieldNames.id] = item[FieldNames.id];
                    pubItem[FieldNames.FullView] = true;
                    pubItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Publish;
                    //alert(JSON.stringify(pubItem));
                    $scope.startSession(pubItem, item);
					$scope.tmpItem = {};
			  }},
				{
                  text: '<b>Setup</b>',
                  //type: 'button-positive',
                  onTap: function(e) {
                    $scope.tmpItem = item;
					$scope.roompublishconfiguration();
                  }
              }
              
            ]
          });
		
		
        /*$cordovaDialogs.confirm("Are you sure you want to publish to this room", "Publisher Prompt", ['Cancel','OK'])
            .then(function(buttonIndex) {
                // no button = 0, 'OK' = 2, 'Cancel' = 1
                var btnIndex = buttonIndex;

                if(btnIndex == 2)
                {
                    //alert(JSON.stringify(item));
                    //return;
                    var pubItem = new OculoraStartSession();
                    pubItem[FieldNames.id] = item[FieldNames.id];
                    pubItem[FieldNames.FullView] = true;
                    pubItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Publish;
                    //alert(JSON.stringify(pubItem));
                    $scope.startSession(pubItem, item);
                    //$scope.publishItem = item;
                    //$scope.roompubview.show();
                }
                                    //else
                                        //navigator.app.exitApp();

        });*/

                            //$scope.roomsactivesubs.show($event);
                            //alert($scope.roomsactivesubs);
    }

    $scope.roomfollowSave = function(item, saveObj) {
        var saveObj1 = angular.copy(saveObj);
        $ionicLoading.show({
            template: 'Connecting...'
        });

        saveObj.$save({}, function(resObj, st) {
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
                            $scope.roomfollowSave(saveObj1);
                        }
                    });
            }
            else {
                //var resObj1 = angular.toJson(resObj.message);
                //alert(resObj1);
                item.follow = !item.follow;
                item.followr = ( item.follow ? $scope.followrYesCls : $scope.followrNotCls);
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
                            $scope.roomfollowSave(saveObj1);
                        }
                });
        });
    }

    $scope.roomfollow = function(item, $event) {
        $scope.roomCardFlipSupp($event);
        var saveObj = new OculoraFollower();
        saveObj[FieldNames.followtargetid] = item[FieldNames.uid];
        saveObj[FieldNames.follow] = !item[FieldNames.follow];
        saveObj[FieldNames.followtype] = Oculora_FollowType.FollowType_UserTORoom;
        $scope.roomfollowSave(item, saveObj);
    }

    $scope.cardroomimagesshow = function(item, $event) {
                    //alert(item.imageURL);
        $scope.roomCardFlipSupp($event);
        $scope.userimages = ((typeof item.images) == "string") ? [item.images] : item.images;
                    //alert($scope.userimages);
        $scope.roomimagesuser.show();
    }


    $scope.roomimagesuserdone = function() {
                      //alert(item.imageURL);
        $scope.userimages = [];
        $scope.roomimagesuser.hide();
    }

    $scope.$on('modal.shown', function(e, m) {
        // Execute action
        if(m == $scope.roompubview)
            $scope.$broadcast('PubViewEvent', $scope.publishCreds);
		else if(m == $scope.publisherconfiguration) 
			hwconfig();
    });

    $scope.$on('modal.hidden', function(e, m) {
                // Execute action
        if(m == $scope.roompubview)
            $scope.$broadcast('PubViewOffEvent');
		else if(m == $scope.publisherconfiguration) {
			var as = hwcomponent.audioSource();
			if(as !== undefined) {
				//alert(angular.toJson(as));
				$scope.inputDevicesAudio.forEach(function (device) {
					if(device.did === as.deviceId) {
						$scope.media.inputAudioDeviceSel = device;
						//break;
					}
				});
			}
			
			var vs = hwcomponent.videoSource();
			if(vs !== undefined) {
				
				$scope.inputDevicesVideo.forEach(function (device) {
					if(device.did === vs.deviceId) {
						$scope.media.inputVideoDeviceSel = device;
						//break;
					}
				});
			}
			hwcomponent.destroy();
			hwcomponent = null;
			$scope.roompublish();
		}
          
    });



    /*for(var i = 0; i < 4; i++) {
        var user = {};
        user.u = "User" + i;
        user.imageURL = 'img/oculora.png';
        //alert(user.imageURL);
        $scope.activeSubs.push(user);
    }*/

    /*$scope.$on("PubItem", function(event, item) {
                            //alert(tp);
                  //$scope.startPublish(d);
        //for(var i = 0; i < items.length; i++)
			$scope.$apply(function () {
              $scope.activeSubs.push(item);
          });
            
    });

    $scope.optionClicked = function(idx) {
        //alert(idx);
		
        $scope.$broadcast('PubItemOption', idx);
    }*/
});

