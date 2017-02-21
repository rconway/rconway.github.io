'use strict';

/*
 * This widget allows you to enter an area on the Earth using latitudes and
 * longitudes.
 */

angular.module('geographicExtentWidget', []);

angular.
module('geographicExtentWidget').
component('geographicExtentWidget', {
  templateUrl: 'geographic-extent-widget/geographic-extent-widget.template.html',
  require: ['ngModel'],
  controller: function GeographicExtentWidgetController($scope, $element, $timeout) {
    var self = this;
    
    self.GLOBAL = { s: -85, w: -180, n: 85, e: 179 };
    self.EUROPE = { s: 35, w: -26, n: 72, e: 46 };
    self.NORTH_AMERICA = { s: 8, w: -169, n: 72, e: -52 };
    //self.STOTFOLD = { s: 52.01384492765967, w: -0.22976875305175784, n: 52.015007091239326, e: -0.22740840911865237 };
    self.STOTFOLD = { s: 52.014, w: -0.230, n: 52.015, e: -0.228 };

    // The extent entered by the user (view model)
    self.vmExtent = {};
    
    // Leaflet 'fly to' animation
    self.fly = false;
    
    // Note: The bindings - this.debug, etc. - are not available until
    // $onInit is called.
    self.$onInit = function GeographicExtentWidgetControllerInit() {
      // Note: There are two pieces of data: the view model
      // (self.vmExtent) which is updated from the view by Angular, and the
      // data we return to our caller (self.extent, to which our caller has
      // a reference).

      // Set our data to the initial value.
      if (self.extent) {
        self.vmExtent.n = self.extent.n;
        self.vmExtent.e = self.extent.e;
        self.vmExtent.s = self.extent.s;
        self.vmExtent.w = self.extent.w;
      }
      
      self.initMap();
    };

    // Little validation is required - almost any combination of values
    // within the valid ranges can be interpreted, and Angular validates
    // the ranges.
    //
    // Note that it's allowed for 'e' to be greater than 'w' - this
    // represents an area spanning the date line. Consider going around
    // the Earth eastwards. When you enter the region you want
    // that's the west angle, when you leave it that's the east.
    //
    // Here are some cases to consider when thinking about what's valid:
    //    - A 20deg-wide area covering the meridian:
    //         (n=55,s=50,w=-10,e=10)
    //         (n=55,s=50,w=350,e=10)
    //    - An 20deg-wide area in the Pacific covering 180:
    //         (n=55,s=50,w=170,e=-170)
    //         (n=55,s=50,w=170,e=190)
    //    - An area covering the north pole:
    //         (n=90,s=80,w=-180,e=180)
    //         (n=90,s=80,w=0,e=360)
    //    - The whole earth:
    //         (n=90,s=-90,w=-180,e=180)
    //         (n=90,s=-90,w=0,e=360)
    //
    // The invalid case:
    //   (n=50,s=60,w=10,e=20)
    self.validateExtent = function validateExtent(modelValue, viewValue) {
      // This call happens before changes to the input are
      // reflected in the model (indeed, the changes will not
      // be reflected if this function returns false).
      //
      // We need to be careful to make sure we're accessing
      // what has been entered.
      var n = parseFloat(self.widgetForm.n.$viewValue);
      var s = parseFloat(self.widgetForm.s.$viewValue);
      if (s > n) {
        $scope.$ctrl.widgetForm.n.$setValidity("nSouthOfS", false);
        $scope.$ctrl.widgetForm.s.$setValidity("nSouthOfS", false);
      }
      else {
        $scope.$ctrl.widgetForm.n.$setValidity("nSouthOfS", true);
        $scope.$ctrl.widgetForm.s.$setValidity("nSouthOfS", true);
      }

      // Note that returning false, even when validation fails,
      // results in the following bug:
      //   - Enter '3000' in 'E'
      //   - Enter '1' in N and '12' in S. Error appears.
      //   - Change 'E' to 300.
      //   - 'E' remains in error.
      return true;
    };

    // We must update the data model when the view model is changed.
    self.updateExtent = function updateExtent() {
      self.extent = {
        n: self.vmExtent.n == null ? 90 : self.vmExtent.n,
        e: self.vmExtent.e == null ? 180 : self.vmExtent.e,
        s: self.vmExtent.s == null ? -90 : self.vmExtent.s,
        w: self.vmExtent.w == null ? -180 : self.vmExtent.w
      };
    };

    // ...and we must update it with initial values, and install our
    // validator
    self.$postLink = function() {
      self.widgetForm.n.$validators.checkExtent =
        self.widgetForm.e.$validators.checkExtent =
        self.widgetForm.s.$validators.checkExtent =
        self.widgetForm.w.$validators.checkExtent =
        self.validateExtent;


      // Ensure that self.extent is set even if the UI is never interacted
      // with.
      self.updateExtent();
    };
//=================================================================================

    self.initMap = function() {
      // Map
      self.mymap = L.map('bboxmap').setView([51.505, -0.09], 13);

      // Background layer
      var streetLayer = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNvbndheSIsImEiOiJjaXoycnRxOGkwMDJuMzJxdGEzaXhjdDVzIn0.LrvIei4nBmUDgs-KCa8qjw';
      // var outdoorLayer = 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNvbndheSIsImEiOiJjaXoycnRxOGkwMDJuMzJxdGEzaXhjdDVzIn0.LrvIei4nBmUDgs-KCa8qjw';
      // var darkLayer = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNvbndheSIsImEiOiJjaXoycnRxOGkwMDJuMzJxdGEzaXhjdDVzIn0.LrvIei4nBmUDgs-KCa8qjw';
      // var rconwayOutdoor = 'https://api.mapbox.com/styles/v1/rconway/ciz2tzme8004g2ss2ug6kz31k/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNvbndheSIsImEiOiJjaXoycnRxOGkwMDJuMzJxdGEzaXhjdDVzIn0.LrvIei4nBmUDgs-KCa8qjw';
      // var rconwayBasic = 'https://api.mapbox.com/styles/v1/rconway/ciz2u4fa7003p2rmef7wwjkhk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNvbndheSIsImEiOiJjaXoycnRxOGkwMDJuMzJxdGEzaXhjdDVzIn0.LrvIei4nBmUDgs-KCa8qjw';
      // var rconwayLight = 'https://api.mapbox.com/styles/v1/rconway/ciz2u79qf003g2sphnnydej5z/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNvbndheSIsImEiOiJjaXoycnRxOGkwMDJuMzJxdGEzaXhjdDVzIn0.LrvIei4nBmUDgs-KCa8qjw';
      L.tileLayer(streetLayer).addTo(self.mymap);

      // Area select
      self.areaSelect = L.areaSelect({width:200, height:180});
      self.areaSelect.addTo(self.mymap);
      self.updateModelFromAreaSelection();
      self.areaSelect.on("change", function() {
        var onChangeFn = this;
        console.log("zzz areaSelect CHANGE: " + JSON.stringify(self.areaSelect.getBounds(),null,2));
        // Use $timeout to ensure async, so that use of $apply is legitimate
        // Otherwise, it is sometimes invoked synchronously and so we end up using
        // $apply when we are already with the scope of an in-progress $apply
        // - this would cause an error.
        // Also, we're getting double-hits on the 'change' event - so use the timer with a 10msec
        // interval to catch the duplicate calls and only action the last one.
        if (onChangeFn.timer) {
          $timeout.cancel(onChangeFn.timer);
          console.log("zzz onChangeFn.timer CANCELLED");
        }
        onChangeFn.timer = $timeout(function() {
          onChangeFn.timer = undefined;
          if (self.areaSelectInvalid) {
            console.log("zzz MANUAL zzz");
            self.areaSelectInvalid = false;
            self.positionBoxManually();
          }
          else if (self.areaSelectIgnoreChange) {
            console.log("zzz IGNORE zzz");
            self.areaSelectIgnoreChange = false;
          }
          else {
            console.log("zzz CHANGE zzz");
            $scope.$apply(self.updateModelFromAreaSelection());
          }
        }, 10);
      });
    }
    
    self.updateModelFromAreaSelection = function() {
      var area = self.areaSelect.getBounds();
      self.vmExtent.n = self.round(area._northEast.lat, 3);
      self.vmExtent.e = self.round(area._northEast.lng, 3);
      self.vmExtent.s = self.round(area._southWest.lat, 3);
      self.vmExtent.w = self.round(area._southWest.lng, 3);
      self.updateExtent();
    }

    self.positionBoxManually = function() {
      console.log("zzz positionBoxManually: " + JSON.stringify(self.vmExtent,null,2));

      var mapSize = self.mymap.getSize();
      console.log("zzz positionBoxManually: mapSize = " + JSON.stringify(mapSize,null,2));

      var mapBounds = self.mymap.getBounds();
      console.log("zzz positionBoxManually: mapBounds = " + JSON.stringify(mapBounds,null,2));
      
      console.log("zzz DEBUG: getPixelBounds = " + JSON.stringify(self.mymap.getPixelBounds(),null,2) );
      console.log("zzz DEBUG: getPixelOrigin = " + JSON.stringify(self.mymap.getPixelOrigin(),null,2) );
      console.log("zzz DEBUG: getPixelWorldBounds = " + JSON.stringify(self.mymap.getPixelWorldBounds(),null,2) );

      var latExtentMap = mapBounds._northEast.lat - mapBounds._southWest.lat;
      var lngExtentMap = mapBounds._northEast.lng - mapBounds._southWest.lng;
      console.log("zzz positionBoxManually: mapExtent = " + latExtentMap + ", " + lngExtentMap);

      var latExtentBox = self.vmExtent.n - self.vmExtent.s;
      var lngExtentBox = self.vmExtent.e - self.vmExtent.w;
      console.log("zzz positionBoxManually: boxExtent = " + latExtentBox + ", " + lngExtentBox);

      var boxHeight = mapSize.y * latExtentBox / latExtentMap;
      var boxWidth = mapSize.x * lngExtentBox / lngExtentMap;
      console.log("zzz positionBoxManually: boxSize = " + boxWidth + ", " + boxHeight);

      self.areaSelectIgnoreChange = true;
      self.areaSelect.setDimensions({height: boxHeight, width: boxWidth});
    }

    self.calculateCentre = function(box) {
      return {
        lat: ((box.n-box.s)/2)+box.s,
        lng: ((box.e-box.w)/2)+box.w
      };
    }
    
    self.setBoundingBox = function(bbox) {
      self.vmExtent = { n: bbox.n, e: bbox.e, s: bbox.s, w: bbox.w };
      self.updateExtent();
      self.setMapFromModel();
    }

    self.setMapFromModel = function(pad) {
      console.log("zzz setMapFromModel START");
      
      if (!pad) {
        pad = 0;
      }

      console.log("zzz setMapFromModel: centre = " + JSON.stringify(self.calculateCentre(self.vmExtent),null,2));

      var bottomLeft = L.latLng(self.vmExtent.s, self.vmExtent.w);
      var topRight = L.latLng(self.vmExtent.n, self.vmExtent.e);
      var bounds = L.latLngBounds(bottomLeft, topRight);
      //bounds = bounds.pad(0);
      self.areaSelectInvalid = true;
      if (self.fly) {
        self.mymap.flyToBounds(bounds, {padding:[pad,pad]});
      }
      else {
        self.mymap.fitBounds(bounds, {padding:[pad,pad]});
      }
      console.log("zzz setMapFromModel END");
    }
    
    self.round = function round(value, decimals) {
      return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }

//=================================================================================
  },
  // External attribute passing...
  bindings: {
    config: "<",
    extent: "=",
    debug: "<"
  }
});
