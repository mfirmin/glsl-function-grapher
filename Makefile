
SOURCEDIR = src
SOURCES = $(shell find $(SOURCEDIR) -name '*.js')

all: static/functiongrapher.js Makefile

clean: 
	rm static/functiongrapher.js

build: static/functiongrapher.js
	@make static/functiongrapher.js

static/functiongrapher.js:  $(SOURCES)
	rollup --globals jquery:jQuery -i src/index.js -o static/functiongrapher.js -f iife --name FunctionGrapher

dragNumber: src/dragNumber.js Makefile
	rollup --globals jquery:jQuery -i src/dragNumber.js -o static/dragNumber.js -f iife --name dragNumber

watch: build
	watchman-make -p 'src/**/*.js' -t build
