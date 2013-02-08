var Express = require( 'express' ),
    express = Express( ),

    Http = require( 'http' ),
    http = Http.createServer( express ),

    SocketIo = require( 'socket.io' ),
    socketio = SocketIo.listen( http );

express.use( Express[ 'static' ]( __dirname ) );
http.listen( 80 );

var width = 20,
    height = 20,
    minep = 10 / 100;

var FLAG_P1   = - 1;
var FLAG_P2   = - 2;
var MINE      = - 3;
var EXPLOSION = - 4;

var createBoard = function ( width, height, minep ) {

    var mines = [ ];

    var cellCount = width * height;
    var mineCount = Math.floor( cellCount * minep );
    var max = Math.min( cellCount, mineCount );

    while ( mines.length < max ) {
        var rnd = Math.floor( Math.random( ) * cellCount );
        if ( mines.indexOf( rnd ) === - 1 ) {
            mines.push( rnd );
        }
    }

    var cells = Object.create( null );
    mines.forEach( function ( index ) {
        var y = Math.floor( index / width ), x = index % width;
        cells[[ x, y ]] = MINE;
    } );

    for ( var y = 0; y < height; ++ y ) {
        for ( var x = 0; x < width; ++ x ) {
            if ( cells[[ x, y ]] !== MINE ) {
                cells[[ x, y ]] = 0
                    + ( cells[[ x - 1, y ]] === MINE )
                    + ( cells[[ x + 1, y ]] === MINE )
                    + ( cells[[ x, y - 1 ]] === MINE )
                    + ( cells[[ x, y + 1 ]] === MINE )
                ;
            }
        }
    }

    return {
        width : width,
        height : height,
        mines : mines,
        cells : cells
    };

};

var disclose = function ( target, source, origin ) {

    var queue = [ ];
    queue.push( origin );

    while ( queue.length ) {
        var coord = queue.shift( );

        if ( coord[ 0 ] < 0 || coord[ 0 ] >= source.width
          || coord[ 1 ] < 0 || coord[ 1 ] >= source.height
          || target.cells[ coord ] !== undefined )
            continue ;

        if ( source.cells[ coord ] >= 0 )
            target.cells[ coord ] = source.cells[ coord ];

        if ( target.cells[ coord ] === 0 ) {
            queue.push( [ coord[ 0 ] - 1, coord[ 1 ] ] );
            queue.push( [ coord[ 0 ] + 1, coord[ 1 ] ] );
            queue.push( [ coord[ 0 ], coord[ 1 ] - 1 ] );
            queue.push( [ coord[ 0 ], coord[ 1 ] + 1 ] );
            queue.push( [ coord[ 0 ] - 1, coord[ 1 ] - 1 ] );
            queue.push( [ coord[ 0 ] - 1, coord[ 1 ] + 1 ] );
            queue.push( [ coord[ 0 ] + 1, coord[ 1 ] - 1 ] );
            queue.push( [ coord[ 0 ] + 1, coord[ 1 ] + 1 ] );
        }
    }

};

var complete = function ( target, source ) {
    for ( var y = 0; y < source.height; ++ y ) {
        for ( var x = 0; x < source.width; ++ x ) {
            if ( target.cells[[ x, y ]] === undefined ) {
                target.cells[[ x, y ]] = source.cells[[ x, y ]];
            }
        }
    }
};

var pendingRooms = [ ];

var nextUserId = 0;
var nextRoomId = 0;

socketio.on( 'connection', function ( socket ) {

    var room, player;

    if ( ! pendingRooms.length ) {

        var roomId = nextRoomId ++;

        room = { id : roomId, model : createBoard( width, height, minep ), board : { width: width, height : height, cells : Object.create( null ) }, players : [ null, null ], turn : null, active : null };
        pendingRooms.push( room );
        room.players[ 0 ] = socket;

        socket.emit( 'player', player = 0 );

        socket.join( room.id );
        socketio.sockets.in( room.id ).emit( 'new' );

    } else {

        room = pendingRooms.shift( );
        room.players[ 1 ] = socket;
        room.active = Math.round( Math.random( ) );
        room.turn = 0;

        socket.emit( 'player', player = 1 );

        socket.join( room.id );
        socketio.sockets.in( room.id ).emit( 'ready' );
        socketio.sockets.in( room.id ).emit( 'board', room.board );
        socketio.sockets.in( room.id ).emit( 'turn', room.active );

    }

    socket.on( 'click', function ( coord ) {

        if ( ! ( coord instanceof Array ) )
            return ;

        if ( room.active !== player
          || coord[ 0 ] < 0 || coord[ 0 ] >= room.model.width
          || coord[ 1 ] < 0 || coord[ 1 ] >= room.model.height
          || room.board.cells[ coord ] !== undefined )
            return ;

        if ( room.model.cells[ coord ] === MINE ) {

            room.board.cells[ coord ] = EXPLOSION;
            complete( room.board, room.model );
            socketio.sockets.in( room.id ).emit( 'board', room.board );
            socketio.sockets.in( room.id ).emit( 'end', player ? 0 : 1 );

        } else {

            disclose( room.board, room.model, coord );
            socketio.sockets.in( room.id ).emit( 'board', room.board );

            room.turn += 1;
            room.active = room.active ? 0 : 1;
            socketio.sockets.in( room.id ).emit( 'turn', room.active );

        }
    } );

    socket.on( 'flag', function ( coord ) {

        if ( ! ( coord instanceof Array ) )
            return ;

        if ( room.active !== player
          || coord[ 0 ] < 0 || coord[ 0 ] >= room.model.width
          || coord[ 1 ] < 0 || coord[ 1 ] >= room.model.height
          || room.board.cells[ coord ] !== undefined )
            return ;

        if ( room.model.cells[ coord ] === MINE ) {

            room.board.cells[ coord ] = ! player ? FLAG_P1 : FLAG_P2;
            socketio.sockets.in( room.id ).emit( 'board', room.board );

            room.turn += 1;
            socketio.sockets.in( room.id ).emit( 'turn', room.active );

        } else {

            disclose( room.board, room.model, coord );
            socketio.sockets.in( room.id ).emit( 'board', room.board );

            room.turn += 1;
            room.active = room.active ? 0 : 1;
            socketio.sockets.in( room.id ).emit( 'turn', room.active );

        }

    } );

    socket.on( 'disconnect', function ( ) {

        if ( room.turn === null ) {

            pendingRooms.splice( pendingRooms.indexOf( room ), 1 );

        } else {

            socketio.sockets.in( room.id ).emit( 'abandon' );
            room.active = null;

        }

    } );

} );
