

var $     = require('jquery');
var World = require('./world/world');
var Box   = require('./entity/box');


var world = new World('raytracer');

var box = new Box('plot', [2,2,2]);

world.addEntity(box);


world.go();

