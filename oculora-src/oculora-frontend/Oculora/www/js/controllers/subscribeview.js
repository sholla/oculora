OculoraApp.controller('SubscriberCtrl', function($scope, $rootScope, $ionicPlatform, $q, $ionicModal, $http, $timeout, $cordovaDialogs, $ionicPopover, $cordovaFileTransfer, $cordovaDevice, $ionicLoading, OTSessionMain, OTSessionMainSub, OculoraProfileRetrieve, OculoraActiveSubList, OculoraStartSession, OculoraEndSession, OculoraFollower) {

    $ionicModal.fromTemplateUrl('templates/roomsubview.html', {
                scope: $scope
        }).then(function(modal) {
            $scope.roomsubview = modal;
    });

    $ionicPopover.fromTemplateUrl('templates/roomsactivepubsbrowse.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.roomsactivepubsbrowse = modal;
    });

    

    $scope.items = [];
    $scope.page = 0;
    $scope.activeRoom = 0;
    $scope.normalControl = 0;
    $scope.newPub = {};
    $scope.pubgone = {};
    $scope.inNotify = false;
    $scope.activeRoomList = {};

    $scope.pageTitle = "Oculora - Subscribable";
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

	var facePublisherPropsHD = {
        name: 'face',
        width: '100%',
        height: '100%',
        style: {
          nameDisplayMode: 'off'
        },
		subscribeToAudio : false,
		publishAudio: false,
        resolution: '1280x720',
        frameRate: '30'
      },
        facePublisherPropsSD = {
          name: 'face',
          width: '100%',
          height: '100%',
          style: {
            nameDisplayMode: 'off'
          }
        };

	$scope.facePublisherProps = angular.copy(facePublisherPropsHD);
	
    $scope.$on("OnFocusSubscriberView", function(ev) {
        if($scope.inNotify != false) {
            //$scope.inNotify = inNotify;
            $scope.roomsubview.show();
        }
        else
            $scope.getSubList(false);
    });

    $scope.$on("NotifySub", function(event) {
                              //alert(d);
        $scope.inNotify = true;
        if($scope.roomsubview.isShown() != false)
            $scope.$broadcast("NotifyPlaySub");
        else
            $scope.roomsubview.show();
    });

    

    $scope.getSubList = function(inReset) {


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
        //var queryObj = { QueryFields.page: pg, QueryFields.sortOrder: sortOrder, QueryFields.sortOn: sortOn };
        if($scope.sortData.length > 0)
            queryObj[QueryFields.sortData] = $scope.sortData;
        OculoraActiveSubList.get(queryObj, function(resObj, st) {
                  //alert(st);
            $ionicLoading.hide();
                  //var resObj = angular.fromJson(res2);
                  //alert(resObj.result);
            if(resObj.result != 2) {
                      //alert(resObj.message);
                if(resObj.result == 3) {
                          //num = 4;
                    $scope.items = [];
                    return;
                }
                $cordovaDialogs.confirm(resObj.message, "Access Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            $scope.getSubList(inReset);
                        }
                                //else
                                  //navigator.app.exitApp();

                    });
            }
            else {
                $ionicLoading.hide();
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
                        rooms[room].infoState = true;
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
                        //rooms[room].followr = "button button-small icon ion-heart";
                        rooms[room].followr = ( rooms[room].follow ? $scope.followrYesCls : $scope.followrNotCls);
                      }
                      //$scope.items = rooms;
                      //$scope.page++;
                      if($scope.page == 0)
                          $scope.items = rooms;
                        else
                          $scope.items.concat(rooms);
                        $scope.page++;
                      //

                        //$scope.$emit('FullScreenEvent', "fullscreen");
                      //alert(JSON.stringify(rooms));
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
                        $scope.getSubList(inReset);
                    }
                      //else
                          //navigator.app.exitApp();

                });
        });
    }

    $scope.roomsubscribe = function(item, $event) {
        $scope.roomCardFlipSupp($event);
        $scope.roomSubscribe(false, item);
        //item.infoState = false;
    }

    $scope.roomsubscribeend = function(item, $event) {
        $scope.roomCardFlipSupp($event);
        //item.infoState = true;
        $scope.roomsubend(item, true);
    }

    $scope.endSession = function(item, subItem, inBrowse) {
        var q = $q.defer();
		//alert(inBrowse);
        //for(var i = 0; i < $scope.activeSubsChatted.length; i++)
        //window.localStorage.removeItem($scope.activeSubsChatted[i]);
        if(Oculora_OpentokDeploy != true)
          {
                $scope.roomsubview.hide();
                return;
          }
        var ret = false;

        var subItem1 = angular.copy(subItem);
        $ionicLoading.show({
          template: 'Connecting...'
        });

        subItem.$save({}, function(resObj, st) {
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

                        $scope.endSession(item, subItem1, inBrowse);

                      //else
                          //navigator.app.exitApp();

                  });
            }
            else {
                //if(inBrowse != false) {
                    
					if(inBrowse != false) {
						//item.subscribing = false;
						//item.infoState = true;
						
						/*var newitem = $scope.activeRoomList[item[FieldNames.id]];
						alert(angular.toJson(newitem));
						var idx = $scope.activeRoomList[item[FieldNames.id]].idx;
						if(idx != null) {
							idx--;
							delete newitem.idx;
							var itemlast = $scope.items.splice(idx,1, angular.copy(newitem));
							itemlast = {};
						}*/
						
						$scope.activeRoomList[item[FieldNames.id]] = null;
						delete $scope.activeRoomList[item[FieldNames.id]];
					}
					
                    
					item.subscribeCreds = null;
					delete item.subscribeCreds;
                //}

                ret = true;
              
            }

        }, function(st) {
          //alert("Error in accessing service. Retry");
          $ionicLoading.hide();
          $cordovaDialogs.confirm("Error in accessing service. Retry", "Access Error", ['Retry'])
              .then(function(buttonIndex) {
                  // no button = 0, 'OK' = 1, 'Cancel' = 2
                      //var btnIndex = buttonIndex;
                      //if(btnIndex == 2)


                          $scope.endSession(item, subItem1, inBrowse);

                      //else
                          //navigator.app.exitApp();

              });
        });
        q.resolve(ret);
        return q.promise;
    }

	var _roomsubend = function(item)
	{
		if(inSubscribing == 1) {
			$scope.abortPaymentTrackerModel();
			inSubscribing = 0;
		}
		
		
		$timeout(function() {
            item.subscribing = false;
		item.infoState = true;
		if(item.OTSessionMainSub) {
			item.OTSessionMainSub.mainsubsession.disconnect();
			item.OTSessionMainSub.mainsubsession.off();
			item.OTSessionMainSub.mainsubsession = null;
			OTSessionMainSub.clearMainSubRef(item.otsindex);
			//item.OTSessionMainSub = null;
			//delete item.OTSessionMainSub;
		}
        }, 1000);
		var subItem = new OculoraEndSession();
		subItem[FieldNames.id] = item[FieldNames.id];
		subItem[FieldNames.SessionInstance] = item.subscribeCreds[FieldNames.SessionInstance];
		//pubItem[FieldNames.uid] = item[FieldNames.uid];
		subItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Subscribe;
		//alert(JSON.stringify(pubItem));
		//$scope.inStopButtonEnd = true;
		$scope.endSession(item, subItem, true);
		
		//item.subscribeCreds = null;
		//delete item.subscribeCreds;
	}
	
    $scope.roomsubend = function(item, prompt) {

		if(prompt != true) {
			_roomsubend(item);
			return;
		}
        $cordovaDialogs.confirm("Are you sure you want to end subscription to this room", "Subscriber Prompt", ['Cancel','OK'])
          .then(function(buttonIndex) {
              // no button = 0, 'OK' = 1, 'Cancel' = 2
              var btnIndex = buttonIndex;
              if(btnIndex == 2)
              {
                  //alert(JSON.stringify(item));
                  //return;

                  _roomsubend(item);

                  //$scope.publishItem = null;
                  //$scope.inStopButtonEnd = true;
                  //$scope.roompubview.hide();
              }
                                  //else
                                      //navigator.app.exitApp();

        });

                          //$scope.roomsactivesubs.show($event);
                          //alert($scope.roomsactivesubs);
        }


    $scope.$on('modal.shown', function(e, m) {
        // Execute action
        if(m == $scope.roomsubview) {
            var curItem = -1;
            if($scope.inNotify != true ) {
				curItem = $scope.items[$scope.activeRoom].activeItemIdx;
				//alert(angular.toJson($scope.items[$scope.activeRoom].pubs[$scope.items[$scope.activeRoom].activeItem]));
				//curItem = $scope.items[$scope.activeRoom].pubs[$scope.items[$scope.activeRoom].activeItemIdx];
				//$scope.inNotify = false;
				//alert("curItem:" + angular.toJson($scope.items[$scope.activeRoom].pubs[0]) + "index:" + $scope.items[$scope.activeRoom].activeItemIdx);
			}
            else 
				$scope.inNotify = false;
            $scope.$broadcast('SubMainViewEvent', curItem);
            
            //$scope.items[$scope.activeRoom].activeItem = -1;
            //$scope.activeRoom = -1;
        }
    });

    $scope.roomsubscribemainview = function(idx) {
        //if(Oculora_OpentokDeploy != false) {
            //$scope.items[$scope.activeRoom].subscribing = false;
            //$scope.items[$scope.activeRoom].infoState = true;
            //$scope.activeRoomList[item[FieldNames.id]] = item;

            angular.forEach($scope.activeRoomList, function(value, key) {
				//alert(Object.keys(value));
				//alert(key);
				
              value.infoState = true;
              value.subscribing = false;
			  $scope.roomsubend(value, false);
            });
			
            $scope.activeRoomList = {};
			$scope.activeRoom = idx;
			if(inSubscribing > 0) {
				$scope.abortPaymentTrackerModel();
				inSubscribing = 0;
			}
        //}
		OTSessionMainSub.clearMainSubRefs();
		//alert($scope.activeRoom);
        $scope.roomsubview.show();
    }

    $scope.roomSubscribeWork = function(item, idx) {
        item.infoState = false;
        $scope.activeRoomList[item[FieldNames.id]] = item;
		$scope.activeRoomList[item[FieldNames.id]].idx = idx;
        var subItem = new OculoraStartSession();
        subItem[FieldNames.id] = item[FieldNames.id];
        //pubItem[FieldNames.uid] = item[FieldNames.uid];
        subItem[FieldNames.FullView] = false;
        subItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Subscribe;
        //alert(JSON.stringify(pubItem));
        $scope.startSession(subItem, item);
    }

    $scope.roomSubscribe = function(inNotify, item, idx) {
        //$scope.browsechatWindow = false;
        //$scope.activeUserIdx = -1;
    //alert(JSON.stringify($scope.publishItem));

        //$scope.roomCardFlipSupp($event);
        if(inNotify != false) {
			//alert("in notify sub!");
            //$scope.roomSubscribeWork(item);
            return;
        }

        $cordovaDialogs.confirm("Are you sure you want to subscribe to this room", "Subscriber Prompt", ['Cancel','OK'])
            .then(function(buttonIndex) {
                // no button = 0, 'OK' = 2, 'Cancel' = 1
                var btnIndex = buttonIndex;

                if(btnIndex == 2)
                {
                    $scope.roomSubscribeWork(item);
                    //alert(JSON.stringify(item));
                    //return;
                    /*item.infoState = false;
                    var subItem = new OculoraStartSession();
                    subItem[FieldNames.id] = item[FieldNames.id];
                    //pubItem[FieldNames.uid] = item[FieldNames.uid];
                    subItem[FieldNames.StreamType] = Oculora_StreamType.StreamType_Subscribe;
                    //alert(JSON.stringify(pubItem));
                    $scope.startSession(subItem, item);*/
                    //$scope.publishItem = item;
                    //$scope.roompubview.show();
                }
                                    //else
                                        //navigator.app.exitApp();

        });


    }

    $scope.startSession = function(subItem, item) {
        var subItem1 = angular.copy(subItem);
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
                            $scope.startSession(subItem1, item);
                        }
                        //else
                            //navigator.app.exitApp();

                    });
            }
            else {
                //$scope.access = angular.fromJson(resObj.message);
                var res2 = angular.fromJson(resObj.message);
                item.subscribeCreds = res2;
                $scope.startSubscribe(item);
                //item.subscribeItem = item;
                //$scope.roompubview.show();

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
                            $scope.startSession(subItem1, item);
                        }
                        //else
                            //navigator.app.exitApp();

                });
        });
    }

	var inSubscribing = 0;
	
    $scope.startSubscribe = function(item) {
            if(Oculora_OpentokDeploy != true) {
                return;
            }
			$scope.facePublisherProps = angular.copy(facePublisherPropsHD);
            var subscriber = OTSessionMainSub.getSub();
            subscriber.init($rootScope.access[FieldNames.apiKey], item.subscribeCreds[FieldNames.RoomSessId], item.subscribeCreds[FieldNames.RoomToken], function(err, session) {
                
				//alert("sess in");
				if(inSubscribing == 0) {
					$scope.paymentButtonClassTracker(null, function(){}, function(){
						$scope.roomsubend(item, false);
					//alert("No credits available. Ending session...");
					});
				}
				inSubscribing++;
				subscriber.mainsubsession = session;
                var connectDisconnect = function(connected) {
                    $scope.$apply(function() {
                      subscriber.connected = connected;

                      item.subscribing = connected;
                      if(!connected)
                        $scope.roomsubend(item, false);
                    });
                };
                if ((session.is && session.is('connected')) || session.connected) {
                    connectDisconnect(true);
                }
                subscriber.session.on('sessionConnected', connectDisconnect.bind(subscriber.mainsubsession, true));
                subscriber.session.on('sessionDisconnected', function(event) {
                     /*
					 if((event.connection.connectionId === subscriber.session.connection.connectionId) || ($scope.pubs.length < 1))
                         connectDisconnect.bind(subscriber.session, false);
                     else {

                     }*/
                });
                subscriber.session.on('connectionCreated', function(event) {
					var ii = 0;
					ii++;
                    //if(inBrowse != true) {
                        //var sideband = angular.fromJson(event.connection.data);
                        //$scope.sidebandPublish(sideband);
                    //}

                });
                subscriber.session.on('streamCreated', function(event) {
					//alert(event.stream.connection.data);
                    var pubData = angular.fromJson(event.stream.connection.data);
					if(pubData[FieldNames.profileimage] == null)
						pubData[FieldNames.profileimage] = "img/oculora.png";
                    //var pub = $scope.builduser(pubData);
					//alert(angular.toJson(pubData));
                    pubData.stream = event.stream;
					
					$scope.$apply(function() {
						item.pubs.push(pubData);
						if(subscriber.streams.length == 1) {

							//item.subscribing = true;
							item.activeItemIdx = 0;
							pubData.active = true;
						}
						//show a popup allowing user to switch to this publisher
						else {
							//$scope.activeRoom = subscriber.streams.indexOf(pubData.stream) ;
							$scope.newpubshow(pubData);
						}
							
                    });
                    
                });
                subscriber.session.on('streamDestroyed', function(event) {
					/*var idx = item.OTSessionMainSub.streams.indexOf(event.stream);
					$scope.$apply(function () {
						var cntr = 0;
						for(var key in $scope.mainsession.browsepub) {
							if(cntr > idx)
								$scope.mainsession.browsepub[key]--;
							cntr++;
						}
						$scope.publishers.splice($scope.activePub, 1);
					});*/
                    //show a popup notifying user of publisher dropping
                    var pubIdx = item.OTSessionMainSub.streams.indexOf(event.stream);
					
					$scope.$apply(function() {
						var pub = item.pubs.splice(pubIdx, 1);
						if(subscriber.streams.length > 0)
							$scope.pubgoneshow(pub);
						if(pub.active != false) {
							pub.active = false;
						}
					});	
					if(subscriber.streams.length > 0) {
								$scope.pubselect(null, pubIdx < (subscriber.streams.length - 1) ? pubIdx : 0);
								//var pubNew = item.OTSessionMainSub.streams[pubIdx < subscriber.streams.length ? pubIdx : 0];
								//pubNew.active = true;
							}
					else {
						$scope.roomsubend(item, false);
					}
                    
                    
                });
                //var newSub = {OTSessionSideBand: subscriber, stream: subscriber.streams[0]};
                item.OTSessionMainSub = subscriber;
                item.otsindex = subscriber.mainsubsindex
                //item.stream = subscriber.streams;
                item.pubs = [];
                //item.subscribing = true;

            });
    }

    $scope.roomAvailablePubs = function(ev, idx) {
        $scope.activeRoom = idx;
		//alert(angular.toJson($scope.items[$scope.activeRoom].pubs));
        $scope.roomsactivepubsbrowse.show(ev);
    }

	$scope.pubselectlist = function(ev, itemidx, pubidx) {
		$scope.pubselect(ev, itemidx, pubidx);
	}
    $scope.pubselect = function(ev, itemidx, pubidx) {
        //var curItem = $scope.items[$scope.activeRoom].pubs[$scope.items[$scope.activeRoom].activeItem];
        //curItem.OTSessionMainSub.
        //$scope.items[$scope.activeRoom].stream = $scope.items[$scope.activeRoom].OTSessionMainSub.streams[idx];
		//alert($scope.items[itemidx].activeItemIdx);
		if($scope.items[itemidx].activeItemIdx == pubidx)
			return;
        $scope.items[itemidx].pubs[$scope.items[itemidx].activeItemIdx].active = false;
		//$scope.activeRoom = itemidx;
        $scope.items[itemidx].activeItemIdx = pubidx;
        $scope.items[itemidx].pubs[$scope.items[itemidx].activeItemIdx].active = true;
    }



    $scope.newpubshow = function(pub) {
		
        $scope.newPub = pub;
        $scope.normalControl = 1;
        $scope.subNewPubTimer = $timeout(function() {
            $scope.newpubdismiss(false);
        }, 1000*Oculora_SubNewPubTimeout);
    }

    $scope.newpubdismiss = function(inEvent, ev) {
        $timeout.cancel($scope.subNewPubTimer);

        if(inEvent != false)
            $scope.roomCardFlipSupp(ev);
        $scope.normalControl = 0;
        $scope.newPub = {};
    }

    $scope.newpubconnect = function(ev, itemidx) {
        $scope.roomCardFlipSupp(ev);
        //var pubIdx = $scope.items[idx].pubs.indexOf(pub);
		var pubIdx = $scope.items[itemidx].pubs.length - 1;
        $scope.pubselect(ev, itemidx, pubIdx);
        $scope.newpubdismiss(false);
    }

    $scope.pubgoneshow = function(pub) {
        $scope.pubgone = pub;
		//alert(angular.toJson($scope.pubgone));
        $scope.normalControl = 2;
        $scope.subPubGoneTimer = $timeout(function() {
            $scope.pubdonedismiss(false);
        }, 1000*Oculora_SubPubGoneTimeout);
    }

    $scope.pubdonedismiss = function(inEvent) {
        $timeout.cancel($scope.subPubGoneTimer);

        if(inEvent != false)
            $scope.roomCardFlipSupp($event);
        $scope.normalControl = 0;
        $scope.pubgone = {};
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
});

