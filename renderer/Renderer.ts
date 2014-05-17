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

  constructor() {
    Handlebars.registerHelper('parameterList', function(object: VRAC.Parameter[]) {
      return new Handlebars.SafeString(
        object.map(function(p){return p.name;}).join(', ')
      );
    });
  }

  renderApp(program: VRAC.Program): VRAC.App {
    this.widgets = program.widgets;
    this.signals = program.signals;

    for(var uid in this.widgets) {
      var widget = this.widgets[uid];
      this.html += fs.readFileSync(widget.htmlPath);
    }

    for(var uid in this.signals) {
      this.processSignal(this.signals[uid]);
    }

    return {
      html: this.html,
      javascript: "alert('hello world!')",
    }
  }

  processSignal(signal: VRAC.Signal) {
    if(signal.streamName) return;

    switch(signal.type) {
      case 'action':
        signal.streamName = this.processAction(<VRAC.Action>signal);
        break;
      case 'element':
        signal.streamName = this.processElement(<VRAC.Element>signal);
        break;
      case 'event':
        signal.streamName = this.processEvent(<VRAC.Event>signal);
        break;
      case 'attribute':
        signal.streamName = this.processAttribute(<VRAC.Attribute>signal);
        break;
      case 'constant':
        signal.streamName = this.processConstant(<VRAC.Constant>signal);
        break;
    }
  }

  processAction(action: VRAC.Action): string {
    var functionSource = 'function({{{parameterList parameters}}}) {\n  {{body}}\n}';
    var functionTemplate = Handlebars.compile(functionSource);
    var functionString = functionTemplate(action);

    console.log(functionString)
    return "1";
  }

  processElement(element: VRAC.Element): string {
    return "2";
  }

  processEvent(event: VRAC.Event): string {
    return "3";
  }

  processAttribute(attribute: VRAC.Attribute): string {
    return "4";
  }

  processConstant(constant: VRAC.Constant): string {
    return "5";
  }
}

export = Renderer;
