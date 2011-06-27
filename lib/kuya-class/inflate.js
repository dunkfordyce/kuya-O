var _ = require('underscore'),
    spawn = require('./spawn').spawn;

exports.deflate = function deflate(obj, ctx) { 
    if( _.isString(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isNull(obj) || _.isUndefined(obj) ) { 
        return obj;
    } else if( _.isFunction(obj) ) { 
        return undefined;
    } else if( _.isArray(obj) ) { 
        return map(obj, function(o) { return exports.deflate(o, ctx); });
    } 
    ctx = ctx || {};
    if( !ctx.stack ) { ctx.stack = [obj]; }
    else { ctx.stack.push(obj); }

    var ret = {}, 
        k, v, 
        opts = obj.$deflate,
        attrs = opts && opts.attrs;
    if( opts ) { 
        if( opts.deflater ) { 
            return opts.deflater(obj);
        } 
        if( opts.id ) { 
            ret.$inflate = opts.id;
        }
    }
    for( k in obj ) { 
        if( !obj.hasOwnProperty(k) || k[0] == '$' || attrs && attrs[k] === false ) {
            continue;
        }
        ret[k] = deflate(obj[k], ctx);
    }
    ctx.stack.pop();
    return ret;
};

exports.inflate = function inflate(obj, ctx, registry) { 
    registry = registry || exports.default;
    if( _.isString(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isNull(obj) || _.isUndefined(obj) ) { 
        return obj;
    } else if( _.isArray(obj) ) { 
        return map(obj, function(o) { return exports.inflate(o, ctx); });
    }
    ctx = ctx || {};
    if( !ctx.stack ) { ctx.stack = [obj]; }
    else { ctx.stack.push(obj); }

    var type = registry.get(obj);
    delete obj['$inflate'];
    var ret = type ? spawn(type, obj) : obj;

    if( type && type.$deflate.inflater ) { 
        return type.$deflate.inflater(ctx);
    } else {
        _.each(_.keys(obj), function(k) { 
            ret[k] = exports.inflate(ret[k], ctx);
        });
    }
    return ret;
};

exports.Registry = function Registry() { 
    var _registry = {},
        registry = {
            add: function(obj) { 
                registry[obj.$deflate.id] = obj;
            },
            get: function(obj) { 
                return registry[obj.$inflate];
            },
            inflate: function(obj, ctx, registry) { 
                return exports.inflate(obj, ctx, registry);
            },
            deflate: exports.deflate
        };
    return registry;
}

exports.default = exports.Registry();


/*
var Type1 = {
    $deflate: { 
        id: 'type1'
    },
    a: 1,
    b: 2,
    foo: function() { console.error('foo', this.a); },
    bar: function() { console.error('bar', this.b); }
};

var t1 = spawn(Type1);

var Type2 = spawn(Type1, { 
    $deflate: {
        id: 'type2',
        attrs: { 
            c: false
        }
    },
    a: 3,
    b: 4,
    c: 5
});

var t2a = spawn(Type2);
t2a.a = 5;
var t2b = spawn(Type2);
t2b.a = 7;
t2b.b = 8;
t2b.c = 9;
*/



/*
console.error('--------------------------------------');
console.error('t1');
console.error(deflate(t1));
console.error('t2a');
console.error(deflate(t2a));
console.error('t2b');
console.error(deflate(t2b));
*/

