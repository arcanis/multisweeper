var Log = [ '$scope', 'socket', function ( $scope, socket ) {

    $scope.playerId = null;

    $scope.items = [ ];

    socket.on( 'player', function ( playerId ) {
        $scope.playerId = playerId;
    } );

    socket.on( 'new', function ( ) {
        $scope.items.push( 'new' );
    } );

    socket.on( 'ready', function ( ) {
        $scope.items.push( 'ready' );
    } );

    socket.on( 'turn', function ( playerId ) {
        $scope.items.push( playerId === $scope.playerId ? 'Your turn' : 'Opponent\'s turn' );
    } );

    socket.on( 'abandon', function ( ) {
        $scope.items.push( 'abandon' );
    } );

    socket.on( 'end', function ( winnerId ) {
        $scope.items.push( winnerId === $scope.playerId ? 'You won !' : 'You lost' );
    } );

} ];
