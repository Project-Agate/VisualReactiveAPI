/// <reference path="./definitions/node.d.ts" />
/// <reference path="./interfaces/Program.ts" />

import Renderer = require('./Renderer');
import fs = require('fs');

var renderer: Renderer = new Renderer();
var exampleName: string = process.argv[2]

var program: VRAC.Program = JSON.parse(fs.readFileSync('examples/' + exampleName + '/program.json').toString());
console.log(renderer.renderApp(program));