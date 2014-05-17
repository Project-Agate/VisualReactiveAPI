/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/express.d.ts" />

import Renderer = require('./Renderer');
import ProjectBuilder = require('./ProjectBuilder');
import express = require('express');
var bodyParser = require('body-parser')
import path = require('path');

var app = express();
var renderer: Renderer = new Renderer();
var projectBuilder: ProjectBuilder = new ProjectBuilder();

app.use(bodyParser())
app.use('/build', express.static(__dirname + '/build'));

app.get('/', function(req, res){
  res.send('hello world');
});

app.post('/compile', function(req, res) {
  var program = req.body;
  var app = renderer.render(program);
  var buildId = Date.now().toString();
  var buildPath = path.join('build', buildId);

  var htmlPath = projectBuilder.build(buildPath, program, app);

  res.send('/' + htmlPath);
});

app.listen(3000);