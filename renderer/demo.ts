/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/wrench.d.ts" />
/// <reference path="./definitions/handlebars.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />

import fs = require('fs');
import path = require('path');

import VRAC = require('./interfaces/VRAC');
import Renderer = require('./Renderer');
import ProjectBuilder = require('./ProjectBuilder');

var renderer: Renderer = new Renderer();
var projectBuilder: ProjectBuilder = new ProjectBuilder();
var exampleName: string = process.argv[2]

var buildPath: string = path.normalize('demo_build')

var rawProgram: Object = JSON.parse(fs.readFileSync('examples/' + exampleName + '/program.json').toString());

var appFiles = renderer.render(rawProgram);
projectBuilder.build(buildPath, rawProgram, appFiles);
