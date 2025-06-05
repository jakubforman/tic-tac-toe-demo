document.addEventListener('DOMContentLoaded', () => {
    // ================================
    // Inicializace elementů a proměnných
    // ================================
    const status = document.querySelector('.status'); // Zobrazování táhnoucího hráče
    const reset = document.querySelector('.reset');   // Tlačítko pro novou hru
    const boxes = document.getElementsByClassName('box'); // Herní políčka

    let currentPlayer = 'X';     // Právě táhnoucí hráč (X nebo O)
    let board = Array(9).fill(null); // Uložení aktuálního stavu hrací plochy
    let gameActive = true;       // Zda hra běží

    // ================================
    // Pomocné funkce
    // ================================

    // Změní hráče v UI i proměnné
    function changeUser(user) {
        status.textContent = `Na tahu: ${user}`;
        currentPlayer = user;
    }

    // Zkontroluje, zda někdo vyhrál
    function checkWinner() {
        // Všechny možné vítězné kombinace podle indexů
        const winCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // řádky
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // sloupce
            [0, 4, 8], [2, 4, 6]           // úhlopříčky
        ];

        for (const combo of winCombos) {
            const [a, b, c] = combo;
            if (
                board[a] &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                return board[a]; // Vrátí vítěze ('X' nebo 'O')
            }
        }
        return null; // Nikdo nevyhrál
    }

    // Zkontroluje, zda je remíza
    function checkDraw() {
        return board.every(cell => cell !== null);
    }

    // ================================
    // Hlavní logika po kliknutí na políčko
    // ================================
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].addEventListener('click', () => {
            if (!gameActive || board[i]) return; // Nejde táhnout dál nebo je obsazeno

            // Nastavení a zobrazení tahu
            board[i] = currentPlayer;
            boxes[i].classList.add(currentPlayer === 'X' ? 'cross' : 'circle');

            // Kontrola vítězství
            const winner = checkWinner();
            if (winner) {
                status.textContent = `Vyhrál: ${winner}`;
                gameActive = false;
                return;
            }

            // Kontrola remízy
            if (checkDraw()) {
                status.textContent = 'Remíza!';
                gameActive = false;
                return;
            }

            // Střídání hráčů
            changeUser(currentPlayer === 'X' ? 'O' : 'X');
        });
    }

    // ================================
    // Logika tlačítka pro novou hru
    // ================================
    reset.addEventListener('click', () => {
        // Vyčisti vše do původního stavu
        for (const box of boxes) {
            box.classList.remove('circle', 'cross');
        }
        board = Array(9).fill(null);
        gameActive = true;
        changeUser('X');
    });

    // Init
    changeUser('X');
});