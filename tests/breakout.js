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
                    console.log(env.renderString('{{name.__proto__.toString()}}', {
                        name: 'bar',
                    }));
                }
            ).to.throwError(/Unable to call `name\["__proto__"\]\["toString"\]`, which is undefined or falsey/);

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

            expect(
                function() {
                    console.log(env.renderString('{{require(\'os\').platform()}}', {
                        name: 'bar',
                        require: module.require,
                    }));
                }
            ).to.throwError(/Unable to call `require`, which is an invalid function/);

            expect(
                function() {
                    console.log(env.renderString('{{foo(\'os\').platform()}}', {
                        name: 'bar',
                        foo: module.require,
                    }));
                }
            ).to.throwError(/Unable to call `foo`, which is an invalid function/);

            expect(
                function() {
                    console.log(env.renderString('{{m.require(\'os\').platform()}}', {
                        name: 'bar',
                        m: module,
                    }));
                }
            ).to.throwError(/Unable to call `m\["require"\]`, which is undefined or falsey/);

            expect(
                function() {
                    console.log(env.renderString('{{m.f.b.require(\'os\').platform()}}', {
                        name: 'bar',
                        m: {
                          f: {
                            b: module
                          },
                        },
                    }));
                }
            ).to.throwError(/Unable to call `m\["f"\]\["b"\]\["require"\]`, which is undefined or falsey/);

            expect(
                function() {
                    console.log(env.renderString('{{m.f.b.require(\'os\').platform()}}', {
                        name: 'bar',
                        m: {
                          f: {
                            b: {
                              require: process.mainModule.require,
                            },
                          },
                        },
                    }));
                }
            ).to.throwError(/Unable to call `m\["f"\]\["b"\]\["require"\]`, which is undefined or falsey/);

            // hard to forbidden this one
            expect(env.renderString('{{foo(\'os\').platform()}}', {
                name: 'bar',
                foo: function(f) {
                  return module.require(f);
                },
            })).to.equal(os.platform());
        });
    });
})();
