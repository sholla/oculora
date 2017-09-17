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
            this.session = TB.initSession(apiKey, sessionId);
            //OLD
            //this.session = TB.initSession(sessionId);
            OTSessionMain.session.on({
                sessionConnected: function(event) {
                    OTSessionMain.publishers.forEach(function (publisher) {

                        //f(tp != false) {
                            publisher.publishAudio(false);
                            //OTSessionMain.session.publish(publisher);
                        //}
                    });
                },
                streamCreated: function(event) {
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

            this.session.connect(token, function (err) {
                if (cb) cb(err, OTSessionMain.session);
            });
            /*
            OLD
            this.session.connect(apiKey, token, function (err) {
                            if (cb) cb(err, OTSession.session);
                        });
            */
            //this.trigger('init')
        },

        batchSignal : function (type, data, toConnection) {
            // We send data in small chunks so that they fit in a signal
            // Each packet is maximum ~250 chars, we can fit 8192/250 ~= 32 updates per signal
            var dataCopy = data.slice();
            var signalError = function (err) {
              if (err) {
                TB.error(err);
              }
            };
            while(dataCopy.length) {
                var dataChunk = dataCopy.splice(0, Math.min(dataCopy.length, 32));
                var signal = {
                    type: type,
                    data: JSON.stringify(dataChunk)
                };
                if (toConnection) signal.to = toConnection;
                OTSession.session.signal(signal, signalError);
            }
        }
    };
    //TB.OTHelpers.eventing(OTSessionMain);

    return OTSessionMain;
}])
.factory("OTSessionSideband", ['TB', '$rootScope', function (TB, $rootScope) {
    var OTSessionSidebands = {};
    OTSessionSidebands.sidebands = [];
    OTSessionSidebands.getSidebandRef = function(idx) {
        return OTSessionSidebands.sidebands[idx];
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
                            publisher.publishVideo(false);
                            publisher.publishAudio(false);
                            //OTSessionSideband.session.publish(publisher);
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
                this.trigger('init');
            },
            batchSignal : function (type, data, toConnection) {
                // We send data in small chunks so that they fit in a signal
                // Each packet is maximum ~250 chars, we can fit 8192/250 ~= 32 updates per signal
                var dataCopy = data.slice();
                var signalError = function (err) {
                  if (err) {
                    TB.error(err);
                  }
                };
                var dataSet = dataCopy;
                var inImage = false;
                if(type == Oculora_SignalType.SignalType_Message_Image) {
                    x=Math.random().toString(36).substring(7).substr(0,10);
                    while (x.length!=10){
                        x=Math.random().toString(36).substring(7).substr(0,10);
                    }
                    dataSet = {name: x, image: dataCopy, end: (dataSet.length < 250 ? 2 : 0)};
                    inImage = true;
                }
                var cnt = 0;
                while(dataSet.length) {
                    var dataSet2 = dataSet;
                    if((inImage != false) && (cnt > 0)){
                        dataSet2 = {name: dataSet.name, image: dataSet, end: (dataSet.length < 250 ? 2 : 1)};
                    }
                    var dataChunk = dataSet2.splice(0, Math.min(dataSet2.length, 32));
                    var signal = {
                        type: type,
                        data: JSON.stringify(dataChunk)
                    };
                    if (toConnection) signal.to = toConnection;
                    OTSessionSideband.session.signal(signal, signalError);
                    cnt++;
                    dataSet = dataSet2;
                }
            }
        };
        //TB.OTHelpers.eventing(OTSessionSideband);
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
                            OTSessionMainSub.streams.splice(OTSessionSideband.streams.indexOf(event.stream), 1);
                        });
                    },
                    sessionDisconnected: function(event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.streams.splice(0, OTSessionSideband.streams.length);
                        });
                    },
                    connectionCreated: function (event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.connections.push(event.connection);
                        });
                    },
                    connectionDestroyed: function (event) {
                        $rootScope.$apply(function() {
                            OTSessionMainSub.connections.splice(OTSessionSideband.connections.indexOf(event.connection), 1);
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
                this.trigger('init');
            }
        };
        //TB.OTHelpers.eventing(OTSessionMainSub);
        OTSessionMainSubs.mainsubs.push(OTSessionMainSub);
        OTSessionMainSubs.mainsubsindex = OTSessionMainSubs.mainsubs.length - 1;
        return OTSessionMainSub;
    }

    return OTSessionSidebands;
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
/*
.directive('otLayout', ['$window', '$parse', 'TB', 'OTSession', function($window, $parse, TB, OTSession) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            var props = $parse(attrs.props)();
            var container = TB.initLayoutContainer(element[0], props);
            scope.$watch(function() {
                return element.children().length;
            }, container.layout);
            $window.addEventListener("resize", container.layout);
            scope.$on("otLayout", container.layout);
            var listenForStreamChange = function listenForStreamChange(session) {
                OTSession.session.on("streamPropertyChanged", function (event) {
                    if (event.changedProperty === 'videoDimensions') {
                        container.layout();
                    }
                });
            };
            if (OTSession.session) listenForStreamChange();
            else OTSession.on("init", listenForStreamChange);
        }
    };
}])
*/
.directive('otPublisher', ['OTSessionMain' , 'OTSessionSideband', function(OTSessionMain, OTSessionSideband) {
    return {
        restrict: 'E',
        scope: {
            props: '&',
            otstype: '=',
            otsindex: '='
        },
        link: function(scope, element, attrs){
            var otsess = null;
            if(scope.otstype == 1)
                otsess = OTSessionMain;
            else if(scope.otstype == 2) {
                otsess = OTSessionSideband.getSidebandRef(otsindex);
            }
            //var otsess = attrs.otsession;
            //alert(scope.OTSession);
            var props = scope.props() || {};
            props.width = props.width ? props.width : angular.element(element).width();
            props.height = props.height ? props.height : angular.element(element).height();
            var oldChildren = angular.element(element).children();
            scope.publisher = TB.initPublisher(
                element[0], props, function (err) {
                if (err) {
                    scope.$emit("otPublisherError", err, scope.publisher);
                    alert("err: " + err);
                }
            });

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
                    scope.$emit("otAccessDenied");
                },
                accessDialogOpened: function (event) {
                    scope.$emit("otAccessDialogOpened");
                },
                accessDialogClosed: function(event){
                    scope.$emit("otAccessDialogClosed");
                },
                accessAllowed: function(event) {
                    angular.element(element).addClass("allowed");
                    scope.$emit("otAccessAllowed");
                },
                loaded: function (event){
                    scope.$emit("otLayout");
                },
                streamCreated: function (event) {
                  scope.$emit("otStreamCreated");
                },
                streamDestroyed: function (event) {
                  scope.$emit("otStreamDestroyed");
                }
            });
            scope.$on("$destroy", function () {
                if (otsess.session) otsess.session.unpublish(scope.publisher);
                else scope.publisher.destroy();
                otsess.publishers = otsess.publishers.filter(function (publisher) {
                    return publisher !== scope.publisher;
                });
                scope.publisher = null;
            });
            if (otsess.session && (otsess.session.connected ||
                    (otsess.session.isConnected && otsess.session.isConnected()))) {
                otsess.session.publish(scope.publisher, function (err) {
                    if (err) {
                        scope.$emit("otPublisherError", err, scope.publisher);
                        alert("pub err:" + err);
                    }
                });
            }
            //alert(OTSessionMain.publishers);
            //alert(otsess.publishers);
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
            OTSession: '='
        },
        link: function(scope, element, attrs){
            var otsess = null;
            if(scope.otstype == 1)
                otsess = OTSessionMain;
            else if(scope.otstype == 2) {
                otsess = OTSessionSideband.getSidebandRef(otsindex);
            }
            else if(scope.otstype == 3) {
                otsess = OTSessionMainSub.getMainSubRef(otsindex);
            }
            var stream = scope.stream,
                props = scope.props() || {};
            props.width = props.width ? props.width : angular.element(element).width();
            props.height = props.height ? props.height : angular.element(element).height();
            var oldChildren = angular.element(element).children();
            var subscriber = otsess.session.subscribe(stream, element[0], props, function (err) {
                if (err) {
                    scope.$emit("otSubscriberError", err, subscriber);
                }
            });
            subscriber.on("loaded", function () {
                scope.$emit("otLayout");
            });
            // Make transcluding work manually by putting the children back in there
            angular.element(element).append(oldChildren);
            scope.$on("$destroy", function () {
                otsess.session.unsubscribe(subscriber);
            });
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
