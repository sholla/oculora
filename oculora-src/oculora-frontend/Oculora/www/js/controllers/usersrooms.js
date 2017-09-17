
OculoraApp.controller('UsersRoomsCtrl', function($scope, $rootScope, $ionicPlatform, $ionicModal, $ionicPopover, $http, Upload, $cordovaDialogs, $timeout, $ionicLoading, OculoraRoom, OculoraRemoveRoom, OculoraListRoom) {
              //alert("ok");
    $scope.pageTitle = "My Rooms";
    $scope.page = 0;
	$scope.items = [];
    $scope.sortOns = [
                       {name: "Date"},
                       {name: "User"},
                       {name: "Name"}
                   ];
                   $scope.sortOn1 = $scope.sortOns[0];

                   $scope.sortOrders = [
                      {name: "Asc"},
                      {name: "Dec"}
                   ];
                   $scope.sortOrder1 = $scope.sortOrders[0];
                   $scope.sortData1 = "";

    $ionicModal.fromTemplateUrl('templates/roommodal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.roommodal = modal;
            $scope.resetnewroom();

    });

    $ionicModal.fromTemplateUrl('templates/roomcandidates.html', {
            scope: $scope
            }).then(function(modal) {
                $scope.roomcandidates = modal;

                $scope.resetnewroomcandidates();

    });

    $ionicModal.fromTemplateUrl('templates/roomimages.html', {
            scope: $scope
            }).then(function(modal) {
                $scope.roomimages = modal;
    });

    $ionicModal.fromTemplateUrl('templates/roomimagesuser.html', {
            scope: $scope
            }).then(function(modal) {
                $scope.roomimagesuser = modal;

    });

    /*$ionicPopover.fromTemplateUrl('templates/userlist.html', {
            scope: $scope
        }).then(function(modal) {
                $scope.userlist = modal;
    });*/

	//$scope.$on("NewRoomImage", function(event, entry, file, url) {
    $scope.$on("NewRoomImage", function(event,  file) {
          //alert(url);
          $scope.$apply(function () {
			  //alert(file);
              //$scope.newroom.images.push({src: file, entry: entry, url: url});
			  $scope.newroom.images.push({src: file});
          });
    });

    $scope.newroomremove = function(id) {

        var newroom = new OculoraRemoveRoom();
        newroom[FieldNames.id] = id;
          //var newRoom1 = angular.copy(newroom);
        $ionicLoading.show({
            template: 'Connecting...'
        });
        newroom.$save({}, function(res2, st) {
                          //alert(st);
            $ionicLoading.hide();
            var resObj = angular.fromJson(res2);
            if(resObj.result != 2) {
                                           //alert(resObj.message);
                $cordovaDialogs.confirm(resObj.message, "Room Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            $scope.newroomremove(id);
                        }


                    });
            }
            else {
                $scope.roommodal.hide();
            }

        }, function(st) {
                          //alert("Error in accessing service. Retry");
            $ionicLoading.hide();
            $cordovaDialogs.confirm("Error in accessing service. Retry", "Room remove Error", ['Exit','Retry'])
                .then(function(buttonIndex) {
                      // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if(btnIndex == 2)
                    {
                        $scope.newroomremove(id);
                    }


            });
        });

    }

    $scope.resetnewroom = function() {
		
		/*if($scope.newroom != undefined) {
			if($scope.newroom.images != undefined) {
				for(var i = 0; i < $scope.newroom.images.length; i++) {
					$scope.clearTmpFile($scope.newroom.images[i].entry);
				}
			}
		}*/
        $scope.newroom = { name: "", description: "", imageURL : 'img/oculora.png', images: [], enableRoom: true, mainImage: -1, curimgidx: 0};

        $scope.newroom.tags = [
                                { text: 'shirts' },
                                { text: 'jeans' },
                                { text: 'tops' },
                                { text: 'purse' }
                              ];
        $scope.newroom[FieldNames.create] = 0;
        $scope.resetnewroomcandidates();
    }

    $scope.newroomstart = function() {
                  //alert($scope.newroom.publishers.mode);
        $scope.resetnewroom();
		//alert(angular.toJson($scope.newroom));
        $scope.roommodal.show();
    }

	$scope.newroomcancel = function() {
		//clearTmpFiles();
        $scope.roommodal.hide();
    }
	
    $scope.resetnewroomcandidates = function() {
		if($scope.newroom === undefined) 
			$scope.newroom = {};
		$scope.newroom.publishers = {mode : 0, candidates: [], tagsfilter: false};
        //$scope.newroom.publishers = {mode : 0, candidates: [], tagsfilter: false};
    }

    $scope.newroomcandidatesselect = function() {
                  //alert($scope.newroom.publishers.mode);
         $scope.newroom.publishers.tagsfilter=false;
         $scope.getUserList();
    }

    $scope.newroomcandidatesopen = function() {
         //alert($scope.newroom.publishers.mode);
        if(($scope.newroom.mainImage < 0) && ($scope.newroom.images.length > 0))
            $scope.newroom.mainImage = 0;
        $scope.roomcandidates.hide();
    }

    $scope.newroomcandidatescancel = function() {
              //alert($scope.newroom.publishers.mode);
        $scope.resetnewroomcandidates();
        $scope.roomcandidates.hide();
    }

    $scope.newroommainimage = function(idx) {
        $scope.newroom.images[idx].style={'border-style':'solid'};
        if($scope.newroom.mainImage >= 0) {

            var mi = $scope.newroom.mainImage;

            $scope.newroom.images[mi].style={'border-style':'none'};

        }
        $scope.newroom.mainImage = idx;

        //$scope.newroom.imageURL = $scope.newroom.images[idx];
        //alert(idx);
    }

    $scope.roomimagesshow = function() {
		//alert(angular.toJson($scope.newroom));
        $scope.newroom.curimgidx = $scope.newroom.images.length;
        $scope.roomimages.show();
    }

    $scope.roomimagesdone = function() {
        if(($scope.newroom.images.length > 0) && ($scope.newroom.mainImage < 0)) {
                //alert($scope.newroom.images[0].src);
			$scope.newroom.mainImage = 0;
            //$scope.newroom.imageURL = $scope.newroom.images[0];
			//alert($scope.newroom.images[$scope.newroom.mainImage].src.name);
            
        }
        $scope.roomimages.hide();
    }

    $scope.roomimagescancel = function() {

        if($scope.newroom.images.length > $scope.newroom.curimgidx ) {
                //alert("here");
            var il = $scope.newroom.images.length - $scope.newroom.curimgidx;
            if($scope.newroom.mainImage > il) {
                $scope.newroom.mainImage = 0;
                //$scope.newroom.imageURL = $scope.newroom.images[0].src;
            }
			//clearTmpFiles();
                //$scope.newroom.images.slice($scope.newroom.curimgidx - 1, il - $scope.newroom.curimgidx );
            //for(var i = 0; i < il; i++)
                //$scope.newroom.images.pop();
        }

        $scope.roomimages.hide();
    }

    $scope.roomimageremove = function(idx) {
        //var img = $scope.newroom.images.splice(idx, 1);
		//$scope.clearTmpFile(img.entry);
		
        if($scope.newroom.mainImage > $scope.newroom.images.length) {
            if($scope.newroom.images.length > 0) {
                $scope.newroom.mainImage = 0;
                //$scope.newroom.imageURL = $scope.newroom.images[0].src;
            }
            else {
                $scope.newroom.mainImage = -1;
                //$scope.newroom.imageURL = "img/oculora.png";
            }
        }
            //alert($scope.newroom.images.length);
    }

    $scope.userlistfinish = function(cancel) {
                      //alert($scope.newroom.publishers.mode);
        if(cancel)
            $scope.newroom.publishers.candidates = [];
        userlist.hide();
    }


    $scope.userSortOrder = "Asc";
       $scope.userSortOrders = [
          {name: "Asc"},
          {name: "Dec"}
       ];
       $scope.userSortData = "";
    $scope.userpage = 0;
    $scope.users = [];

    $scope.getUserList = function() {
        var page = QueryFields.page;
        var sortOrder = QueryFields.sortOrder;
        var queryObj = {};
        queryObj[QueryFields.page] = $scope.userpage;
        queryObj[QueryFields.sortOrder] = $scope.userSortOrder;
        //var queryObj = {page: $scope.userpage, sortOrder: $scope.userSortOrder};
        if($scope.userSortData.length > 0)
            queryObj[QueryFields.sortData] = $scope.userSortData;
        OculoraActiveSubList.get(queryObj, function(resObj, st) {
                  //alert(st);
            $ionicLoading.hide();
                  //var resObj = angular.fromJson(res2);
                  //alert(resObj.result);
            if(resObj.result != 2) {
                      //alert(resObj.message);
                if(resObj.result == 3) {
                          //num = 4;
                    return;
                }
                $cordovaDialogs.confirm(resObj.message, "Room Save Access Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                        var btnIndex = buttonIndex;
                        if(btnIndex == 2)
                        {
                            $scope.getUserList();
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
                      alert(resObj.message);
                    var users1 = angular.fromJson(resObj.message);
                    for(user1 in users1)
                    {
						if(users1[user1].images == null) {
							users1[user1].imageURL = "img/oculora.png";
							continue;
						}
                        
						users1[user1].images = OculoraURLs.HostAddress + users1[user1].images;
						var rm = users1[user1] ;
						users1[user1].imageURL = ((typeof users1[user1].images) == "string") ? users1[user1].images : users1[user1].images[rm[FieldNames.MainImageIdx]];
                        /*if(users1[user1].imageURL == null) {
							users1[user1].imageURL = "img/oculora.png";
							
						}
                        else    
							users1[user1].imageURL = OculoraURLs.HostAddress + users1[user1].imageFile;*/
                        //var rm = rooms[room] ;
                        //rooms[room].imageURL = ((typeof rooms[room].images) == "string") ? rooms[room].images : rooms[room].images[rm[FieldNames.MainImageIdx]];

                        //rooms[room].followr = "button button-small icon ion-heart";

                      }
					  if($scope.page == 0)
						$scope.users = users1;
					  else
						$scope.users.concat(users1);
					  $scope.userpage++;
                      /*$scope.users.concat(users1);
                      $scope.userpage++;
                      $scope.userlist.show();*/
            }

        }, function(st) {
              //alert("Error in accessing service. Retry");
            $ionicLoading.hide();
            $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Save Access Error", ['Exit','Retry'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if(btnIndex == 2)
                    {
                        $scope.getUserList();
                    }
                      //else
                          //navigator.app.exitApp();

                });
        });
    }

    $scope.newroommanip = function() {
        var nameEmpty = isEmpty($scope.newroom.name);
        if(nameEmpty != false) {
            alert("Room Name cannot be empty");
            return;
        }
        var newroom = new OculoraRoom();
        newroom[FieldNames.name] = $scope.newroom.name;
        newroom[FieldNames.descr] = $scope.newroom.description;
        newroom[FieldNames.tags] = [];
        var tagsList = angular.fromJson($scope.newroom.tags);

        for( t in tagsList ) {
            newroom[FieldNames.tags].push(tagsList[t].text);
        }
          //alert($scope.newroom.name);
        newroom[FieldNames.searchMode] = parseInt($scope.newroom.publishers.mode);
        newroom[FieldNames.tagsfilter] = $scope.newroom.publishers.tagsfilter;
          //var pubs = newroom[FieldNames.publishers];
          //alert($scope.newroom.name);
        if(newroom[FieldNames.searchMode] > Oculora_SearchMode[1]) {
              //is a specific set of users for publishing
            newroom[FieldNames.publishers] = $scope.newroom.publishers.candidates;

        }
          //newroom[FieldNames.images] = $scope.newroom.images;
          //alert($scope.newroom.name);
        if($scope.newroom.id != null)
            newroom[FieldNames.id] = $scope.newroom.id;
        newroom[FieldNames.enableRoom] = $scope.newroom.enableRoom;
        newroom[FieldNames.create] = true;
        newroom[FieldNames.MainImageIdx] = $scope.newroom.mainImage;
          //alert(JSON.stringify(newroom));
        $scope.roomedit(newroom);
          //$scope.roommodal.hide();
    }

	/*var clearTmpFiles = function() {
		if($scope.newroom.images != undefined) {
			for(var i = 0; i < $scope.newroom.images.length; i++) {
				$scope.clearTmpFile($scope.newroom.images[i].entry);
			}
		}
		$scope.picFile = [];
		$scope.newroom.images = [];
	};*/
      /*
          newRoom: room object

      */
      $scope.roomedit = function(newRoom) {

          $scope.roomedit1(newRoom);

      }

      $scope.roomedit1 = function(newRoom) {
          $ionicLoading.show({
              template: 'Connecting...'
          });
          var newRoom1 = angular.copy(newRoom);
          newRoom.$save({}, function(resObj, st) {
              //alert(res2.result == 2);
              $ionicLoading.hide();
              //var resObj = angular.fromJson(res2);

              if(resObj.result != 2) {
                               //alert(resObj.message);
				  if(resObj.result == 4) {
					$scope.newroom.name = "";
					$scope.roomForm.roomName.$setValidity("server", false);
					return;
				  }
                  $cordovaDialogs.confirm(resObj.message, "Room Modification Room Error", ['Cancel','Retry'])
                      .then(function(buttonIndex) {
                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = buttonIndex;
                          if(btnIndex == 2)
                          {
                              $scope.roomedit1(newRoom1);
                          }
                          else if(btnIndex == 1) {
							  //clearTmpFiles();
                              $scope.roommodal.hide();
						  }
                      });
              }
              else {
                  //$scope.access = angular.fromJson(resObj.message);
                  //
                  newRoomRes = angular.fromJson(resObj.message);
                  newRoom = newRoom1;

                  newRoom[FieldNames.id] = newRoomRes[FieldNames.id];
                  //alert(JSON.stringify(newRoomRes));

                  $scope.roomedit2(newRoom);

              }

          }, function(st) {
              //alert("Error in accessing service. Retry");
              $ionicLoading.hide();
              $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Modification Access Error", ['Exit','Retry'])
                  .then(function(buttonIndex) {
                      // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = buttonIndex;
                          if(btnIndex == 2)
                          {
                              $scope.roomedit1(newRoom1);
                          }
                          else if(btnIndex == 1) {
							  //clearTmpFiles();
                              $scope.roommodal.hide();
						  }

                  });
          });

      }

      $scope.roomedit2 = function(newRoom) {
          //alert($scope.newroom.images.length);
          //newRoom[FieldNames.images] = $scope.newroom.images;
          //alert($scope.newroom.images.length);
          if($scope.newroom.images.length > 0) {
              $scope.newroom[FieldNames.create] = $scope.newroom.images.length;
              for(fileName in $scope.newroom.images) {
                  //alert($scope.newroom.images[fileName].src);
                  //$scope.roomedit3(newRoom, $scope.newroom.images[fileName].entry, $scope.newroom.images[fileName].url);
				  $scope.roomedit3(newRoom, $scope.newroom.images[fileName].src);
              }
          }
          else
              $scope.roomedit4(newRoom);

      }

	  $scope.roomedit3 = function(newRoom, f) {
			var newRoom1 = angular.copy(newRoom);
              //var f2 = f.toURL();
              //var filePath = $rootScope.profile.imageURL;
              var url = AbsoluteOculoraURL(OculoraURLs.RoomImage);
              //var trustHosts = true
			  var headers={'adid':$rootScope.profile.adid, 'mid': newRoom[FieldNames.id]};
              var options = {url: url, file: f, headers: headers};

              

              //options.headers = headers;
              //options.file=u.substr(u.lastIndexOf('/')+1);

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
						  //alert(angular.toJson(status));
                          if(status != 200) {
                              $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Image Room Error", ['Exit','Retry'])
                                  .then(function(buttonIndex) {
                                      // no button = 0, 'OK' = 1, 'Cancel' = 2
                                      var btnIndex = buttonIndex;
                                      if(btnIndex == 2)
                                      {
                                          $ionicLoading.hide();
                                              $scope.roomedit3(newRoom3, f);
                                      }
                                      else if(btnIndex == 1) {
										  //clearTmpFiles();
                                          $scope.newroomremove(newRoom1[[FieldNames.id]]);
                                          //$scope.roommodal.hide();
                                      }
                                  });
                          }
                          else {
                              var resObj = angular.fromJson(r);
                              if(resObj.result != 2) {
                                                                   //alert(resObj.message);
                                  $cordovaDialogs.confirm(resObj.message, "Room Image Save Error", ['Exit','Retry'])
                                      .then(function(buttonIndex) {
                                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                                          var btnIndex = buttonIndex;
                                          if(btnIndex == 2)
                                          {
                                              $scope.roomedit3(newRoom3, f);
                                          }
                                          else if(btnIndex == 1) {
											  //clearTmpFiles();
                                              $scope.newroomremove(newRoom1[[FieldNames.id]]);
                                              //$scope.roommodal.hide();
                                          }

                                      });
                              }
                              else {
                                  $scope.roomedit4(newRoom1);
                                  
                              }
                          }
                      }).error(function(){
						  $ionicLoading.hide();
                          $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Image Room Error", ['Exit','Retry'])
                              .then(function(buttonIndex) {
                                  // no button = 0, 'OK' = 1, 'Cancel' = 2
                                  var btnIndex = buttonIndex;
                                  if(btnIndex == 2)
                                  {

                                      $scope.roomedit3(newRoom3, f);
                                  }
                                  else if(btnIndex == 1) {
									  //clearTmpFiles();
                                      $scope.newroomremove(newRoom1[[FieldNames.id]]);
                                      //$scope.roommodal.hide();
                                  }
                              });
					  });
          }
      
      $scope.roomedit4 = function(newRoom) {

          $ionicLoading.show({
              template: 'Connecting...'
          });
          $scope.newroom[FieldNames.create]--;
          var creating = $scope.newroom[FieldNames.create];
          if(creating > 0)
              return;

          var newroom = new OculoraRoom();
          newroom[FieldNames.id] = newRoom[FieldNames.id];
          newroom[FieldNames.create] = false;
          var newroom1 = angular.copy(newroom);
          newroom.$save({}, function(resObj, st) {
                          //alert(st);
              $ionicLoading.hide();
          //var resObj = angular.fromJson(res2);
              if(resObj.result != 2) {
                                           //alert(resObj.message);
                  $cordovaDialogs.confirm(resObj.message, "Room Finalization Room Error", ['Exit','Retry'])
                      .then(function(buttonIndex) {
                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = buttonIndex;
                          if(btnIndex == 2)
                          {
                              $scope.roomedit4(newroom1);
                          }
                          else if(btnIndex == 1) {
							//clearTmpFiles();
                              $scope.newroomremove(newroom1[[FieldNames.id]]);
                              $scope.roommodal.hide();
                          }

                      });
              }
              else {
					//clearTmpFiles();
					$scope.roommodal.hide();
              }

          }, function(st) {
                              //alert("Error in accessing service. Retry");
              $ionicLoading.hide();
              $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Finalization Access Error", ['Exit','Retry'])
                  .then(function(buttonIndex) {
                      // no button = 0, 'OK' = 1, 'Cancel' = 2
                      var btnIndex = buttonIndex;
                      if(btnIndex == 2)
                      {
                          $scope.roomedit4(newroom1);
                      }
                      else if(btnIndex == 1) {
                          $scope.newroomremove(newroom1[[FieldNames.id]]);
						  //clearTmpFiles();
                          $scope.roommodal.hide();
                      }

                  });
          });
      }

      $scope.getRooms = function(inReset) {
          var num = 0;

          $ionicLoading.show({
              template: 'Connecting...'
          });
          if(inReset != false)
                $scope.page = 0;
          var sortOrder1 = $scope.sortOrders.indexOf($scope.sortOrder1);
                  var sortOn1 = $scope.sortOns.indexOf($scope.sortOn1);
                  var queryObj = {};
                  queryObj[QueryFields.page] = $scope.page;
                  queryObj[QueryFields.sortOrder] = sortOrder1;
                  queryObj[QueryFields.sortOn] = sortOn1;
          //var queryObj = { page: $scope.userpage, sortOrder1: sortOrder, QueryFields.sortOn: sortOn };
          //alert(angular.toJson(queryObj));
          if($scope.sortData1.length > 0)
              queryObj[QueryFields.sortData] = $scope.sortData1;
         OculoraListRoom.get(queryObj, function(res2, st) {
              //alert(st);
              $ionicLoading.hide();
              var resObj = angular.fromJson(res2);
              //alert(resObj.result);
              if(resObj.result != 2) {
                  //alert(resObj.message);
                  if(resObj.result == 3) {

                      return;
                  }
                  $cordovaDialogs.confirm(resObj.message, "Room Listing Access Error", ['Exit','Retry'])
                      .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = buttonIndex;
                            if(btnIndex == 2)
                            {
                              $scope.getRooms(inReset);
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
					if(rooms[room].images == null) {
						rooms[room].imageURL = "img/oculora.png";
						continue;
					}
                        
                    rooms[room].images = OculoraURLs.HostAddress + rooms[room].images;
                    var rm = rooms[room] ;
                    rooms[room].imageURL = ((typeof rooms[room].images) == "string") ? rooms[room].images : rooms[room].images[rm[FieldNames.MainImageIdx]];
					
                    /*if(rooms[room].images == null)
                        continue;
                    rooms[room].images = OculoraURLs.HostAddress + rooms[room].images;
                    var rm = rooms[room] ;
                    rooms[room].imageURL = ((typeof rooms[room].images) == "string") ? rooms[room].images : rooms[room].images[rm[FieldNames.MainImageIdx]];*/
                    //alert((typeof rooms[room].images) == "string");
                    if(rooms[room].sm == "RoomPairMode_ANY")
                        rooms[room].sm = 0;
                    else if(rooms[room].sm == "RoomPairMode_CONNECTIONS")
                        rooms[room].sm = 1;
                    else if(rooms[room].sm == "RoomPairMode_THISUSERS")
                        rooms[room].sm = 2;

                  }
                  //$scope.page = pg;
                  if($scope.page == 0)
                    $scope.items = rooms;
                  else
                    $scope.items.concat(rooms);
                  $scope.page++;
                  //$scope.items = rooms;
                  //$scope.page++;
                  //alert(JSON.stringify(rooms));
              }

         }, function(st) {
          //alert("Error in accessing service. Retry");
              $ionicLoading.hide();
              $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Listing Access Error", ['Exit','Retry'])
                  .then(function(buttonIndex) {
                  // no button = 0, 'OK' = 1, 'Cancel' = 2
                  var btnIndex = buttonIndex;
                  if(btnIndex == 2)
                  {
                      $scope.getRooms(inReset);
                  }
                  //else
                      //navigator.app.exitApp();

                  });
         });

      }

      

      $scope.roomedit1user = function(item, newRoom) {
            $ionicLoading.show({
                template: 'Connecting...'
            });
            var newRoom1 = angular.copy(newRoom);
            newRoom.$save({}, function(resObj, st) {
                //alert(res2.result == 2);
                $ionicLoading.hide();
                //var resObj = angular.fromJson(res2);

                if(resObj.result != 2) {
                                 //alert(resObj.message);
                    $cordovaDialogs.confirm(resObj.message, "Room Changed Room Error", ['Cancel','Retry'])
                        .then(function(buttonIndex) {
                            // no button = 0, 'OK' = 1, 'Cancel' = 2
                            var btnIndex = buttonIndex;
                            if(btnIndex == 2)
                            {
                                $scope.roomedit1user(newRoom1);
                            }
                            else if(btnIndex == 1)
                                item.er = !item.er;
                        });
                }


            }, function(st) {
                //alert("Error in accessing service. Retry");
                $ionicLoading.hide();
                $cordovaDialogs.confirm("Error in accessing service. Retry", "Room Changed Access Error", ['Exit','Retry'])
                    .then(function(buttonIndex) {
                        // no button = 0, 'OK' = 1, 'Cancel' = 2
                            var btnIndex = buttonIndex;
                            if(btnIndex == 2)
                            {
                                $scope.roomedit1user(newRoom1);
                            }
                            else if(btnIndex == 1)
                                item.er = !item.er;

                    });
            });

      }
      $scope.roomenableuserchange = function(item) {
        //alert(item.er);
        $cordovaDialogs.confirm("Are you sure you want to change ENABLE", "Room Enable", ['Cancel','OK'])
                                      .then(function(buttonIndex) {
                                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                                          var btnIndex = buttonIndex;
                                          if(btnIndex == 2)
                                          {
                                              //$scope.roomedit1(newRoom1);
                                              //alert(btnIndex);
                                              var newroom = new OculoraRoom();


                                              newroom[FieldNames.id] = item[FieldNames.id];
                                              newroom[FieldNames.enableRoom] = item[FieldNames.enableRoom];
                                              newroom[FieldNames.create] = false;
                                              $scope.roomedit1user(item, newroom);
                                                //alert(angular.toJson(newroom));
                                                //$scope.roomedit(newroom);
                                          }
                                          else if(btnIndex == 1) {
                                              //$scope.roommodal.hide();
                                              //alert(btnIndex);
                                              item.er = !item.er;
                                          }
                                      });
      }
      $scope.cardroomimagesshow = function(item, $event) {
        //alert(item.imageURL);
        $scope.roomCardFlipSupp($event);
        $scope.userimages = ((typeof item.images) == "string") ? [item.images] : item.images;
        //alert($scope.userimages);
        $scope.roomimagesuser.show();
      }

      $scope.userimages = [];
      $scope.roomimagesuserdone = function() {
                      //alert(item.imageURL);
        $scope.userimages = [];
        $scope.roomimagesuser.hide();
      }

      //$scope.sortOrder = "-ct";
      //$scope.sortBy = "0";
      /*roomsortby = function() {
        alert("sortBy:" + $scope.sortBy);
      }*/


      /*$scope.doRefresh = function() {
            if($scope.items.length < 4) {
                $scope.$broadcast('scroll.infiniteScrollComplete');
                return;
            }


            //alert("ok");
            $timeout( function() {
    $scope.$broadcast('scroll.infiniteScrollComplete');
                //Stop the ion-refresher from spinning
                //$scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        }*/

      $scope.$on("OnFocusUsersRooms", function() {
              //alert("focussed");
              //alert(JSON.stringify($rootScope.access));
              $scope.getRooms(false);
          });

    //$scope.PublishType = ["Anyone", "Connected", "Selected"];
  });