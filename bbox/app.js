
(function() {

var app = angular.module("bbox", [ 'geographicExtentWidget' ]);

app.controller("BboxController", function() {
  var self = this;
  self.extent = {
    n: 50,
    s: 45,
    w: 0,
    e: 5
  };
});

})();
