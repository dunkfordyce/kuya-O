var _ = require('underscore');

function spawn(parent, props) {
    var defs = {}, key;
    for (key in props) {
        if (props.hasOwnProperty(key)) {
            defs[key] = {value: props[key], enumerable: true};
        }
    }
    return Object.create(parent, defs);
};

function protowalk(obj, cb) { 
    var r;
    while( obj = Object.getPrototypeOf(obj) ) { 
        r = cb(obj);
        if( r !== undefined ) { return r; }
    }
}

function instanceOf(obj, parent) { 
    if( obj === parent ) return true;
    if( protowalk(obj, function(proto) { 
        if( proto == parent ) { return proto; }
    }) ) { 
        return true;
    }
    return false;
};


function sp(n) { 
    var ret = '';
    for( x=0; x!= n; x++ ) { ret += ' '; }
    return ret;
};


function deflate(obj, ctx) { 
    if( _.isString(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isNull(obj) || _.isUndefined(obj) ) { 
        return obj;
    } else if( _.isFunction(obj) ) { 
        return undefined;
    } else if( _.isArray(obj) ) { 
        return map(obj, function(o) { return deflate(o, ctx); });
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

function inflate(obj, ctx, registry) { 
    var spa = sp(((ctx && ctx.stack) ? ctx.stack.length : 0)*4);
    registry = registry || exports.default;
    if( _.isString(obj) || _.isBoolean(obj) || _.isNumber(obj) || _.isNull(obj) || _.isUndefined(obj) ) { 
        return obj;
    } else if( _.isArray(obj) ) { 
        return map(obj, function(o) { return inflate(o, ctx); });
    }
    ctx = ctx || {};
    if( !ctx.stack ) { ctx.stack = [obj]; }
    else { ctx.stack.push(obj); }

    var type = registry.get(obj);
    if( type ) { 
        delete obj['$inflate'];
    }
    if( type && type.$deflate.inflater ) { 
        return type.$deflate.inflater(ctx);
    } else {
        _.each(_.keys(obj), function(k) { 
            obj[k] = inflate(obj[k], ctx);
        });
    }
    var ret = (type ? spawn(type, obj) : obj);

    return ret;
};

function Registry() { 
    var _registry = {},
        registry = {
            add: function(obj) { 
                registry[obj.$deflate.id] = obj;
            },
            get: function(obj) { 
                return registry[obj.$inflate];
            },
            inflate: function(obj, ctx, registry) { 
                return inflate(obj, ctx, registry);
            },
            deflate: deflate
        };
    return registry;
}

exports.spawn = spawn;
exports.protowalk = protowalk;
exports.instanceOf = instanceOf;
exports.inflate = inflate;
exports.deflate = deflate;
exports.Registry = Registry;
exports.default = Registry();
