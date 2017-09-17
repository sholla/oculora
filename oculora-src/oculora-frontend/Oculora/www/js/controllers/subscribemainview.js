//alert("foo o");
//OculoraApp.controller('SubViewCtrl', function($scope, $rootScope, $ionicPlatform, $q, $ionicModal, $http, $cordovaDialogs, $ionicPopover, $cordovaFileTransfer, $cordovaDevice, $ionicLoading, OculoraProfileRetrieve, OculoraSubList, OculoraStartSession) {
OculoraApp.controller('SubViewCtrl', function($scope, $rootScope, $ionicPlatform, $q, $ionicModal, $http, $timeout, $cordovaDialogs, $ionicActionSheet, $ionicPopover, $cordovaFileTransfer, $cordovaDevice, $ionicLoading, $ionicScrollDelegate, $cordovaMedia, OTSessionMain, OTSessionSideband, OculoraProfileRetrieve, OculoraActiveSubList, OculoraStartSession, OculoraEndSession) {

    $ionicPopover.fromTemplateUrl('templates/roomsactivepubs.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.roomsactivepubs = modal;
                                                                        //$scope.publishers = {};
                                                                        //$scope.newroom.images = {mode : 0, candidates: [], tagsfilter: false};


    });

    $scope.subscribing = false;
    $scope.publishers = [];
    $scope.pubsclass = "button button-clear icon ion-person-stalker";
    //$scope.chatWindow = false;
    //$scope.voiceWindow = false;
    //$scope.chat = {};
      //$scope.chat.msg = "";
    //$scope.chat.msgs = [];
    //$scope.image = null;
    //$scope.doChat = false;

	//the item being used in this room
	$scope.activeItem = {};
    //publlisher index being viewed off
    $scope.activePub = 0;
    //if the publisher is actively communicating with this user
    //publisher.subscribing = false;

    $scope.inSubPays = true;
	$scope.pubsclass = "button button-clear icon ion-person-stalker ";
	$scope.pubsclassresult = $scope.pubsclass + Oculora_SignalClass[0];
	//$scope.moreOptions = false;
	$scope.newPub = null;
	$scope.notifyAction = false;
	$scope.newPubTimer = null;
	
	var facePublisherPropsHD = {
        //name: 'face',
		//audioFallbackEnabled: "false",
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off'
        },
        //resolution: '1280x720',
        //frameRate: '30',
		showControls: false,
		publishAudio: false
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
		
    $scope.$on("SubMainViewEvent", function(event, d) {
                      //alert(d);
        if(d >=0) {
			$scope.activeItem = $scope.items[$scope.activeRoom];
			$scope.startSubscribe(d);
		}
            
        else {
            //in notified subscription stage. Process accordingly
            $scope.notifiedSubscribe(true);
        }
    });

    $scope.$on("NotifyPlaySub", function(event, d) {
                          //alert(d);

        //in notified subscription stage. Process accordingly
        $scope.notifiedSubscribe(false);
    });

	$scope.$on("otSubscriberError", function(event, err) {
                          //alert(d);

        //alert(angular.toJson(err));
		$cordovaDialogs.confirm("Error in connecting stream. Retry", "Network Error", ['Exit'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {

                            /*$scope.roomsubend(false);
							if(($scope.currentMessage !== undefined) && ($scope.currentMessage != null)) {
								$scope.notifiedSubscribe(true);
							}
							else {
								$scope.startSubscribe($scope.activeItem);
							}*/
							
                        }
                        else {
							$scope.roomsubend(false);
						}
                            

                });
		
    });
	
    $scope.notifiedSubscribe = function(newSub) {
		
		//$scope.currentMessage = null;
        if(newSub != false) {
			$scope.activeItem = angular.copy($scope.currentMessage);
            $scope.subscribing = false;
            //$scope.roomSubscribe(true, $scope.currentMessage);
			$scope.startSubscribe(0);
            return;
        }
        $scope.subscribing = false;
        var ret = $scope.roomsubend(false, function() {
			$scope.activeItem = angular.copy($scope.currentMessage);
			$scope.startSubscribe(0);
		});
        /*ret.then(function(res) {
            if(res) {
				$scope.startSubscribe(0);*/
                //$scope.roomSubscribe(true, $scope.currentMessage);
                /*if($scope.currentMessage.viewMode !== undefined)
                    $scope.currentMessage = {};*/
            /*}
        });*/
    }

    
    $scope.roomsubscribeend = function(cb) {
        //$scope.roomCardFlipSupp($event);
        //item.infoState = true;

        $scope.roomsubend(true);
    }

	var _roomsubendWork = function(cb) {
		$scope.subscribing = false;
		//$scope.moreOptions=false;
		if(($scope.publishers.length - 1) >= $scope.activePub) {
			var pub = $scope.publishers[$scope.activePub];
			if(pub != null) {
				pub.active = false;
				if(pub.sideband)
				{
					pub.sideband.subscribing = false;
					if(pub.sideband.OTSessionSideband !== undefined) {
						if(pub.sideband.OTSessionSideband.sidebandsession !== undefined) {
							pub.sideband.OTSessionSideband.sidebandsession.off();
							pub.sideband.OTSessionSideband.sidebandsession.disconnect();
						}
					
					}
				}
				 
			}
		}
		  
		  
		  if($scope.mainsession) {
			  $scope.mainsession.disconnect();
			  $scope.mainsession.off();
			  $scope.mainsession = null;
			
			  
		  }
		  
		  $scope.abortPaymentTrackerModel();
			
		  $scope.activePub = 0;
		  $scope.publishers = [];
		  OTSessionSideband.clearSidebandRefs();
		  $scope.showWhiteboard = false;
		  var subItem = new OculoraEndSession();
		  subItem[FieldNames.id] = $scope.activeItem[FieldNames.id];
		  subItem[FieldNames.SessionInstance] = $scope.activeItem.subscribeCreds[FieldNames.SessionInstance];
		  //pubItem[FieldNames.uid] = item[FieldNames.uid];
		  subItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Subscribe;
		  //alert(JSON.stringify(pubItem));
		  //$scope.inStopButtonEnd = true;
		  var ret2 = $scope.endSession($scope.activeItem, subItem, false).then(function() {if(cb) cb();});
		  //alert("here");
		  if(!cb) $scope.roomsubview.hide();
	}
    $scope.roomsubend = function(prompt, cb) {
        //var q = $q.defer();
        //alert("here");
        //var ret = false;
		if(prompt != true) {
			_roomsubendWork(cb);
			return true;
		}
			
		
        $cordovaDialogs.confirm("Are you sure you want to end subscribing to this room", "Subscriber Prompt", ['Cancel','OK'])
          .then(function(buttonIndex) {
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = buttonIndex;
              if(btnIndex == 2)
              {
                  //alert(JSON.stringify(item));
                  //return;
                  /*if(Oculora_OpentokDeploy != true)
                  {
                        $scope.endSession(false, $scope.activeItem);
                        return;
                  }*/
				  
				  _roomsubendWork(cb);  
				  
                  //$scope.publishItem = null;
                  //$scope.inStopButtonEnd = true;
                  /*ret2.then(function(res) {
                    if(res) {
                        ret = res;
                        if($scope.currentMessage.viewMode === undefined)
                            $scope.roomsubview.hide();
                    }
                  });*/
              }
                                  //else
                                      //navigator.app.exitApp();

        });
        //q.resolve(ret);
        //return q.promise;
                          //$scope.roomsactivesubs.show($event);
                          //alert($scope.roomsactivesubs);
    }

    $scope.sidebandPublish = function(sideband, pub) {
		$scope.interactPublisherProps = angular.copy(interactPublisherPropsTemplate);
		$scope.showWhiteboard = false;
        var roomAccess = sideband[FieldNames.RoomAccessSub];
        if(roomAccess[FieldNames.RoomSessId] === undefined) {
                    return;
        }
        //var subInfo = sideband[FieldNames.SubInfo];
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
                    subscriber.subscribing = false;
                    $scope.showUserState2(pub, false);
					$scope.subItemSelectHandler(false);
					
					//subscriber.sidebandsession.disconnect();
					//newSub = {OTSessionSideband: subscriber, streams: subscriber.streams, subscribing: false, subInfo: pub, otsindex: subscriber.sidebandsindex, voiceWindow: true, messages: {}, chatWindow: {active: false, emsg: "", msgs: []}};
					
                  }
                });
            };
            if ((subscriber.sidebandsession.is && subscriber.sidebandsession.is('connected')) || subscriber.sidebandsession.connected) {
                connectDisconnect(true);
            }
            subscriber.sidebandsession.on('streamCreated', function(event) {


                //item.subscribing = true;
                //item.active = true;
                //item.activeItem = 0;
				//alert("S stream audio:" + event.stream.hasAudio);
				//alert("S stream video:" + event.stream.hasVideo);
//alert("reached");
                if(event.stream.connection.connectionId !== subscriber.sidebandsession.connection.connectionId) {
                    /*var idx = subscriber.idx;
                    var item = $scope.publishers[idx];
                    item.stream = event.stream;*/
					
                    if( newSub.subscribing != false) {
                        //subscriber started publishing that this publisher asked to communicate with has accepted. indicate so
                        //$scope.showUserState(subInfo, true);
                        // cancel the timer
						//alert("how");
                        $scope.subItemSelectHandler(true);
                    }
                    else {
                        //notify the user of a publisher wanting to communicate
                        //var subInfo = $scope.mainsession.browsepub[event.stream.connection.connectionId];
						/*var subInfo = pub;
                        var titleText = "<img src='%%%IMG%%%' height='50px' width='50px'></img><h2>%%%NAME%%%</h2><br></br><h4>Wants to communicate</h4>";
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
                                        $scope.subItemOption(true);
                                        //$scope.pubselect(subscriber.idx);
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
                      $scope.newPub = newSub;
						$scope.notifyAction = true;
                    });
						
						$scope.newPubTimer = $timeout(function() {
                                     $scope.newPub = null;
						$scope.notifyAction = false;
						//alert("end");
                                }, 1000*Oculora_SubNewPubTimeout);
                    }
                    //}
                }
                else {
                    //publishers stream i.e. this users stream - can be set only by user setting it in the popover
                    connectDisconnect(true);
                }
            });
			subscriber.sidebandsession.on('streamDestroyed', function(event) {
                //if(event.stream.connectionId !== subscriber.sidebandsession.connection.connectionId)
                    //$scope.showUserState(subInfo, true, false);
				//alert("dropped stream sb");
				connectDisconnect(false);
				
            });
            subscriber.sidebandsession.on('sessionConnected', function(event) {
                //if(event.stream.connectionId !== subscriber.sidebandsession.connection.connectionId)
                    //$scope.showUserState(subInfo, true, false);
				var ii = 0;
				ii++;
				//alert("sess conn");
            });
            subscriber.sidebandsession.on('sessionDisconnected', function(event) {
                //if(event.stream.connectionId !== subscriber.sidebandsession.connection.connectionId)
                    //$scope.showUserState(subInfo, true, false);
				//alert("dropped session");
				connectDisconnect(false);
				
            });
            subscriber.sidebandsession.on(Oculora_SignalHandlerMark + Oculora_SignalType.SignalType_Message_Text, function(event) {
				//alert(angular.toJson(event.from));
				if(event.from.connectionId !== subscriber.sidebandsession.connection.connectionId) {
					if( subscriber.idx == $scope.activePub)
						$scope.handleMessage(event, true);
				}
            });
            subscriber.sidebandsession.on(Oculora_SignalHandlerMark + Oculora_SignalType.SignalType_Message_Image, function(event) {
                if( subscriber.idx == $scope.activePub)
                    $scope.handleMessage(event, false);
            });

            //subscriber.sidebandpublishing = true;
        });
        var newSub = {OTSessionSideband: subscriber, streams: subscriber.streams, subscribing: false, subInfo: pub, otsindex: subscriber.sidebandsindex, voiceWindow: true, messages: {}, chatWindow: {active: false, emsg: "", msgs: []}};

        return newSub;

    }

    $scope.makeSession = function() {
        var q = $q.defer();
        var item = $scope.activeItem;
        var subItem = new OculoraStartSession();
        subItem[FieldNames.id] = item[FieldNames.id];
        //pubItem[FieldNames.uid] = item[FieldNames.uid];
        subItem[FieldNames.FullView] = true;
        subItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Subscribe;

        //var subItem1 = angular.copy(subItem);
        $ionicLoading.show({
            template: 'Connecting...'
        });

        subItem.$save({}, function(resObj, st) {
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
                            var res1 = $scope.makeSession().then();
                            q.resolve(true);
                        }
                        else {
							//alert("in heref");
							q.resolve(false);
						}
                            

                    });
            }
            else {
                
                var res2 = angular.fromJson(resObj.message);
                item.subscribeCreds = res2;
                q.resolve(true);
                
            }

        }, function(st) {
            //alert("Error in accessing service. Retry");
            $ionicLoading.hide();
            $cordovaDialogs.confirm("Error in accessing service. Retry", "System Error", ['Exit','Retry'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {

                            var res1 = $scope.makeSession().then();
                            q.resolve(true);
                        }
                        else
                            q.resolve(false);

                });
        });

        return q.promise;
    }
	
	
	var _startSubscribeWork = function(itemIdx, res) {
		if(res != true) {
			alert("fail!");
			return;
		}
		
		if(Oculora_OpentokDeploy != true) {
			return;
		}
		//$scope.moreOptions = false;
		//alert("ss");
		var item = $scope.activeItem;
		if($scope.activeItem[FieldNames.profileimage] == null)
			$scope.activeItem[FieldNames.profileimage] = "img/oculora.png";
		//alert("sess:" + item.subscribeCreds[FieldNames.RoomSessId] + "tok:" + item.subscribeCreds[FieldNames.RoomToken]);
		//alert(itemIdx);
		OTSessionMain.init($rootScope.access[FieldNames.apiKey], item.subscribeCreds[FieldNames.RoomSessId], item.subscribeCreds[FieldNames.RoomToken], function(err, session) {
			if(err) {
				alert(angular.toJson(err));
				$scope.roomsubend(false);
				return;
			}
				
			$scope.mainsession = session;
			$scope.mainsession.messages = {};
			$scope.mainsession.browsepub = {};
			
			//alert("in sess");
			$scope.subscribing = true;
			$scope.paymentButtonClassTracker(null, function(){}, function(){
					$scope.roomsubend(false);
					//alert("No credits available. Ending session...");
				});
			var connectDisconnect = function(connected) {
				$scope.$apply(function() {
				  $scope.connected = connected;
				  
				  if (!connected) {

					if($scope.connections.length <= 1) {
					  $scope.roomsubend(false);
					}
				  }
				});
			};
			if ((session.is && session.is('connected')) || session.connected) {
				connectDisconnect(true);
			}
			$scope.mainsession.on('sessionConnected', function(event) {
				//alert("m s c");
				//connectDisconnect.bind($scope.mainsession, true));
				/*if(event.connection.connectionId === $scope.mainsession.connection.connectionId) {
					$scope.active = true;
				}*/
			});

			$scope.mainsession.on('sessionDisconnected', function(event) {
				//alert("m s dc");
				//alert("sess done!");
				//if((event.connection.connectionId === $scope.mainsession.connection.connectionId) || ($scope.publishers.length <= 1))
					connectDisconnect.bind($scope.mainsession, false);
				/*else {
					if($scope.browsepub[event.connection.connectionId]) {
						$scope.showUserState($scope.browsepub[event.connection.connectionId], false, false);
						$scope.browsepub[event.connection.connectionId] = null;
					}
				}*/
			});
			$scope.mainsession.on('connectionCreated', function(event) {
				//alert("conn created");
				//alert("m c c");

			});
			$scope.mainsession.on('connectionDestroyed', function(event) {
				//alert("conn destroyed");
				//alert("m c dc");

			});
			$scope.mainsession.on('streamCreated', function(event) {
				//alert("M stream audio:" + event.stream.hasAudio);
				//alert("M stream video:" + event.stream.hasVideo);
				//alert(event.stream);
				//alert(angular.toJson(event.stream.connection.data));
				var pub = {};
				pub.pubInfo = angular.fromJson(event.stream.connection.data);
				if(pub.pubInfo[FieldNames.profileimage] == null)
					pub.pubInfo[FieldNames.profileimage] = "img/oculora.png";
				pub.stream = event.stream;
				$scope.$apply(function () {
					$scope.publishers.push(pub);
				});
				
				var idx = $scope.publishers.length - 1;
				//var connData = {i: idx, s:event.stream, c: event.stream.connection.connectionId};
				$scope.mainsession.browsepub[event.stream.connection.connectionId] = idx;
				//alert(angular.toJson($scope.mainsession.browsepub[event.stream.connection.connectionId]));
				//alert(event.stream.connection.connectionId);
				var signalError = function (err) {
              if (err) {
                alert(angular.toJson(err));
              }
            };
				var signal = {
                    type: "oculoraSubSelect",
                    data: 1,
					to : event.stream.connection
                };
				//var idx2 = OTSessionMain.streams.indexOf(event.stream);
				//alert("idx:" + idx + "itemIdx:" + itemIdx + "idx2:" + idx2);
				if(idx == itemIdx)
					$scope.mainsession.signal(signal, signalError);
				
			});
			$scope.mainsession.on('streamDestroyed', function(event) {
				//alert("m st d");
				var pub1 = $scope.publishers[$scope.activePub];
				
				if(pub1 && (pub1.stream == event.stream)) {
					pub1.active = false;
					
				}
				pub1 = {};
				var idx = OTSessionMain.streams.indexOf(event.stream);
				$scope.$apply(function () {
					var cntr = 0;
					for(var key in $scope.mainsession.browsepub) {
						if(cntr > idx) {
							if($scope.mainsession.browsepub[key] > 0)
								$scope.mainsession.browsepub--;
						}
							
						cntr++;
					}
					$scope.publishers.splice($scope.activePub, 1);
				});
				if($scope.publishers.length == 0){
					$scope.roomsubend(false);
				}
				else {
					//switch to next publisher 
					//show a message saying we are switching and then switch
					//alert(angular.toJson($scope.publishers[0].pubInfo));
					var pubInfo2 = $scope.publishers[0].pubInfo;
					if($scope.publishers[0].pubInfo[FieldNames.profileimage] == null)
						$scope.publishers[0].pubInfo[FieldNames.profileimage] = "img/oculora.png";
					var titleText = "<img src='%%%IMG%%%' height='50px' width='50px'></img><h2>%%%NAME%%%</h2><br></br><h4>Switching to new publisher</h4>";
                        var r1 = titleText.replace("%%%IMG%%%", pubInfo2[FieldNames.profileimage]).replace("%%%NAME%%%", pubInfo2[FieldNames.nickName]);
						titleText = r1;
                                // Show the action sheet
                                var hideUserCommSheet = $ionicActionSheet.show({
                                    buttons: [
                                              { text: 'Accept' }
                                            ],
                                    titleText: titleText,
                                    
                                    cancel: function() {
                                        // add cancel code..
                                    },
                                    buttonClicked: function(index) {
                                        $scope.activePub = -1;
										$scope.pubselect(0);
                                        return true;
                                    }
                                });
                                $timeout(function() {
                                     hideUserCommSheet();
                                }, 1000*Oculora_PublishSelectTimeout);
					
				}
			});
			$scope.mainsession.on(Oculora_SignalHandlerMark + Oculora_SignalType.SignalType_Subscriber, function(event) {
				//alert(angular.toJson(event));
				if(event.from.connectionId !== $scope.mainsession.connection.connectionId) {
					//alert(angular.toJson(event));
					var pubData = null;
					var msg = angular.fromJson(event.data);
					switch(msg.state) {
						case 0:
							$scope.mainsession.messages[event.from.connectionId] = "";
							//scope.messageMap$scope.messages.length;
							break;
						case 1:
							var content = $scope.mainsession.messages[event.from.connectionId];
							content += msg.content;
							$scope.mainsession.messages[event.from.connectionId] = content;
							break;
						case 2:
							var data = $scope.mainsession.messages[event.from.connectionId];
							pubData = angular.fromJson(data);
							
							$scope.mainsession.messages[event.from.connectionId] = null;
							delete $scope.mainsession.messages[event.from.connectionId];
							break;
					}
					if(msg.state < 2) return;
					
					//var sideband = angular.fromJson(event.data);
					//var subInfo = $scope.sidebandPublish(sideband);
					//if(subInfo != null)
						//$scope.browsesub[event.connection.connectionId] = subInfo;

					//var pubData = angular.fromJson(event.data);
					//prepare user request and then call getUser()
					var pub = angular.fromJson(pubData[FieldNames.SubInfo]);
					if(pub[FieldNames.profileimage] == null)
						pub[FieldNames.profileimage] = "img/oculora.png";
					pubData[FieldNames.SubInfo] = pub;
					//alert(angular.toJson(pub));
					//var sideband = pubData[FieldNames.RoomAccessSub];
					pub.sideband = $scope.sidebandPublish(pubData, pub);
					
					//$scope.publishers.push(pub);
					//var idx = $scope.publishers.indexOf(pub);
					//pub.sideband.OTSessionSideBand.idx = idx;
					//$scope.showUserState(pub, true, false);
					
					var pubIdx = $scope.mainsession.browsepub[event.from.connectionId];
					//alert(pubIdx);
					var pubItem = $scope.publishers[pubIdx];
					//alert(angular.toJson(pubItem));
					angular.extend(pub, pubItem);
					$scope.publishers[pubIdx] = pub;
					//var stream = connData.s;
					/*alert(stream);
					alert(idx);
					alert(itemIdx);*/
					//pub.stream = stream; 
					//pub.pubInfo = connData.d;
					//if(pub.pubInfo[FieldNames.profileimage] == null)
						//pub.pubInfo[FieldNames.profileimage] = "img/oculora.png";
					//alert(angular.toJson(pub.pubInfo));
					$scope.showUserState2(pubItem.pubInfo, true);
					//delete $scope.mainsession.browsepub[event.from.connectionId];
					//$scope.mainsession.browsepub[event.from.connectionId] = pub;
					
					//$scope.publishers.push(pub);
					//var idx = $scope.publishers.length - 1;
					pub.sideband.OTSessionSideband.idx = pubIdx;
					//alert("pubIdx:" + pubIdx + "itemIdx:" + itemIdx);
					if(pubIdx == itemIdx) {
						//item.stream = event.stream;
						//item.subscribing = true;
						$scope.activePub = itemIdx;
						pub.active = true;
						//alert(angular.toJson(pub.stream));
					}
				}
			});
			

		});
	}
	
    $scope.startSubscribe = function(itemIdx) {
        if(Oculora_OpentokDeploy != true)
            return;
		//var subscriber = OTSessionMainSubs.getSub();
		
		$scope.makeSession().then(function(res) {
			$timeout(function() {
                              _startSubscribeWork(itemIdx, res);
                          }, 1000*1);
			
			});
    }

    /*$scope.roomAvailablePubs = function(ev, idx) {
        $scope.activeRoom = idx;
        $scope.roomsactivepubsbrowse.show(ev);
    }*/

    $scope.pubselect = function(idx) {
        //var curItem = $scope.items[activeRoom].pubs[$scope.items[activeRoom].activeItem];
        //curItem.OTSessionMainSub.
        //$scope.items[activeRoom].stream = $scope.items[activeRoom].OTSessionMainSub.streams[idx];
		if(idx == $scope.activePub) {
			return;
			$scope.roomsactivepubs.hide();
		}
			
        if($scope.activePub >= 0) 
		{
			var pub = $scope.publishers[$scope.activePub];
			pub.active = false;
			pub.sideband.OTSessionSideband.sidebandsession.disconnect();
			pub.sideband.OTSessionSideband.sidebandsession.off();
			pub.sideband = null;
		}
		$scope.facePublisherProps = angular.copy(facePublisherPropsHD);
        $scope.activePub = idx;
        var pubCur = $scope.publishers[$scope.activePub];
		//alert(angular.toJson(pubCur.stream));
        pubCur.active = true;
		//alert(event.stream.connection.connectionId);
				var signalError = function (err) {
              if (err) {
                alert(angular.toJson(err));
              }
            };
			var stream = OTSessionMain.streams[$scope.activePub];
				var signal = {
                    type: "oculoraSubSelect",
                    data: 1,
					to : pubCur.stream.connection
                };
				
					$scope.mainsession.signal(signal, signalError);
		$scope.showWhiteboard = false;
		$scope.roomsactivepubs.hide();
    }

    $scope.handleSelect = function(event) {
        if (event.from.connectionId !== $scope.session.connection.connectionId) {
            var msg = angular.fromJson(event.data);
            $scope.subItemSelectHandler(msg);
            /*if(msg.action != false) {
                OTSessionSideband.publishers.forEach(function (publisher) {
                    if($scope.requestedSelect.imode == 0)
                        publisher.publishAudio(msg.action);

                });
            }*/

        }
      }

      /*$scope.coordinateSelectProtocol = function(tp, idx) {
        $scope.requestedSelect = { imode: tp, idx: idx};
        var newUser = false;
        var curIdx = $scope.activeItem;
        if((curIdx >= 0) && (curIdx != idx) ) {
        //    return;
        //if($scope.activeUserIdx >= 0)
            //var a1 = ((curIdx >= 0) && (curIdx == idx) && (tp == $scope.requestedSelect.imode))
            newUser = true;
            //var cmd = { action: false};
            var cmd = { action: false};
            //switch off this user

            $scope.publishers[$scope.activeItem].OTSessionSideBand.batchSignal('signal:oculora_select', cmd);
        }
        //switch on idx user now
        var cmd = { imode: tp, action: true};
        $scope.publishers[$scope.activeItem].OTSessionSideBand.batchSignal('signal:oculora_select', cmd);
        return newUser;
      }*/

      var subItemWait = function() {
          $cordovaDialogs.confirm("Continue waiting for publisher to respond?", "Pubscriber Response", ['Cancel','Wait'])
              .then(function(buttonIndex) {
                  // no button = 0, 'OK' = 1, 'Cancel' = 2
                      var btnIndex = buttonIndex;
                      if(btnIndex == 2)
                      {
                          $scope.subWaitTimer = $timeout(function() {
                              subItemWait();
                          }, 1000*Oculora_PublishSelectTimeout);
                      }
                      else {
                          //var newMsg = {action: false};
                          $scope.subItemSelectHandler(false);
                      }
                      return btnIndex;

              });
        }

	  
	$scope.pubUserInfo = function(item, ev) {
		  //$scope.roomCardFlipSupp(ev);
		  var item1 = {};
		  item1[FieldNames.uid] = item[FieldNames.uid]
		  $scope.roomuser(item1, ev);
	  }

	$scope.closeSideband = function()
	{
		//$scope.moreOptions=false;
		if($scope.activePub >= 0) {
			  $scope.publishers[$scope.activePub].sideband.subscribing = false;
			  switchMainAudio(true);
		  }
		  //$scope.activePub = -1;
		  $scope.showWhiteboard = false;
	}
	
	var switchMainAudio = function(on) {
		OTSessionMain.streams.forEach(function (stream) {   
			var subObjs = $scope.mainsession.getSubscribersForStream(stream);
			subObjs.forEach(function (sub) {  
				sub.subscribeToAudio(on);
			});
		});
	}
	
	$scope.sidebandOption = function(opts) {
		if($scope.publishers[$scope.activePub].sideband.subscribing != true) 
			$scope.subItemOption(-1, true); //chat should be disabled until we are connected over teh sideband since there is no way to launch chat remote
		else {
			if(opts.c !== undefined) {
				//process chat window
				//$scope.doChat = !$scope.doChat;
				$scope.publishers[$scope.activePub].sideband.chatWindow.active = !$scope.publishers[$scope.activePub].sideband.chatWindow.active;
				$scope.subItemSelectHandler(true);
			}
			if(opts.v !== undefined) {
				$scope.publishers[$scope.activePub].sideband.voiceWindow = !$scope.publishers[$scope.activePub].sideband.voiceWindow;
				
				/*$scope.publishers[$scope.activePub].sideband.OTSessionSideband.publishers.forEach(function (publisher) {             
					publisher.publishAudio($scope.publishers[$scope.activePub].sideband.voiceWindow);
					
                });*/
				/*$scope.publishers[$scope.activePub].sideband.OTSessionSideband.streams.forEach(function (stream) {   
					var pub = $scope.publishers[$scope.activePub].sideband.OTSessionSideband.sidebandsession.getPublisherForStream(stream);
					pub.publishAudio($scope.publishers[$scope.activePub].sideband.voiceWindow);
				});*/
				$scope.publishers[$scope.activePub].sideband.OTSessionSideband.publishers.forEach(function (publisher) {   
					//var pub = $scope.publishers[$scope.activePub].sideband.OTSessionSideband.sidebandsession.getPublisherForStream(stream);
					publisher.publishAudio($scope.publishers[$scope.activePub].sideband.voiceWindow);
				});
				$scope.publishers[$scope.activePub].sideband.OTSessionSideband.streams.forEach(function (stream) {   
					var subObjs = $scope.publishers[$scope.activePub].sideband.OTSessionSideband.sidebandsession.getSubscribersForStream(stream);
					subObjs.forEach(function (sub) {  
						sub.subscribeToAudio($scope.publishers[$scope.activePub].sideband.voiceWindow);
					});
				});
			}
			
		}
	}
      $scope.subItemOption = function(idx, accept) {
		if(($scope.newPubTimer !== undefined) && ($scope.newPubTimer != null)) {
			  $timeout.cancel($scope.newPubTimer);
			  $scope.newPubTimer = null;
		   }
		
		$scope.newPub = null;
		$scope.notifyAction = false;
		if((idx >= 0) && (accept != false)){
			$scope.showWhiteboard = false;
			if($scope.activePub >= 0)	$scope.publishers[$scope.activePub].sideband.subscribing = false;
			$scope.activePub = idx;
		}
        if(accept != false) {
			$scope.showWhiteboard = false;
			$scope.publishers[$scope.activePub].sideband.subscribing = true;
			$scope.sidebandOption({v: 1});
			$scope.subItemSelectHandler(true);
            return;
        }
		if((idx >= 0) && (accept != true)) {
			$scope.showWhiteboard = false;
			$scope.subItemSelectHandler(false);
			return;
		}
			
          //set a timeout for slow users!
          $scope.subWaitTimer = $timeout( function() {
              $cordovaDialogs.confirm("Waiting for publisher to respond?", "Publisher Response", ['Cancel','Wait'])
                  .then(function(buttonIndex) {
                      // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = buttonIndex;
                          if(btnIndex == 2)
                          {
                              subItemWait();
                          }
                          else {
                              //var newMsg = {action: false};
                              $scope.subItemSelectHandler(false);
                          }
                          return btnIndex;

                  });



                    }, 1000*Oculora_PublishSelectTimeout);
          //launch busy dialog in waiting for subscriber action for this request
          $ionicLoading.show({
                          template: 'Contacting publisher...'
          });


        }

    $scope.subItemSelectHandler = function(accepted) {
          $ionicLoading.hide();
		  if(($scope.subWaitTimer !== undefined) && ($scope.subWaitTimer != null)) {
			  $timeout.cancel($scope.subWaitTimer);
			  $scope.subWaitTimer = null;
		   }
          //alert(tp);
          //if($scope.activeUserIdx >= 0)
			  $scope.showWhiteboard = false;
          if(accepted != false) {
			  switchMainAudio(false);
			  message = "Subscriber accepted";
			  //$scope.moreOptions=true;
		  }
          else {
            
            message = "Subscriber declined";
            //$scope.requestedSelect = { imode: -1, idx: -1};
            $scope.pubsclassresult = $scope.pubsclass + Oculora_SignalClass[0];
			if($scope.activePub >=0) $scope.publishers[$scope.activePub].sideband.subscribing = false;
			switchMainAudio(true);
			//$scope.moreOptions=false;
			//$scope.chatWindow = !$scope.doChat;
			if($scope.activePub >=0) $scope.publishers[$scope.activePub].sideband.chatWindow.active = false;
            //return;
          }
          //var curIdx = $scope.activePub;

          //$scope.activePub = idx;

          if(($scope.activePub >=0) && $scope.publishers[$scope.activePub].sideband.chatWindow.active != false) {

              var var1 = $scope.publishers[$scope.activePub].sideband[FieldNames.SubInfo];
              var a = window.localStorage[var1[FieldNames.mid]];

              if( a === undefined)
                  $scope.publishers[$scope.activePub].sideband.chatWindow.msgs = [];
              else
                  $scope.publishers[$scope.activePub].sideband.chatWindow.msgs = angular.fromJson(a);

              //alert($scope.publishers[$scope.activePub].sideband.chatWindow.msgs);
              //$scope.chatWindow = (curIdx == idx ? false: true);
			  //$scope.chatWindow = $scope.doChat;
              if($scope.activePubsChatted.indexOf(var1[FieldNames.mid]) < 0)
                  $scope.activePubsChatted.push(var1[FieldNames.mid]);

          } else {
			  //first save the users chat session for reciver later in the session if needed
              //if($scope.chatWindow != false) {
                  if(($scope.activePub >=0) && $scope.publishers[$scope.activePub].sideband.chatWindow.msgs.length > 0) {
                      var var1 = $scope.publishers[$scope.activePub].sideband[FieldNames.SubInfo];

                      window.localStorage[var1[FieldNames.mid]] = angular.toJson($scope.publishers[$scope.activePub].sideband.chatWindow.msgs);

                      $scope.publishers[$scope.activePub].sideband.chatWindow.msgs = [];
                  }
                  //$scope.chatWindow = false;
              //}
		  }

          $scope.pubsclassresult = $scope.pubsclass + Oculora_SignalClass[1];
      }

    $scope.handleMessage = function(event, isText) {

		var pubData = null;
		var msg1 = angular.fromJson(event.data);
		//alert(event.data);
		switch(msg1.state) {
			case 0:
				$scope.publishers[$scope.activePub].sideband.messages[event.from.connectionId] = "";
				//scope.messageMap$scope.messages.length;
				break;
			case 1:
				var content = $scope.publishers[$scope.activePub].sideband.messages[event.from.connectionId];
				content += msg1.content;
				$scope.publishers[$scope.activePub].sideband.messages[event.from.connectionId] = content;
				break;
			case 2:
				var data = $scope.publishers[$scope.activePub].sideband.messages[event.from.connectionId];
				pubData = angular.fromJson(data);
				
				$scope.publishers[$scope.activePub].sideband.messages[event.from.connectionId] = null;
				delete $scope.publishers[$scope.activePub].sideband.messages[event.from.connectionId];
				break;
		}
		if(msg1.state < 2) return;
		if($scope.publishers[$scope.activePub].sideband.chatWindow.active != true)
			$scope.sidebandOption({c: 1});//ensure chat window is up
		
         var msg = angular.fromJson(pubData);
         /*if($scope.chatWindow != true) {

            var var1 = $scope.publishers[$scope.activePub].subInfo;
            var a = window.localStorage[var1[FieldNames.mid]];
                          //var b = angular.toJson(a[0]);
            if( a === undefined)
                $scope.chat.msgs = [];
            else
                $scope.chat.msgs = angular.fromJson(a);
                          if( (a != undefined) || (a != "undefined") || (a!= null) || (a.length > 0))
                              $scope.chat.msgs = angular.fromJson(a);
                          else
                              $scope.chat.msgs = [];
            alert($scope.chat.msgs);
            $scope.chatWindow = true;
            if($scope.activeSubsChatted.indexOf(var1[FieldNames.mid]) < 0)
                $scope.activeSubsChatted.push(var1[FieldNames.mid]);
         }*/
		/*if($scope.publishers[$scope.activePub].sideband.chatWindow.active != false) {

              var var1 = $scope.publishers[$scope.activePub][FieldNames.SubInfo];
              var a = window.localStorage[var1[FieldNames.mid]];

              if( a === undefined)
                  $scope.publishers[$scope.activePub].sideband.chatWindow.msgs = [];
              else
                  $scope.publishers[$scope.activePub].sideband.chatWindow.msgs = angular.fromJson(a);

              alert($scope.publishers[$scope.activePub].sideband.chatWindow.msgs);
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
              $scope.publishers[$scope.activePub].sideband.chatWindow.msgs.push(msg2);
			  $ionicScrollDelegate.$getByHandle('subChat').scrollBottom();
          });
		
		
  }

  $scope.$on("NewImageSubChat", function(event, url) {
              //alert(url);
          var msg = {image: url, chatWindowClass: "itemleft"};
          $scope.$apply(function () {
              $scope.publishers[$scope.activePub].sideband.chatWindow.msgs.push(msg);
                                          //$scope.newroom.images.push({src: url});
                                                                              //alert($scope.newroom.images[1].src);
          });
          $scope.chatUseImageSend(url);
  });

  $scope.chatUseImage = function() {
    $scope.profilepic(50, 50);
  }

  $scope.chataction = function() {
                                                  //alert(ev);

      //alert($scope.chat.msg);
        var msg = {msg: $scope.publishers[$scope.activePub].sideband.chatWindow.emsg, chatWindowClass: "itemleft"};
      /*if($scope.image != false)
          msg.msg = $scope.chat.emsg;
      else
          msg.imageURL = 'img/oculora.png';
      msg.image = $scope.image;
      $scope.image = !$scope.image;*/

        $scope.publishers[$scope.activePub].sideband.chatWindow.msgs.push(msg);
        $scope.publishers[$scope.activePub].sideband.chatWindow.emsg = "";
        if(Oculora_OpentokDeploy != true) {
            return;
        }
		//var sb = $scope.publishers[$scope.activePub].sideband.OTSessionSideband;
        $scope.publishers[$scope.activePub].sideband.OTSessionSideband.batchSignal(Oculora_SignalType.SignalType_Message_Text, angular.toJson(msg));
		$ionicScrollDelegate.$getByHandle('subChat').scrollBottom();
        //alert(JSON.stringify($scope.chat.msgs[0]));
    }

  $scope.chatUseImageSend = function(img) {
        if(Oculora_OpentokDeploy != true) {
            return;
        }
        $scope.publishers[$scope.activePub].sideband.OTSessionSideband.batchSignal(Oculora_SignalType.SignalType_Message_Image, img);
  }

	$scope.showWhiteboard = false;
	$scope.currentSidebandIndex = -1;
  $scope.whiteboardUnread = false;
	$scope.toggleWhiteboard = function() {
		$scope.currentSidebandIndex = $scope.publishers[$scope.activePub].sideband.otsindex;
		$scope.showWhiteboard = !$scope.showWhiteboard;
    $scope.whiteboardUnread = false;
    setTimeout(function() {
      $scope.$emit('otLayout');
    }, 10);
  };
});
//alert("bar o");
