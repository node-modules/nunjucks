(function() {
    'use strict';

    var expect, util, Environment, Loader, templatesPath;
    var path = require('path');
    var os = require('os');

    if(typeof require !== 'undefined') {
        expect = require('expect.js');
        util = require('./util');
        Environment = require('../src/environment').Environment;
        Loader = require('../src/node-loaders').FileSystemLoader;
        templatesPath = 'tests/templates';
    }
    else {
        expect = window.expect;
        Environment = nunjucks.Environment;
        Loader = nunjucks.WebLoader;
        templatesPath = '../templates';
    }

    describe('breakout', function() {
        it('should not breakout on constructor()', function() {
            var env = new Environment();

            expect(
                function() {
                    env.renderString('{{name.prototype.toString.constructor("return global.process.version")()}}', {
                        name: 'bar',
                    });
                }
            ).to.throwError(/Unable to call `name\["prototype"\]\["toString"\]\["constructor"\]`, which is undefined or falsey/);

            expect(
                function() {
                    env.renderString('{{name.prototype.toString[name]("return global.process.version")()}}', {
                        name: 'constructor',
                    });
                }
            ).to.throwError(/Unable to call `name\["prototype"\]\["toString"\]\["name"\]`, which is undefined or falsey/);

            expect(
                function() {
                    env.renderString('{{global.process.mainModule.require(\'os\').platform()}}', {
                        name: 'constructor',
                    });
                }
            ).to.throwError(/Unable to call `global\["process"\]\["mainModule"\]\["require"\]`, which is undefined or falsey/);

            expect(
                function() {
                    env.renderString('{% set username = joiner.constructor("return global.process.version")() %} {{username}}', {
                        name: 'bar',
                    });
                }
            ).to.throwError(/Unable to call `joiner\["constructor"\]`, which is undefined or falsey/);
        });
    });
})();
