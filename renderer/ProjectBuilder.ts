/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/wrench.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/mkdirp.d.ts" />

import fs = require('fs');
import path = require('path');
import wrench = require('wrench');
import Handlebars = require('handlebars');
import mkdirp = require('mkdirp');

class ProjectBuilder {
  build(buildPath, program, appFiles) {
    this.deleteFolderRecursive(buildPath);
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

    mkdirp.sync(path.join(buildPath, 'imports'));

    var appPath;
    for(var p in appFiles) {
      var htmlPath = path.join(buildPath, p);
      if(p === 'app.html') {
        fs.writeFileSync(htmlPath, '<base href="/' + buildPath + '/"/>\n' + appFiles[p]);
        appPath = htmlPath;
      }
      else {
        fs.writeFileSync(htmlPath, appFiles[p]);
      }
    }

    return appPath;
  }

  deleteFolderRecursive(path) {
    var files = [];
    if(fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach((file,index) => {
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          this.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
}

export = ProjectBuilder;
