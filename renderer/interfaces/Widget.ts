import fs = require('fs');
import assert = require('assert');
import Handlebars = require('handlebars');

import VRAC = require('VRAC');

class Widget {
  uid: string;
  htmlPath: string;
  renderToRef: string;
  childWidgets: Widget[] = [];
  renderingHtml: string = "";
  renderingJavascript: string = "";

  private _isCollection: boolean;

  private shadowDOMSource: string = fs.readFileSync('templates/ShadowDOMTemplate.handlebars').toString();
  private shadowDOMTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.shadowDOMSource);
  private nonRootWidgetSource: string = fs.readFileSync('templates/NonRootWidgetTemplate.handlebars').toString();
  private nonRootWidgetTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.nonRootWidgetSource);
  private rootWidgetSource: string = fs.readFileSync('templates/RootWidgetTemplate.handlebars').toString();
  private rootWidgetTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.rootWidgetSource);
  private collectionWidgetSource: string = fs.readFileSync('templates/CollectionWidgetTemplate.handlebars').toString();
  private collectionWidgetTemplate: HandlebarsTemplateDelegate = Handlebars.compile(this.collectionWidgetSource);

  constructor(data: Object) {
    this.uid = data['uid'];
    this.htmlPath = data['htmlPath'];
    this.renderToRef = data['renderToRef'];
    this._isCollection = data['isCollection'];
    this.renderingHtml = fs.readFileSync(this.htmlPath).toString();
  }

  isRoot() {
    return this.renderToRef === 'document';
  }

  isCollection() {
    return this._isCollection;
  }

  renderTree(rootJavascript: String, appFiles: VRAC.App): string {
    var importsCode = "";
    var shadowDOMsCode = "";

    for(var selector in this.childWidgets) {
      var childWidget = this.childWidgets[selector];
      var childFilePath = childWidget.renderTree(rootJavascript, appFiles);
      var importCode = '<link rel="import" href="' + childFilePath + '"/>\n';
      var shadowDOMCode = this.shadowDOMTemplate({
        childUID: childWidget.uid,
        selector: selector,
        childFilePath: childFilePath,
      });
      importsCode += importCode;
      shadowDOMsCode += shadowDOMCode;
    }

    var filePath: string;
    var content: string;
    if(this.isRoot()) {
      assert(!this.isCollection(), "The root widget can't be a collection!");

      filePath = "app.html";
      this.renderingHtml = importsCode + this.renderingHtml;
      this.renderingJavascript += this.rootWidgetTemplate({
        uid: this.uid,
        shadowDOMsCode: shadowDOMsCode,
      }); 
      content = this.renderingHtml + "\n<script>\n" + rootJavascript + "\n" + this.renderingJavascript + "\n</script>";
    }
    else {
      filePath = "/imports/" + this.uid + ".html";
      this.renderingJavascript += this.nonRootWidgetTemplate({
        uid: this.uid,
        shadowDOMsCode: shadowDOMsCode,
      }); 
      this.renderingHtml = importsCode + "<template>\n" + this.renderingHtml + "\n</template>\n";
      if(this.isCollection()) {
        this.renderingJavascript += this.collectionWidgetTemplate({
          uid: this.uid,
        });
      }
      content = this.renderingHtml + "\n<script>\n" + this.renderingJavascript + "\n</script>";
    }
    appFiles[filePath] = content;
    return filePath;
  }
}

export = Widget;
