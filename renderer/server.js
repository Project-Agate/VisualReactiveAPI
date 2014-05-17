/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/express.d.ts" />
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser());

app.get('/', function (req, res) {
    res.send('hello world');
});

app.listen(3000);
