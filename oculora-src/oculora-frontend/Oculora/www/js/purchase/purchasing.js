
var OculoraPurchasing = angular.module('oculora-purchasing')
.directive('ocPurchase', ['$ionicPopover', $window', '$q', function ($ionicPopover, $window, $q) {
    return {
        restrict: 'E',
		scope: {
            
        },
        template: '<a ng-click="paymentsHandler($event)" ng-class="paymentsCurrentState"></a>',
			
        link: function (scope, element, attrs) {
			scope.paymentsHandler = function(ev) {
                scope.buyRequests = [];
                scope.updatedCredit = 0;

                scope.popuppayments.show(ev);

                /*$scope.paymentsState().then(function(res) {
                    if(res) {
                        alert("b");
                        $scope.popuppayments.show();
                        alert("a");
                    }

                });*/

           }
		   
		   $ionicPopover.fromTemplateUrl('templates/popup-payments.html', {
                    scope: scope
                }).then(function(modal) {
                    scope.popuppayments = modal;
                });
			/*var skuMap = {
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
				if(Oculora_PayDeploy == 2) {
					if(scope.currentCredit < 0) scope.currentCredit = (60*2/(30*60));
					q.resolve(true);
				}
				else {
					google.payments.inapp.getPurchases(function(details) {
						for(var i = 0; i < details.details.length; i++) {
							var resp = angular.fromJson(details.details);
							if(resp.state == "ACTIVE") {
								currCred += $scope.skuDetails[details.details.sku];
							}

						}
						scope.currentCredit = currCred;
						q.resolve(true);
					}, function(err) {
						 console.log(JSON.stringify(err));
						 console.log("Failed to get purchases details");
						 q.resolve(false);
					});
				}

				return q.promise;
		   }



		   var calculateUpdatedPayments = function() {
				scope.updatedCredit = 0;
				var totalNewPurchase = 0;
				for(var j = 0; j < buyRequests.length; j++) {
					if(buyRequests[j].numBuys === undefined)
						continue;
					for(var k = 0; k < buyRequests[j].numBuys; k++) {

						totalNewPurchase += $scope.skuDetails[j].price;
					}
				}
				scope.updatedCredit = totalNewPurchase;
		   }

		   scope.addPayment = function() {

				var consume = true;
				var totalNewPurchase = 0;
				for(var j = 0; j < buyRequests.length; j++) {
					if(buyRequests[j].numBuys === undefined)
						continue;
					for(var k = 0; k < buyRequests[j].numBuys; k++) {
						if(Oculora_PayDeploy == 2) {
							totalNewPurchase += $scope.skuDetails[j].price;
						}
						else {
							google.payments.inapp.buy({
								  sku: skuMap[google.payments.inapp.platform][j],
								  consume: consume,
								  success: function() {
									console.log('success');
									totalNewPurchase += scope.skuDetails[j].price;
									//Increment the stored value declaring how many of this
									 //particular item the user owns.
									 //
									//window.storage["credits." + sku] += 1

								  },
								  failure: function(err) {
									console.log('buy/consume failure' + JSON.stringify(err));
									alert("Fail :(\n\n" + JSON.stringify(arguments));
								  }
							});
						}
					}

				}
				scope.currentCredit = totalNewPurchase;
				if(paymentsTrackState != null) {
					scope.paymentButtonClassTracker(scope.paymentsTrackState.warningCB, scope.paymentsTrackState.expiredCB)
				}
				scope.popuppayments.hide();
		   }

		   $scope.trackPayment = function(warningCB, expiredCB, queryOnly) {
				//var q = $q.defer();

				var ret = {ret: -1, tmr: null};
				var payState = $scope.paymentsState().then();
				if(!payState) {
					//q.resolve(ret);
					return ret;
				}

				//if((queryOnly != false) && ($scope.currentCredit < 1))
					//$scope.currentCredit = 0; //adjust for a user completing before the 1 min slot. but we round off per minute
				if($scope.currentCredit == 0)
				{
		//alert("track1");
					if(queryOnly != true) expiredCB();
					ret.ret = 0;
					//q.resolve(ret);
					return ret;
				}
				var tmOut = 60;
				if($scope.currentCredit <= (30/(30*60)) )
				{
					if(queryOnly != true) {
						warningCB();
						tmOut = 30;
						$scope.currentCredit = 0;
					}

					ret.ret = 1;
				}
				else {
					ret.ret = 2;
					if(queryOnly != true) {
						if($scope.currentCredit  <= (30/(30*60)) ) {
							tmOut = 30;
							$scope.currentCredit = $scope.currentCredit - (tmOut/(30*60));
							//alert("1:" + tmOut);
						}
						else {
							if($scope.currentCredit <= (60/(30*60))) {
								tmOut = 30;
								$scope.currentCredit = tmOut/(30*60);
								//alert("2A:" + tmOut);
							}
							else {
								$scope.currentCredit = $scope.currentCredit - (tmOut/(30*60));
								//alert("2B:" + tmOut);
							}
						}
					}

				}

				if(queryOnly != true) {

					var tmr = $timeout( function() {
								//alert($scope.currentCredit);
								var tmr2 = $scope.trackPayment(warningCB, expiredCB)  ;
								//ret = tmr2;
								ret = tmr2;

								//q.resolve(tmr2);

							}, 1000*tmOut);
					$scope.paymentsTrackState.paymentTmr = tmr;
					ret.tmr = tmr;
					//$scope.abortPaymentTracker(ret.tmr);
					//q.resolve(ret);
					//alert(angular.toJson(ret));
				}
				//else q.resolve(ret);

				return ret;
				//return q.promise;

		   }

		   $scope.abortPaymentTracker = function(tmr) {
				$timeout.cancel(tmr);
		   }

		   scope.paymentButtonClassTracker = function(warningCB, expiredCB, queryOnly) {
				//var q = $q.defer();

				//var paymentsclass = "button button-clear button-small icon ion-videocamera ";
				//"ok credit", "warning credit", "no credit"
				//var paymentsBtnStatesClass = ["button-balanced", "button-energized", "button-assertive"];
			   // var res = $scope.paymentsclass + $scope.paymentsBtnStatesClass[0];
				$scope.paymentsTrackState = {warningCB: warningCB, expiredCB: expiredCB};
				var ret = trackPayment(function() {
					if(warningCB)
						warningCB();
					scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[1];
					//alert(angular.toJson(ret.tmr));
					//$scope.paymentsTrackState.paymentTmr = ret.tmr;
					//$scope.abortPaymentTrackerModel();
					//q.resolve(paymentsclass + paymentsBtnStatesClass[1]);
				}, function() {
					if(expiredCB)
						expiredCB();
					//q.resolve(paymentsclass + paymentsBtnStatesClass[2]);
					scope.paymentsCurrentState = paymentsclass + paymentsBtnStatesClass[2];
					//alert(angular.toJson(ret.tmr));
					//$scope.paymentsTrackState.paymentTmr = ret.tmr;
				}, queryOnly);
				//alert(angular.toJson(ret));
				if(queryOnly != false)
					return ret;
				
				//return res;
		   }

		   $scope.abortPaymentTrackerModel = function() {
			   if(($scope.paymentsTrackState != null) && ($scope.paymentsTrackState.paymentTmr != null)){
					//alert("foo");
					$scope.abortPaymentTracker($scope.paymentsTrackState.paymentTmr);
					$scope.paymentsTrackState = {};
			   }
		   }*/
		}
}]);