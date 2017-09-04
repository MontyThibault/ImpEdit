REPORTER = spec

build: FORCE
	npm run browserify

FORCE:

all: jshint test build

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter $(REPORTER) --timeout 3000

jshint:
	jshint src

tap:
	@NODE_ENV=test ./node_modules/.bin/mocha -R tap > results.tap

unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive -R xunit > results.xml --timeout 3000