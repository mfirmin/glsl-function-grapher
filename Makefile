

all: static/functiongrapher.js Makefile

clean: 
	rm static/functiongrapher.js

static/functiongrapher.js: src/main.js src/world/world.js src/entity/entity.js src/entity/box.js src/entity/capsule.js src/entity/cylinder.js src/entity/sphere.js
	browserify src/main.js -o static/functiongrapher.js
