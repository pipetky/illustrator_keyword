Array.prototype.includes = function ( item ) {

    var index = 0, length = this.length;

    for ( ; index < length; index++ ) {

              if ( this[index] === item )

                        return true;
    }
    return false;
    };
