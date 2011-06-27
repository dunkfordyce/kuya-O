var vows = require('vows'),
    assert = require('assert'),
    spawn = require('../lib/kuya-class/spawn.js').spawn;

vows.describe('spawn')
    .addBatch({
        'simple': { 
            'does spawn': function() { 
                var x = {a:1},
                    b = spawn(x, {b:2});
                assert.ok(b.a);
                assert.ok(b.b);
                assert.ok(b.hasOwnProperty('b'));
                assert.ok(!b.hasOwnProperty('a'));
                
            }
        }
    })
    .export(module)
;

