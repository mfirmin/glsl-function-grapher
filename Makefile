
SOURCEDIR = src
SOURCES = $(shell find $(SOURCEDIR) -name '*.js')

all: static/functiongrapher.js Makefile

clean: 
	rm static/functiongrapher.js

build: static/functiongrapher.js
	@make static/functiongrapher.js

static/functiongrapher.js:  $(SOURCES)
	rollup --globals jquery:jQuery -i src/main.js -o static/functiongrapher.js -f iife --name FunctionGrapher 

watch: build
	watchman-make -p 'src/**/*.js' -t build
