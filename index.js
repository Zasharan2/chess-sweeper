var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

var spritesheet = document.getElementById("spritesheet");

const SCREENTYPE = {
    NULL_TO_TITLE: 0.1,
    TITLE: 1,
    TITLE_TO_LOCAL: 1.2,
    LOCAL: 2
}

var gameScreen = SCREENTYPE.NULL_TO_TITLE;

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

var playButtonShiftX = 0;

var boardSize = 8;

var tileSize = 384 / boardSize;

const LOSESTATE = {
    BY_CHESS: 1,
    BY_MINESWEEPER: 2,
    BY_MINESWEEPER_CHESS: 1.2
};

var gameOver = false;
var loseState = [-1, -1]; // colour and LOSESTATE

// ===== CHESS =====

var chessPieces = [];
var moveToTiles = [];

var selectedIndex;

function calculateMoveTo() {
    var selectedPiece = chessPieces[selectedIndex];
    moveToTiles = [];
    switch (selectedPiece.type) {
        case CHESSPIECETYPE.PAWN: {
            if (selectedPiece.colour == CHESSPIECECOLOUR.WHITE) {
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - 1) == -1) {
                    if (selectedPiece.y - 1 >= 0) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y - 1]);
                    }
                }
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y - 1) != -1) {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y - 1)].colour == CHESSPIECECOLOUR.BLACK) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y - 1]);
                    }
                }
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y - 1) != -1) {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y - 1)].colour == CHESSPIECECOLOUR.BLACK) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y - 1]);
                    }
                }
                if (!selectedPiece.hasMoved) {
                    if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - 1) == -1 && getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - 2) == -1) {
                        if (selectedPiece.y - 2 >= 0) {
                            moveToTiles.push([selectedPiece.x, selectedPiece.y - 2]);
                        }
                    };
                }
            } else {
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + 1) == -1) {
                    if (selectedPiece.y + 1 <= (boardSize - 1)) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y + 1]);
                    }
                }
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y + 1) != -1) {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y + 1)].colour == CHESSPIECECOLOUR.WHITE) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y + 1]);
                    }
                }
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y + 1) != -1) {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y + 1)].colour == CHESSPIECECOLOUR.WHITE) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y + 1]);
                    }
                }
                if (!selectedPiece.hasMoved) {
                    if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + 1) == -1 && getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + 2) == -1) {
                        if (selectedPiece.y + 2 <= (boardSize - 1)) {
                            moveToTiles.push([selectedPiece.x, selectedPiece.y + 2]);
                        }
                    };
                }
            }
            break;
        }
        case CHESSPIECETYPE.KNIGHT: {
            if (selectedPiece.x + 1 <= (boardSize - 1) && selectedPiece.y + 2 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y + 2) == -1) {
                    moveToTiles.push([selectedPiece.x + 1, selectedPiece.y + 2]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y + 2)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y + 2]);
                    }
                }
            }
            if (selectedPiece.x + 1 <= (boardSize - 1) && selectedPiece.y - 2 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y - 2) == -1) {
                    moveToTiles.push([selectedPiece.x + 1, selectedPiece.y - 2]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y - 2)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y - 2]);
                    }
                }
            }
            if (selectedPiece.x - 1 >= 0 && selectedPiece.y + 2 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y + 2) == -1) {
                    moveToTiles.push([selectedPiece.x - 1, selectedPiece.y + 2]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y + 2)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y + 2]);
                    }
                }
            }
            if (selectedPiece.x - 1 >= 0 && selectedPiece.y - 2 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y - 2) == -1) {
                    moveToTiles.push([selectedPiece.x - 1, selectedPiece.y - 2]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y - 2)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y - 2]);
                    }
                }
            }
            if (selectedPiece.x + 2 <= (boardSize - 1) && selectedPiece.y + 1 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x + 2, selectedPiece.y + 1) == -1) {
                    moveToTiles.push([selectedPiece.x + 2, selectedPiece.y + 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 2, selectedPiece.y + 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 2, selectedPiece.y + 1]);
                    }
                }
            }
            if (selectedPiece.x + 2 <= (boardSize - 1) && selectedPiece.y - 1 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x + 2, selectedPiece.y - 1) == -1) {
                    moveToTiles.push([selectedPiece.x + 2, selectedPiece.y - 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 2, selectedPiece.y - 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 2, selectedPiece.y - 1]);
                    }
                }
            }
            if (selectedPiece.x - 2 >= 0 && selectedPiece.y + 1 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x - 2, selectedPiece.y + 1) == -1) {
                    moveToTiles.push([selectedPiece.x - 2, selectedPiece.y + 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 2, selectedPiece.y + 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 2, selectedPiece.y + 1]);
                    }
                }
            }
            if (selectedPiece.x - 2 >= 0 && selectedPiece.y - 1 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x - 2, selectedPiece.y - 1) == -1) {
                    moveToTiles.push([selectedPiece.x - 2, selectedPiece.y - 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 2, selectedPiece.y - 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 2, selectedPiece.y - 1]);
                    }
                }
            }
            break;
        }
        case CHESSPIECETYPE.BISHOP: {
            var uprightStop = false;
            var upleftStop = false;
            var downrightStop = false;
            var downleftStop = false;
            for (var k = 1; k < boardSize; k++) {
                if (!downrightStop) {
                    if (selectedPiece.x + k <= (boardSize - 1) && selectedPiece.y + k <= (boardSize - 1)) {
                        if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y + k) == -1) {
                            moveToTiles.push([selectedPiece.x + k, selectedPiece.y + k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y + k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x + k, selectedPiece.y + k]);
                            }
                            downrightStop = true;
                        }
                    }
                }
                if (!downleftStop) {
                    if (selectedPiece.x - k >= 0 && selectedPiece.y + k <= (boardSize - 1)) {
                        if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y + k) == -1) {
                            moveToTiles.push([selectedPiece.x - k, selectedPiece.y + k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y + k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x - k, selectedPiece.y + k]);
                            }
                            downleftStop = true;
                        }
                    }
                }
                if (!uprightStop) {
                    if (selectedPiece.x + k <= (boardSize - 1) && selectedPiece.y - k >= 0) {
                        if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y - k) == -1) {
                            moveToTiles.push([selectedPiece.x + k, selectedPiece.y - k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y - k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x + k, selectedPiece.y - k]);
                            }
                            uprightStop = true;
                        }
                    }
                }
                if (!upleftStop) {
                    if (selectedPiece.x - k >= 0 && selectedPiece.y - k >= 0) {
                        if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y - k) == -1) {
                            moveToTiles.push([selectedPiece.x - k, selectedPiece.y - k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y - k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x - k, selectedPiece.y - k]);
                            }
                            upleftStop = true;
                        }
                    }
                }
            }
            break;
        }
        case CHESSPIECETYPE.ROOK: {
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.x + k >= boardSize) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y) == -1) {
                    moveToTiles.push([selectedPiece.x + k, selectedPiece.y]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + k, selectedPiece.y]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.x - k < 0) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y) == -1) {
                    moveToTiles.push([selectedPiece.x - k, selectedPiece.y]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - k, selectedPiece.y]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.y + k >= boardSize) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + k) == -1) {
                    moveToTiles.push([selectedPiece.x, selectedPiece.y + k]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + k)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y + k]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.y - k < 0) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - k) == -1) {
                    moveToTiles.push([selectedPiece.x, selectedPiece.y - k]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - k)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y - k]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            break;
        }
        case CHESSPIECETYPE.QUEEN: {
            // bishop
            var uprightStop = false;
            var upleftStop = false;
            var downrightStop = false;
            var downleftStop = false;
            for (var k = 1; k < boardSize; k++) {
                if (!downrightStop) {
                    if (selectedPiece.x + k <= (boardSize - 1) && selectedPiece.y + k <= (boardSize - 1)) {
                        if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y + k) == -1) {
                            moveToTiles.push([selectedPiece.x + k, selectedPiece.y + k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y + k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x + k, selectedPiece.y + k]);
                            }
                            downrightStop = true;
                        }
                    }
                }
                if (!downleftStop) {
                    if (selectedPiece.x - k >= 0 && selectedPiece.y + k <= (boardSize - 1)) {
                        if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y + k) == -1) {
                            moveToTiles.push([selectedPiece.x - k, selectedPiece.y + k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y + k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x - k, selectedPiece.y + k]);
                            }
                            downleftStop = true;
                        }
                    }
                }
                if (!uprightStop) {
                    if (selectedPiece.x + k <= (boardSize - 1) && selectedPiece.y - k >= 0) {
                        if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y - k) == -1) {
                            moveToTiles.push([selectedPiece.x + k, selectedPiece.y - k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y - k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x + k, selectedPiece.y - k]);
                            }
                            uprightStop = true;
                        }
                    }
                }
                if (!upleftStop) {
                    if (selectedPiece.x - k >= 0 && selectedPiece.y - k >= 0) {
                        if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y - k) == -1) {
                            moveToTiles.push([selectedPiece.x - k, selectedPiece.y - k]);
                        } else {
                            if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y - k)].colour != selectedPiece.colour) {
                                moveToTiles.push([selectedPiece.x - k, selectedPiece.y - k]);
                            }
                            upleftStop = true;
                        }
                    }
                }
            }
            // rook
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.x + k >= boardSize) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y) == -1) {
                    moveToTiles.push([selectedPiece.x + k, selectedPiece.y]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + k, selectedPiece.y]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.x - k < 0) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y) == -1) {
                    moveToTiles.push([selectedPiece.x - k, selectedPiece.y]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - k, selectedPiece.y]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.y + k >= boardSize) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + k) == -1) {
                    moveToTiles.push([selectedPiece.x, selectedPiece.y + k]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + k)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y + k]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            for (var k = 1; k < boardSize; k++) {
                if (selectedPiece.y - k < 0) {
                    break;
                }
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - k) == -1) {
                    moveToTiles.push([selectedPiece.x, selectedPiece.y - k]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - k)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y - k]);
                        break;
                    } else {
                        break;
                    }
                }
            }
            break;
        }
        case CHESSPIECETYPE.KING: {
            if (selectedPiece.x + 1 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y) == -1) {
                    moveToTiles.push([selectedPiece.x + 1, selectedPiece.y]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y]);
                    }
                }
            }
            if (selectedPiece.x - 1 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y) == -1) {
                    moveToTiles.push([selectedPiece.x - 1, selectedPiece.y]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y]);
                    }
                }
            }
            if (selectedPiece.y + 1 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + 1) == -1) {
                    moveToTiles.push([selectedPiece.x, selectedPiece.y + 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x, selectedPiece.y + 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y + 1]);
                    }
                }
            }
            if (selectedPiece.y - 1 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - 1) == -1) {
                    moveToTiles.push([selectedPiece.x, selectedPiece.y - 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x, selectedPiece.y - 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x, selectedPiece.y - 1]);
                    }
                }
            }
            if (selectedPiece.x + 1 <= (boardSize - 1) && selectedPiece.y + 1 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y + 1) == -1) {
                    moveToTiles.push([selectedPiece.x + 1, selectedPiece.y + 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y + 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y + 1]);
                    }
                }
            }
            if (selectedPiece.x - 1 >= 0 && selectedPiece.y + 1 <= (boardSize - 1)) {
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y + 1) == -1) {
                    moveToTiles.push([selectedPiece.x - 1, selectedPiece.y + 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y + 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y + 1]);
                    }
                }
            }
            if (selectedPiece.x + 1 <= (boardSize - 1) && selectedPiece.y - 1 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y - 1) == -1) {
                    moveToTiles.push([selectedPiece.x + 1, selectedPiece.y - 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x + 1, selectedPiece.y - 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x + 1, selectedPiece.y - 1]);
                    }
                }
            }
            if (selectedPiece.x - 1 >= 0 && selectedPiece.y - 1 >= 0) {
                if (getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y - 1) == -1) {
                    moveToTiles.push([selectedPiece.x - 1, selectedPiece.y - 1]);
                } else {
                    if (chessPieces[getChessPieceIndexAt(selectedPiece.x - 1, selectedPiece.y - 1)].colour != selectedPiece.colour) {
                        moveToTiles.push([selectedPiece.x - 1, selectedPiece.y - 1]);
                    }
                }
            }
            if (!selectedPiece.hasMoved) {
                for (var k = 1; k < boardSize; k++) {
                    if (selectedPiece.x + k >= boardSize) {
                        break;
                    }
                    if (getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y) != -1) {
                        if (chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y)].type == CHESSPIECETYPE.ROOK && chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y)].colour == mineShowState && chessPieces[getChessPieceIndexAt(selectedPiece.x + k, selectedPiece.y)].hasMoved == false) {
                            moveToTiles.push([selectedPiece.x + 2, selectedPiece.y]);
                        } else {
                            break;
                        }
                    }
                }
                for (var k = 1; k < boardSize; k++) {
                    if (selectedPiece.x - k < 0) {
                        break;
                    }
                    if (getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y) != -1) {
                        if (chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y)].type == CHESSPIECETYPE.ROOK && chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y)].colour == mineShowState && chessPieces[getChessPieceIndexAt(selectedPiece.x - k, selectedPiece.y)].hasMoved == false) {
                            moveToTiles.push([selectedPiece.x - 2, selectedPiece.y]);
                        } else {
                            break;
                        }
                    }
                }
            }
            break;
        }
        default: {
            break;
        }
    }
}

var chessMoveMade;

function movePiece(pieceIndex, x, y) {
    if (chessPieces[pieceIndex].type == CHESSPIECETYPE.KING) {
        if (mineTiles[getMineTileIndexAt(x, y)].isBomb) {
            loseState = [mineShowState, LOSESTATE.BY_MINESWEEPER_CHESS];
            gameOver = true;
            if (mineShowState == MINESHOWSTATE.WHITE) {
                console.log("White loses by Minesweeper + Chess!");
            } else if (mineShowState == MINESHOWSTATE.BLACK) {
                console.log("Black loses by Minesweeper + Chess!");
            }
        }
    }
    if (!mineTiles[getMineTileIndexAt(chessPieces[pieceIndex].x, chessPieces[pieceIndex].y)].isBomb) {
        mineTiles[getMineTileIndexAt(chessPieces[pieceIndex].x, chessPieces[pieceIndex].y)].findValue();
        if (chessPieces[pieceIndex].colour == CHESSPIECECOLOUR.WHITE) {
            mineTiles[getMineTileIndexAt(chessPieces[pieceIndex].x, chessPieces[pieceIndex].y)].visible[CHESSPIECECOLOUR.WHITE] = true;
        } else {
            mineTiles[getMineTileIndexAt(chessPieces[pieceIndex].x, chessPieces[pieceIndex].y)].visible[CHESSPIECECOLOUR.BLACK] = true;
        }
    }
    if (chessPieces[pieceIndex].type == CHESSPIECETYPE.KING && Math.abs(chessPieces[pieceIndex].x - x) == 2) {
        if (Math.sign(x - chessPieces[pieceIndex].x) == 1) {
            chessPieces[pieceIndex].x = x;
            chessPieces[pieceIndex].y = y;
            chessPieces[getChessPieceIndexAt(7, chessPieces[pieceIndex].y)].x = x - 1;
            if (mineTiles[getMineTileIndexAt(x, y)].isBomb || mineTiles[getMineTileIndexAt(x - 1, y)].isBomb) {
                loseState = [mineShowState, LOSESTATE.BY_MINESWEEPER_CHESS];
                gameOver = true;
                if (mineShowState == MINESHOWSTATE.WHITE) {
                    console.log("White loses by Minesweeper + Chess!");
                } else if (mineShowState == MINESHOWSTATE.BLACK) {
                    console.log("Black loses by Minesweeper + Chess!");
                }
            }
        } else if (Math.sign(x - chessPieces[pieceIndex].x) == -1) {
            chessPieces[pieceIndex].x = x;
            chessPieces[pieceIndex].y = y;
            chessPieces[getChessPieceIndexAt(0, chessPieces[pieceIndex].y)].x = x + 1;
            if (mineTiles[getMineTileIndexAt(x, y)].isBomb || mineTiles[getMineTileIndexAt(x + 1, y)].isBomb) {
                loseState = [mineShowState, LOSESTATE.BY_MINESWEEPER_CHESS];
                gameOver = true;
                if (mineShowState == MINESHOWSTATE.WHITE) {
                    console.log("White loses by Minesweeper + Chess!");
                } else if (mineShowState == MINESHOWSTATE.BLACK) {
                    console.log("Black loses by Minesweeper + Chess!");
                }
            }
        }
    } else {
        if (getChessPieceIndexAt(x, y) != -1) {
            var tempIndex = getChessPieceIndexAt(x, y);
            if (chessPieces[tempIndex].type == CHESSPIECETYPE.KING) {
                loseState = [((mineShowState + 1) % 2), LOSESTATE.BY_CHESS];
                gameOver = true;
                if (mineShowState == MINESHOWSTATE.WHITE) {
                    console.log("Black loses by Chess!");
                } else if (mineShowState == MINESHOWSTATE.BLACK) {
                    console.log("White loses by Chess!");
                }
            }
            chessPieces.splice(tempIndex, 1);
            if (pieceIndex > tempIndex) {
                chessPieces[pieceIndex - 1].x = x;
                chessPieces[pieceIndex - 1].y = y;
                chessPieces[pieceIndex - 1].hasMoved = true;
            } else {
                chessPieces[pieceIndex].x = x;
                chessPieces[pieceIndex].y = y;
                chessPieces[pieceIndex].hasMoved = true;
            }
        } else {
            chessPieces[pieceIndex].x = x;
            chessPieces[pieceIndex].y = y;
            chessPieces[pieceIndex].hasMoved = true;
        }
    }
    selectedIndex = -1;
    moveToTiles = [];
}

function getChessPieceIndexAt(x, y) {
    for (var i = 0; i < chessPieces.length; i++) {
        if (chessPieces[i].x == x && chessPieces[i].y == y) {
            return i;
        }
    }
    return -1;
}

var selectDelay = 40;
var selectTimer = selectDelay;

function drawBoard() {
    selectTimer += deltaTime;

    ctx.beginPath();
    ctx.fillStyle = "#0089cc"
    ctx.fillRect(64, 64, 384, 384);
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            if ((i + j) % 2 == 0) {
                ctx.beginPath();
                if (mineTiles[getMineTileIndexAt(i, j)].flagged[mineShowState]) {
                    ctx.fillStyle = "#ff0000"
                } else {
                    ctx.fillStyle = "#009eee"
                }
                ctx.fillRect(64 + (tileSize * i), 64 + (tileSize * j), tileSize, tileSize);
            }
        }
    }

    if (mineShowState == MINESHOWSTATE.WHITE || mineShowState == MINESHOWSTATE.BLACK) {

        for (var i = 0; i < boardSize; i++) {
            for (var j = 0; j < boardSize; j++) {
                ctx.beginPath();
                ctx.fillStyle = "#ff0000"
                if (mineTiles[getMineTileIndexAt(i, j)].flagged[mineShowState]) {
                    ctx.fillRect(64 + (tileSize * i), 64 + (tileSize * j), tileSize, tileSize);
                }
            }
        }    


        for (var k = 0; k < boardSize; k++) {
            for (var l = 0; l < boardSize; l++) {
                if (!gameOver) {
                    if (mouseX > 64 + (k * tileSize) && mouseY > 64 + (l * tileSize) && mouseX < 64 + tileSize + (k * tileSize) && mouseY < 64 + tileSize + (l * tileSize)) {
                        if (mouseDown && selectTimer > selectDelay && mouseButton == 2) {
                            selectTimer = 0;
                            mineTiles[getMineTileIndexAt(k, l)].flagged[mineShowState] = (!(mineTiles[getMineTileIndexAt(k, l)].flagged[mineShowState]));
                        }
                        ctx.beginPath();
                        ctx.globalAlpha = 0.1;
                        ctx.fillStyle = "#ff0000"
                        ctx.fillRect(64 + (tileSize * k), 64 + (tileSize * l), tileSize, tileSize);
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }

        if (!gameOver) {
            if (checkFlags(mineShowState) && checkMinePieces()) {
                loseState = [mineShowState, LOSESTATE.BY_MINESWEEPER];
                gameOver = true;
                if (mineShowState == MINESHOWSTATE.WHITE) {
                    console.log("Black loses by Minesweeper!");
                } else if (mineShowState == MINESHOWSTATE.BLACK) {
                    console.log("White loses by Minesweeper!");
                }
            }
        }
    }
    
    for (var piece = 0; piece < chessPieces.length; piece++) {
        if (selectedIndex == piece) {
            ctx.beginPath();
            ctx.fillStyle = "#00ff00"
            ctx.fillRect(64 + (tileSize * chessPieces[piece].x), 64 + (tileSize * chessPieces[piece].y), tileSize, tileSize);
        }
        if (!chessMoveMade) {
            if (!gameOver) {
                if (mouseX > 64 + (chessPieces[piece].x * tileSize) && mouseY > 64 + (chessPieces[piece].y * tileSize) && mouseX < 64 + tileSize + (chessPieces[piece].x * tileSize) && mouseY < 64 + tileSize + (chessPieces[piece].y * tileSize)) {
                    if (chessPieces[piece].colour == mineShowState) {
                        if (mouseDown && selectTimer > selectDelay && mouseButton == 1) {
                            selectTimer = 0;
                            selectedIndex = piece;
                            calculateMoveTo();
                        }
                        ctx.beginPath();
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = "#00ff00"
                        ctx.fillRect(64 + (tileSize * chessPieces[piece].x), 64 + (tileSize * chessPieces[piece].y), tileSize, tileSize);
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }
        drawChessPiece(chessPieces[piece]);
    }
    for (var moveToTile = 0; moveToTile < moveToTiles.length; moveToTile++) {
        if (!gameOver && mouseX > 64 + (moveToTiles[moveToTile][0] * tileSize) && mouseY > 64 + (moveToTiles[moveToTile][1] * tileSize) && mouseX < 64 + tileSize + (moveToTiles[moveToTile][0] * tileSize) && mouseY < 64 + tileSize + (moveToTiles[moveToTile][1] * tileSize)) {
            ctx.beginPath();
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = "#00ff00"
            ctx.fillRect(64 + (tileSize * moveToTiles[moveToTile][0]), 64 + (tileSize * moveToTiles[moveToTile][1]), tileSize, tileSize);
            ctx.globalAlpha = 1;
            if (mouseDown && selectTimer > selectDelay && mouseButton == 1) {
                selectTimer = 0;
                movePiece(selectedIndex, moveToTiles[moveToTile][0], moveToTiles[moveToTile][1]);
                chessMoveMade = true;
            }
        } else {
            ctx.beginPath();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#00ff00"
            ctx.fillRect(64 + (tileSize * moveToTiles[moveToTile][0]), 64 + (tileSize * moveToTiles[moveToTile][1]), tileSize, tileSize);
            ctx.globalAlpha = 1;
        }
    }
}

class ChessPiece {
    constructor(x, y, type, colour) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.colour = colour;
        this.hasMoved = false;
    }
}

// KQBNRP
const CHESSPIECETYPE = {
    KING: 0,
    QUEEN: 1,
    BISHOP: 2,
    KNIGHT: 3,
    ROOK: 4,
    PAWN: 5
}

// WB
const CHESSPIECECOLOUR = {
    WHITE: 0,
    BLACK: 1
}

function drawChessPiece(chessPiece) {
    ctx.beginPath();
    ctx.drawImage(spritesheet, chessPiece.type * (640 / 3), chessPiece.colour * (427 / 2), (640 / 3), (640 / 3), 64 + (chessPiece.x * tileSize), 64 + (chessPiece.y * tileSize), tileSize, tileSize);
}

function setupChessBoard() {
    chessPieces = [new ChessPiece(1, 0, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.BLACK), new ChessPiece(0, 0, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.BLACK), new ChessPiece(2, 0, CHESSPIECETYPE.KING, CHESSPIECECOLOUR.BLACK), new ChessPiece(3, 0, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.BLACK), new ChessPiece(4, 0, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.BLACK), new ChessPiece(0, 4, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.WHITE), new ChessPiece(1, 4, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.WHITE), new ChessPiece(2, 4, CHESSPIECETYPE.KING, CHESSPIECECOLOUR.WHITE), new ChessPiece(4, 4, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.WHITE), new ChessPiece(3, 4, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.WHITE), new ChessPiece(0, 1, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.BLACK), new ChessPiece(1, 1, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.BLACK), new ChessPiece(2, 1, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.BLACK), new ChessPiece(3, 1, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.BLACK), new ChessPiece(4, 1, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.BLACK), new ChessPiece(0, 3, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.WHITE), new ChessPiece(1, 3, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.WHITE), new ChessPiece(2, 3, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.WHITE), new ChessPiece(3, 3, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.WHITE), new ChessPiece(4, 3, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.WHITE)]
    chessPieces = [];
    // rooks
    chessPieces.push(new ChessPiece(0, 0, CHESSPIECETYPE.ROOK, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(7, 0, CHESSPIECETYPE.ROOK, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(0, 7, CHESSPIECETYPE.ROOK, CHESSPIECECOLOUR.WHITE));
    chessPieces.push(new ChessPiece(7, 7, CHESSPIECETYPE.ROOK, CHESSPIECECOLOUR.WHITE));
    // knights
    chessPieces.push(new ChessPiece(1, 0, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(6, 0, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(1, 7, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.WHITE));
    chessPieces.push(new ChessPiece(6, 7, CHESSPIECETYPE.KNIGHT, CHESSPIECECOLOUR.WHITE));
    // bishops
    chessPieces.push(new ChessPiece(2, 0, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(5, 0, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(2, 7, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.WHITE));
    chessPieces.push(new ChessPiece(5, 7, CHESSPIECETYPE.BISHOP, CHESSPIECECOLOUR.WHITE));
    // queens
    chessPieces.push(new ChessPiece(3, 0, CHESSPIECETYPE.QUEEN, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(3, 7, CHESSPIECETYPE.QUEEN, CHESSPIECECOLOUR.WHITE));
    // kings
    chessPieces.push(new ChessPiece(4, 0, CHESSPIECETYPE.KING, CHESSPIECECOLOUR.BLACK));
    chessPieces.push(new ChessPiece(4, 7, CHESSPIECETYPE.KING, CHESSPIECECOLOUR.WHITE));
    // pawns
    for (var m = 0; m < 8; m++) {
        chessPieces.push(new ChessPiece(m, 1, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.BLACK));
        chessPieces.push(new ChessPiece(m, 6, CHESSPIECETYPE.PAWN, CHESSPIECECOLOUR.WHITE));
    }
}

// ===== MINESWEEPER =====

var mineTiles = [];

class MineTile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isBomb = false;
        this.visible = [false, false]; // visible[0] signifies white, visible[1] signifies black
        this.flagged = [false, false];
        this.value = -1;
    }

    findValue() {
        if (this.isBomb) {
            return -1;
        } else {
            this.value = 0
            if (this.x - 1 >= 0) {
                if (mineTiles[getMineTileIndexAt(this.x - 1, this.y)].isBomb) {
                    this.value++;
                }
            }
            if (this.x + 1 <= (boardSize - 1)) {
                if (mineTiles[getMineTileIndexAt(this.x + 1, this.y)].isBomb) {
                    this.value++;
                }
            }
            if (this.y - 1 >= 0) {
                if (mineTiles[getMineTileIndexAt(this.x, this.y - 1)].isBomb) {
                    this.value++;
                }
            }
            if (this.y + 1 <= (boardSize - 1)) {
                if (mineTiles[getMineTileIndexAt(this.x, this.y + 1)].isBomb) {
                    this.value++;
                }
            }
            if (this.x - 1 >= 0 && this.y - 1 >= 0) {
                if (mineTiles[getMineTileIndexAt(this.x - 1, this.y - 1)].isBomb) {
                    this.value++;
                }
            }
            if (this.x + 1 <= (boardSize - 1) && this.y - 1 >= 0) {
                if (mineTiles[getMineTileIndexAt(this.x + 1, this.y - 1)].isBomb) {
                    this.value++;
                }
            }
            if (this.x - 1 >= 0 && this.y + 1 <= (boardSize - 1)) {
                if (mineTiles[getMineTileIndexAt(this.x - 1, this.y + 1)].isBomb) {
                    this.value++;
                }
            }
            if (this.x + 1 <= (boardSize - 1) && this.y + 1 <= (boardSize - 1)) {
                if (mineTiles[getMineTileIndexAt(this.x + 1, this.y + 1)].isBomb) {
                    this.value++;
                }
            }
        }
    }
}

function fillMines() {
    for (var i = 0; i < boardSize; i++) {
        for (var j = 0; j < boardSize; j++) {
            mineTiles.push(new MineTile(i, j));
        }
    }
    for (var i = 0; i < 13; i++) {
        var tempX = Math.floor(Math.random() * boardSize);
        var tempY = Math.floor(Math.random() * boardSize);
        if (mineTiles[getMineTileIndexAt(tempX, tempY)].isBomb) {
            i--;
        } else {
            if (getChessPieceIndexAt(tempX, tempY) != -1) {
                if (chessPieces[getChessPieceIndexAt(tempX, tempY)].type == CHESSPIECETYPE.KING) {
                    i--
                } else {
                    mineTiles[getMineTileIndexAt(tempX, tempY)].isBomb = true;
                }
            } else {
                mineTiles[getMineTileIndexAt(tempX, tempY)].isBomb = true;
            }
        }
    }
}

function getMineTileIndexAt(x, y) {
    for (var i = 0; i < mineTiles.length; i++) {
        if (mineTiles[i].x == x && mineTiles[i].y == y) {
            return i;
        }
    }
    return -1;
}

function drawMines() {
    switch (mineShowState) {
        case MINESHOWSTATE.WHITE: {
            for (var k = 0; k < mineTiles.length; k++) {
                if (mineTiles[k].visible[MINESHOWSTATE.WHITE]) {
                    if (getChessPieceIndexAt(mineTiles[k].x, mineTiles[k].y) != -1) {
                        ctx.beginPath();
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "15px Arial";
                        ctx.fillText(mineTiles[k].value, 68 + (tileSize * mineTiles[k].x), 82 + (tileSize * mineTiles[k].y));
                    } else {
                        ctx.beginPath();
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "30px Arial";
                        ctx.fillText(mineTiles[k].value, 80 + (tileSize * mineTiles[k].x), 100 + (tileSize * mineTiles[k].y));
                    }
                }
            }
            break;
        }
        case MINESHOWSTATE.BLACK: {
            for (var k = 0; k < mineTiles.length; k++) {
                if (mineTiles[k].visible[MINESHOWSTATE.BLACK]) {
                    if (getChessPieceIndexAt(mineTiles[k].x, mineTiles[k].y) != -1) {
                        ctx.beginPath();
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "20px Arial";
                        ctx.fillText(mineTiles[k].value, 68 + (tileSize * mineTiles[k].x), 85 + (tileSize * mineTiles[k].y));
                    } else {
                        ctx.beginPath();
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "30px Arial";
                        ctx.fillText(mineTiles[k].value, 80 + (tileSize * mineTiles[k].x), 100 + (tileSize * mineTiles[k].y));
                    }
                }
            }
            break;
        }
        default: {
            break;
        }
    }
}

function checkFlags(colour) {
    var tempCount = 0;
    var tempCorrectCount = 0;
    for (var p = 0; p < mineTiles.length; p++) {
        if (mineTiles[p].flagged[colour]) {
            tempCount++;
            if (mineTiles[p].isBomb) {
                tempCorrectCount++;
            }
        }
    }
    if (tempCount == tempCorrectCount && tempCorrectCount == 13) {
        return true;
    }
    return false;
}

function checkMinePieces() {
    for (var p = 0; p < mineTiles.length; p++) {
        if (mineTiles[p].isBomb) {
            if (getChessPieceIndexAt(mineTiles[p].x, mineTiles[p].y) != -1) {
                if (chessPieces[getChessPieceIndexAt(mineTiles[p].x, mineTiles[p].y)].colour == mineShowState) {
                    return false;
                }
            }
        }
    }
    return true;
}

const MINESHOWSTATE = {
    WHITE: 0,
    BLACK: 1,
    W_TO_B: 2,
    B_TO_W: 3
}

var mineShowState = MINESHOWSTATE.B_TO_W;

var switchTimer = 0;
var switchDelay = 40;

function drawSwitch() {
    ctx.beginPath();
    if (!gameOver && mouseX > 64 && mouseX < 448 && mouseY > 464 && mouseY < 496) {
        switch (mineShowState) {
            case MINESHOWSTATE.WHITE: {
                ctx.fillStyle = "#ff0000";
                if (mouseDown && switchTimer > switchDelay && mouseButton == 1) {
                    switchTimer = 0;
                    mineShowState = MINESHOWSTATE.W_TO_B;
                    selectTimer = selectDelay;
                    selectedIndex = -1;
                    moveToTiles = [];
                }
                break;
            }
            case MINESHOWSTATE.BLACK: {
                ctx.fillStyle = "#ff0000";
                if (mouseDown && switchTimer > switchDelay && mouseButton == 1) {
                    switchTimer = 0;
                    mineShowState = MINESHOWSTATE.B_TO_W;
                    selectTimer = selectDelay;
                    selectedIndex = -1;
                    moveToTiles = [];
                }
                break;
            }
            case MINESHOWSTATE.W_TO_B: {
                ctx.fillStyle = "#000000";
                if (mouseDown && switchTimer > switchDelay && mouseButton == 1) {
                    switchTimer = 0;
                    mineShowState = MINESHOWSTATE.BLACK;
                    chessMoveMade = false;
                }
                break;
            }
            case MINESHOWSTATE.B_TO_W: {
                ctx.fillStyle = "#ffffff";
                if (mouseDown && switchTimer > switchDelay && mouseButton == 1) {
                    switchTimer = 0;
                    mineShowState = MINESHOWSTATE.WHITE;
                    chessMoveMade = false;
                }
                break;
            }
        }
    } else {
        ctx.fillStyle = "#004488";
    }
    ctx.fillRect(64, 464, 384, 32);
}

function main() {
    switch (gameScreen) {
        case SCREENTYPE.NULL_TO_TITLE: {
            gameScreen = SCREENTYPE.TITLE;
            break;
        }
        case SCREENTYPE.TITLE: {
            ctx.beginPath();
            ctx.fillStyle = "#00aeee";
            ctx.fillRect(0, 0, 512, 512);

            ctx.beginPath();
            ctx.fillStyle = "#004488";
            ctx.font = "50px Comic Sans MS";
            ctx.fillText("Chess Sweeper", 50, 80);

            ctx.beginPath();
            ctx.fillStyle = "#004488";
            ctx.fillRect(40 + playButtonShiftX, 140, 110, 40);
            ctx.fillStyle = "#ffffff";
            ctx.font = "30px Comic Sans MS";
            ctx.fillText("LOCAL", 45 + playButtonShiftX, 170);

            if (mouseX > 40 + playButtonShiftX && mouseX < 150 + playButtonShiftX && mouseY > 140 && mouseY < 180) {
                playButtonShiftX += ((20 - playButtonShiftX) / 15) * deltaTime;
                if (mouseDown && mouseButton == 1) {
                    gameScreen = SCREENTYPE.TITLE_TO_LOCAL;
                }
            } else {
                playButtonShiftX += ((0 - playButtonShiftX) / 15) * deltaTime;
            }

            break;
        }
        case SCREENTYPE.TITLE_TO_LOCAL: {
            switchTimer = switchDelay;
            setupChessBoard();
            gameScreen = SCREENTYPE.LOCAL;
            fillMines();
            break;
        }
        case SCREENTYPE.LOCAL: {
            switchTimer += deltaTime;

            ctx.beginPath();
            ctx.fillStyle = "#00aeee";
            ctx.fillRect(0, 0, 512, 512);

            drawBoard();
            drawMines();
            drawSwitch();
            break;
        }
        default: {
            break;
        }
    }
}

var deltaTime = 0;
var deltaCorrect = (1 / 8);
var prevTime = Date.now();
function loop() {
    deltaTime = (Date.now() - prevTime) * deltaCorrect;
    prevTime = Date.now();

    main();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
