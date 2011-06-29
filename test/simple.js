var vows = require('vows'),
    assert = require('assert'),
    O = require('../kuya-O');

var Type1 = { 
        $deflate: {id: 'Type1'},
        a: 1
    },
    Type2 = O.spawn(Type1, {
        $deflate: {id: 'Type2'},
        b: 2
    });

O.default.add(Type1);
O.default.add(Type2);

vows.describe('inflate')
    .addBatch({
        'simple': { 
            'does spawn': function() { 
                var x = {a:1},
                    b = O.spawn(x, {b:2});
                assert.ok(b.a);
                assert.ok(b.b);
                assert.ok(b.hasOwnProperty('b'));
                assert.ok(!b.hasOwnProperty('a'));
                b.b = 3;
                assert.equal(b.b, 3);              
            },
            'deflate std': function() { 
                assert.ok(O.default.deflate(1));
                assert.ok(O.default.deflate(true));
                assert.ok(O.default.deflate('a'));
            },
            'inflate std': function() { 
                assert.equal(O.default.inflate(1), 1);
                assert.equal(O.default.inflate(true), true);
                assert.equal(O.default.inflate('a'), 'a');
            },
            'deflatable': function() { 
                assert.deepEqual(O.default.deflate(Type1), { '$inflate': 'Type1', a: 1 });
            },
            'inflateable': function() { 
                assert.ok( O.instanceOf(O.default.inflate(O.default.deflate(Type1)), Type1) );
            },
            'rehydrate sub obj': function() { 
                var t = O.spawn(Type1, {
                        foo: O.spawn(Type1, {c:1}),
                        bar: O.spawn(Type2, {c:1})
                    }),
                    d = O.default.deflate(t),
                    i = O.default.inflate(t);

                assert.ok( O.instanceOf(i.foo, Type1) );
                assert.ok( O.instanceOf(i.bar, Type2) );
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
                assert.deepEqual(O.default.deflate(Type3), {boo: 1});
            }
        }
    })
    .export(module)
;
