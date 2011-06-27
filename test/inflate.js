var vows = require('vows'),
    assert = require('assert'),
    spawn = require('../lib/kuya-class/spawn').spawn,
    instanceOf = require('../lib/kuya-class/spawn').instanceOf,
    inflate = require('../lib/kuya-class/inflate').default;

var Type1 = { 
        $deflate: {id: 'Type1'},
        a: 1
    },
    Type2 = spawn(Type1, {
        $deflate: {id: 'Type2'},
        b: 2
    });

inflate.add(Type1);
inflate.add(Type2);

vows.describe('inflate')
    .addBatch({
         'simple': { 
            'deflate std': function() { 
                assert.ok(inflate.deflate(1));
                assert.ok(inflate.deflate(true));
                assert.ok(inflate.deflate('a'));
            },
            'inflate std': function() { 
                assert.equal(inflate.inflate(1), 1);
                assert.equal(inflate.inflate(true), true);
                assert.equal(inflate.inflate('a'), 'a');
            },
            'deflatable': function() { 
                assert.deepEqual(inflate.deflate(Type1), { '$inflate': 'Type1', a: 1 });
            },
            'inflateable': function() { 
                assert.ok( instanceOf(inflate.inflate(inflate.deflate(Type1)), Type1) );
            },
            'rehydrate sub obj': function() { 
                var t = spawn(Type1, {
                    foo: spawn(Type2, {c:1})
                });
                assert.ok( instanceOf(inflate.inflate(inflate.deflate(t.foo)), Type2) );
            },
            'custom deflate': function() { 
                var Type3 = {
                    $deflate: {
                        deflater: function(ctx) { 
                            return {boo: 1};
                        }
                    },
                    c: 4,
                };
                assert.deepEqual(inflate.deflate(Type3), {boo: 1});
            }
        }
    })
    .export(module)
;
