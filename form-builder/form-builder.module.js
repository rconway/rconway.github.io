'use strict';

// Define the `formBuilder` module
angular.module('formBuilder', [
  'ngRoute',
  'ngAnimate',
  // ...which depends on the `xxxWidget` modules
  'dateRangeWidget',
  'stringListWidget',
  'stringListArrayWidget'
]);
