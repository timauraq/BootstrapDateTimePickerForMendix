/*global logger*/
/*
    BootstrapDatetimePickerForMendix
    ========================

    @file      : BootstrapDatetimePickerForMendix.js
    @version   : 1.0.0
    @author    : Tim Newman
    @date      : 2/19/2016
    @copyright : AuraQ LTD
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
require({
  packages: [
    {
          name: 'jqwrapper',
          location: '../../widgets/BootstrapDatetimePickerForMendix/lib',
          main: 'jqwrapper'
    }, {
           name: 'bootstrap',
           location: '../../widgets/BootstrapDatetimePickerForMendix/lib',
           main: 'bootstrap'
      }, {
             name: 'moment',
             location: '../../widgets/BootstrapDatetimePickerForMendix/lib',
             main: 'moment'
        }, {
           name: 'bootstrap-datetimepicker',
           location: '../../widgets/BootstrapDatetimePickerForMendix/lib',
           main: 'bootstrap-datetimepicker'
      }]
  } ,[
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "jqwrapper",

    "bootstrap",
    "moment",
    //"BootstrapDatetimePickerForMendix/lib/",
    "bootstrap-datetimepicker",

    "dojo/text!BootstrapDatetimePickerForMendix/widget/template/BootstrapDatetimePickerForMendix.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jqwrapper, _bootstrap, moment, _dateTimePicker, widgetTemplate) {
    "use strict";

    var $ = _jqwrapper;
        $ = _bootstrap.createInstance($);
        $ = _dateTimePicker.createInstance($);

    //var $ = _jQuery.noConflict(true);
    //_moment().fomat();
    // Declare widget's prototype.
    return declare("BootstrapDatetimePickerForMendix.widget.BootstrapDatetimePickerForMendix", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        dateTimeNode: null,
        dateTimeInputNode: null,
        dateTimeSelectNode: null,
        infoTextNode: null,

        // Parameters configured in the Modeler.
        _$inputGroup: null,
        _$input: null,
        mfToExecute: "",
        _dateTimeAttribute: "",


        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            // Uncomment the following line to enable debug messages
            //logger.level(logger.DEBUG);

            console.log(this.id + ".constructor");
            logger.debug(this.id + ".constructor");
            this._handles = [];

        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            console.log(this.id + ".postCreate");
            logger.debug(this.id + ".postCreate");

            this._dateTimeAttribute = this.dateTimeAttribute;

            // make sure we only select the control for the current id or we'll overwrite previous instances
            var groupSelector = '#' + this.id + ' .DTpicker';
            this._$inputGroup = $(groupSelector);

            var inputSelector = '#' + this.id + ' input.mxDTPicker';
            this._$input = $(inputSelector);

            // adjust the template based on the display settings.
            if( this.showLabel ) {
                if(this.formOrientation === "horizontal"){
                    // width needs to be between 1 and 11
                    var comboLabelWidth = this.labelWidth < 1 ? 1 : this.labelWidth;
                    comboLabelWidth = this.labelWidth > 11 ? 11 : this.labelWidth;

                    var comboControlWidth = 12 - comboLabelWidth,
                        comboLabelClass = 'col-sm-' + comboLabelWidth,
                        comboControlClass = 'col-sm-' + comboControlWidth;

                    dojoClass.add(this.mxDTPickerLabel, comboLabelClass);
                    dojoClass.add(this.mxDTPickerInputGroupContainer, comboControlClass);
                }

                this.mxDTPickerLabel.innerHTML = this.fieldCaption;
            }
            else {
                dojoClass.remove(this.mxDTPickerMainContainer, "form-group");
                dojoConstruct.destroy(this.mxDTPickerLabel);
            }

            //$('#datetimepicker').datetimepicker();
            this._updateRendering();
            this._setupEvents();


        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            console.log(this.id + ".update");
            logger.debug(this.id + ".update");

            var self = this;

            if (obj === null) {
                if (!dojoClass.contains(this.domNode, 'hidden')) {
                    dojoClass.add(this.domNode, 'hidden');
                }
            } else {
                if (dojoClass.contains(this.domNode, 'hidden')) {
                    dojoClass.remove(this.domNode, 'hidden');
                }



                this._$inputGroup.datetimepicker({
                    //format: "dddd, MMMM Do YYYY, h:mm:ss a",
                    showClose: true,
                }).on("dp.change", function(e) {
                    moment.unix(e.date);
                    self._contextObj.set(self.dateTimeAttribute, e.date);
                });

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();
          }

            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function() {
          console.log(this.id + ".enable");
          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function() {
          console.log(this.id + ".disable");
          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function(box) {
          console.log(this.id + ".resize");
          logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function() {
          console.log(this.id + ".uninitialize");
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
            //$('#datetimepicker').destroy();
            //destroy();
            //$(this.dateTimeNode).data("DateTimePicker").destroy();
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            console.log(this.id + "._stopBubblingEventOnMobile");
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function() {
            console.log(this.id + "._setupEvents");
            logger.debug(this.id + "._setupEvents");
        },

        // Rerender the interface.
        _updateRendering: function() {
            console.log(this.id + "._updateRendering");
            logger.debug(this.id + "._updateRendering");
            //this.colorSelectNode.disabled = this.readOnly;
            //this.colorInputNode.disabled = this.readOnly;
            this.mxDTPickerInputGroup.disabled = this.readOnly;


              if( this._contextObj ) {
                var currentDate = this._contextObj.get(this._dateTimeAttribute);
                var currentValue = '';
                if(currentDate){
                   currentValue = currentDate;
                }

                this._$input.val(currentValue);
            }


            // Important to clear all validations!
            this._clearValidations();
        },

        // Handle validations.
        _handleValidation: function(validations) {
            console.log(this.id + "._handleValidation");
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(this._dateTimeAttribute);

            if (this.readOnly) {
                validation.removeAttribute(this._dateTimeAttribute);
            } else if (message) {
                this._addValidation(message);
                validation.removeAttribute(this._dateTimeAttribute);
            }
        },

        // Clear validations.
        _clearValidations: function() {
            console.log(this.id + "._clearValidations");
            logger.debug(this.id + "._clearValidations");
            if( this._$alertdiv ) {
                this._$inputGroup.parent().removeClass('has-error');
                this._$alertdiv.remove();
            }
        },

        // Show an error message.
        _showError: function(message) {
            console.log(this.id + "._showError");
            logger.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this.domNode, this._alertDiv);
        },

        // Add a validation.
        _addValidation: function(message) {
            console.log(this.id + "._addValidation");
            this._$alertdiv = $("<div></div>").addClass('alert alert-danger mx-validation-message').html(message);
            this._$inputGroup.parent().addClass('has-error').append( this._$alertdiv );
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            console.log(this.id + "._resetSubscriptions");
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            if (this._handles) {
                dojoArray.forEach(this._handles, function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this._dateTimeAttribute,
                    callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                var validationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });

                this._handles = [ objectHandle, attrHandle, validationHandle ];
            }
        }
    });
});

require(["BootstrapDatetimePickerForMendix/widget/BootstrapDatetimePickerForMendix"], function() {
    "use strict";
});
