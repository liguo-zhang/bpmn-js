'use strict';

var assign = require('lodash/object/assign');

/**
 * A palette provider for BPMN 2.0 elements.
 */
function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool, handTool, translate) {

  this._palette = palette;
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;
  this._translate = translate;

  palette.registerProvider(this);
}

module.exports = PaletteProvider;

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'translate',
  'eventBus'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions  = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool,
      translate = this._translate;

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^bpmn\:/, '');

    return {
      group: group,
      className: className,
      title: title || translate('Create {type}', { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createParticipant(event, collapsed) {
    create.start(event, elementFactory.createParticipantShape(collapsed));
  }

  assign(actions, {
    'hand-tool': {
      group: 'tools',
      className: 'bpmn-icon-hand-tool',
      //title: translate('Activate the hand tool'),
      title: '移动',
      action: {
        click: function(event) {
          handTool.activateHand(event);
        }
      }
    },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      //title: translate('Activate the lasso tool'),
      title: '套索工具',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    // 'space-tool': {
    //   group: 'tools',
    //   className: 'bpmn-icon-space-tool',
    //   title: translate('Activate the create/remove space tool'),
    //   action: {
    //     click: function(event) {
    //       spaceTool.activateSelection(event);
    //     }
    //   }
    // },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create.start-event': createAction(
      'bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none', '开始节点'
    ),
//    'create.intermediate-event': createAction(
//      'bpmn:IntermediateThrowEvent', 'event', 'bpmn-icon-intermediate-event-none'
//    ),
    'create.end-event': createAction(
      'bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none', '结束节点'
    ),
    'create.task': createAction(
      'bpmn:Task', 'activity', 'bpmn-icon-task', '任务节点'
    ),
//    'create.data-object': createAction(
//      'bpmn:DataObjectReference', 'data-object', 'bpmn-icon-data-object'
//    ),
//    'create.data-store': createAction(
//      'bpmn:DataStoreReference', 'data-store', 'bpmn-icon-data-store'
//    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-xor', '网关节点'
    ),

    'create.subprocess-expanded': createAction(
      'bpmn:SubProcess', 'activity', 'bpmn-icon-subprocess-expanded',  'subprocess节点',
      { isExpanded: true }
    ),
    'create.participant-expanded': {
      group: 'collaboration',
      className: 'bpmn-icon-participant',
      //title: translate('Create Pool/Participant'),
      title: '泳道',
      action: {
        dragstart: createParticipant,
        click: createParticipant
      }
    }
  });

  return actions;
};
