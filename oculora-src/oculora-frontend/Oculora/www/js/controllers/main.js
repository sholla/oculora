
OculoraApp.controller('MainCtrl', function($scope, $rootScope, $ionicPlatform, $ionicModal, $q, $ionicPopup, $ionicPopover, $timeout, Upload, $ionicSlideBoxDelegate, $ionicActionSheet, $ionicLoading, $cordovaCamera, $cordovaDialogs, OculoraProfileRetrieve, OculoraCredits) {
               //alert("ok");
    $rootScope.initComplete = false;
	$scope.buyChoices = {};
    //$scope.buyRequests = [];
    $scope.skuDetails = [];
    //$scope.updatedCredit = 0;
    $scope.currentCredit = -1;
    $scope.paymentsTrackState = {};
    $scope.pageTitle = "Oculora";
	//$scope.OculoraStorageFS = null;
	
    var paymentsclass = "button button-clear button-small icon ion-cash ";
            //"ok credit", "warning credit", "no credit"
    var paymentsBtnStatesClass = ["button-balanced", "button-energized", "button-assertive"];
    $scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[0];
    /*$scope.chatWindowBaseClass = "item";
    $scope.chatWindowSourceClass = [" itemright", " itemleft"];
    $scope.chatWindowClass = $scope.chatWindowBaseClass + $scope.chatWindowSourceClass[Oculora_ThisUser];*/

    $ionicPopover.fromTemplateUrl('templates/extprofile.html', {
            scope: $scope
        }).then(function(modal) {
                $scope.extprofilemodal = modal;
    });
	$ionicPopover.fromTemplateUrl('templates/popup-payments.html', {
                    scope: $scope
                }).then(function(modal) {
                    $scope.popuppayments = modal;
                });

	/*var setupStorage = function() {
		window.requestFileSystem(window.TEMPORARY, 5*1024*1024 , $scope.onInitFs, $scope.FSerrorHandler);
	}
	
	$scope.onInitFs = function(fs) {
		//alert('Opened file system: ' + fs.name);
		$scope.OculoraStorageFS = fs;
		
	}*/
	
	/*$scope.FSerrorHandler = function(e) {
		  var msg = '';

		  switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			  msg = 'QUOTA_EXCEEDED_ERR';
			  break;
			case FileError.NOT_FOUND_ERR:
			  msg = 'NOT_FOUND_ERR';
			  break;
			case FileError.SECURITY_ERR:
			  msg = 'SECURITY_ERR';
			  break;
			case FileError.INVALID_MODIFICATION_ERR:
			  msg = 'INVALID_MODIFICATION_ERR';
			  break;
			case FileError.INVALID_STATE_ERR:
			  msg = 'INVALID_STATE_ERR';
			  break;
			default:
			  msg = 'Unknown Error';
			  break;
		  };

		alert('Error: ' + msg);
	}*/

   $scope.slideChanged = function (index) {
           //$scope.slideIndex = index;
           //alert("index:" + index);
           switch(index) {

           case 0:
                $scope.$broadcast("OnFocusHome");
              break;
           case 1:
                $scope.$broadcast("OnFocusUsersRooms");
                break;

           /*case 2:
                $scope.$broadcast("OnFocusPage3");
                break;*/

           case 2:

                $scope.$broadcast("OnFocusSubscriberView");
                break;

           case 3:
                $scope.$broadcast("OnFocusProfile");
                break;
           }
   };

   $scope.showScreens = function() {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: 'Home' },
          { text: 'My Rooms' },
          { text: 'Subscribe' },
          //{ text: 'Active Subscribe' },
          { text: 'Profile' }
        ],

        titleText: 'Available Screens',

        cancel: function() {
             // add cancel code..
           },
        buttonClicked: function(index) {
           $ionicSlideBoxDelegate.slide(index);

           return true;
        }
      });
   }
   $scope.notifyInfo = false;
	$scope.userState = "";
	$scope.userInfo = null;
	$scope.notifyInfoTimer = null;
	$scope.ackUserState = function() {
		if(($scope.notifyInfoTimer !== undefined) && ($scope.notifyInfoTimer != null)) {
			  $timeout.cancel($scope.notifyInfoTimer);
			  $scope.notifyInfoTimer = null;
		   }
		$scope.notifyInfo = false;
		$scope.userInfo = null;
	}
   $scope.showUserState2 = function(item, appear) {
        $scope.userState = (appear != true ? "Dropped" : "Entered");
        
        
		$scope.userInfo = item;
		$scope.notifyInfo = true;
        $scope.notifyInfoTimer = $timeout(function() {
             $scope.ackUserState();
        }, 1000*Oculora_PublishSelectTimeout);
   }
   
   

   $scope.roomuser = function(item, $event) {

       if($event != null) $scope.roomCardFlipSupp($event);
       var ret = $scope.builduser(item, ($event != null ? true: false));
       if($event != null) $scope.extprofilemodal.show($event);
	   else return ret;
           
   }

   $scope.builduser = function(item, inShow) {
       var user = new OculoraProfileRetrieve();
       user[FieldNames.uid] = item[FieldNames.uid];
	   //alert("item: " + angular.toJson(item));
       return $scope.getUser(user, inShow).then();
   }

   $scope.getUser = function(user, inShow) {
       var q = $q.defer();

       var user1 = angular.copy(user);
       $ionicLoading.show({
           template: 'Connecting...'
       });

       user.$save({}, function(resObj, st) {
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
                           var res1 = $scope.getUser(user1).then();
                           q.resolve(res1);
                       }
                       else
                            q.resolve(resObj);
                           //navigator.app.exitApp();

                   });
           }
           else {
               //$scope.access = angular.fromJson(resObj.message);
               var res2 = angular.fromJson(resObj.message);
               //alert(JSON.stringify(res2));
               //$rootScope.profile[FieldNames.id] = res2[FieldNames.id];
               //$scope.userprofileedit2();
               if(inShow != false) {
                   $scope.extprofile = { imageURL: res2.imageFile != null ? OculoraURLs.HostAddress + res2.imageFile:"img/oculora.png", fullName: res2.fn, nickName: res2.nn, tags: res2.tags};

                   //alert(angular.toJson(user));
                   q.resolve(res2);
               }
               else
                   q.resolve(res2);


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
                           var res1 = $scope.getUser(user1).then();
                           q.resolve(res1);
                       }
                       else
                            q.resolve(st);
                           //navigator.app.exitApp();

               });
       });
       return q.promise;
   }

   $scope.$on("LoginEvent", function(event, prof) {
       $rootScope.profile = prof;
       $scope.initComplete = true;
   });

   $scope.doMoreRefresh = function(items) {
        if($rootScope.initComplete != true) {
            return false;
        }
        if(((items.length % Oculora_PageNumItems) > 0) || (items.length < Oculora_PageNumItems)) {
                   return false;
        }
        return true;
   }
   $scope.doRefresh = function(tp, items, hdlr) {

       if($rootScope.initComplete != true) {
       //alert("1o");
            if(tp == 1) $scope.$broadcast('scroll.infiniteScrollComplete');
            if(tp == 0) $scope.$broadcast('scroll.refreshComplete');
            return;
       }
       // return;
       /*if(tp == 1) {
            if(hdlr) hdlr();
            $scope.$broadcast('scroll.infiniteScrollComplete');
            return;
       }*/
       if(items == null)
            return;
       if(tp == 1) {
            if(((items.length % Oculora_PageNumItems) > 0) || (items.length < Oculora_PageNumItems)) {

               if(tp == 1) $scope.$broadcast('scroll.infiniteScrollComplete');
                           if(tp == 0) $scope.$broadcast('scroll.refreshComplete');
               return;
            }
       }

       hdlr((tp == 1 ? false : true));
       if(tp == 1) $scope.$broadcast('scroll.infiniteScrollComplete');
       if(tp == 0) $scope.$broadcast('scroll.refreshComplete');
                       //alert("ok");
       //$timeout( function() {
       //    $scope.$broadcast('scroll.infiniteScrollComplete');
           //Stop the ion-refresher from spinning
           //$scope.$broadcast('scroll.refreshComplete');
       //}, 1000);
   }



   $scope.sortAction = function(hdlr) {

        hdlr(true);
   }

   $scope.$on("NotificationMessage", function(event, msg) {
        //alert(angular.toJson(msg));
		var msg2 = angular.fromJson(msg);
        var msg1 = msg2.payload.msg;
		//alert(angular.toJson(msg1));
		if((msg1[FieldNames.RoomImage] === undefined) || (msg1[FieldNames.RoomImage] == null) )
			msg1[FieldNames.RoomImage] = "img/oculora.png";
		if((msg1[FieldNames.profileimage] === undefined) || (msg1[FieldNames.profileimage] == null) )
			msg1[FieldNames.profileimage] = "img/oculora.png";
		//alert(angular.toJson(msg));
		//return;
        if((msg1 != undefined) && (msg1.viewMode == Oculora_StreamType.StreamType_Publish)) {
			$scope.currentMessage = msg1;
            //notify user/publisher of a message from a subscriber - decline message
            $scope.$broadcast("NotifyPubOfSub");
            return;
        }
        //msg1.ri = OculoraURLs.HostAddress + msg1.ri;
        //msg1.imageFile = OculoraURLs.HostAddress + msg1.imageFile;
		
		$scope.currentMessage = msg1;
        //alert(angular.toJson($scope.currentMessage));
        var myPopup = $ionicPopup.show({
            templateUrl: 'templates/popup-notify.html',
            title: 'Room Publish Notification',
            //subTitle: 'Please use normal things',
            scope: $scope,
            buttons: [
              {
                  text: '<b>Reject</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                    //save the response on server
                  }
              },
              {
                text: '<b>Accept</b>',
                type: 'button-positive',
                onTap: function(e) {
                    //launch the fullscreen room view with this room
                    //$scope.inNotify = true;
                    if($ionicSlideBoxDelegate.currentIndex() == 2) {
                        $scope.$broadcast("NotifySub");
                    }
                    else if($ionicSlideBoxDelegate.currentIndex() == 0) {
                        $scope.$broadcast("NotifyPub");
                    }
                    else {
                        alert("in default");
						$scope.$broadcast("NotifySub");
                        $ionicSlideBoxDelegate.slide(2);
                    }

                }
              }
            ]
          });

   });

   $scope.$on("NotifyPubDone", function(event, prof) {
        //alert("in pub done");
		
      $ionicSlideBoxDelegate.slide(2);
	  $scope.$broadcast("NotifySub");
	  
   });
            /*$scope.$on("FullScreenEvent", function(event, d) {
                              $scope.$broadcast('FullScreenEvent', d);
                                                          //$scope.$emit('FullScreenEvent', "fullscreen");

                          });*/
	
	$scope.inputDevicesVideo = [];
	$scope.inputDevicesAudio = [];
	
	$scope.resolutions = [
       {name: "1280x720"},
       {name: "640x480"},
       {name: "320x240"}
   ];
   //$scope.pubResolution = $scope.pubResolutions[0];
   
   $scope.frameRates = [
       {name: "30"},
       {name: "15"},
       {name: "7"},
       {name: "1"}
   ];
   //$scope.pubFrameRate = $scope.pubFrameRates[0];
   
   $scope.media = {inputVideoDeviceSel: null, inputAudioDeviceSel: null, resolution: $scope.resolutions[0], frameRate: $scope.frameRates[0], mirror: true};
	//$scope.inputVideoDeviceSel0 = null;
	//$scope.inputAudioDeviceSel0 = null;
   $ionicPlatform.ready(function() {
        //$ionicSlideBoxDelegate.slide(2);
		OT.getDevices(function(err, devices) {
			//alert(angular.toJson(err));
			if(err) {
				alert("Could not get devices for input");
				return;
			}
			//alert(angular.toJson(devices));
			var mediaNames = ["Audio", "Video"];
			var mediaDefinition = " Source #";
			var cntrVideo = 0;
			var cntrAudio = 0;
			devices.forEach(function (device) {
					//alert(angular.toJson(device));
                    if(device.kind == "videoInput") {
						var name = mediaNames[1] + mediaDefinition + cntrVideo++;
						$scope.inputDevicesVideo.push({name: name, did: device.deviceId, lbl: device.label});
					}
					else if(device.kind == "audioInput") {
						var name = mediaNames[0] + mediaDefinition + cntrAudio++;
						$scope.inputDevicesAudio.push({name: name, did: device.deviceId, lbl: device.label});
					}
						

            });
			$scope.$apply(function () {
                if($scope.inputDevicesVideo.length > 1)
					$scope.media.inputVideoDeviceSel = $scope.inputDevicesVideo[1];
				else if($scope.inputDevicesVideo.length == 1)
					$scope.media.inputVideoDeviceSel = $scope.inputDevicesVideo[0];
				else {
					alert("No camera available. Oculora cannot be used without a camera!");
					navigator.app.exitApp();
				}
				
				if($scope.inputDevicesAudio.length > 0)
					$scope.media.inputAudioDeviceSel = $scope.inputDevicesAudio[0];
			//alert(angular.toJson($scope.inputVideoDeviceSel));
			
            });
			
			
	   });
		//setupStorage();
        //$scope.inNotify = false;
        if(Oculora_PayDeploy < 2) {
            google.payments.inapp.getSkuDetails($scope.skuMap[google.payments.inapp.platform], function(details) {
                var skuDetails = angular.fromJson(details);
                for(sku in skuDetails) {
                    $scope.skuDetails[sku.productId] = sku;
                }

            }, function(err) {
                 console.log(JSON.stringify(err));
                 console.log("Failed to get SKU details");}
            );
        }
		else {
			//var cntr = 0;
			$scope.skuMap[google.payments.inapp.platform].forEach(function (sku) {
				var idx = sku.indexOf("_") + 1;
				var title = sku.slice(idx);
				
				var obj = {};
				obj.title = CREDIT_PURCHASE_UNIT*title + " minutes";
				obj.price = title;
				
				$scope.$apply(function () {
					$scope.skuDetails.push(obj);
				});
				
				//cntr++;
            });
		}
		

   });

	/*$scope.clearTmpFile = function(file) {
		file.remove(function() {
			console.log('File removed.');
		}, $scope.FSerrorHandler);
	}*/
	
							
	$scope.fileSelected = function(f, e, tp) {
		 
		if((f != null) && (f.length > 0)) {
			var en = "";
			switch(tp) {
				case 0:
					en = "NewProfileImage";
					break;
				case 1:
					en = "ChangedProfileImage";
					break;
				case 2:
					en = "NewRoomImage";
					break;
			default:
					return;
					
			}
			$scope.$broadcast(en, f[0]);
			
			
		}
	}

   $scope.roomCardFlipSupp = function($event) {
       //alert("ok");
       // Prevent bubbling to showItem.
       // On recent browsers, only $event.stopPropagation() is needed
        if ($event.stopPropagation) $event.stopPropagation();
       //if ($event.preventDefault) $event.preventDefault();
       //$event.cancelBubble = true;
       //$event.returnValue = false;
   }

   $scope.skuMap = {
       "android-play-store": [
            "org.oculora.tamatura.sku_1",
            "org.oculora.tamatura.sku_2",
            "org.oculora.tamatura.sku_3",
            "org.oculora.tamatura.sku_4",
            "org.oculora.tamatura.sku_5",
            "org.oculora.tamatura.sku_8",
            "org.oculora.tamatura.sku_10"
            ],
       "ios-app-store": "com.google.mcaspec.physicalediblecake"
   };

   
   var paymentsState = function() {
        var q = $q.defer();

        var currCred = 0;
		
		
        /*if(Oculora_PayDeploy == 2) {
            if($scope.currentCredit < 0) $scope.currentCredit = (60*2/(30*60));
            q.resolve(true);
        }
        else {*/
			
            $ionicLoading.show({
               template: 'Connecting...'
            });
            OculoraCredits.get({}, function(resObj, st) {
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
                               paymentsState();
                           }
                           else
                                q.resolve(false);
                               //navigator.app.exitApp();

                       });
               }
               else {
                   //$scope.access = angular.fromJson(resObj.message);
                   var res2 = angular.fromJson(resObj.message);
                   
				   $scope.currentCredit = res2[FieldNames.Credits]*CREDITS_MARK;
				   q.resolve(true);


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
                               paymentsState();
                           }
                           else
                                q.resolve(false);
                               //navigator.app.exitApp();

                   });
           });

            /*google.payments.inapp.getPurchases(function(details) {
                for(var i = 0; i < details.details.length; i++) {
                    var resp = angular.fromJson(details.details);
                    if(resp.state == "ACTIVE") {
                        currCred += $scope.skuDetails[details.details.sku];
                    }

                }
                $scope.currentCredit = currCred;
                q.resolve(true);
            }, function(err) {
                 console.log(JSON.stringify(err));
                 console.log("Failed to get purchases details");
                 q.resolve(false);
            });*/
        //}

        return q.promise;
   }



   /*$scope.calculateUpdatedPayments = function() {
        $scope.updatedCredit = 0;
        var totalNewPurchase = 0;
        for(var j = 0; j < $scope.buyRequests.length; j++) {
            if($scope.buyRequests[j].numBuys === undefined)
                continue;
            for(var k = 0; k < $scope.buyRequests[j].numBuys; k++) {

                totalNewPurchase += $scope.skuDetails[j].price;
            }
        }
        $scope.updatedCredit = totalNewPurchase*30;
		alert($scope.updatedCredit);
   }*/

   var _doBuy = function(num) 
   {
	   $q.defer();
	   
		var buy = OculoraCredits();
		buy[FieldNames.Credits] = num;
        buy.$save({}, function(resObj, st) {
               //alert(st);
               
               //var resObj = angular.fromJson(res2);
               if(resObj.result != 2) {
                                //alert(resObj.message);
                   $cordovaDialogs.confirm(resObj.message, "Access Error", ['Exit','Retry'])
                       .then(function(buttonIndex) {
                           // no button = 0, 'OK' = 1, 'Cancel' = 2
                           var btnIndex = buttonIndex;
                           if(btnIndex == 2)
                           {
                               _doBuy(num);
                           }
                           /*else
                                q.resolve(false);*/
                               //navigator.app.exitApp();

                       });
               }
               /*else {
                   //$scope.access = angular.fromJson(resObj.message);
                   var res2 = angular.fromJson(resObj.message);
                   
				   $scope.currentCredit = res2[FieldNames.Credits];
				   q.resolve(true);


               }*/

           }, function(st) {
               //alert("Error in accessing service. Retry");
               
               $cordovaDialogs.confirm("Error in accessing service. Retry", "Access Error", ['Exit','Retry'])
                   .then(function(buttonIndex) {
                       // no button = 0, 'OK' = 1, 'Cancel' = 2
                           var btnIndex = buttonIndex;
                           if(btnIndex == 2)
                           {
                               _doBuy(num);
                           }
                           /*else
                                q.resolve(false);*/
                               //navigator.app.exitApp();

                   });
           });
   }
   
   $scope.addPayment = function() {

		if(Oculora_PayDeploy == 2) {
            //alert($scope.buyChoices.sel);
			alert("Not supported");
			$scope.popuppayments.hide();
			return;
        }
        /*var consume = true;
        var totalNewPurchase = 0;
        for(var j = 0; j < $scope.buyRequests.length; j++) {
            if($scope.buyRequests[j].numBuys === undefined)
                continue;
            for(var k = 0; k < $scope.buyRequests[j].numBuys; k++) {
                if(Oculora_PayDeploy == 2) {
                    totalNewPurchase += $scope.skuDetails[j].price;
                }
                else {
                    google.payments.inapp.buy({
                          sku: $scope.skuMap[google.payments.inapp.platform][j],
                          consume: consume,
                          success: function() {
                            console.log('success');
							_doBuy($scope.skuDetails[j].price);
                            $scope.currentCredit += $scope.skuDetails[j].price*30;
							totalNewPurchase += $scope.skuDetails[j].price*30;
                            //Increment the stored value declaring how many of this
                            //particular item the user owns.
                             //
                            //window.storage["credits." + sku] += 1

                          },
                          failure: function(err) {
                            console.log('buy/consume failure' + JSON.stringify(err));
                            //alert("Fail :(\n\n" + JSON.stringify(arguments));
                          }
                    });
                }
            }

        }*/
		google.payments.inapp.buy({
		  sku: $scope.skuMap[google.payments.inapp.platform][$scope.buyChoices.sel],
		  consume: true,
		  success: function() {
			console.log('success');
			_doBuy($scope.skuDetails[$scope.buyChoices.sel].price);
			$scope.currentCredit += $scope.skuDetails[$scope.buyChoices.sel].price*CREDIT_PURCHASE_UNIT;
			//totalNewPurchase += $scope.skuDetails[$scope.buyChoices.sel].price*30;
			$scope.buyChoices = {};
			$scope.buyChoices.sel = 0;
			
			/* Increment the stored value declaring how many of this
			 * particular item the user owns.
			 */
			//window.storage["credits." + sku] += 1
			if(($scope.paymentsTrackState != null) && (totalNewPurchase > 0)){
				$scope.paymentButtonClassTracker($scope.paymentsTrackState.periodicCB, $scope.paymentsTrackState.warningCB, $scope.paymentsTrackState.expiredCB)
			}
			$scope.popuppayments.hide();
			$scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[1];
		  },
		  failure: function(err) {
			console.log('buy/consume failure' + JSON.stringify(err));
			var errObj = angular.fromJson(err);
			
			var confirmPopup = $ionicPopup.confirm({
				title: 'Payments error',
				template: errObj.response.details.errorText + '\n   Retry?'
			});
			confirmPopup.then(function(res) {
				if(res) {
					$scope.addPayment();
				} else {
					$scope.buyChoices = {};
					$scope.buyChoices.sel = 0;
					$scope.popuppayments.hide();
				}
			});
			//alert("Fail :(\n\n" + JSON.stringify(arguments));
		  }
	});
        //if(Oculora_PayDeploy == 2) 
			//$scope.currentCredit = totalNewPurchase;
		
        
   }

   var trackPayment = function(periodicCB, warningCB, expiredCB) {
        //var q = $q.defer();

        //var ret = {ret: -1, tmr: null};
        /*var payState = paymentsState().then();
        if(!payState) {
            //q.resolve(ret);
			expiredCB();
            return ;
        }*/

        //if((queryOnly != false) && ($scope.currentCredit < 1))
            //$scope.currentCredit = 0; //adjust for a user completing before the 1 min slot. but we round off per minute
		var tmOut = 60;
        if($scope.currentCredit == 0)
        {
//alert("track1");
            /*if(queryOnly != true)*/ expiredCB();
            //ret.ret = 0;
            //q.resolve(ret);
            return ;
        }
        else if(($scope.currentCredit <= CREDITS_WARN_THRESHOLD ) && ($scope.currentCredit > CREDITS_WARN_THRESHOLD/2 ))
        {
            //if(queryOnly != true) {
                
                tmOut = 30;
                $scope.currentCredit = 0.5;
            //}

            //ret.ret = 1;
        }
		else if($scope.currentCredit <= CREDITS_WARN_THRESHOLD/2 ) {
			warningCB();
			$scope.currentCredit = 0;
		}
        else {
			$scope.currentCredit = $scope.currentCredit - CREDITS_MARK;
            //ret.ret = 2;
            //if(queryOnly != true) {
                /*if($scope.currentCredit  <= CREDITS_WARN_THRESHOLD ) {
                    tmOut = 30;
                    $scope.currentCredit = $scope.currentCredit - CREDITS_WARN_THRESHOLD/2;
                    //alert("1:" + tmOut);
                }
                else {
                    if($scope.currentCredit <= CREDITS_WARN_THRESHOLD*2) {
                        tmOut = 30;
                        $scope.currentCredit = CREDITS_WARN_THRESHOLD/2;
                        //alert("2A:" + tmOut);
                    }
                    else {
                        $scope.currentCredit = $scope.currentCredit - CREDITS_MARK;
                        //alert("2B:" + tmOut);
                    }
                }*/
            //}

        }
		//alert($scope.currentCredit);
        //if(queryOnly != true) {

            var tmr = $timeout( function() {
                        //alert($scope.currentCredit);
                        var tmr2 = trackPayment(periodicCB, warningCB, expiredCB, false)  ;
                        //ret = tmr2;
                        $scope.paymentsTrackState.paymentTmr = tmr2;

                        //q.resolve(tmr2);

                    }, 1000*tmOut);
            $scope.paymentsTrackState.paymentTmr = tmr;
            //ret.tmr = tmr;
            //$scope.abortPaymentTracker(ret.tmr);
            //q.resolve(ret);
            //alert(angular.toJson(ret));
        //}
        //else q.resolve(ret);

        //return ret;
        //return q.promise;

   }

   var abortPaymentTracker = function(tmr) {
        $timeout.cancel(tmr);
   }

   $scope.paymentStateSetup = function() {
		//if($scope.currentCredit < 0) {
					
			$ionicLoading.show({
				template: 'Getting payment status...'
			});
			paymentsState().then(function(res) {
				$ionicLoading.hide();
				
				var st = 0;
				if((!res) || ($scope.currentCredit <= 0) ){
					st = 2;
				}
				else if($scope.currentCredit <= (CREDITS_WARN_THRESHOLD/2) )
					st = 1;
				$scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[st];
				//alert(st);
				
			});
		//}
	   
   }
   
   $scope.paymentButtonClassTracker = function(periodicCB, warningCB, expiredCB) {
        //var q = $q.defer();

        //var paymentsclass = "button button-clear button-small icon ion-videocamera ";
        //"ok credit", "warning credit", "no credit"
        //var paymentsBtnStatesClass = ["button-balanced", "button-energized", "button-assertive"];
       // var res = $scope.paymentsclass + $scope.paymentsBtnStatesClass[0];
	   //alert(1);
	   /*if($scope.currentCredit < 0) {
			$ionicLoading.show({
               template: 'Getting payment status...'
            });
			$scope.paymentsState().then(function(res) {
				$ionicLoading.hide();
				if(!res) {
				//q.resolve(ret);
					expiredCB();
					return ;
				}
				//alert($scope.currentCredit);
				$scope.paymentButtonClassTracker(periodicCB, warningCB, expiredCB);
			});
			return;
	   }*/
	   if($scope.currentCredit == 0) {
		   expiredCB();
			return ;
	   }
	    $scope.abortPaymentTrackerModel();
        $scope.paymentsTrackState = {periodicCB: periodicCB, warningCB: warningCB, expiredCB: expiredCB};
        trackPayment(function() {
			
            if(periodicCB)
                periodicCB();
            
        },function() {
			
            if(warningCB)
                warningCB();
            $scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[1];
            //alert(angular.toJson(ret.tmr));
            //$scope.paymentsTrackState.paymentTmr = ret.tmr;
            //$scope.abortPaymentTrackerModel();
            //q.resolve(paymentsclass + paymentsBtnStatesClass[1]);
        }, function() {
            if(expiredCB)
                expiredCB();
            //q.resolve(paymentsclass + paymentsBtnStatesClass[2]);
            $scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[2];
            //alert(angular.toJson(ret.tmr));
            //$scope.paymentsTrackState.paymentTmr = ret.tmr;
        });
        //alert(angular.toJson(ret));
        //if(queryOnly != false)
            //return ret;
        /*switch(ret.ret) {
            case -1:
                $scope.paymentsTrackState = null;
                //q.resolve(null);
                $scope.paymentsCurrentState = null;
            case 0:
                $scope.paymentsTrackState.paymentTmr = ret.tmr;
                //q.resolve(paymentsclass + paymentsBtnStatesClass[2]);
                $scope.paymentsCurrentState = $scope.paymentsclass + $scope.paymentsBtnStatesClass[2];
                break;
            case 1:
                $scope.paymentsTrackState.paymentTmr = ret.tmr;
                //q.resolve(paymentsclass + paymentsBtnStatesClass[1]);
                $scope.paymentsCurrentState = $scope.paymentsclass + $scope.paymentsBtnStatesClass[1];
                break;
            case 2:
                //q.resolve(paymentsclass + paymentsBtnStatesClass[0]);
                $scope.paymentsCurrentState = $scope.paymentsclass + $scope.paymentsBtnStatesClass[0];
                break;
        }
        //$scope.paymentsCurrentState = res;
        //return q.promise;*/
        //return res;
   }

   $scope.abortPaymentTrackerModel = function() {
       if(($scope.paymentsTrackState != null) && ($scope.paymentsTrackState.paymentTmr != null)){
            //alert("foo");
            abortPaymentTracker($scope.paymentsTrackState.paymentTmr);
            $scope.paymentsTrackState = {};
       }
   }

   $scope.showPaymentsDialog = function(ev) {
		//alert("ok");
        $scope.buyChoices = {};       
		$scope.buyChoices.sel = 0;
        $scope.popuppayments.show(ev);

                /*$scope.paymentsState().then(function(res) {
                    if(res) {
                        alert("b");
                        $scope.popuppayments.show();
                        alert("a");
                    }

                });*/

           }
   $scope.dismissPaymentsDialog = function() {
	   $scope.buyChoices = {};
	   $scope.buyChoices.sel = 0;
	   $scope.popuppayments.hide();
   }
});

