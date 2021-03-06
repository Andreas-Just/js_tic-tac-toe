'use strict';

let origBoard;
let huPlayer;
const aiPlayer = 'O';
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2],
];

const container = document.querySelector('.container');
const cells = container.querySelectorAll('.container__cell');
const endgame = container.querySelector('.container__message');
const startBtn = container.querySelector('.container__btn--bottom');
const chooseGameTypeBtn = container.querySelector('.container__inner');
let flag;

startBtn.addEventListener('click', startGame);

function startGame() {
  huPlayer = 'X';
  startBtn.textContent = 'restart';
  startBtn.setAttribute('disabled', 'true');
  chooseGameTypeBtn.addEventListener('click', chooseGameType);
  displayMessage('Choose the type of game: one or two players.');
  origBoard = [...Array(9).keys()];

  cells.forEach((_, index) => {
    cells[index].innerText = '';
    cells[index].style = '';
    cells[index].removeEventListener('click', turnClick);
  });

  [...chooseGameTypeBtn.children].forEach(btn => {
    btn.style = '';
    btn.removeAttribute('disabled');
  });
}

const chooseGameType = (click) => {
  choosePlayer(click);
  endgame.style.display = 'none';
  startBtn.removeAttribute('disabled');

  cells.forEach((_, index) => {
    cells[index].addEventListener('click', turnClick);
    cells[index].style.cursor = 'url("../images/pencil.cur"), pointer';
  });
};

const turnClick = cell => {
  if (typeof origBoard[cell.target.id] === 'number') {
    turn(cell.target.id, huPlayer);

    if (!checkTie()) {
      if (flag) {
        turn(bestSpot(), aiPlayer);
      } else {
        huPlayer = huPlayer === 'O' ? 'X' : 'O';
      }
    }
  }
};

const turn = (cellId, player) => {
  origBoard[cellId] = player;
  document.getElementById(cellId).innerText = player;

  const gameWon = checkWin(origBoard, player);

  if (gameWon) {
    gameOver(gameWon);
  }
};

const checkWin = (board, player) => {
  const plays = board.reduce((arr, click, cell) => (
    click === player ? arr.concat(cell) : arr
  ), []);
  let gameWon = null;

  for (const [index, win] of winCombos.entries()) {
    if (win.every(elem => plays.includes(elem))) {
      gameWon = {
        index: index,
        player: player,
      };
      break;
    }
  }

  return gameWon;
};

const checkTie = () => {
  if (emptySquares().length === 0) {
    if (endgame.style.display === 'none') {
      cells.forEach((_, index) => {
        cells[index].style.color = 'green';
        cells[index].removeEventListener('click', turnClick);
      });

      displayMessage('Tie Game!');
    } else {
      cells.forEach((_, index) => {
        cells[index].removeEventListener('click', turnClick);
      });
    }

    return true;
  }

  return false;
};

const gameOver = gameWon => {
  winCombos[gameWon.index].forEach(item => {
    document.getElementById(item)
      .style.color = gameWon.player === huPlayer ? 'blue' : 'red';
  });

  cells.forEach((_, index) => {
    cells[index].removeEventListener('click', turnClick);
  });

  if (flag) {
    displayMessage(gameWon.player === huPlayer ? 'You win!' : 'You lose.');
  } else {
    displayMessage(`Player "${gameWon.player}" won!`);
  }
};

const choosePlayer = (click) => {
  const onePlayer = click.target.closest('.container__btn--left');
  const twoPlayers = click.target.closest('.container__btn--right');

  if (onePlayer) {
    onePlayer.setAttribute('disabled', 'true');
    onePlayer.nextElementSibling.style.display = 'none';
    onePlayer.style.borderTopRightRadius = '20px';
    flag = true;
  } else {
    twoPlayers.setAttribute('disabled', 'true');
    twoPlayers.previousElementSibling.style.display = 'none';
    twoPlayers.style.borderTopLeftRadius = '20px';
    flag = false;
  }
};

const displayMessage = who => {
  endgame.style.display = 'block';
  endgame.children[0].innerText = who;
};

const emptySquares = () => origBoard.filter(s => typeof s === 'number');

/**  @Version_with_random_bot_move
 const randomArr = arr => {
  let randomInt = Math.floor(Math.random() * emptySquares().length);

  return arr[randomInt];
}

 const randomSpot =_=> randomArr( emptySquares() );
 */

const bestSpot = () => minimax(origBoard, aiPlayer).index;

const minimax = (newBoard, player) => {
  const availSpots = emptySquares();

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};

    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;

    if (player === aiPlayer) {
      move.score = minimax(newBoard, huPlayer).score;
    } else {
      move.score = minimax(newBoard, aiPlayer).score;
    }

    newBoard[availSpots[i]] = move.index;
    moves.push(move);
  }

  let bestMove;

  if (player === aiPlayer) {
    let bestScore = -10000;

    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;

    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
};
