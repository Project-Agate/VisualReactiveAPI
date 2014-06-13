/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/express.d.ts" />

import Renderer = require('./Renderer');
import ProjectBuilder = require('./ProjectBuilder');
import express = require('express');
var bodyParser = require('body-parser')
import path = require('path');

var app = express();

app.use(bodyParser())
app.use('/build', express.static(__dirname + '/build'));

app.get('/', function(req, res){
  res.send('hello world');
});

app.post('/compile', function(req, res) {
  var renderer = new Renderer();
  var projectBuilder = new ProjectBuilder();
  var rawProgram = req.body;
  var appFiles = renderer.render(rawProgram);
  var buildId = Date.now().toString();
  var buildPath = path.join('build', buildId);

  var htmlPath = projectBuilder.build(buildPath, rawProgram, appFiles);

  res.send('/' + htmlPath);
});

app.listen(process.argv[2] || 3000);