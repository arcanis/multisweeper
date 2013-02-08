var Board = [ '$scope', 'socket', function ( $scope, socket ) {

    $scope.size = 20;

    $scope.width = 0;
    $scope.height = 0;

    $scope.cells = { };

    socket.on( 'board', function ( board ) {

        $scope.width = board.width;
        $scope.height = board.height;

        for ( var y = 0; y < board.height; ++ y ) {
            for ( var x = 0; x < board.width; ++ x ) {

                var cell = $scope.cells[[ x, y ]] = $scope.cells[[ x, y ]] || { x : x, y : y };
                cell.value = board.cells[[ x, y ]];
            }
        }

    } );

    $scope.click = function ( $event, coord ) {
        socket.emit( 'click', coord );
    };

    $scope.rightClick = function ( $event, coord ) {
        $event.preventDefault( );
        socket.emit( 'flag', coord );
    };

} ];
