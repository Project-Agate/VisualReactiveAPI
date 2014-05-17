/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/wrench.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/mkdirp.d.ts" />
/// <reference path="./interfaces/Program.ts" />

import fs = require('fs');
import path = require('path');
import wrench = require('wrench');
import Handlebars = require('handlebars');
import mkdirp = require('mkdirp');

class ProjectBuilder {
  build(buildPath, program, app) {
    mkdirp.sync(buildPath);
    for(var uid in program.widgets) {
      var widget = program.widgets[uid];
      var htmlPath = path.normalize(widget.htmlPath);
      var htmlDir = path.dirname(htmlPath);
      var filenames = fs.readdirSync(htmlDir);

      wrench.copyDirSyncRecursive(htmlDir, buildPath, {
        forceDelete: true,
        exclude: function(filename, dir) {
          return path.join(dir, filename) === htmlPath;
        },
      });
    };

    wrench.copyDirSyncRecursive('templates/lib', path.join(buildPath, 'lib'), {
      forceDelete: true,
    });

    var template = Handlebars.compile(fs.readFileSync('templates/app_template.handlebars').toString());
    var appHtml = template(app)

    var htmlPath = path.join(buildPath, 'app.html');
    fs.writeFileSync(htmlPath, appHtml);

    return htmlPath;
  }
}

export = ProjectBuilder;
