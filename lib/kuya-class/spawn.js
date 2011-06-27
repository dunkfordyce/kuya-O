exports.spawn = function (parent, props) {
    var defs = {}, key;
    for (key in props) {
        if (props.hasOwnProperty(key)) {
            defs[key] = {value: props[key], enumerable: true};
        }
    }
    return Object.create(parent, defs);
};

exports.instanceOf = function(obj, parent) { 
    do {
        if( obj === parent ) return true;
    } while( (obj = Object.getPrototypeOf(obj)) )
    return false;
};
