'use strict';

// Register `dateRangeWidget` component, along with its associated controller and template
angular.
  module('dateRangeWidget').
  component('dateRangeWidget', {
    templateUrl: 'date-range-widget/date-range-widget.template.html',
    controller: function DateRangeWidgetController($filter) {
      var self = this;

      if (self.debug === undefined) {
        self.debug = false;
      };

      self.dateFormat = "yyyy-MM-dd";

      // Use Date objects for the <input> validation.
      var dateParts = self.config.details.default.split("/");
      self.startDate = new Date(dateParts[0]);
      self.endDate = new Date(dateParts[1]);

      // Prepare the dateSelection as our 'output' in the agreed form:
      //   YYYY-MM-DD/YYYY-MM-DD (start/end)
      self.updateDate = function() {
        self.dateSelection = $filter('date')(self.startDate, self.dateFormat) + "/" + $filter('date')(self.endDate, self.dateFormat);
      }

      // Function to validate the start and end dates make sense in combination.
      // Returns false to indicate that valid dates are entered, and the start date is
      // greater than the end date.
      // Returns true otherwise - including cases where the dates are undefined/null.
      self.validateStartEndDates = function() {
        // Check for dates not set properly
        // - in which case return true since other validations will handle this.
        if ( (self.startDate === undefined) || (self.startDate === null)
          || (self.endDate === undefined) || (self.endDate === null) ) {
          return true;
        }
        // Else, dates have been set so compare them.
        else {
          return (self.startDate.getTime() <= self.endDate.getTime());
        }
      }

      // Self-configuration post angular link.
      self.$postLink = function() {
        // Custom form validation.
        self.widgetForm.dateRangeWidget.$validators.dateStartEnd = self.validateStartEndDates;

        // Ensure the dateSelection parameter is well initialised.
        // After this it will be updated from UI change events.
        self.updateDate();
      }
    },
    // External attribute passing...
    bindings: {
      config: "<",
      dateSelection: "=",
      debug: "<"
    }
  });
