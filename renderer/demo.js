/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/wrench.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./interfaces/Program.ts" />
var Renderer = require('./Renderer');
var fs = require('fs');
var path = require('path');
var wrench = require('wrench');
var Handlebars = require('handlebars');

var renderer = new Renderer();
var exampleName = process.argv[2];

var program = JSON.parse(fs.readFileSync('examples/' + exampleName + '/program.json').toString());
var buildPath = path.normalize('demo_build');

for (var uid in program.widgets) {
    var widget = program.widgets[uid];
    var htmlPath = path.normalize(widget.htmlPath);
    var htmlDir = path.dirname(htmlPath);
    var filenames = fs.readdirSync(htmlDir);

    wrench.copyDirSyncRecursive(htmlDir, buildPath, {
        forceDelete: true,
        exclude: function (filename, dir) {
            return path.join(dir, filename) === htmlPath;
        }
    });
}
;

wrench.copyDirSyncRecursive('templates/lib', path.join(buildPath, 'lib'), {
    forceDelete: true
});

var app = renderer.renderApp(program);
var template = Handlebars.compile(fs.readFileSync('templates/app_template.handlebars').toString());
var appHtml = template(app);

fs.writeFileSync(path.join(buildPath, 'app.html'), appHtml);
