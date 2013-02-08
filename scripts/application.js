var app = angular.module( 'app', [ ] );

app.directive( [ 'contextmenu' ].reduce( function ( container, name ) {
    var directiveName = 'ng' + name[ 0 ].toUpperCase( ) + name.substr( 1 );

    container[ directiveName ] = [ '$parse', function ( $parse ) {
        return function ( scope, element, attr ) {
            var fn = $parse( attr[ directiveName ] );
            element.bind( name, function ( event ) {
                scope.$apply( function ( ) {
                    fn( scope, {
                        $event : event
                    } );
                } );
            } );
        };
    } ];

    return container;
}, { } ) );

app.factory( 'socket', function ( $rootScope ) {

    var socket = io.connect( );

    return {
        on : function ( eventName, callback ) {
            socket.on( eventName, function ( ) {
                var args = arguments;
                $rootScope.$apply( function ( ) {
                    callback && callback.apply( socket, args );
                } );
            } );
        },

        emit : function ( eventName, data, callback ) {
            socket.emit( eventName, data, function ( ) {
                var args = arguments;
                $rootScope.apply( function ( ) {
                    callback && callback.apply( socket, args );
                } );
            } );
        }
    };

} );
