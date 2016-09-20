'use strict';

// Register `stringListWidget` component, along with its associated controller and template
angular.
  module('stringListWidget').
  component('stringListWidget', {
    templateUrl: 'string-list-widget/string-list-widget.template.html',
    controller: function StringListWidgetController() {
      var self = this;

      if (self.debug === undefined) {
        self.debug = false;
      }

      // 'selections' is bound to the ng-model to receive the user interactions.
      // This is translated via the updateSelectedItems() function into the form that
      // is output by the widget - in the variable selectedItems.
      self.selections = {};

      // Prepare the output presented by this widget - should be called whenever selections change.
      self.updateSelectedItems = function() {
        // Empty the array - also assigning a new array notifies any watchers (e.g. validators).
        self.selectedItems = [];
        // Re-populate with current selections.
        for (var item in self.selections) {
          if (self.selections[item]) {
            self.selectedItems.push(item);
          }
        }
      }

      // Validate (optional) 'required' status - meaning at least one must be selected.
      self.validateOneOrMore = function() {
        return (self.selectedItems.length > 0);
      }

      // Self-configuration post angular link.
      self.$postLink = function() {
        // Custom form validation.
        if (self.config.required) {
          self.widgetForm.stringListWidget.$validators.oneOrMore = self.validateOneOrMore;
        }

        // Ensure initial value of array reflects current selections.
        self.updateSelectedItems();
      }

    },
    // External attribute passing...
    bindings: {
      config: "<",
      selectedItems: "=",
      debug: "<"
    }
  });
