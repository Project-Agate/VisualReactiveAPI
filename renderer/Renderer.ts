/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/templates.d.ts" />

import fs = require('fs');
import asset = require('assert');

import Handlebars = require('handlebars');

import VRAC = require('./interfaces/VRAC');
import Widget = require('./interfaces/Widget');

class Renderer {
  rootWidget: Widget;
  widgets: VRAC.Widgets = {};
  signals: VRAC.Signals = {};
  javascript: string = '';
  html: string = '';

  private rAttributeSource: string = fs.readFileSync('templates/RAttributeTemplate.handlebars').toString();
  private rAttributeTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.rAttributeSource);
  private wAttributeSource: string = fs.readFileSync('templates/WAttributeTemplate.handlebars').toString();
  private wAttributeTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.wAttributeSource);
  private eventSource: string = fs.readFileSync('templates/EventTemplate.handlebars').toString();
  private eventTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.eventSource);
  private demuxerActionSource: string = fs.readFileSync('templates/DemuxerActionTemplate.handlebars').toString();
  private demuxerActionTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.demuxerActionSource);
  private dataSourceSource: string = fs.readFileSync('templates/DataSourceTemplate.handlebars').toString();
  private dataSourceTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.dataSourceSource);

  constructor() {
    Handlebars.registerHelper('commaList', function(object: any[]) {
      return new Handlebars.SafeString(
        object.join(', ')
      );
    });
    Handlebars.registerHelper('literal', function(object: any) {
      return new Handlebars.SafeString(
        JSON.stringify(object)
      );
    });
  }

  render(rawProgram: Object): VRAC.App {
    var rawWidgets = rawProgram['widgets'];
    for(var uid in rawWidgets) {
      this.widgets[uid] = new Widget(rawWidgets[uid]);
    }
    this.signals = rawProgram['signals'];
    this.html = this.javascript = '';

    for(var uid in this.widgets) {
      var widget = this.widgets[uid];
      if(widget.isRoot()) {
        this.rootWidget = widget;
      }
      else {
        var placeholder = <VRAC.Placeholder>this.signals[widget.renderToRef];
        var parentWidget = this.widgets[placeholder.widgetRef];
        parentWidget.childWidgets[placeholder.selector] = widget;
      }
    }

    for(var uid in this.signals) {
      var signal = this.signals[uid];
      if(signal.type === 'demuxer') {
        var newActions = this.preprocessDemuxer(<VRAC.Demuxer>signal);
        newActions.forEach((action: VRAC.Action) => {
          this.signals[action.uid] = action;
        });
      }
    }

    for(var uid in this.signals) {
      this.processSignal(this.signals[uid]);
    }

    var appFiles: VRAC.App = {};
    var rootWidget = this.rootWidget;
    rootWidget.renderTree(this.javascript, appFiles);

    return appFiles;
  }

  preprocessDemuxer(demuxer: VRAC.Demuxer): VRAC.Action[] {
    return demuxer.outputs.map((output, index) => {
      var demuxerActionCode = this.demuxerActionTemplate({
        key: output.key,
        isOnArray: demuxer.isOnArray,
      });
      return {
        type: 'action',
        uid: output.uid,
        name: 'demuxer_action_' + output.uid + '_' + output.key,
        parameters: [
          {name: 'data', valueRef: demuxer.inputRef }
        ],
        body: demuxerActionCode,
      };
    });
  }

  processSignal(signal: VRAC.Signal): string {
    if(signal.streamName) return signal.streamName;

    switch(signal.type) {
      case 'action':
        return signal.streamName = this.processAction(<VRAC.Action>signal);
      case 'event':
        return signal.streamName = this.processEvent(<VRAC.Event>signal);
      case 'rAttribute':
        return signal.streamName = this.processRAttribute(<VRAC.RAttribute>signal);
      case 'wAttribute':
        return signal.streamName = this.processWAttribute(<VRAC.WAttribute>signal);
      case 'dataSource':
        return signal.streamName = this.processDataSource(<VRAC.DataSource>signal);
      case 'constant':
        return signal.streamName = this.processConstant(<VRAC.Constant>signal);
      case 'placeholder':
      case 'element':
      case 'demuxer':
        return signal.streamName = ''; // Placholder, Element and Demuxer don't have their own JavaScript code
      default:
        throw 'Unknown signal type: "' + signal.type + '"';
    }
  }

  processAction(action: VRAC.Action): string {
    var streamName = 'action_' + action.name + '_' + action.uid;
    var functionSource = 'function({{{commaList parameterNames}}}) {\n  {{{body}}}  \n}';
    var functionTemplate = Handlebars.compile(functionSource);
    var functionCode = functionTemplate({
      parameterNames: action.parameters.map((p) => { return p.name; }),
      body: action.body,
    });

    var parameterStreamNames = action.parameters.map((p) => {
      return this.processSignal(this.signals[p.valueRef]);
    });
    var actionSource = 'var {{{streamName}}} = Bacon.combineWith({{{functionCode}}}, {{{commaList parameterStreamNames}}});'
    var actionTemplate = Handlebars.compile(actionSource);
    var actionCode = actionTemplate({
      streamName: streamName,
      parameterStreamNames: parameterStreamNames,
      functionCode: functionCode,
    });

    this.addJavascriptCode(actionCode);

    return streamName;
  }

  processEvent(event: VRAC.Event): string {
    var streamName = 'event_' + event.uid;
    var element = <VRAC.Element>this.signals[event.elementRef];
    var widget = this.widgets[element.widgetRef];

    var eventCode = this.eventTemplate({
      widgetUID: widget.uid,
      streamName: streamName,
      elementSelector: element.selector,
      eventType: event.eventType,
    });

    this.addJavascriptCode(eventCode);

    return streamName;
  }

  processRAttribute(attribute: VRAC.RAttribute): string {
    var streamName = 'rAttribute_' + attribute.name + '_' + attribute.uid;
    var element = <VRAC.Element>this.signals[attribute.elementRef];
    var widget = this.widgets[element.widgetRef];
    var selectingCode = '$(window.shadowRoots["' + widget.uid + '"].querySelector("' + element.selector + '"))';

    var attributeCode = this.rAttributeTemplate({
      streamName: streamName,
      seletingCode: selectingCode,
      attributeName: attribute.name,
      isOnCollection: widget.isCollection(),
    });

    this.addJavascriptCode(attributeCode);

    return streamName;
  }

  processWAttribute(attribute: VRAC.WAttribute): string {
    var streamName = 'wAttribute_' + attribute.name + '_' + attribute.uid;
    var element = <VRAC.Element>this.signals[attribute.elementRef];
    var widget = this.widgets[element.widgetRef];
    var selectingCode = '$(window.shadowRoots["' + widget.uid + '"].querySelectorAll("' + element.selector + '"))';
    var sourceSignal = this.signals[attribute.signalRef];
    var signalStreamName = this.processSignal(sourceSignal);

    var attributeCode = this.wAttributeTemplate({
      widgetUID: widget.uid,
      seletingCode: selectingCode,
      signalStreamName: signalStreamName,
      attributeName: attribute.name,
      isOnCollection: widget.isCollection(),
    });

    this.addJavascriptCode(attributeCode);

    return streamName;
  }

  processDataSource(dataSource: VRAC.DataSource): string {
    var streamName = 'dataSource_' + dataSource.uid;
    var initialValue = dataSource.initialValue;
    var mutatorStreamNames = dataSource.mutatorRefs.map((m) => {
      return this.processSignal(this.signals[m]);
    });
    var dataSourceCode = this.dataSourceTemplate({
      streamName: streamName,
      mutatorStreamNames: mutatorStreamNames,
      initialValue: initialValue,
    });

    this.addJavascriptCode(dataSourceCode);

    return streamName;
  }

  processConstant(constant: VRAC.Constant): string {
    var streamName = 'constant_' + constant.uid;
    var valueType = constant.valueType;
    var value = constant.value;
    var constantSource = 'var {{{streamName}}} = Bacon.constant({{{value}}});';
    var constantTemplate = Handlebars.compile(constantSource);
    var constantCode = constantTemplate({
      streamName: streamName,
      value: valueType == 'string' ? '"' + value + '"' : value,
    });

    this.addJavascriptCode(constantCode);

    return streamName;
  }

  addJavascriptCode(code: string) {
    this.javascript += '\n' + code + '\n';
  }
}

export = Renderer;
