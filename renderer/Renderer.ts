/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/templates.d.ts" />
/// <reference path="./interfaces/Program.ts" />

class Renderer {
  renderApp(program: VRAC.Program): VRAC.App {
    return {
      html: "",
      javascript: "alert('hello world!')",
    }
  }
}

export = Renderer;
