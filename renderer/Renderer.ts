/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/templates.d.ts" />
/// <reference path="./interfaces/Program.ts" />

var fs = require('fs');

class Renderer {
  widgets: VRAC.Widgets;
  signals: VRAC.Signals;

  renderApp(program: VRAC.Program): VRAC.App {
    this.widgets = program.widgets;
    this.signals = program.signals;

    var html = "";
    for(var uid in this.widgets) {
      var widget = this.widgets[uid];
      html += fs.readFileSync(widget.htmlPath);
    }

    return {
      html: html,
      javascript: "alert('hello world!')",
    }
  }
}

export = Renderer;
