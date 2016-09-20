'use strict';

// TODO - Broker URL should be configurable.
var defaultBrokerUrl = "http://localhost:8084/broker/api/v1/request";

// TEST DATA
// TODO - This should be retrieved by REST call to the catalogue
var era15_spec = {
  title: "Data Retrieval Selections for ECMWF ERA15 (Surface Parameters)",
  form: [
    {
      name: "levtype",
      label: "Level type",
      required: true,
      help: "Level type - pl (Pressure Level) or sfc (Surface)",
      type: "HiddenWidget",
      details: {
        default: "sfc"
      }
    },
    {
      name: "date",
      label: "Select a date range between 1979-01-01 and 1993-12-31",
      required: true,
      help: "Date range - specified as start and end dates",
      type: "DateRangeWidget",
      details: {
        default: "1980-01-01/1985-12-31",
        range: [ "1979-01-01", "1993-12-31" ]
      }
    },
    {
      name: "param",
      label: "Select Surface Parameters",
      required: true,
      help: "Surface parameters",
      type: "StringListWidget",
      details: {
        default: [],
        values: [ "2t", "2d", "10u", "10v", "tcc" ],
        labels: {
          "2d": "2 metre dewpoint temperature",
          "2t": "2 metre temperature",
          "10u": "10 metre U wind component",
          "10v": "10 metre V wind component",
          "tcc": "Total cloud cover"
        }
      }
    }
  ],
  constraints: ""
};
var era15pl_spec = {
  title: "Data Retrieval Selections for ECMWF ERA15 (Pressure Level Parameters)",
  form: [
    {
      name: "levtype",
      label: "Level type",
      required: true,
      help: "Level type - pl (Pressure Level) or sfc (Surface)",
      type: "HiddenWidget",
      details: {
        default: "pl"
      }
    },
    {
      name: "param",
      label: "Select Pressure Level Parameters",
      required: true,
      help: "Pressure Level Parameters",
      type: "StringListWidget",
      details: {
        default: [],
        values: [ "geo1000", "geo500", "temp850", "temp200", "u850", "u200", "v850", "v200" ],
        labels: {
          "geo1000": "Geopotential 1000",
          "geo500": "Geopotential 500",
          "temp850": "Temperature 850",
          "temp200": "Temperature 200",
          "u850": "U component of wind 850",
          "u200": "U component of wind 200",
          "v850": "V component of wind 850",
          "v200": "V component of wind 200"
        }
      }
    },
    {
      name: "date",
      label: "Select a date range between 1985-01-01 and 1989-12-31",
      required: true,
      help: "Date range - specified as start and end dates",
      type: "DateRangeWidget",
      details: {
        default: "1985-01-01/1989-12-31",
        range: [ "1985-01-01", "1989-12-31" ]
      }
    }
  ],
  constraints: ""
};
var era15pl2_spec = {
  title: "Data Retrieval Selections for ECMWF ERA15 (Pressure Level Parameters)",
  form: [
    {
      name: "levtype",
      label: "Level type",
      required: true,
      help: "Level type - pl (Pressure Level) or sfc (Surface)",
      type: "HiddenWidget",
      details: {
        default: "pl"
      }
    },
    {
      name: "date",
      label: "Select a date range between 1985-01-01 and 1989-12-31",
      required: true,
      help: "Date range - specified as start and end dates",
      type: "DateRangeWidget",
      details: {
        default: "1985-01-01/1989-12-31",
        range: [ "1985-01-01", "1989-12-31" ]
      }
    },
    {
      name: "param",
      label: "Select Pressure Level Parameters",
      required: true,
      help: "Pressure Level Parameters",
      type: "StringListArrayWidget",
      details: {
        default: [],
        groups: [
          {
            label: "Geopotential",
            values: ["geo1000", "geo500"],
            labels: {
              "geo1000": "Geopotential 1000",
              "geo500": "Geopotential 500"
            }
          },
          {
            label: "Temperature",
            values: ["temp850", "temp200"],
            labels: {
              "temp850": "Temperature 850",
              "temp200": "Temperature 200"
            }
          },
          {
            label: "U component of wind",
            values: ["u850", "u200"],
            labels: {
              "u850": "U component of wind 850",
              "u200": "U component of wind 200"
            }
          },
          {
            label: "V component of wind",
            values: ["v850", "v200"],
            labels: {
              "v850": "V component of wind 850",
              "v200": "V component of wind 200"
            }
          }
        ]
      }
    }
  ],
  constraints: ""
};
var datasetMap = {
  ecmwf_era15: era15_spec,
  ecmwf_era15pl: era15pl_spec,
  ecmwf_era15pl2: era15pl2_spec
}

// Register `formBuilder` component, along with its associated controller and template
angular.
  module('formBuilder').
  component('formBuilder', {
    templateUrl: 'form-builder/form-builder.template.html',
    controller: function FormBuilderController($routeParams, $scope, $compile, $element) {
      var self = this;

      if (self.debug === undefined) {
        self.debug = false;
      };

      self.datasetId = $routeParams.datasetId;

      // This is derived from 'form' - it is the model that matches the form.
      self.model = {
      };

      self.requestToBroker = {
        user: "cdstestuser",
        action: "retrieve",
        arguments: {
          dataset: self.datasetId,
          subset: self.model
        }
      };

      // Show and hide the Request Preview div.
      self.showRequest = false;

      self.$onInit = function() {
        self.getSpecForDataset();
        self.buildForm();
      };

      self.getSpecForDataset = function() {
        // TODO - this is a hack ~ it should come from catalogue
        self.datasetSpec = datasetMap[self.datasetId];
        if (self.datasetSpec != undefined) {
          self.form = self.datasetSpec.form;
        }
      };

      self.buildForm = function() {
        if (self.form != undefined) {
          self.form.forEach( self.buildElement );
        }
        else {
          var template = `
            <p class="text-danger">ERROR: There was a problem getting the form specification for dataset {{$ctrl.datasetId}}</p>
          `;
          self.appendTemplateToForm(template);
        }
      };

      self.buildElement = function( formElement, index ) {
        console.log("index=" + index + ", formElement.name = " + formElement.name);

        var paramName = formElement.name;
        var paramType = formElement.type;

        self.model[paramName] = "";

        var formElementInController = "$ctrl.form[" + index + "]";
        var dataModelInController = "$ctrl.model." + paramName;

        switch (paramType) {
          case "DateRangeWidget":
            self.appendTemplateToForm("<date-range-widget config='" + formElementInController + "' date-selection='" + dataModelInController + "' debug='" + self.debug + "'></date-range-widget>");
            break;
          case "StringListWidget":
            self.appendTemplateToForm("<string-list-widget config='" + formElementInController + "' selected-items='" + dataModelInController + "' debug='" + self.debug + "'></string-list-widget>");
            break;
          case "StringListArrayWidget":
            self.appendTemplateToForm("<string-list-array-widget config='" + formElementInController + "' selected-items='" + dataModelInController + "' debug='" + self.debug + "'></string-list-array-widget>");
            break;
          case "HiddenWidget":
            self.model[paramName] = formElement.details.default;
            break;
          default:
            console.log("Unknown form widget type: " + paramType);
            break;
        }

      };

      self.appendTemplateToForm = function(template) {
        var linkFn = $compile( template );
        var content = linkFn( $scope );
        $element.find("section").append( content );
      };

      // TODO
      // Submit the form - should be a call to the Broker's request interface
      self.formSubmit = function() {
        self.submitStatus = "REQUEST AWAITING CONFIRMATION";
        self.submitSuccess = false;

        // Call the Broker to submit the request.
        console.log("Request sent to broker: " + JSON.stringify(self.requestToBroker,null,2));
        $.ajax({
          type: "POST",
          url: defaultBrokerUrl,
          contentType: "application/json",
          data: JSON.stringify(self.requestToBroker),
          processData: false,
          dataType: "json",
          // SUCCESS callback
          success: function(data, textStatus, jqXHR) {
            // Use the angular $apply() function to ensure that edits to $watched
            // parameters are notified to the watchers. This is needed because we are
            // inside a jQuery callback, i.e. outside of the angular scope.
            $scope.$apply(function() {
              self.submitStatus = "REQUEST SUBMISSION SUCCEEDED";
              self.cdsForm.$setPristine();
              self.submitSuccess = true;
            });
            console.log(self.submitStatus + ": " + textStatus);
            console.log("Reply returned from broker: " + JSON.stringify(data,null,2));
          },
          // FAILURE callback
          error: function(jqXHR, textStatus, errorThrown) {
            // Use angular $apply when in callback - see above explanation.
            $scope.$apply(function() {
              self.submitStatus = "REQUEST SUBMISSION FAILED";
              if (errorThrown) {
                self.submitStatus += " - " + errorThrown;
              }
              self.cdsForm.$setPristine();
              self.submitSuccess = false;
            });
            console.log(self.submitStatus + ": " + textStatus + ", " + errorThrown);
          }
        });
      };
    },
    bindings: {
      debug: "<"
    }
  });
