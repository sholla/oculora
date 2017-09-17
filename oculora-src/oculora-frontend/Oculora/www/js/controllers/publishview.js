

OculoraApp.controller('PubViewCtrl', function($scope, $rootScope, $ionicPlatform, $ionicModal, $ionicPopover, $timeout, $http, $q, $ionicActionSheet, $cordovaDialogs, $ionicLoading, Upload, $cordovaMedia, OTSessionMain, OTSessionSideband, OculoraSubscribeSession, OculoraEndSession) {

    //$scope.streams = OTSessionSideBand.streams;
    //$scope.connections = OTSessionSideBand.connections;
    $scope.pageTitle = "Oculora - Publishable";
    $scope.subscribers = [];

    $scope.publishing = false;
    $scope.inPubPays = false;


    $scope.connected = false;
    //$scope.publisherVideoMuted = false;
    $scope.activeUserIdx = -1;
    $scope.inStopButtonEnd = false;
    //$scope.requestedSelect = { imode: -1, idx: -1};

    //$scope.chatWindow = false;
    //$scope.voiceWindow = false;
    //$scope.chat = {};
      //$scope.chat.msg = "";
    //$scope.chat.msgs = [];
    //$scope.image = null;
    //$scope.doChat = false;
    //$scope.activeSubs = [];
    $scope.activeSubsChatted = [];
	//$scope.moreOptions = false;
	$scope.newSub = null;
	$scope.notifyAction = false;
	$scope.newSubTimer = null;
	
    $scope.subsclass = "button button-clear icon ion-person-stalker ";

    $scope.subsclassresult = $scope.subsclass + Oculora_SignalClass[0];

	
	
	$ionicModal.fromTemplateUrl('templates/roomsactivesubs.html', {
        scope: $scope
    }).then(function(modal) {
            $scope.roomsactivesubs = modal;
    });
	
	$scope.showSubs = function(ev) {
		//alert($scope.subscribers[0].subInfo.nn);
		$scope.roomsactivesubs.show();
	}
	
	$scope.subslist = {viewmode:2};
	$scope.subsviewmodefilter = function(el, idx, arr) {
		if($scope.subslist.viewmode == 1) {
			return el.subInfo.fv === undefined;
		}
		else if($scope.subslist.viewmode == 0) {
			return el.subInfo.fv !== undefined;
		}
		return true;
	}
	$scope.subsviewenable = function(item) {
		return item.subInfo.fv === undefined;
	}
	$scope.runSub = function(idx) {
		//alert($scope.subscribers[0].subInfo.nn);
		//alert($scope.subscribers[idx].subInfo.fv);
		//return;
		if($scope.subscribers[idx].subInfo.fv === undefined) {
			$scope.roomsactivesubs.hide();
			$scope.pubItemOption(idx, false);
		}
		
	}
	
    $scope.$on("PubViewEvent", function(event, d) {
                  //alert(d);
                  //alert($scope.otSessMain.publishers.length);
				  /*$scope.canvas = new fabric.Canvas('c', {
    isDrawingMode: true
  });
  //alert($scope.canvas);
  $scope.canvas.freeDrawingBrush.color = "#ffff80";*/

        $scope.startPublish(d);
    });

    //$scope.otSessMain = OTSessionMain;

    $scope.$on("PubViewOffEvent", function() {
                      //alert(d);
            if($scope.inStopButtonEnd != false) {
                $scope.inStopButtonEnd = false;
                return;
            }
            var pubItem = new OculoraEndSession();
            pubItem[FieldNames.id] = $scope.publishItem[FieldNames.id];
                                            //pubItem[FieldNames.uid] = item[FieldNames.uid];
            pubItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Publish;
            $scope.endSession(pubItem);
        });

    /*$scope.$on("NotifyPub", function(event) {
                                      //alert(d);
        $scope.roompublishend(true).then(function(res) {
            if(res)
                $scope.$broadcast("NotifyPubDone");
        });

    });*/

    $scope.$on("NotifyPubOfSub", function(event) {
                //show the notification of subscriber declined message

    });
	$scope.$on("NotifyPlayPub", function(event) {
                //show the notification of subscriber declined message
		//alert("NotifyPlayPub");
		$scope.roompublishend(false, function() {
			$scope.$emit("NotifyPubDone");
		});
    });
    

    

    var facePublisherPropsHD = {
        //name: 'face',
		audioFallbackEnabled: "false",
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off'
        },
        resolution: '1280x720',
        frameRate: '30',
		showControls: false,
		subscribeToAudio : false
		//videoSource : ""
		//frameRate: 
		//mirror:
		//resolution:
      },
        facePublisherPropsSD = {
          //name: 'face',
          width: '100%',
          height: '100%',
          style: {
            nameDisplayMode: 'off'
          }
        };

      /*$scope.togglePublish = function(publishHD) {
        if (!$scope.publishing) {
            $scope.facePublisherProps = publishHD ? facePublisherPropsHD : facePublisherPropsSD;
        }
        $scope.publishing = !$scope.publishing;
      };*/

      $scope.facePublisherProps = angular.copy(facePublisherPropsHD);
	  /*$scope.inputDevicesVideo = [];
	  $scope.inputDevicesAudio = [];
	   $ionicPlatform.ready(function() {
		   OT.getDevices(function(err, devices) {
			//alert(angular.toJson(err));
			if(err) {
				alert("Could not get devices for input");
				return;
			}
			//alert(angular.toJson(devices));
			
			devices.forEach(function (device) {
                    if(device.kind == "videoInput")
						$scope.inputDevicesVideo.push({did: device.deviceId, lbl: device.label});
					else if(device.kind == "audioInput")
						$scope.inputDevicesAudio.push({did: device.deviceId, lbl: device.label});

            });
			if($scope.inputDevicesVideo.length > 0)
				$scope.facePublisherProps.videoSource = $scope.inputDevicesVideo[1].did;
			else if($scope.inputDevicesVideo.length == 1)
				$scope.facePublisherProps.videoSource = $scope.inputDevicesVideo[1].did;
			else {
				alert("No camera available. Oculora cannot be used without a camera!");
				navigator.app.exitApp();
			}
			if($scope.inputDevicesAudio.length > 0)
				$scope.facePublisherProps.audioSource = $scope.inputDevicesAudio[0].did;
	   });
	
			
			//alert(angular.toJson($scope.facePublisherProps));
		}); */
		
	var interactPublisherPropsTemplate = {
          //name: 'interact',
          publishVideo: false,
		  subscribeToVideo : false,
		  videoSource: null,
		  //showControls: false,
          style: {
            nameDisplayMode: 'off', audioLevelDisplayMode : "on", videoDisabledDisplayMode: 'off'
          }
        };
	$scope.interactPublisherProps = angular.copy(interactPublisherPropsTemplate);
		
	
	
	
	
	$scope.$on("otPublisherError", function(event, err) {
                          //alert(d);

        //alert(angular.toJson(err));
		$scope.roompublishend(false);
    });
	
      $scope.sidebandPublish = function(fullview, sideband) {
		  
		  $scope.interactPublisherProps = angular.copy(interactPublisherPropsTemplate);
		  $scope.showWhiteboard = false;
        var subInfo = sideband[FieldNames.SubInfo];
        if(fullview != true) {
            //var subInfo = $scope.builduser(sideband, false);
			//alert("fv false");
            $scope.showUserState2(subInfo, true);
            //return subInfo;
            return;
        }

        var roomAccess = sideband[FieldNames.RoomAccessPub];
        if(roomAccess[FieldNames.RoomSessId] === undefined) {
                    return;
        }
        if(Oculora_OpentokDeploy != true) {
            return;
        }
        var subscriber = OTSessionSideband.getSideband();
        subscriber.init($rootScope.access[FieldNames.apiKey], roomAccess[FieldNames.RoomSessId], roomAccess[FieldNames.RoomToken], function(err, session) {
			//alert("side sess");
            subscriber.sidebandsession = session;
			
            var connectDisconnect = function(connected) {
            $scope.$apply(function() {
              subscriber.sidebandconnected = connected;
              if (!connected) {
                //subscriber.subscribing = false;
                //$scope.showUserState(subInfo, false, false);
				$scope.pubItemSelectHandler(false);
				//switchMainAudio(true);
				//alert("finished sb");
				//newSub = {OTSessionSideband: subscriber, streams: subscriber.streams, subInfo: sideband[FieldNames.SubInfo], otsindex: subscriber.sidebandsindex, voiceWindow: true, messages: {}, chatWindow: {active: false, emsg: "", msgs: []}};
              }
            });
            };
            if ((subscriber.sidebandsession.is && subscriber.sidebandsession.is('connected')) || subscriber.sidebandsession.connected) {
                connectDisconnect(true);
            }
            subscriber.sidebandsession.on('streamCreated', function(event) {

                if(event.stream.connection.connectionId !== subscriber.sidebandsession.connection.connectionId) {
                    if( subscriber.idx == $scope.activeUserIdx) {
                        //subscriber started publishing that this publisher asked to communicate with has accepted. indicate so
                        //$scope.showUserState(subInfo, true);
                        // cancel the timer
                        $scope.pubItemSelectHandler(true);
                    }
                    else {
                        //notify the user of a subscriber wanting to communicate
                        //var subInfo = $scope.browsesub[event.connection.connectionId];
                        /*var titleText = "<img src='%%%IMG%%%' height='50px' width='50px'></img><h2>%%%NAME%%%</h2><br></br><h4>Wants to communicate</h4>";
                        var r1 = titleText.replace("%%%IMG%%%", subInfo[FieldNames.profileimage]).replace("%%%NAME%%%", subInfo[FieldNames.nickName]);
						titleText = r1;
                                // Show the action sheet
                                var hideUserCommSheet = $ionicActionSheet.show({
                                    buttons: [
                                              { text: 'Accept' }
                                            ],
                                    titleText: titleText,
                                    cancelText: 'Reject',
                                    cancel: function() {
                                        // add cancel code..
                                    },
                                    buttonClicked: function(index) {
                                        //cant really know if remote wants to chat or not. rely on chat messages handler to show the chat window
                                        $scope.pubItemOption(subscriber.idx, true);
                                        return true;
                                    }
                                });
                                $timeout(function() {
                                     hideUserCommSheet();
                                }, 1000*Oculora_PublishSelectTimeout);*/
						//alert("start:" + angular.toJson(newSub.subInfo));
						var my_media = new Media("/android_asset/www/"+ "beep.wav", function() {/*alert("done");*/});
                        my_media.play();
						$scope.$apply(function() {
                      $scope.newSub = newSub;
						$scope.notifyAction = true;
                    });
						
						$scope.newSubTimer = $timeout(function() {
                                     $scope.newSub = null;
						$scope.notifyAction = false;
						//alert("end");
                                }, 1000*Oculora_SubNewPubTimeout);
                    }
                }
                else {
                    //publishers stream i.e. this users stream - can be set only by user setting it in the popover
                    //connectDisconnect.bind(subscriber.sidebandsession, true);
					connectDisconnect(true);
                }
            });
            subscriber.sidebandsession.on('sessionConnected', function(event) {
                //if(event.connection.connectionId !== subscriber.sidebandsession.connection.connectionId)
                    $scope.showUserState2(subInfo, true);
            });
            subscriber.sidebandsession.on('sessionDisconnected', function(event) {
                //if(event.stream.connectionId !== subscriber.sidebandsession.connection.connectionId)
                    //$scope.showUserState(subInfo, true, false);
				//alert("dropped session");
				//connectDisconnect.bind(subscriber.sidebandsession, false);
				connectDisconnect(false);
				
            });
			subscriber.sidebandsession.on('streamDestroyed', function(event) {
                //if(event.stream.connectionId !== subscriber.sidebandsession.connection.connectionId)
                    //$scope.showUserState(subInfo, true, false);
				//alert("dropped stream sb");
				//$scope.closeSideband();
				connectDisconnect(false);
				//alert("dropped stream sb2");
				
				
          //});
				
				
				
            });
			subscriber.sidebandsession.on('connectionDestroyed', function(event) {
				var idx = newSub.OTSessionSideband.idx;
				var sub = $scope.subscribers[idx];
				//alert(sub);
								sub.OTSessionSideband.sidebandsession.disconnect();
								sub.OTSessionSideband.sidebandsession.off();
								$scope.$apply(function () {
              $scope.subscribers.splice(idx, 1);
          });
								
				
			});
            subscriber.sidebandsession.on(Oculora_SignalHandlerMark + Oculora_SignalType.SignalType_Message_Text, function(event) {
				
				if(event.from.connectionId !== subscriber.sidebandsession.connection.connectionId) {
					if( subscriber.idx == $scope.activeUserIdx)
						$scope.handleMessage(event, true);
				}
            });
            subscriber.sidebandsession.on(Oculora_SignalHandlerMark + Oculora_SignalType.SignalType_Message_Image, function(event) {
                if( subscriber.idx == $scope.activeUserIdx)
                    $scope.handleMessage(event, false);
            });

            //subscriber.sidebandpublishing = true;
        });
        var newSub = {OTSessionSideband: subscriber, streams: subscriber.streams, subInfo: sideband[FieldNames.SubInfo], otsindex: subscriber.sidebandsindex, voiceWindow: true, messages: {}, chatWindow: {active: false, emsg: "", msgs: []}};

        //Get User info over REST and populate the below
       // var subInfo = $scope.builduser(sideband, false);
        /*var subInfo = {};
        subInfo[FieldNames.nickName] = "User " + i;
        subInfo[FieldNames.mid] = "User" + i;
        subInfo.imageURL = 'img/oculora.png';
        newSub.subInfo = subInfo;*/
        
		
        //$scope.subscribers.push(newSub);
		//alert($scope.subscribers.length);
        //subscriber.idx = $scope.subscribers.length - 1;
		//$scope.$emit('PubItem', sideband[FieldNames.SubInfo]);
		return newSub;
        //$scope.subscribers[sideband[FieldNames.mid]] = newSub;
        //return null;//flag for main session to not do any notification!
      }

      $scope.getSubInfo = function(uid, roomid, fv) {
            var q = $q.defer();
            var user = new OculoraSubscribeSession();
            user[FieldNames.uid] = uid;
            user[FieldNames.mid] = roomid;
			user[FieldNames.SubscribeBrowse] = !fv;
			//user[FieldNames.SessionInstance] = si;
            //var user1 = angular.copy(user);
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
                               var res1 = $scope.getSubInfo(uid, roomid).then();
                               q.resolve(res1);
                           }
                           else
                                q.resolve(null);
                               //navigator.app.exitApp();

                       });
               }
               else {
                   //$scope.access = angular.fromJson(resObj.message);
                   var res2 = angular.fromJson(resObj.message);
                   //alert(JSON.stringify(res2));
                   //$rootScope.profile[FieldNames.id] = res2[FieldNames.id];
                   //$scope.userprofileedit2();
					//alert(angular.toJson(res2));
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
                               var res1 = $scope.getSubInfo(uid, roomid).then();
                               q.resolve(res1);
                           }
                           else
                                q.resolve(null);
                               //navigator.app.exitApp();

                   });
           });

           return q.promise;
      }
      $scope.startPublish = function(item) {
		/*if(($scope.facePublisherProps.videoSource === undefined) || ($scope.media.dirty != false)){
			$scope.facePublisherProps.videoSource = $scope.media.inputVideoDeviceSel.did;
			if($scope.media.inputAudioDeviceSel != null)
				$scope.facePublisherProps.audioSource = $scope.media.inputAudioDeviceSel.did;
			$scope.media.dirty = false;
			
		}*/
		$scope.facePublisherProps = angular.copy(facePublisherPropsHD);
		$scope.facePublisherProps.videoSource = $scope.media.inputVideoDeviceSel.did;
		$scope.facePublisherProps.audioSource = $scope.media.inputAudioDeviceSel.did;
		$scope.facePublisherProps.resolution = $scope.media.resolution.name;
		$scope.facePublisherProps.frameRate = $scope.media.frameRate.name;
		$scope.facePublisherProps.mirror = $scope.media.mirror;
		//$scope.media.dirty = false;
		//alert(angular.toJson($scope.facePublisherProps));
			//$scope.moreOptions = false;
            $scope.activeUserIdx = -1;
            
            //alert(angular.toJson(ret));
        //alert(JSON.stringify($scope.publishItem));
            if(Oculora_OpentokDeploy != true) {
                $scope.publishing = true;
                return;
            }
			
			//item[FieldNames.RoomToken] = "T1==cGFydG5lcl9pZD00NTI0MzMwMiZzaWc9NDUwNDkyZGE2YjJmMzY0MGMxMjgwMzJmMjZkMjM0YWQ4ZDI1NGQ2Yjpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5USTBNek13TW41LU1UUXpNalExTkRNNU56TTBNSDVsUW1JeVdsQkJRMFZzTlZaSU0wWkhRbmhSYjNoT1ZWZC1VSDQmY3JlYXRlX3RpbWU9MTQzMjU0NTUxMyZub25jZT0wLjQ3MjE1Nzg0NDIwMDgyOTYmZXhwaXJlX3RpbWU9MTQzNTEzNzQ4MyZjb25uZWN0aW9uX2RhdGE9";
            //alert($rootScope.access[FieldNames.apiKey]);
            //alert(item[FieldNames.RoomSessId]);
            //alert(item[FieldNames.RoomToken]);
			$scope.browsesub = {};
			$scope.publishing = true;
			$scope.subscribers = [];
			$scope.activeSubs = [];
			$scope.activeSubsChatted = [];
			//$scope.activeUserIdx = -1;
            OTSessionMain.init($rootScope.access[FieldNames.apiKey], item[FieldNames.RoomSessId], item[FieldNames.RoomToken], function(err, session) {
                //alert("init main: " + angular.toJson(err) + "sess:" + session/*+ " sess:" + angular.toJSON(session)*/);
                $scope.mainsession = session;
				
                
				
                var connectDisconnect = function(connected) {
                    $scope.$apply(function() {
                      $scope.connected = connected;
                      if (!connected) {
                        /*if(OTSessionMain.connections.length == 1) {
                            $scope.publishing = false;
                        }*/
                      }
                    });
                };
                /*if ((mainsession.is && mainsession.is('connected')) || mainsession.connected) {
                    connectDisconnect(true);
                }*/
				
				$scope.mainsession.on('streamCreated', function(event) {
					//alert("M stream audio:" + event.stream.hasAudio);
					//alert("M stream video:" + event.stream.hasVideo);

				
				});
				
                /*$scope.mainsession.on('sessionConnected', function(event) {
                    //connectDisconnect.bind($scope.mainsession, true));
					alert("conn0");
                    if(event.connection.connectionId === $scope.mainsession.connection.connectionId) {
						alert("conn");
                        $scope.publishing = true;
                    }
                });*/
                /*$scope.mainsession.on('sessionDisconnected', function(event) {
                    //connectDisconnect.bind($scope.mainsession, false));
					alert("dropped");
                    if(OTSessionMain.connections.length <= 1) {
                        $scope.$apply(function() {
                            $scope.publishing = false;
                        });
                    }
                    else {
                        if($scope.browsesub[event.connection.connectionId]) {
                            $scope.showUserState($scope.browsesub[event.connection.connectionId], false, true);
                            $scope.browsesub[event.connection.connectionId] = null;
                        }
                    }
                });*/

                $scope.mainsession.on('connectionCreated', function(event) {
					//alert("conn conn");
					//alert(angular.toJson(event.connection.permissions));
                    if((event.connection.permissions.publish == 0) && (event.connection.connectionId !== $scope.mainsession.connection.connectionId)) {
						//alert(event.connection.data);
						var connData = angular.fromJson(event.connection.data);
						if(connData[FieldNames.FullView] != true) {
							
							if(connData[FieldNames.profileimage] == null)
								connData[FieldNames.profileimage] = "img/oculora.png";
							var sub = {subInfo: connData};
							$scope.browsesub[event.connection.connectionId] = sub.subInfo;
							$scope.$apply(function () {
								$scope.subscribers.push(sub);
								sub.subInfo.idx = $scope.subscribers.length -1;
								//sub.fullView = false;
							});
						}
						
						/*if(connData[FieldNames.FullView] != true) {
							var userInfo = $scope.roomuser(connData);
							var sub = {subInfo: userInfo};
							$scope.subscribers.push(sub);
						}*/
						//alert("conn conn2");
                        // sub id, and fullview flag
						/*if(($scope.inPubPays != false) && ($scope.subscribers.length == 0))
							$scope.paymentButtonClassTracker(null, function(){}, function(){
								$scope.roompublishend(false);
								//alert("No credits available. Ending session...");
							});
                        var connData = angular.fromJson(event.connection.data);
                        //get subscriber info and OT keys for the subscriber over REST
                        //alert(connData);
                        $scope.getSubInfo(connData[FieldNames.uid], $scope.publishItem[FieldNames.mid], connData[FieldNames.FullView]).then(function(fullSub) {
							var subInfoObj = angular.fromJson(fullSub[FieldNames.SubInfo]);
							if(subInfoObj[FieldNames.profileimage] == null)
								subInfoObj[FieldNames.profileimage] = "img/oculora.png";
							fullSub[FieldNames.SubInfo] = subInfoObj;
							var sub = $scope.sidebandPublish(connData[FieldNames.FullView], fullSub);
							$scope.subscribers.push(sub);
							sub.OTSessionSideband.idx = $scope.subscribers.length - 1;
							//sub[FieldNames.SessionInstance] = item[FieldNames.SessionInstance];
							fullSub[FieldNames.SubInfo].idx = sub.OTSessionSideband.idx;
							//if(subInfo != null)
							//alert(angular.toJson(fullSub));
							
							//fullSub[FieldNames.SubInfo] = subInfoObj;
							$scope.browsesub[event.connection.connectionId] = fullSub[FieldNames.SubInfo];
							//send the access keys to the subscriber for it to attach
							var subInfoCopy = angular.copy(fullSub);
							subInfoCopy[FieldNames.RoomAccessPub] = null;
							var subInfoJSON = angular.toJson(subInfoCopy);
							//alert(subInfoJSON);
							OTSessionMain.batchSignal(Oculora_SignalType.SignalType_Subscriber, subInfoJSON, event.connection);
						});*/
                        
                    }
                });
				$scope.mainsession.on('connectionDestroyed', function(event) {
					//alert("connection ended: " + angular.toJson(event));
					//alert("dropped");
                    //if(OTSessionMain.connections.length > 0) {
					if(event.connection.connectionId === $scope.mainsession.connection.connectionId) {
						$scope.roompublishend(false);
						return;
					}
                        if($scope.browsesub[event.connection.connectionId] !== undefined) {
							$scope.$apply(function () {
								var idx = OTSessionMain.streams.indexOf(event.stream);
								//$scope.$apply(function () {
									var cntr = 0;
									for(var key in $scope.browsesub) {
										//alert($scope.browsesub[key].idx);
										if(cntr > idx) {
											if($scope.browsesub[key].idx > 0)
												$scope.browsesub[key].idx--;
										}
											
										//alert($scope.browsesub[key].idx);
										cntr++;
									}
									
								//});
								var inf = $scope.browsesub[event.connection.connectionId];
								/*alert(angular.toJson(inf));
								if(inf.fullview !== undefined) {
									inf = inf.subInfo;
								}*/
								//alert(angular.toJson(inf));
								$scope.showUserState2(inf, false);
								var idx = $scope.browsesub[event.connection.connectionId].idx;
								//alert("idx:" + idx + "activeUserIdx:" + $scope.activeUserIdx);
								if(($scope.activeUserIdx >= 0 ) && ( $scope.activeUserIdx == idx) ){
									$scope.subscribers[$scope.activeUserIdx].subscribing = false;
								  //$scope.subscribers[$scope.activeUserIdx].OTSessionSideband.sidebandsession.off();
								  //$scope.subscribers[$scope.activeUserIdx].OTSessionSideband.sidebandsession.disconnect();
									$scope.activeUserIdx = -1;
								}
								var sub = $scope.subscribers[idx];
								if(sub.OTSessionSideband !== undefined)
								{
									sub.OTSessionSideband.sidebandsession.disconnect();
									sub.OTSessionSideband.sidebandsession.off();
								}
								$scope.subscribers.splice(idx, 1);
                            //$scope.browsesub[event.connection.connectionId] = null;
								delete $scope.browsesub[event.connection.connectionId];
							//alert($scope.subscribers.length);
								if(($scope.inPubPays != false) && ($scope.subscribers.length == 0))
									$scope.abortPaymentTrackerModel();
							});
                            
                        }
                    //}
				});
				$scope.mainsession.on(Oculora_SignalHandlerMark + "oculoraSubSelect", function(event) {
				//alert(angular.toJson(event));
					if(event.from.connectionId !== $scope.mainsession.connection.connectionId) {
						//alert(event.from.connectionId);
						if(($scope.inPubPays != false) && ($scope.subscribers.length == 0))
							$scope.paymentButtonClassTracker(null, function(){}, function(){
								$scope.roompublishend(false);
								//alert("No credits available. Ending session...");
							});
                        var connData = angular.fromJson(event.from.data);
                        //get subscriber info and OT keys for the subscriber over REST
                        //alert(connData);
                        $scope.getSubInfo(connData[FieldNames.uid], $scope.publishItem[FieldNames.mid], connData[FieldNames.FullView]).then(function(fullSub) {
							var subInfoObj = angular.fromJson(fullSub[FieldNames.SubInfo]);
							if(subInfoObj[FieldNames.profileimage] == null)
								subInfoObj[FieldNames.profileimage] = "img/oculora.png";
							fullSub[FieldNames.SubInfo] = subInfoObj;
							var sub = $scope.sidebandPublish(connData[FieldNames.FullView], fullSub);
							$scope.subscribers.push(sub);
							sub.OTSessionSideband.idx = $scope.subscribers.length - 1;
							//sub[FieldNames.SessionInstance] = item[FieldNames.SessionInstance];
							fullSub[FieldNames.SubInfo].idx = sub.OTSessionSideband.idx;
							//if(subInfo != null)
							//alert(angular.toJson(fullSub));
							
							//fullSub[FieldNames.SubInfo] = subInfoObj;
							$scope.browsesub[event.from.connectionId] = fullSub[FieldNames.SubInfo];
							//send the access keys to the subscriber for it to attach
							var subInfoCopy = angular.copy(fullSub);
							subInfoCopy[FieldNames.RoomAccessPub] = null;
							var subInfoJSON = angular.toJson(subInfoCopy);
							//alert(subInfoJSON);
							OTSessionMain.batchSignal(Oculora_SignalType.SignalType_Subscriber, subInfoJSON, event.connection);
						});
					}
				});

            });
			//alert("sess created");

      }

     


      $scope.endSession = function(pubItem) {
          var q = $q.defer();
          //var ret = false;
		  
		  if($scope.mainsession) {
			  $scope.publishing = false;
			  $scope.mainsession.disconnect();
			  $scope.mainsession.off();
			  $scope.mainsession = null;
		  }
			
		  if($scope.activeUserIdx >= 0) {
			  $scope.subscribers[$scope.activeUserIdx].subscribing = false;
			  $scope.subscribers[$scope.activeUserIdx].OTSessionSideband.sidebandsession.disconnect();
			  $scope.subscribers[$scope.activeUserIdx].OTSessionSideband.sidebandsession.off();
		  }
		  $scope.activeUserIdx = -1;
		  $scope.subscribers = [];
		  OTSessionSideband.clearSidebandRefs();
		  $scope.showWhiteboard = false;
		  //$scope.moreOptions=false;
          for(var i = 0; i < $scope.activeSubsChatted.length; i++)
            window.localStorage.removeItem($scope.activeSubsChatted[i]);
          $scope.activeSubsChatted = [];

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
                  $cordovaDialogs.confirm(resObj.message, "Access Error", ['Retry'])
                      .then(function(buttonIndex) {
                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                          //var btnIndex = buttonIndex;
                          //if(btnIndex == 2)
                          {
                              var res = $scope.endSession(pubItem1);
							  q.resolve(res);
                          }
                          //else
                              //navigator.app.exitApp();

                      });
              }
              else {
                  //$scope.access = angular.fromJson(resObj.message);
                  //var res2 = angular.fromJson(resObj.message);
                  $scope.publishCreds = null;
                  //$scope.publishItem = null;
                  if($scope.inStopButtonEnd != false)
                    $scope.roompubview.hide();
                  $scope.publishing = false;
                  $scope.abortPaymentTrackerModel();
                  ret = true;
				  q.resolve(ret);
                  //alert(JSON.stringify(res2));
                  //$rootScope.profile[FieldNames.id] = res2[FieldNames.id];
                  //$scope.userprofileedit2();
                  //$scope.extprofile = { imageURL: OculoraURLs.HostAddress + res2.imageFile, fullName: res2.fn, nickName: res2.nn, tags: res2.tags};
                  //$scope.extprofilemodal.show();
              }

          }, function(st) {
              //alert("Error in accessing service. Retry");
              $ionicLoading.hide();
              $cordovaDialogs.confirm("Error in accessing service. Retry", "Access Error", ['Retry'])
                  .then(function(buttonIndex) {
                      // no button = 0, 'OK' = 1, 'Cancel' = 2
                          //var btnIndex = buttonIndex;
                          //if(btnIndex == 2)
                          {

                              var res = $scope.endSession(pubItem1);
							  q.resolve(res);
                          }
                          //else
                              //navigator.app.exitApp();

                  });
          });
          //q.resolve(ret);
          return q.promise;
      }

	  var _roompublishend = function(cb) {
		  var pubItem = new OculoraEndSession();
		  pubItem[FieldNames.id] = $scope.publishItem[FieldNames.id];
		  //pubItem[FieldNames.SessionInstance] = $scope.publishItem[FieldNames.SessionInstance];
		  //pubItem[FieldNames.uid] = item[FieldNames.uid];
		  pubItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Publish;
		  //alert(JSON.stringify(pubItem));
		  $scope.inStopButtonEnd = true;
		  var ret1 = $scope.endSession(pubItem);
		  ret1.then(function(res) {
			//ret = res;
			//alert(res);
			if(cb && res) {
				
				cb();
			}
		  });
	  }
      $scope.roompublishend = function(prompt, cb) {
		  if(prompt != true) {
			  _roompublishend(cb);
			  return;
		  }
			  
		  
        var q = $q.defer();
         var ret = false;
          $cordovaDialogs.confirm("Are you sure you want to end publishing to this room", "Publisher Prompt", ['Cancel','OK'])
              .then(function(buttonIndex) {
                  // no button = 0, 'OK' = 1, 'Cancel' = 2
                  var btnIndex = buttonIndex;
                  if(btnIndex == 2)
                  {
					  _roompublishend();
                      //alert(JSON.stringify(item));
                      //return;
                      
                      //$scope.publishItem = null;
                      //$scope.inStopButtonEnd = true;
                      //$scope.roompubview.hide();
                  }
                                      //else
                                          //navigator.app.exitApp();

          });
          q.resolve(ret);
          return q.promise;
                              //$scope.roomsactivesubs.show($event);
                              //alert($scope.roomsactivesubs);
      }

      /*$scope.test1 = function(ev) {
        alert("swiped");
      }*/

      /*$scope.activeusers = [];
      for(var i = 0; i < 4; i++) {
        var user = {imageURL:'img/oculora.png'};
        $scope.activeusers.push(user);
      }*/



      /*for(var i = 0; i < 4; i++) {
          var user = {};
          user[FieldNames.nickName] = "User " + i;
          user[FieldNames.mid] = "User" + i;
          user.imageURL = 'img/oculora.png';
          //alert(user.imageURL);
          $scope.activeSubs.push(user);
      }*/

      //$scope.$emit('PubItems', $scope.activeSubs);

      //alert($scope.activeusers.length);
      $scope.$on("PubItemOption", function(event, idx) {
                        //alert(tp);
              //$scope.startPublish(d);
              $scope.pubItemOption(idx, false);
          });

      /*$scope.handleSelect = function(event) {
        if (event.from.connectionId !== $scope.session.connection.connectionId) {
            var msg = angular.fromJson(event.data);
            $scope.pubItemSelectHandler(msg);*/
            /*if(msg.action != false) {
                OTSessionSideband.publishers.forEach(function (publisher) {
                    if($scope.requestedSelect.imode == 0)
                        publisher.publishAudio(msg.action);

                });
            }*/

        //}
      //}

      /*$scope.coordinateSelectProtocol = function(tp, idx) {
        $scope.requestedSelect = { imode: tp, idx: idx};
        var newUser = false;
        var curIdx = $scope.activeUserIdx;
        if((curIdx >= 0) && (curIdx != idx) ) {
        //    return;
        //if($scope.activeUserIdx >= 0)
            //var a1 = ((curIdx >= 0) && (curIdx == idx) && (tp == $scope.requestedSelect.imode))
            newUser = true;
            //var cmd = { action: false};
            var cmd = { action: false};
            //switch off this user

            $scope.subscribers[$scope.activeUserIdx].OTSessionSideBand.batchSignal('signal:oculora_select', cmd);
        }
        //switch on idx user now
        var cmd = { imode: tp, action: true};
        $scope.subscribers[idx].OTSessionSideBand.batchSignal('signal:oculora_select', cmd);
        return newUser;
      }*/

      $scope.pubItemWait = function() {
        $cordovaDialogs.confirm("Continue waiting for subscriber to respond?", "Subscriber Response", ['Cancel','Wait'])
            .then(function(buttonIndex) {
                // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if(btnIndex == 2)
                    {
                        $scope.pubWaitTimer = $timeout(function() {
                            $scope.pubItemWait();
                        }, 1000*Oculora_PublishSelectTimeout);
                    }
                    else {
                        //var newMsg = {action: false};
                        $scope.pubItemSelectHandler(false);
                    }
                    return btnIndex;

            });
      }

	  $scope.pubUserInfo = function(item, ev) {
		  //$scope.roomCardFlipSupp(ev);
		  var item1 = {};
		  item1[FieldNames.uid] = item[FieldNames.id] || item[FieldNames.uid]
		  $scope.roomuser(item1, ev);
	  }
	  
	$scope.closeSideband = function()
	{
		//$scope.moreOptions=false;
		if($scope.activeUserIdx >= 0) {
			  $scope.subscribers[$scope.activeUserIdx].subscribing = false;
			  switchMainAudio(true);
		  }
		  $scope.activeUserIdx = -1;
		  $scope.showWhiteboard = false;
	}
	
	var switchMainAudio = function(on) {
		
		OTSessionMain.publishers.forEach(function (publisher) {   
					//var pub = $scope.publishers[$scope.activePub].sideband.OTSessionSideband.sidebandsession.getPublisherForStream(stream);
			publisher.publishAudio(on);
		});
	}
	
	$scope.sidebandOption = function(opts) {
		
		if($scope.subscribers[$scope.activeUserIdx].subscribing != true) 
			$scope.pubItemOption($scope.activeUserIdx, false); //chat should be disabled until we are connected over teh sideband since there is no way to launch chat remote
		else {
			if(opts.c !== undefined) {
				//process chat window
				//$scope.doChat = !$scope.doChat;
				$scope.subscribers[$scope.activeUserIdx].chatWindow.active = !$scope.subscribers[$scope.activeUserIdx].chatWindow.active;
				$scope.pubItemSelectHandler(true);
			}
			if(opts.v !== undefined) {
				$scope.subscribers[$scope.activeUserIdx].voiceWindow = !$scope.subscribers[$scope.activeUserIdx].voiceWindow;
				/*$scope.publishers[$scope.activePub].sideband.OTSessionSideband.publishers.forEach(function (publisher) {             
					publisher.publishAudio($scope.publishers[$scope.activePub].sideband.voiceWindow);
					
                });*/
				/*$scope.publishers[$scope.activePub].sideband.OTSessionSideband.streams.forEach(function (stream) {   
					var pub = $scope.publishers[$scope.activePub].sideband.OTSessionSideband.sidebandsession.getPublisherForStream(stream);
					pub.publishAudio($scope.publishers[$scope.activePub].sideband.voiceWindow);
				});*/
				$scope.subscribers[$scope.activeUserIdx].OTSessionSideband.publishers.forEach(function (publisher) {   
					//var pub = $scope.publishers[$scope.activePub].sideband.OTSessionSideband.sidebandsession.getPublisherForStream(stream);
					publisher.publishAudio($scope.subscribers[$scope.activeUserIdx].voiceWindow);
				});
				$scope.subscribers[$scope.activeUserIdx].OTSessionSideband.streams.forEach(function (stream) {   
					var subObjs = $scope.subscribers[$scope.activeUserIdx].OTSessionSideband.sidebandsession.getSubscribersForStream(stream);
					subObjs.forEach(function (sub) {  
						sub.subscribeToAudio($scope.subscribers[$scope.activeUserIdx].voiceWindow);
					});
				});
			}
			
		}
	}
      $scope.pubItemOption = function(idx, accept) {

		/*alert("index: " + idx + " type: " + inChat);
		//alert(angular.toJson($scope.subcribers[idx].subInfo));
		return;*/
		
        var curIdx = $scope.activeUserIdx;
        if(curIdx == idx) {
           return;
        //if($scope.activeUserIdx >= 0)
            //var a1 = ((curIdx >= 0) && (curIdx == idx) && (tp == $scope.requestedSelect.imode))

            //var cmd = { action: false};
            //switch off interactions for this user first locally
            //first save the users chat session for reciver later in the session if needed
            /*if($scope.chatWindow != false) {
                if($scope.chat.msgs.length > 0) {
                    var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;

                    window.localStorage[var1[FieldNames.mid]] = angular.toJson($scope.chat.msgs);
                    //alert(JSON.stringify(window.localStorage[var1[FieldNames.mid]]));
                    $scope.chat.msgs = [];
                }
                //$scope.chatWindow = false;
            }*/

            /*//now switch off audio
            if($scope.voiceWindow != false) {
                //now switch off audio
                $scope.subscribers[$scope.activeUserIdx].OTSessionSideBand.publishers.forEach(function (publisher) {

                    publisher.publishAudio(false);

                });
                $scope.subscribers[$scope.activeUserIdx].OTSessionSideBand.streams.forEach(function (stream) {
                    subscribers = $scope.subscribers[$scope.activeUserIdx].OTSessionSideBand.sidebandsession.getSubscribersForStream(stream);
                    subscribers.forEach(function (subscriber) {
                        if (subscriber) {
                          subscriber.subscribeToAudio(false);
                        }
                    }
                });
            }
            var cmd = { action: false};
            //switch off this user
            $scope.subscribers[$scope.activeUserIdx].OTSessionSideBand.batchSignal('signal:oculora_select', cmd);*/
        }
        /*//switch on idx user now
        if(tp == $scope.requestedSelect.imode) {
            //switch off this interact mode then
            if($scope.chatWindow != false) {
                if($scope.chat.msgs.length > 0) {
                    var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;

                    window.localStorage[var1[FieldNames.mid]] = angular.toJson($scope.chat.msgs);
                    //alert(JSON.stringify(window.localStorage[var1[FieldNames.mid]]));
                    $scope.chat.msgs = [];
                }
                $scope.chatWindow = false;
            }
            $scope.subscribers[$scope.activeUserIdx].sidebandpublishing = false;

        }*/
        //switch off this user now
        
        //$scope.doChat = inChat;
		if(($scope.newSubTimer !== undefined) && ($scope.newSubTimer != null)) {
			  $timeout.cancel($scope.newSubTimer);
			  $scope.newSubTimer = null;
		   }
		$scope.newSub = null;
		$scope.notifyAction = false;
		//alert($scope.activeUserIdx);
		if($scope.activeUserIdx >= 0)	$scope.subscribers[$scope.activeUserIdx].subscribing = false;
		$scope.activeUserIdx = idx;
		//alert($scope.activeUserIdx);
		//alert($scope.activeUserIdx);
		$scope.subscribers[$scope.activeUserIdx].subscribing = true;
		
		switchMainAudio(!accept);
        if(accept != false) {
			$scope.showWhiteboard = false;
			$scope.sidebandOption({v: 1});
            $scope.pubItemSelectHandler(true);
            return;
        }
        //var cmd = { imode: tp};
        //$scope.requestedSelect = { imode: tp, idx: idx};
        //$scope.subscribers[idx].OTSessionSideBand.batchSignal('signal:oculora_select', cmd);
        //set a timeout for slow users!
        $scope.pubWaitTimer = $timeout( function() {
            $cordovaDialogs.confirm("Continue waiting for subscriber to respond?", "Subscriber Response", ['Cancel','Wait'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            $scope.pubItemWait();
                        }
                        else {
                            //var newMsg = {action: false};
                            $scope.pubItemSelectHandler(false);
                        }
                        return btnIndex;

                });



                  }, 1000*Oculora_PublishSelectTimeout);
        //launch busy dialog in waiting for subscriber action for this request
        $ionicLoading.show({
                        template: 'Contacting subscriber...'
        });
		//alert("fine");
        //alert(tp);
        //if($scope.activeUserIdx >= 0)

        //var curIdx = $scope.activeUserIdx;
        //if((curIdx >= 0) && (curIdx == idx) && (tp == $scope.requestedSelect.imode))
        //    return;
        //coordinateSelectProtocol(tp, idx);

        /*if($scope.chatWindow != false) {
            if($scope.chat.msgs.length > 0) {
                var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;

                window.localStorage[var1[FieldNames.mid]] = angular.toJson($scope.chat.msgs);
                //alert(JSON.stringify(window.localStorage[var1[FieldNames.mid]]));
                $scope.chat.msgs = [];
            }
            $scope.chatWindow = false;
        }*/
      }

      $scope.pubItemSelectHandler = function(accepted) {
          $ionicLoading.hide();
          //alert(tp);
          //if($scope.activeUserIdx >= 0)
	      if(($scope.pubWaitTimer !== undefined) && ($scope.pubWaitTimer != null)) {
			  $timeout.cancel($scope.pubWaitTimer);
			  $scope.pubWaitTimer = null;
			}
		$scope.showWhiteboard = false;
          if(accepted != false) {
			  message = "Subscriber accepted";
			  switchMainAudio(false);
			  //$scope.moreOptions=true;
		  }  
          else {
            
            message = "Subscriber declined";
            //$scope.requestedSelect = { imode: -1, idx: -1};
            $scope.subsclassresult = $scope.subsclass + Oculora_SignalClass[0];
			//alert($scope.activeUserIdx);
			if($scope.activeUserIdx >= 0) {
				$scope.subscribers[$scope.activeUserIdx].subscribing = false;
			$scope.subscribers[$scope.activeUserIdx].chatWindow.active = false;
			}
			
			switchMainAudio(true);
			//$scope.moreOptions=false;
			$scope.activeUserIdx = -1;
            return;
          }
          //var curIdx = $scope.activeUserIdx;
          /*if((curIdx == idx) && (tp == 1))
              return;
          coordinateSelectProtocol(tp, idx);*/

          /*if($scope.chatWindow != false) {
              if($scope.chat.msgs.length > 0) {
                  var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;

                  window.localStorage[var1[FieldNames.mid]] = angular.toJson($scope.chat.msgs);
                  //alert(JSON.stringify(window.localStorage[var1[FieldNames.mid]]));
                  $scope.chat.msgs = [];
              }
          }*/

          //$scope.activeUserIdx = idx;
          //$scope.chatWindow = false;
          if($scope.subscribers[$scope.activeUserIdx].chatWindow.active != false) {
              //$scope.chat.msgs
              var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;
              var a = window.localStorage[var1[FieldNames.mid]];
              //var b = angular.toJson(a[0]);
              if( a === undefined)
                  $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs = [];
              else
                  $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs = angular.fromJson(a);
              /*if( (a != undefined) || (a != "undefined") || (a!= null) || (a.length > 0))
                  $scope.chat.msgs = angular.fromJson(a);
              else
                  $scope.chat.msgs = [];*/
              //alert($scope.subscribers[$scope.activeUserIdx].chatWindow.msgs);
              //$scope.chatWindow = (curIdx == idx ? false: true);
			  //$scope.chatWindow = $scope.doChat;
              if($scope.activeSubsChatted.indexOf(var1[FieldNames.mid]) < 0)
                  $scope.activeSubsChatted.push(var1[FieldNames.mid]);
              //alert(b);
              //alert($scope.activeUserIdx);
          } else {
			  if($scope.subscribers[$scope.activeUserIdx].chatWindow.msgs.length > 0) {
                    var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;

                    window.localStorage[var1[FieldNames.mid]] = angular.toJson($scope.subscribers[$scope.activeUserIdx].chatWindow.msgs);
                    //alert(JSON.stringify(window.localStorage[var1[FieldNames.mid]]));
                    $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs = [];
              }
		  }
          /*else {
              //$scope.chatWindow = false;
              $scope.subscribers[$scope.activeUserIdx].OTSessionSideBand.publishers.forEach(function (publisher) {

                                  publisher.publishAudio(true);

              });
          }*/
          //$scope.requestedSelect = { imode: -1, idx: -1};
          $scope.subsclassresult = $scope.subsclass + Oculora_SignalClass[1];
      }

      $scope.handleMessage = function(event, isText) {

             /*var msg = angular.fromJson(ev.data);
             if($scope.chatWindow != true) {

                var var1 = $scope.subscribers[$scope.activeUserIdx].subInfo;
                var a = window.localStorage[var1[FieldNames.mid]];
                              //var b = angular.toJson(a[0]);
                if( a === undefined)
                    $scope.chat.msgs = [];
                else
                    $scope.chat.msgs = angular.fromJson(a);
                              //if( (a != undefined) || (a != "undefined") || (a!= null) || (a.length > 0))
                                  //$scope.chat.msgs = angular.fromJson(a);
                              ///else
                                  //$scope.chat.msgs = [];
                alert($scope.chat.msgs);
                $scope.chatWindow = true;
                if($scope.activeSubsChatted.indexOf(var1[FieldNames.mid]) < 0)
                    $scope.activeSubsChatted.push(var1[FieldNames.mid]);
             }
            if(isText != false) {
                var msg = {msg: msg.msg, chatWindowClass: "itemright"};
                $scope.chat.msgs.push(msg);
            }
            else {
                switch(msg.state) {
                    case 0:
                        $scope.subscribers[$scope.activeUserIdx].chatimages[msg.name] = msg.image;
                        break;
                    case 1:
                        $scope.subscribers[$scope.activeUserIdx].chatimages[msg.name] += msg.image;
                        break;
                    case 2:
                        $scope.subscribers[$scope.activeUserIdx].chatimages[msg.name] += msg.image;
                        var msg = {image: $scope.subscribers[$scope.activeUserIdx].chatimages[msg.name], chatWindowClass: "itemright"};
                        $scope.subscribers[$scope.activeUserIdx].chatimages[msg.name] = null;
                        $scope.chat.msgs.push(msg);
                        break;
                }

            }*/
			
		var pubData = null;
		var msg1 = angular.fromJson(event.data);
		switch(msg1.state) {
			case 0:
				$scope.subscribers[$scope.activeUserIdx].messages[event.from.connectionId] = "";
				//scope.messageMap$scope.messages.length;
				break;
			case 1:
				var content = $scope.subscribers[$scope.activeUserIdx].messages[event.from.connectionId];
				content += msg1.content;
				$scope.subscribers[$scope.activeUserIdx].messages[event.from.connectionId] = content;
				break;
			case 2:
				var data = $scope.subscribers[$scope.activeUserIdx].messages[event.from.connectionId];
				pubData = angular.fromJson(data);
				
				$scope.subscribers[$scope.activeUserIdx].messages[event.from.connectionId] = null;
				delete $scope.subscribers[$scope.activeUserIdx].messages[event.from.connectionId];
				break;
		}
		if(msg1.state < 2) return;
					
         var msg = angular.fromJson(pubData);
		 if($scope.subscribers[$scope.activeUserIdx].chatWindow.active != true)
			$scope.sidebandOption({c: 1});//ensure chat window is up
		/*if($scope.subscribers[$scope.activeUserIdx].chatWindow.active != false) {

              var var1 = $scope.subscribers[$scope.activeUserIdx][FieldNames.SubInfo];
              var a = window.localStorage[var1[FieldNames.mid]];

              if( a === undefined)
                  $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs = [];
              else
                  $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs = angular.fromJson(a);

              alert($scope.subscribers[$scope.activeUserIdx].chatWindow.msgs);
              //$scope.chatWindow = (curIdx == idx ? false: true);
			  //$scope.chatWindow = $scope.doChat;
              if($scope.activePubsChatted.indexOf(var1[FieldNames.mid]) < 0)
                  $scope.activePubsChatted.push(var1[FieldNames.mid]);

          }*/
		var msg2 = {};
        if(isText != false) {
            msg2 = {msg: msg.msg, chatWindowClass: "itemright"};
        }
        else {
			msg2 = {image: msg.image, chatWindowClass: "itemright"};
            /*switch(msg.state) {
                case 0:
                    $scope.publishers[$scope.activePub].chatimages[msg.name] = msg.image;
                    break;
                case 1:
                    $scope.publishers[$scope.activePub].chatimages[msg.name] += msg.image;
                    break;
                case 2:
                    $scope.publishers[$scope.activePub].chatimages[msg.name] += msg.image;
                    var msg = {image: $scope.publishers[$scope.activePub].chatimages[msg.name], chatWindowClass: "itemright"};
                    $scope.subscribers[$scope.activeUserIdx].chatimages[msg.name] = null;
                    $scope.chat.msgs.push(msg);
                    break;
            }*/

        }
		$scope.$apply(function () {
              $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs.push(msg2);
			  $ionicScrollDelegate.$getByHandle('pubChat').scrollBottom();
          });
		
      }

	$scope.chataction = function() {
                                                  //alert(ev);

      //alert($scope.chat.msg);
        var msg = {msg: $scope.subscribers[$scope.activeUserIdx].chatWindow.emsg, chatWindowClass: "itemleft"};
      /*if($scope.image != false)
          msg.msg = $scope.chat.emsg;
      else
          msg.imageURL = 'img/oculora.png';
      msg.image = $scope.image;
      $scope.image = !$scope.image;*/

        $scope.subscribers[$scope.activeUserIdx].chatWindow.msgs.push(msg);
        $scope.subscribers[$scope.activeUserIdx].chatWindow.emsg = "";
        if(Oculora_OpentokDeploy != true) {
            return;
        }
		//var sb = $scope.publishers[$scope.activePub].sideband.OTSessionSideband;
        $scope.subscribers[$scope.activeUserIdx].OTSessionSideband.batchSignal(Oculora_SignalType.SignalType_Message_Text, angular.toJson(msg));
		$ionicScrollDelegate.$getByHandle('pubChat').scrollBottom();
        //alert(JSON.stringify($scope.chat.msgs[0]));
    }
	
      $scope.$on("NewImagePubChat", function(event, url) {
                  //alert(url);
              var msg = {image: url, chatWindowClass: "itemleft"};
              $scope.$apply(function () {
                  $scope.subscribers[$scope.activeUserIdx].msgs.push(msg);
                                              //$scope.newroom.images.push({src: url});
                                                                                  //alert($scope.newroom.images[1].src);
              });
              $scope.chatUseImageSend(url);
      });

      $scope.chatUseImage = function() {
        $scope.profilepic(50, 50);
      }

      $scope.chatUseImageSend = function(img) {
            if(Oculora_OpentokDeploy != true) {
                return;
            }
            $scope.subscribers[$scope.activeUserIdx].OTSessionSideband.batchSignal(Oculora_SignalType.SignalType_Message_Image, img);
      }
	
	$scope.chatImageFunc = function(f, e) {
		alert(f);
	}
	
	
	$scope.showWhiteboard = false;
	$scope.currentSidebandIndex = -1;
  $scope.whiteboardUnread = false;
	$scope.toggleWhiteboard = function() {
		$scope.currentSidebandIndex = $scope.subscribers[$scope.activeUserIdx].otsindex;
		$scope.showWhiteboard = !$scope.showWhiteboard;
    $scope.whiteboardUnread = false;
    setTimeout(function() {
      $scope.$emit('otLayout');
    }, 10);
  };
});