/*!
 *  opentok-whiteboard (http://github.com/aullman/opentok-whiteboard)
 *  
 *  Shared Whiteboard that works with OpenTok
 *
 *  @Author: Adam Ullman (http://github.com/aullman)
 *  @Copyright (c) 2014 Adam Ullman
 *  @License: Released under the MIT license (http://opensource.org/licenses/MIT)
**/

var OpenTokWhiteboard = angular.module('opentok-whiteboard', ['opentok'])
.directive('otWhiteboard', ['OTSessionSideband', '$window', '$q', function (OTSessionSideband, $window, $q) {
    return {
        restrict: 'E',
		scope: {
            otsindex: '='
        },
        template: '<div ng-show="stickerMode" class="row" style="z-index:220; position: absolute; top: 50px; left: 0px; width:100%;">' +
            '<div ng-repeat="s in stickers" >'    +       
			'<a ng-click="selSticker($index)" class="button button-clear button-small button-balanced"><img  ng-src={{s.img}} height="50px" width="50px"/></a>' +
                        
            '</div></div>' +
		'<canvas width="500px" height="500px"></canvas>' + 
			
            '<div class="OT_panel">' +

            '<input ng-hide="stickerMode" type="button" ng-class="{OT_color: true, OT_selected: c[\'background-color\'] === color}" ' +
            'ng-repeat="c in colors" ng-style="c" ng-click="changeColor(c)">' +
            '</input>' +
			//'<a ng-show="stickerMode" ng-repeat="s in stickers" ng-click="selSticker($event, s)" class="button button-clear button-small button-balanced"><img  ng-src={{s.img}} height="25px" width="25px"/></a>' +

            //'<input type="button" ng-click="erase()" ng-class="{OT_erase: true, OT_selected: erasing}"' +
            //' value="Width"></input>' +
            
            //'<input type="button" ng-click="capture()" class="OT_capture" value="{{captureText}}"></input>' +

			'<a ng-click="stickerModeSwitch()" class="button button-clear button-balanced icon ion-images"></a>' +
			
            '<input type="button" ng-click="clear()" class="OT_clear" value="Clear"></input></div>' +
			
			
			//'<div class="OT_clear range" style="left: -60px; "> <i class="icon ion-wand"></i><input type="range" name="brush" min="0" max="100" ng-model="currentBrushThickness" ng-change="changeThickness()"></div></div>' ,
			'<div ng-hide="stickerMode" class="range brushpos" > <i class="icon ion-wand"></i><input type="range" name="brush" min="0" max="100" ng-model="currentBrushThickness" ng-change="changeThickness()"></div>',
			
        link: function (scope, element, attrs) {
			//alert("post init1");
			var otsess = OTSessionSideband.getSidebandRef(scope.otsindex);
            var canvas = element.context.querySelector("canvas"),
                select = element.context.querySelector("select"),
                input = element.context.querySelector("input"),
                client = {dragging:false},
                ctx,
                drawHistory = [],
                drawHistoryReceivedFrom,
                drawHistoryReceived,
                batchUpdates = [],
                iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );

			//var otherConn;
			
            scope.colors = [{'background-color': 'black'},
                            {'background-color': 'blue'},
                            {'background-color': 'red'},
                            {'background-color': 'green'},
                            {'background-color': 'orange'},
                            {'background-color': 'purple'},
                            {'background-color': 'brown'}];
			scope.stickers = [{img: 'eimgs/fantastic-reality.jpg'}, {img: 'eimgs/FoodForThought.jpg'}, {img: 'eimgs/onlyhuman.jpg'}, {img: 'eimgs/pickmeups.jpg'}
                            ];
			scope.stickerMode = false;
			scope.selSticker = -1;
			
            scope.captureText = iOS ? 'Email' : 'Capture';
			scope.currentBrushThickness = 20;
            //canvas.width = attrs.width || element.width();
            //canvas.height = attrs.height || element.height();
            scope.canvas = new fabric.Canvas(canvas, {
			isDrawingMode: true});
			scope.canvas.freeDrawingBrush.color = "#ffff80";
			scope.canvas.freeDrawingBrush.width = parseInt(scope.currentBrushThickness, 10) || 1;
			
			scope.canvas.on('path:created', function(options) {
				  //console.log(JSON.stringify(options));
				//canvas.clear() ;
				//canvas.loadFromJSON
				
				//draw(options.path);
				$q.defer();
				drawHistory.push(options.path);
				sendUpdate(options.path);
			});

			scope.changeThickness = function() {
				scope.canvas.freeDrawingBrush.width = parseInt(scope.currentBrushThickness, 10) || 1;
			} 
			

            var clearCanvas = function () {
                /*ctx.save();

                // Use the identity matrix while clearing the canvas
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Restore the transform
                ctx.restore();*/
                drawHistory = [];
				scope.canvas.clear() ;
            };
            
            scope.changeColor = function (color) {
                scope.color = color['background-color'];
                //scope.lineWidth = 2;
                //scope.erasing = false;
				scope.canvas.freeDrawingBrush.color = scope.color;
            };
            
            scope.changeColor(scope.colors[Math.floor(Math.random() * scope.colors.length)]);
            
            scope.clear = function () {
                clearCanvas();
                if (otsess.session) {
                    otsess.session.signal({
                        type: 'otWhiteboard_clear'
                    });
                }
            };
            
            scope.erase = function () {
                scope.color = element.css("background-color") || "#fff";
                //scope.lineWidth = 50;
                //scope.erasing = true;
				scope.canvas.freeDrawingBrush.color = scope.color;
            };
            
            scope.capture = function () {
                if (iOS) {
                    // On iOS you can put HTML in a mailto: link
                    window.location.href = "mailto:?subject=Whiteboard&Body=<img src='" + canvas.toDataURL('image/png') + "'>";
                } else {
                    // We just open the image in a new window
                    window.open(canvas.toDataURL('image/png'));
                }
            };

			var drawSticker = function (update) {
                /*if (!ctx) {
                    ctx = canvas.getContext("2d");
                    ctx.lineCap = "round";
                    ctx.fillStyle = "solid";
                }

                ctx.strokeStyle = update.color;
                ctx.lineWidth = update.lineWidth;
                ctx.beginPath();
                ctx.moveTo(update.fromX, update.fromY);
                ctx.lineTo(update.toX, update.toY);
                ctx.stroke();
                ctx.closePath();*/
                //alert(angular.toJson(update));
				//var o1 = angular.fromJson(update);
				$q.defer();
				/*scope.$apply(function() {
                      scope.currentBrushThickness = update.strokeWidth;
                    });*/
				fabric.Image.fromObject(update, function(el) {
					scope.canvas.add(el);
				});
				//alert(scope.currentBrushThickness);
				/*var o2 = {objects:[update]};
				scope.$apply(function() {
                      scope.canvas.loadFromJSON(o2, null, function(o, object) {
  // `o` = json object
  // `object` = fabric.Object instance
  // ... do some stuff ...
					//alert(o);
					//alert(object);
					
					scope.canvas.add(object);
					
});
                    });*/
				
				

                //drawHistory.push(update);
            };
			
            var draw = function (update) {
                /*if (!ctx) {
                    ctx = canvas.getContext("2d");
                    ctx.lineCap = "round";
                    ctx.fillStyle = "solid";
                }

                ctx.strokeStyle = update.color;
                ctx.lineWidth = update.lineWidth;
                ctx.beginPath();
                ctx.moveTo(update.fromX, update.fromY);
                ctx.lineTo(update.toX, update.toY);
                ctx.stroke();
                ctx.closePath();*/
                //alert(angular.toJson(update));
				//var o1 = angular.fromJson(update);
				$q.defer();
				scope.$apply(function() {
                      scope.currentBrushThickness = update.strokeWidth;
                    });
				fabric.Path.fromObject(update, function(el) {
					scope.canvas.add(el);
				});
				//alert(scope.currentBrushThickness);
				/*var o2 = {objects:[update]};
				scope.$apply(function() {
                      scope.canvas.loadFromJSON(o2, null, function(o, object) {
  // `o` = json object
  // `object` = fabric.Object instance
  // ... do some stuff ...
					//alert(o);
					//alert(object);
					
					scope.canvas.add(object);
					
});
                    });*/
				
				

                //drawHistory.push(update);
            };
            
            var drawUpdates = function (updates) {
                updates.forEach(function (update) {
                    draw(update);
                });
            };
            
			var drawUpdatesSticker = function (updates) {
                updates.forEach(function (update) {
                    drawSticker(update);
                });
            };
			
			scope.stickerModeSwitch = function() {
				scope.stickerMode = !scope.stickerMode;
				scope.canvas.isDrawingMode = !scope.stickerMode;
				scope.currSticker = -1;
				if(scope.stickerMode != true) {
					scope.canvas.off('mouse:up');
				}
				scope.canvas.on('mouse:up', function(options) {
					//alert("x:" + options.e.clientX + " y:" + options.e.clientY);
					//alert(options.e.changedTouches[0].clientX);
					//alert(options.touches.length);
					if(scope.currSticker < 0)
						return;
					fabric.Image.fromURL(scope.stickers[scope.currSticker].img, function(oImg) {
 
						
						scope.canvas.add(oImg);
						var obj = oImg.toObject();
						var objs = [obj];
						batchSignal('otSticker_new', objs);
					}, {
						left: options.e.changedTouches[0].clientX,
						top: options.e.changedTouches[0].clientY,
						height: 50,
						width:50
  
					});
					//
				});
			}
			
			scope.selSticker = function(idx) {
				
				scope.currSticker = idx;
				//alert(scope.currSticker);
				
			}
			
            var batchSignal = function (type, data, toConnection) {
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
                    otsess.session.signal(signal, signalError);
                }
            };
            
            var updateTimeout;
            var sendUpdate = function (update) {
                if (otsess.session) {
                    batchUpdates.push(update);
                    if (!updateTimeout) {
                        updateTimeout = setTimeout(function () {
                            batchSignal('otWhiteboard_update', batchUpdates);
                            batchUpdates = [];
                            updateTimeout = null;
                        }, 100);
                    }
                }
            };
            
            /*angular.element(canvas).on('mousedown mousemove mouseup mouseout touchstart touchmove touchend', 
              function (event) {
                if (event.type === 'mousemove' && !client.dragging) {
                    // Ignore mouse move Events if we're not dragging
                    return;
                }
                event.preventDefault();
                
                var offset = angular.element(canvas).offset(),
                    scaleX = canvas.width / element.width(),
                    scaleY = canvas.height / element.height(),
                    offsetX = event.offsetX || event.originalEvent.pageX - offset.left ||
                       200,
                    offsetY = event.offsetY || event.originalEvent.pageY - offset.top ||
                       200,
                    x = offsetX*2 ,
                    y = offsetY*2 ;
                //alert(element.width());
                switch (event.type) {
                case 'mousedown':
                case 'touchstart':
                    client.dragging = true;
                    client.lastX = x;
                    client.lastY = y;
                    break;
                case 'mousemove':
                case 'touchmove':
                    if (client.dragging) {
                        var update = {
                            id: OTSessionSideband.session && OTSessionSideband.session.connection &&
                                OTSessionSideband.session.connection.connectionId,
                            fromX: client.lastX,
                            fromY: client.lastY,
                            toX: x,
                            toY: y,
                            color: scope.color,
                            lineWidth: scope.lineWidth
                        };
                        draw(update);
                        client.lastX = x;
                        client.lastY = y;
                        sendUpdate(update);
                    }
                    break;
                case 'mouseup':
                case 'touchend':
                case 'mouseout':
                    client.dragging = false;
                }
            });*/
            
            if (otsess.session) {
                otsess.session.on({
                    'signal:otWhiteboard_update': function (event) {
						
                        if (event.from.connectionId !== otsess.session.connection.connectionId) {
                            drawUpdates(JSON.parse(event.data));
                            scope.$emit('otWhiteboardUpdate');
                        }
                    },
                    'signal:otWhiteboard_history': function (event) {
                        // We will receive these from everyone in the room, only listen to the first
                        // person. Also the data is chunked together so we need all of that person's
						
                        if (!drawHistoryReceivedFrom || drawHistoryReceivedFrom === event.from.connectionId) {
							alert("conn white r");
                            drawHistoryReceivedFrom = event.from.connectionId;
                            drawUpdates(JSON.parse(event.data));
                            scope.$emit('otWhiteboardUpdate');
                        }
                    },
                    'signal:otWhiteboard_clear': function (event) {
                        if (event.from.connectionId !== otsess.session.connection.connectionId) {
                            clearCanvas();
                        }
                    },
					'signal:otSticker_new': function (event) {
						
                        if (event.from.connectionId !== otsess.session.connection.connectionId) {
                            drawUpdatesSticker(JSON.parse(event.data));
                            scope.$emit('otStickerUpdate');
                        }
                    }/*,
                    connectionCreated: function (event) {
						alert("conn white s");
                        if (drawHistory.length > 0 && event.connection.connectionId !==
                                otsess.session.connection.connectionId) {
									alert("conn white s2");
                            batchSignal('otWhiteboard_history', drawHistory, event.connection);
							otherConn = event.connection;
                        }
                    }*/
                });
            }
			//alert("post init2");
        }
    };
}]);