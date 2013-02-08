var main = [ '$scope', function ( $scope ) {

    $scope.now = new Date( );

    $scope.randomStep = function ( n ) {
        var seed = 232324, a = 1103515245, c = 3534, m = Math.pow( 2, 32 );
        while ( n -- ) seed = ( a * seed + c ) % m;
        return seed % m / m;
    };

} ];
