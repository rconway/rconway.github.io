'use strict';

// Define the `formApp` module
angular.module('formApp', [
  'ngRoute',
  // ...which depends on the `formBuilder` module
  'formBuilder'
]);
