/// <reference path="./definitions/node.d.ts" />
/// <reference path="./interfaces/Program.ts" />
var Renderer = require('./Renderer');
var fs = require('fs');

var renderer = new Renderer();
var exampleName = process.argv[2];

var program = JSON.parse(fs.readFileSync('examples/' + exampleName + '/program.json').toString());
console.log(renderer.renderApp(program));
