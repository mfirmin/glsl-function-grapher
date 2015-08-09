

all: templates/static/bundle.js Makefile

clean: 
	rm templates/static/bundle.js

templates/static/bundle.js: src/main.js src/world/world.js src/entity/entity.js src/entity/box.js src/entity/capsule.js src/entity/cylinder.js src/entity/sphere.js
	browserify src/main.js -o templates/static/bundle.js
	cp templates/static/bundle.js ~/website/mfirmin.github.io/projects/static/functiongrapher.js
