const GRID_SIZE = 5;
const CENTER = Math.floor(GRID_SIZE / 2);
const CHALLENGES = [
  [{ type: 'red-shuttle', row: 4, col: 2 }, { type: 'orange-bot', row: 1, col: 2 }],
  [{ type: 'red-shuttle', row: 4, col: 3 }, { type: 'orange-bot', row: 2, col: 1 }, { type: 'yellow-bot', row: 1, col: 3 }],
  [{ type: 'red-shuttle', row: 4, col: 2 }, { type: 'orange-bot', row: 0, col: 2 }, { type: 'yellow-bot', row: 2, col: 4 }, { type: 'green-bot', row: 2, col: 1 }],
  [{ type: 'red-shuttle', row: 4, col: 4 }, { type: 'yellow-bot', row: 1, col: 0 }, { type: 'green-bot', row: 1, col: 4 }, { type: 'blue-bot', row: 3, col: 1 }]
  [{ type: 'red-shuttle', row: 4, col: 0 }, { type: 'orange-bot', row: 0, col: 2 }, { type: 'yellow-bot', row: 1, col: 4 }, { type: 'green-bot', row: 3, col: 1 }, { type: 'blue-bot', row: 4, col: 3 }],
];
let currentChallenge = 0;
let explorers = JSON.parse(JSON.stringify(CHALLENGES[currentChallenge]));
let selectedExplorer = null;
let moveHistory = [];

function initGame() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  document.getElementById('win-message').innerHTML = '';
  document.getElementById('challenge-number').innerHTML = `${currentChallenge + 1}/${CHALLENGES.length}`;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (row === CENTER && col === CENTER) {
        cell.classList.add('center');
      }
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => handleCellClick(row, col));
      grid.appendChild(cell);
    }
  }

  moveHistory = [JSON.parse(JSON.stringify(explorers))];
  renderExplorers();

  const mode = localStorage.getItem('mode');
  if (mode === 'light') {
    document.body.classList.remove('dark-mode');
    document.getElementById('mode-toggle').textContent = '🌙';
  }
}

function renderExplorers() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.innerHTML = '';
    cell.classList.remove('red-shuttle', 'orange-bot', 'yellow-bot', 'green-bot', 'blue-bot', 'purple-bot', 'selected', 'arrow');
  });

  explorers.forEach((explorer, index) => {
    const cell = document.querySelector(`.cell[data-row="${explorer.row}"][data-col="${explorer.col}"]`);
    if (cell) {
      // Assign letters based on piece type
      switch (explorer.type) {
        case 'red-shuttle': cell.innerHTML = 'S'; break;
        case 'orange-bot': cell.innerHTML = 'O'; break;
        case 'yellow-bot': cell.innerHTML = 'Y'; break;
        case 'green-bot': cell.innerHTML = 'G'; break;
        case 'blue-bot': cell.innerHTML = 'B'; break;
        case 'purple-bot': cell.innerHTML = 'P'; break;
      }
      cell.classList.add(explorer.type);
      if (selectedExplorer === index) {
        cell.classList.add('selected');
      }
    }
  });

  checkWin();
  if (selectedExplorer !== null) {
    showLegalMoveArrows(explorers[selectedExplorer]);
  }
}

function showLegalMoveArrows(explorer) {
  const { row, col } = explorer;
  const isOccupied = (r, c) => explorers.some(e => e.row === r && e.col === c && e !== explorer);

  if (explorers.some(e => e.col === col && e.row < row && e !== explorer)) {
    const upCell = document.querySelector(`.cell[data-row="${row - 1}"][data-col="${col}"]`);
    if (upCell && !isOccupied(row - 1, col)) upCell.innerHTML = '↑';
  }

  if (explorers.some(e => e.col === col && e.row > row && e !== explorer)) {
    const downCell = document.querySelector(`.cell[data-row="${row + 1}"][data-col="${col}"]`);
    if (downCell && !isOccupied(row + 1, col)) downCell.innerHTML = '↓';
  }

  if (explorers.some(e => e.row === row && e.col < col && e !== explorer)) {
    const leftCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col - 1}"]`);
    if (leftCell && !isOccupied(row, col - 1)) leftCell.innerHTML = '←';
  }

  if (explorers.some(e => e.row === row && e.col > col && e !== explorer)) {
    const rightCell = document.querySelector(`.cell[data-row="${row}"][data-col="${col + 1}"]`);
    if (rightCell && !isOccupied(row, col + 1)) rightCell.innerHTML = '→';
  }
}

function handleCellClick(row, col) {
  const explorerIndex = explorers.findIndex(e => e.row === row && e.col === col);

  if (selectedExplorer === null) {
    if (explorerIndex !== -1) {
      selectedExplorer = explorerIndex;
      renderExplorers();
    }
  } else {
    if (explorerIndex !== -1) {
      selectedExplorer = explorerIndex;
      renderExplorers();
    } else {
      moveExplorer(row, col);
      selectedExplorer = null;
      moveHistory.push(JSON.parse(JSON.stringify(explorers)));
      renderExplorers();
    }
  }
}

function moveExplorer(targetRow, targetCol) {
  const explorer = explorers[selectedExplorer];
  const currentRow = explorer.row;
  const currentCol = explorer.col;

  if (targetRow === currentRow) {
    const direction = targetCol > currentCol ? 'right' : 'left';
    const blockers = explorers.filter(e =>
      e.row === currentRow &&
      (direction === 'right' ? e.col > currentCol : e.col < currentCol) &&
      e !== explorer
    );
    const targetExplorer = direction === 'right'
      ? blockers.reduce((min, e) => e.col < min.col ? e : min, blockers[0])
      : blockers.reduce((max, e) => e.col > max.col ? e : max, blockers[0]);
    if (targetExplorer) {
      explorer.col = direction === 'right' ? targetExplorer.col - 1 : targetExplorer.col + 1;
      console.log(`Moved ${explorer.type} to (${explorer.row}, ${explorer.col})`);
    }
  } else if (targetCol === currentCol) {
    const direction = targetRow > currentRow ? 'down' : 'up';
    const blockers = explorers.filter(e =>
      e.col === currentCol &&
      (direction === 'down' ? e.row > currentRow : e.row < currentRow) &&
      e !== explorer
    );
    const targetExplorer = direction === 'down'
      ? blockers.reduce((min, e) => e.row < min.row ? e : min, blockers[0])
      : blockers.reduce((max, e) => e.row > max.row ? e : max, blockers[0]);
    if (targetExplorer) {
      explorer.row = direction === 'down' ? targetExplorer.row - 1 : targetExplorer.row + 1;
      console.log(`Moved ${explorer.type} to (${explorer.row}, ${explorer.col})`);
    }
  }

  if (explorer.row < 0) explorer.row = 0;
  if (explorer.row >= GRID_SIZE) explorer.row = GRID_SIZE - 1;
  if (explorer.col < 0) explorer.col = 0;
  if (explorer.col >= GRID_SIZE) explorer.col = GRID_SIZE - 1;
}

function checkWin() {
  const shuttle = explorers.find(e => e.type === 'red-shuttle');
  console.log(`Shuttle position: (${shuttle.row}, ${shuttle.col})`);
  if (shuttle.row === CENTER && shuttle.col === CENTER) {
    document.getElementById('win-message').innerHTML = 'You win!';
  }
}

function undoMove() {
  if (moveHistory.length > 1) {
    moveHistory.pop();
    explorers = JSON.parse(JSON.stringify(moveHistory[moveHistory.length - 1]));
    renderExplorers();
  }
}

function toggleMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  document.getElementById('mode-toggle').textContent = isDarkMode ? '☀' : '🌙';
  localStorage.setItem('mode', isDarkMode ? 'dark' : 'light');
}

function toggleInstructions() {
  const instructions = document.getElementById('instructions');
  const link = document.getElementById('show-instructions');
  if (instructions.style.display === 'none') {
    instructions.style.display = 'block';
    link.textContent = 'Hide Instructions';
  } else {
    instructions.style.display = 'none';
    link.textContent = 'Show Instructions';
  }
}

function setupControls() {
  document.getElementById('prev-challenge').addEventListener('click', () => {
    currentChallenge = (currentChallenge - 1 + CHALLENGES.length) % CHALLENGES.length;
    resetChallenge();
  });
  document.getElementById('next-challenge').addEventListener('click', () => {
    currentChallenge = (currentChallenge + 1) % CHALLENGES.length;
    resetChallenge();
  });
  document.getElementById('reset').addEventListener('click', resetChallenge);
  document.getElementById('undo').addEventListener('click', undoMove);
  document.getElementById('mode-toggle').addEventListener('click', toggleMode);
  document.getElementById('show-instructions').addEventListener('click', (e) => {
    e.preventDefault();
    toggleInstructions();
  });
}

function resetChallenge() {
  explorers = JSON.parse(JSON.stringify(CHALLENGES[currentChallenge]));
  selectedExplorer = null;
  moveHistory = [];
  initGame();
}

setupControls();
initGame();