/*!
 *  opentok-angular (https://github.com/aullman/OpenTok-Angular)
 *
 *  Angular module for OpenTok
 *
 *  @Author: Adam Ullman (http://github.com/aullman)
 *  @Copyright (c) 2014 Adam Ullman
 *  @License: Released under the MIT license (http://opensource.org/licenses/MIT)
**/

if (!window.TB) throw new Error("You must include the TB library before the TB_Angular library");

var OpenTokAngular = angular.module('opentok', [])
.factory("TB", function () {
    return TB;
})
.factory("OTSessionMain", ['TB', '$rootScope', function (TB, $rootScope) {
    var OTSessionMain = {
        streams: [],
        connections: [],
        publishers: [],
        init: function (apiKey, sessionId, token, cb) {
			//alert(apiKey);
			//alert(sessionId);
			//alert(token);
			//alert("pre init");
			OTSessionMain.streams = [];
			OTSessionMain.connections = [];
			OTSessionMain.publishers =[];
			this.session = {};
            this.session = OT.initSession(apiKey, sessionId);
			//alert("sessed");
            //OLD
            //this.session = TB.initSession(sessionId);
            this.session.on({
                sessionConnected: function(event) {
					//alert("ang sess conn");
                    OTSessionMain.publishers.forEach(function (publisher) {

                        //f(tp != false) {
                            //publisher.publishAudio(false);
                            OTSessionMain.session.publish(publisher);
                        //}
                    });
                },
                streamCreated: function(event) {
					//alert("ang stream create");
                    $rootScope.$apply(function() {
                        OTSessionMain.streams.push(event.stream);
                    });
                },
                streamDestroyed: function(event) {
                    $rootScope.$apply(function() {
                        OTSessionMain.streams.splice(OTSessionMain.streams.indexOf(event.stream), 1);
                    });
                },
                sessionDisconnected: function(event) {
                    $rootScope.$apply(function() {
                        OTSessionMain.streams.splice(0, OTSessionMain.streams.length);
                    });
                },
                connectionCreated: function (event) {
					//alert("ang conn");
                    $rootScope.$apply(function() {
                        OTSessionMain.connections.push(event.connection);
                    });
                    //$rootScope.$emit("oculoraConnectionCreated", event.connection);
                },
                connectionDestroyed: function (event) {
                    $rootScope.$apply(function() {
                        OTSessionMain.connections.splice(OTSessionMain.connections.indexOf(event.connection), 1);
                    });
                }
            });
//alert("post init1");

            this.session.connect(token, function (err) {
//alert("post conn");
                if (cb) cb(err, OTSessionMain.session);
            });


            //OLD
            /*this.session.connect(apiKey, token, function (err) {
                            if (cb) cb(err, OTSessionMain.session);
                        });*/

            this.trigger('init');


        },

        batchSignal : function (type, data, toConnection) {
            // We send data in small chunks so that they fit in a signal
            // Each packet is maximum ~250 chars, we can fit 8192/250 ~= 32 updates per signal
			//alert(data);
            var dataCopy = data.slice();
			//alert(dataCopy);
            var signalError = function (err) {
              if (err) {
                TB.error(err);
              }
            };
			
			var signalHeader = {
                    type: type,
                    data: JSON.stringify({state:0})
                };
			if (toConnection) signalHeader.to = toConnection;
			OTSessionMain.session.signal(signalHeader, signalError);
			var startIdx = 0;
            while(dataCopy.length > startIdx) {
                var dataChunk = dataCopy.slice(startIdx, Math.min(dataCopy.length, startIdx + 32));
                var signal = {
                    type: type,
                    data: JSON.stringify({state:1, content: dataChunk})
                };
                if (toConnection) signal.to = toConnection;
                OTSessionMain.session.signal(signal, signalError);
				startIdx += dataChunk.length;
				//alert("dc:" + dataChunk + "si: " + startIdx);
            }
			var signalTrailer = {
                    type: type,
                    data: JSON.stringify({state:2})
                };
			if (toConnection) signalTrailer.to = toConnection;
			OTSessionMain.session.signal(signalTrailer, signalError);
        }
    };
    TB.$.eventing(OTSessionMain);

    return OTSessionMain;
}])
.factory("OTSessionSideband", ['TB', '$rootScope', function (TB, $rootScope) {
    var OTSessionSidebands = {};
    OTSessionSidebands.sidebands = [];
    OTSessionSidebands.getSidebandRef = function(idx) {
        return OTSessionSidebands.sidebands[idx];
    };
	OTSessionSidebands.clearSidebandRefs = function() {
        OTSessionSidebands.sidebands = [];
    };
	
    OTSessionSidebands.getSideband = function() {
        var OTSessionSideband = {
            streams: [],
            connections: [],
            publishers: [],
            init: function (apiKey, sessionId, token, cb) {
                this.session = TB.initSession(apiKey, sessionId);
                //OLD
                //this.session = TB.initSession(sessionId);
                OTSessionSideband.session.on({
                    sessionConnected: function(event) {
                        OTSessionSideband.publishers.forEach(function (publisher) {
                            //publisher.publishVideo(false);
                            //publisher.publishAudio(false);
                            OTSessionSideband.session.publish(publisher);
                        });
                    },
                    streamCreated: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionSideband.streams.push(event.stream);
                        });
                    },
                    streamDestroyed: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionSideband.streams.splice(OTSessionSideband.streams.indexOf(event.stream), 1);
                        });
                    },
                    sessionDisconnected: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionSideband.streams.splice(0, OTSessionSideband.streams.length);
                        });
                    },
                    connectionCreated: function (event) {
                        $rootScope.$apply(function() {
                            OTSessionSideband.connections.push(event.connection);
                        });
                    },
                    connectionDestroyed: function (event) {
                        $rootScope.$apply(function() {
                            OTSessionSideband.connections.splice(OTSessionSideband.connections.indexOf(event.connection), 1);
                        });
                    }/*,

                    Oculora_SignalType.SignalType_Message: function (event) {
                        if (event.from.connectionId !== OTSessionSideband.session.connection.connectionId) {
                            scope.$emit('oculoramessage', event.data);
                        }
                    }*/
                });

                this.session.connect(token, function (err) {
                    if (cb) cb(err, OTSessionSideband.session);
                });
                /*
                OLD
                this.session.connect(apiKey, token, function (err) {
                                if (cb) cb(err, OTSession.session);
                            });
                */
                //this.trigger('init');
            },
            
			batchSignal : function (type, data, toConnection) {
				// We send data in small chunks so that they fit in a signal
				// Each packet is maximum ~250 chars, we can fit 8192/250 ~= 32 updates per signal
				//alert(data);
				var dataCopy = data.slice();
				//alert(dataCopy);
				var signalError = function (err) {
				  if (err) {
					TB.error(err);
				  }
				};
				
				var signalHeader = {
						type: type,
						data: JSON.stringify({state:0})
					};
				if (toConnection) signalHeader.to = toConnection;
				this.session.signal(signalHeader, signalError);
				var startIdx = 0;
				while(dataCopy.length > startIdx) {
					var dataChunk = dataCopy.slice(startIdx, Math.min(dataCopy.length, startIdx + 32));
					var signal = {
						type: type,
						data: JSON.stringify({state:1, content: dataChunk})
					};
					if (toConnection) signal.to = toConnection;
					this.session.signal(signal, signalError);
					startIdx += dataChunk.length;
					//alert("dc:" + dataChunk + "si: " + startIdx);
				}
				var signalTrailer = {
						type: type,
						data: JSON.stringify({state:2})
					};
				if (toConnection) signalTrailer.to = toConnection;
				this.session.signal(signalTrailer, signalError);
			}
        };
        //TB.$.eventing(OTSessionSideband);
        OTSessionSidebands.sidebands.push(OTSessionSideband);
        OTSessionSideband.sidebandsindex = OTSessionSidebands.sidebands.length - 1;
        return OTSessionSideband;
    }

    return OTSessionSidebands;
}])
.factory("OTSessionMainSub", ['TB', '$rootScope', function (TB, $rootScope) {
    var OTSessionMainSubs = {};
    OTSessionMainSubs.mainsubs = [];
    OTSessionMainSubs.getMainSubRef = function(idx) {
        return OTSessionMainSubs.mainsubs[idx];
    };
	OTSessionMainSubs.clearMainSubRef = function(idx) {
        var ref = OTSessionMainSubs.mainsubs.splice(idx, 1);
		ref = {};
    };
	OTSessionMainSubs.clearMainSubRefs = function() {
        OTSessionMainSubs.mainsubs = [];
    };
    OTSessionMainSubs.getSub = function() {
        var OTSessionMainSub = {
            streams: [],
            connections: [],
            publishers: [],
            init: function (apiKey, sessionId, token, cb) {
                this.session = TB.initSession(apiKey, sessionId);
                //OLD
                //this.session = TB.initSession(sessionId);
                OTSessionMainSub.session.on({
                    sessionConnected: function(event) {
                        /*OTSessionMainSub.publishers.forEach(function (publisher) {
                            publisher.publishVideo(false);
                            publisher.publishAudio(false);
                            //OTSessionSideband.session.publish(publisher);
                        });*/
                    },
                    streamCreated: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.streams.push(event.stream);
                        });
                    },
                    streamDestroyed: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.streams.splice(OTSessionMainSub.streams.indexOf(event.stream), 1);
                        });
                    },
                    sessionDisconnected: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.streams.splice(0, OTSessionMainSub.streams.length);
                        });
                    },
                    connectionCreated: function (event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.connections.push(event.connection);
                        });
                    },
                    connectionDestroyed: function (event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.connections.splice(OTSessionMainSub.connections.indexOf(event.connection), 1);
                        });
                    }/*,

                    Oculora_SignalType.SignalType_Message: function (event) {
                        if (event.from.connectionId !== OTSessionSideband.session.connection.connectionId) {
                            scope.$emit('oculoramessage', event.data);
                        }
                    }*/
                });

                this.session.connect(token, function (err) {
                    if (cb) cb(err, OTSessionMainSub.session);
                });
                /*
                OLD
                this.session.connect(apiKey, token, function (err) {
                                if (cb) cb(err, OTSession.session);
                            });
                */
                //this.trigger('init');
            }
        };
        //TB.$.eventing(OTSessionMainSub);
        OTSessionMainSubs.mainsubs.push(OTSessionMainSub);
        OTSessionMainSub.mainsubsindex = OTSessionMainSubs.mainsubs.length - 1;
        return OTSessionMainSub;
    }

    return OTSessionMainSubs;
}])
.factory("OTSessionMessaging", ['TB', '$rootScope', function (TB, $rootScope) {
    var OTSessionMessaging = {
        streams: [],
        connections: [],
        publishers: [],
        init: function (apiKey, sessionId, token, cb) {
            this.session = TB.initSession(apiKey, sessionId);
            //OLD
            //this.session = TB.initSession(sessionId);
            OTSessionMessaging.session.on({
                sessionConnected: function(event) {
                    OTSessionMessaging.publishers.forEach(function (publisher) {
                        publisher.publishVideo(false);
                        publisher.publishAudio(false);
                        OTSessionMessaging.session.publish(publisher);
                    });
                },
                streamCreated: function(event) {
                    $rootScope.$apply(function() {
                        OTSessionMessaging.streams.push(event.stream);
                    });
                },
                streamDestroyed: function(event) {
                    $rootScope.$apply(function() {
                        OTSessionMessaging.streams.splice(OTSessionMessaging.streams.indexOf(event.stream), 1);
                    });
                },
                sessionDisconnected: function(event) {
                    $rootScope.$apply(function() {
                        OTSessionMessaging.streams.splice(0, OTSessionMessaging.streams.length);
                    });
                },
                connectionCreated: function (event) {
                    $rootScope.$apply(function() {
                        OTSessionMessaging.connections.push(event.connection);
                    });
                },
                connectionDestroyed: function (event) {
                    $rootScope.$apply(function() {
                        OTSessionMessaging.connections.splice(OTSessionMessaging.connections.indexOf(event.connection), 1);
                    });
                }
            });

            this.session.connect(token, function (err) {
                if (cb) cb(err, OTSessionMessaging.session);
            });
            /*
            OLD
            this.session.connect(apiKey, token, function (err) {
                            if (cb) cb(err, OTSession.session);
                        });
            */
            this.trigger('init');
        }
    };
    //TB.OTHelpers.eventing(OTSessionMessaging);
    return OTSessionMessaging;
}])
.directive('otLayout', ['$window', '$parse', 'TB', 'OTSessionMain' , 'OTSessionSideband', 'OTSessionMainSub', function($window, $parse, TB, OTSessionMain , OTSessionSideband, OTSessionMainSub) {
    return {
        restrict: 'E',
		scope: {
            otstype: '=',
            otsindex: '='
        },
        link: function(scope, element, attrs) {
			var otsess = null;
            if(scope.otstype == 1)
                otsess = OTSessionMain;
            else if(scope.otstype == 2) {
                otsess = OTSessionSideband.getSidebandRef(scope.otsindex);
            }
			else if(scope.otstype == 3) {
                otsess = OTSessionMainSub.getMainSubRef(scope.otsindex);
            }
			else alert(scope.otstype);
			
            var props = $parse(attrs.props)();
            var container = TB.initLayoutContainer(element[0], props);
            scope.$watch(function() {
                return element.children().length;
            }, container.layout);
            $window.addEventListener("resize", container.layout);
            scope.$on("otLayout", container.layout);
            var listenForStreamChange = function listenForStreamChange(session) {
                otsess.session.on("streamPropertyChanged", function (event) {
                    if (event.changedProperty === 'videoDimensions') {
                        container.layout();
                    }
                });
            };
            if (otsess.session) listenForStreamChange();
            else otsess.on("init", listenForStreamChange);
        }
    };
}])
.directive('otPublisher', ['OTSessionMain' , 'OTSessionSideband', 'OTSessionMainSub', function(OTSessionMain, OTSessionSideband, OTSessionMainSub) {
    return {
        restrict: 'E',
        scope: {
            props: '&',
            otstype: '=',
            otsindex: '='
        },
        link: function(scope, element, attrs){
        //alert("post init");
            var otsess = null;
            if(scope.otstype == 1)
                otsess = OTSessionMain;
            else if(scope.otstype == 2) {
                otsess = OTSessionSideband.getSidebandRef(scope.otsindex);
            }
			else if(scope.otstype == 3) {
                otsess = OTSessionMainSub.getMainSubRef(scope.otsindex);
            }
            //var otsess = attrs.otsession;
            //alert(scope.OTSession);
            var props = scope.props() || {};
            props.width = props.width ? props.width : angular.element(element).width();
            props.height = props.height ? props.height : angular.element(element).height();
            var oldChildren = angular.element(element).children();
			//alert("children: " + oldChildren.html());
			//alert("element: " + element[0].innerHTML);
			var errState = false;
            scope.publisher = OT.initPublisher(
                element[0], props, function (err) {
                if (err) {
                    //scope.$emit("otPublisherError", err, scope.publisher);
                    //alert("err: " + angular.toJson(err));
					scope.$emit("otPublisherError", err);
                }
            });
			//alert(angular.toJson(props));
            /*OLD
            scope.publisher = TB.initPublisher(attrs.apikey || OTSession.session.apiKey,
                            element[0], props, function (err) {
                            if (err) {
                                scope.$emit("otPublisherError", err, scope.publisher);
                            }
                        });
            */
            // Make transcluding work manually by putting the children back in there
            angular.element(element).append(oldChildren);
            scope.publisher.on({
                accessDenied: function (event) {
					//alert("otAccessDenied");
                    scope.$emit("otAccessDenied");
                },
                accessDialogOpened: function (event) {
					//alert("otAccessDialogOpened");
                    scope.$emit("otAccessDialogOpened");
                },
                accessDialogClosed: function(event){
					//alert("otAccessDialogClosed");
                    scope.$emit("otAccessDialogClosed");
                },
                accessAllowed: function(event) {
					//alert("otAccessAllowed");
                    angular.element(element).addClass("allowed");
                    scope.$emit("otAccessAllowed");
                },
                loaded: function (event){
					//alert("otLayout");
                    scope.$emit("otLayout");
                },
                streamCreated: function (event) {
					//alert("otStreamCreated");
                  scope.$emit("otStreamCreated");
                },
                streamDestroyed: function (event) {
					//alert("otStreamDestroyed");
                  scope.$emit("otStreamDestroyed");
                }
            });
            scope.$on("$destroy", function () {
				//alert("pub done:" + scope.otstype);
                if (otsess.session) {otsess.session.unpublish(scope.publisher);}
                else scope.publisher.destroy();
                otsess.publishers = otsess.publishers.filter(function (publisher) {
                    return publisher !== scope.publisher;
                });
                scope.publisher = null;
            });
            if (otsess.session && (otsess.session.connected ||
                    (otsess.session.isConnected && otsess.session.isConnected()))) {
						//alert("in pub");
                otsess.session.publish(scope.publisher, function (err) {
                    if (err) {
                        scope.$emit("otPublisherError", err, scope.publisher);
                        //alert("pub err:" + angular.toJson(err));
						errState = true;
                    }
                });
				//alert("in pub2");
            }
			if(errState != false)
				return;
            otsess.publishers.push(scope.publisher);


        }
    };
}])
.directive('otSubscriber', ['OTSessionMain' , 'OTSessionSideband', 'OTSessionMainSub', function(OTSessionMain, OTSessionSideband, OTSessionMainSub) {
    return {
        restrict: 'E',
        scope: {
            stream: '=',
            props: '&',
            otstype: '=',
            otsindex: '='
        },
        link: function(scope, element, attrs){
			
            var otsess = null;
            if(scope.otstype == 1)
                otsess = OTSessionMain;
            else if(scope.otstype == 2) {
                otsess = OTSessionSideband.getSidebandRef(scope.otsindex);
            }
            else if(scope.otstype == 3) {
                otsess = OTSessionMainSub.getMainSubRef(scope.otsindex);
            }
			//alert("sub");
            var stream = scope.stream,
                props = scope.props() || {};
            props.width = props.width ? props.width : angular.element(element).width();
            props.height = props.height ? props.height : angular.element(element).height();
            var oldChildren = angular.element(element).children();
			var errState = false;
            var subscriber = otsess.session.subscribe(stream, element[0], props, function (err) {
                if (err) {
                    //scope.$emit("otSubscriberError", err, subscriber);
					scope.$emit("otSubscriberError", err);
					//alert(angular.toJson(err));
					errState = true;
                }
            });
			
            // Make transcluding work manually by putting the children back in there
            angular.element(element).append(oldChildren);
            scope.$on("$destroy", function () {
				//alert("sub done:" + scope.otstype);
                if(subscriber) {
					otsess.session.unsubscribe(subscriber);
					subscriber = null;
				}
            });
			if(errState != false)
				return;
            subscriber.on("loaded", function () {
                scope.$emit("otLayout");
            });
			//alert(subscriber);
            /*$scope.$watch("stream", function(value) {
                if(subscriber) {
                    OTSession.session.unsubscribe(subscriber);
                    if(value != null)
                    subscriber = OTSession.session.subscribe(value, element[0], props, function (err) {
                                    if (err) {
                                        scope.$emit("otSubscriberError", err, subscriber);
                                    }
                                });
                }
            });*/
        }
    };
}]);
