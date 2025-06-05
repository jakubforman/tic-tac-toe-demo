// ===== Global variables for the current window =====
let socket = new WebSocket("ws://localhost:8080"); // create a websocket instance
let mySymbol = null; // holds user symbol
let gameActive = true; // holds game status
let currentPlayer = 'X'; // Currently active player (X or O)
let board = Array(9).fill(null); // Stores the current state of the game board

// Multiplayer code
const multiplayer = (status, boxes) => {
    // Upon connection established
    socket.onopen = () => {
        status.textContent = 'Waiting for opponent...';
    };

    // Get player symbol (first is X, second O)
    socket.onmessage = function (event) {
        let data = event.data; // here the message contains information - specifically the index of the box the user played

        // Setup symbol after joining
        if (data === 'start:X') {
            mySymbol = 'X';
            currentPlayer = 'X';
            status.textContent = 'You are X. Your turn.';
            gameActive = true;
        } else if (data === 'start:O') {
            mySymbol = 'O';
            currentPlayer = 'X';
            status.textContent = 'You are O. Waiting for opponent\'s move.';
            gameActive = false;
        } else if (!isNaN(data)) { // Received a number = opponent's move
            const i = Number(data);
            if (!board[i]) {
                // When a move comes from the opponent, insert opponent's symbol
                board[i] = (mySymbol === 'X') ? 'O' : 'X';
                boxes[i].classList.add(board[i] === 'X' ? 'cross' : 'circle');

                const winner = checkWinner();
                if (winner) {
                    status.textContent = `Winner: ${winner}`;
                    gameActive = false;
                    return;
                }
                if (checkDraw()) {
                    status.textContent = 'Draw!';
                    gameActive = false;
                    return;
                }

                // Set that now it's your turn
                currentPlayer = mySymbol;
                gameActive = true;
                status.textContent = `Your turn! ${mySymbol}`;
            }
        }
    };
}


// ================================
// Helper functions
// ================================

// Check if someone has won
const checkWinner = () => {
    // All possible win combinations by index
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const combo of winCombos) {
        const [a, b, c] = combo;
        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a]; // Returns the winner ('X' or 'O')
        }
    }
    return null; // No winner
}

// Check if it is a draw
const checkDraw = () => {
    return board.every(cell => cell !== null);
}

// ================================
// Main logic after page load
// ================================
document.addEventListener('DOMContentLoaded', () => {
    // ================================
    // Initialization of elements and variables
    // ================================
    const status = document.querySelector('.status'); // Displays current active player
    const reset = document.querySelector('.reset');   // Button for a new game
    const boxes = document.getElementsByClassName('box'); // Game tiles

    // ===== Multiplayer - connect to the server =====
    multiplayer(status, boxes);

    // ================================
    // Main logic after clicking on a field
    // ================================
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].addEventListener('click', () => {
            if (!gameActive || board[i] || mySymbol !== currentPlayer) return;

            // Set and display the move
            board[i] = currentPlayer;
            boxes[i].classList.add(currentPlayer === 'X' ? 'cross' : 'circle');
            socket.send(i); // SEND the move to the opponent - information about the box

            // Check for winner
            const winner = checkWinner();
            if (winner) {
                status.textContent = `Winner: ${winner}`;
                gameActive = false;
                return;
            }

            // Check for draw
            if (checkDraw()) {
                status.textContent = 'Draw!';
                gameActive = false;
                return;
            }

            // After your move, wait for opponent
            status.textContent = `Waiting for opponent's move...`;
            gameActive = false; // disables moves for the player
        });
    }

    // ================================
    // New game button logic
    // ================================
    reset.addEventListener('click', () => {
        // Reset everything to initial state
        for (const box of boxes) {
            box.classList.remove('circle', 'cross');
        }

        // reset
        board = Array(9).fill(null);
        gameActive = false;

        // TODO: send WS message to server and clear both players' game
    });
});