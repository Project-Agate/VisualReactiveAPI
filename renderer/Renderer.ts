/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/templates.d.ts" />
/// <reference path="./interfaces/Program.ts" />

import fs = require('fs');
import Handlebars = require('handlebars');

class Renderer {
  widgets: VRAC.Widgets;
  signals: VRAC.Signals;
  javascript: string = '';
  html: string = '';
  rAttributeSource: string = fs.readFileSync('templates/RAttributeTemplate.handlebars').toString();
  wAttributeSource: string = fs.readFileSync('templates/WAttributeTemplate.handlebars').toString();
  rAttributeTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.rAttributeSource);
  wAttributeTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.wAttributeSource);

  constructor() {
    Handlebars.registerHelper('commaList', function(object: any[]) {
      return new Handlebars.SafeString(
        object.join(', ')
      );
    });
  }

  renderApp(program: VRAC.Program): VRAC.App {
    this.widgets = program.widgets;
    this.signals = program.signals;

    for(var uid in this.widgets) {
      var widget = this.widgets[uid];
      this.html += '<div id="' + uid + '">' + fs.readFileSync(widget.htmlPath) + '</div>';
    }

    for(var uid in this.signals) {
      this.processSignal(this.signals[uid]);
    }

    console.log(this.javascript);

    return {
      html: this.html,
      javascript: "alert('hello world!')",
    }
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
      case 'constant':
        return signal.streamName = this.processConstant(<VRAC.Constant>signal);
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
    throw 'Event is not supported yet!';
  }

  processRAttribute(attribute: VRAC.RAttribute): string {
    // We need a better way to read general attributes, don't try do DRY W/RAttributes for now
    if(attribute.name === 'value') { 
      var streamName = 'attribute_' + attribute.name + '_' + attribute.uid;
      var element = <VRAC.Element>this.signals[attribute.uid];
      var widgetId = element.widgetRef;
      var selectingCode = '$("#' + widgetId + ' ' + element.selector + '")';

      var attributeCode = this.rAttributeTemplate({
        streamName: streamName,
        seletingCode: selectingCode,
      });

      this.addJavascriptCode(attributeCode);

      return streamName;
    }
    else {
      throw 'attribute "' + attribute.name + '" is not supported for RAttribute.';
    }
  }

  processWAttribute(attribute: VRAC.WAttribute): string {
    // We need a better way to write general attributes, don't try do DRY W/RAttributes for now
    if(attribute.name === 'value') { 
      var streamName = 'attribute_' + attribute.name + '_' + attribute.uid;
      var element = <VRAC.Element>this.signals[attribute.uid];
      var widgetId = element.widgetRef;
      var selectingCode = '$("#' + widgetId + ' ' + element.selector + '")';
      var sourceSignal = this.signals[attribute.signalRef];
      var signalStreamName = this.processSignal(sourceSignal);

      var attributeCode = this.wAttributeTemplate({
        streamName: streamName,
        seletingCode: selectingCode,
        signalStreamName: signalStreamName,
      });

      this.addJavascriptCode(attributeCode);

      return streamName;
    }
    else {
      throw 'attribute "' + attribute.name + '" is not supported for WAttribute.';
    }
  }

  processConstant(constant: VRAC.Constant): string {
    return "5";
  }

  addJavascriptCode(code: string) {
    this.javascript += '\n' + code + '\n';
  }
}

export = Renderer;
