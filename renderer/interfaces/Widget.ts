import fs = require('fs');
import Handlebars = require('handlebars');

import VRAC = require('VRAC');

class Widget {
  uid: string;
  htmlPath: string;
  renderToRef: string;
  childWidgets: Widget[] = [];
  renderingHtml: string = "";
  renderingJavascript: string = "";

  private shadowDOMSource: string = fs.readFileSync('templates/ShadowDOMTemplate.handlebars').toString();
  private shadowDOMTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.shadowDOMSource);

  constructor(data: Object) {
    this.uid = data['uid'];
    this.htmlPath = data['htmlPath'];
    this.renderToRef = data['renderToRef'];
    this.renderingHtml = fs.readFileSync(this.htmlPath).toString();
  }

  isRoot() {
    return this.renderToRef === 'document';
  }

  renderTree(rootJavascript: String, appFiles: VRAC.App): string {
    for(var selector in this.childWidgets) {
      var childWidget = this.childWidgets[selector];
      var childFilePath = childWidget.renderTree(rootJavascript, appFiles);
      var importCode = '<link rel="import" href="' + childFilePath + '"/>\n';
      var shadowDOMCode = this.shadowDOMTemplate({
        selector: selector,
        childFilePath: childFilePath,
      });
      this.renderingHtml = importCode + this.renderingHtml;
      this.renderingJavascript += shadowDOMCode;
    }

    var filePath: string;
    var content: string;
    if(this.isRoot()) {
      filePath = "app.html";
      content = this.renderingHtml + "\n<script>\n" + rootJavascript + "\n" + this.renderingJavascript + "\n</script>";
    }
    else {
      filePath = "/imports/" + this.uid + ".html";
      content = this.renderingHtml + "\n<script>\n" + this.renderingJavascript + "\n</script>";
    }
    appFiles[filePath] = content;
    return filePath;
  }
}

export = Widget;
