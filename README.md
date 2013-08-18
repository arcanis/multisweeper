# Multisweeper

My first node + angular application ... :)

## Installation

    $> git clone git@github.com:arcanis/multisweeper
    $> cd multisweeper
    $> npm install
    $> node server 8888

You can now access [http://localhost:8888](http://localhost:8888) in your browser.

## Rules

 - Left click will open a cell.
   - If there is a bomb, you lose.

 - Right click will flag a cell.
   - If there is a bomb, you play again.
   - If there isn't, you lost your turn.

The winner is the player who flagged more than 50% of the bombs.

## Todo

 - Better interface
 - Win condition
