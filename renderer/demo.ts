/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/wrench.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./interfaces/Program.ts" />

import Renderer = require('./Renderer');
import ProjectBuilder = require('./ProjectBuilder');
import fs = require('fs');
import path = require('path');

var renderer: Renderer = new Renderer();
var projectBuilder: ProjectBuilder = new ProjectBuilder();
var exampleName: string = process.argv[2]

var buildPath: string = path.normalize('demo_build')

var program: VRAC.Program = JSON.parse(fs.readFileSync('examples/' + exampleName + '/program.json').toString());
var app = renderer.renderApp(program);

projectBuilder.build(buildPath, program, app);
