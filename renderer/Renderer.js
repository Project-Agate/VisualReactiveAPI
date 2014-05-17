/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/templates.d.ts" />
/// <reference path="./interfaces/Program.ts" />
var Renderer = (function () {
    function Renderer() {
    }
    Renderer.prototype.renderApp = function (program) {
        return "alert('hello, world!')";
    };
    return Renderer;
})();

module.exports = Renderer;
