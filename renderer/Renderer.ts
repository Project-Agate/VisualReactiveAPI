/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/templates.d.ts" />
/// <reference path="./interfaces/Program.ts" />

class Renderer {
  renderApp(program: VRAC.Program) {
    return "alert('hello, world!')";
  }
}

export = Renderer;
