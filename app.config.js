'use strict';

angular.module('formApp').
  config([ "$locationProvider", "$routeProvider",
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix("!");

      $routeProvider.
        when("/datasets", {
          template: `
            <h2>Available datasets...</h2>
            <p>
              <a href="#!/datasets/ecmwf_era15">ECMWF ERA15</a>
              <a href="#!/datasets/ecmwf_era15/debug">[with debug]</a>
            </p>
            <p>
              <a href="#!/datasets/ecmwf_era15pl">ECMWF ERA15 (Pressure Levels)</a>
              <a href="#!/datasets/ecmwf_era15pl/debug">[with debug]</a>
            </p>
            <p>
              <a href="#!/datasets/ecmwf_era15pl2">ECMWF ERA15 (Pressure Levels) ALTERNATIVE</a>
              <a href="#!/datasets/ecmwf_era15pl2/debug">[with debug]</a>
            </p>
            <p>
              <a href="#!/datasets/ecmwf_era20">ECMWF ERA20</a>
              <a href="#!/datasets/ecmwf_era20/debug">[with debug]</a>
            </p>
          `
        }).
        when("/datasets/:datasetId", {
          template: "<form-builder debug='false'></form-builder>"
        }).
        when("/datasets/:datasetId/debug", {
          template: "<form-builder debug='true'></form-builder>"
        }).
        otherwise("/datasets");
    }
  ]);
