const SIZE = 4;
let grid, score, best;

function init() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  score = 0;
  addTile();
  addTile();
  document.getElementById('overlay').style.display = 'none';
  render();
}

function addTile() {
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (grid[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slideRow(row) {
  const tiles = row.filter(v => v);
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] === tiles[i + 1]) {
      tiles[i] *= 2;
      score += tiles[i];
      tiles.splice(i + 1, 1);
    }
  }
  while (tiles.length < SIZE) tiles.push(0);
  return tiles;
}

function move(dir) {
  const snapshot = JSON.stringify(grid);

  if (dir === 'left') {
    grid = grid.map(r => slideRow([...r]));
  } else if (dir === 'right') {
    grid = grid.map(r => slideRow([...r].reverse()).reverse());
  } else if (dir === 'up') {
    for (let c = 0; c < SIZE; c++) {
      const col = slideRow(grid.map(r => r[c]));
      col.forEach((v, r) => (grid[r][c] = v));
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const col = slideRow(grid.map(r => r[c]).reverse()).reverse();
      col.forEach((v, r) => (grid[r][c] = v));
    }
  }

  if (JSON.stringify(grid) !== snapshot) addTile();
  if (score > best) best = score;
  render();

  if (grid.flat().includes(2048)) return showMessage('You win! 🎉');
  if (!canMove()) showMessage('Game over!');
}

function canMove() {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) return true;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  return false;
}

function render() {
  document.getElementById('score').textContent = score;
  document.getElementById('best').textContent = best;
  const board = document.getElementById('board');
  board.innerHTML = '';
  grid.flat().forEach(val => {
    const tile = document.createElement('div');
    tile.className = `tile${val ? ` tile-${val}` : ''}`;
    tile.textContent = val || '';
    board.appendChild(tile);
  });
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
  document.getElementById('overlay').style.display = 'flex';
}

// Keyboard controls
document.addEventListener('keydown', e => {
  const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  if (map[e.key]) { e.preventDefault(); move(map[e.key]); }
});

// Touch / swipe controls
let touchStart = null;
document.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
document.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  touchStart = null;
});

document.getElementById('new-game').addEventListener('click', init);
document.getElementById('play-again').addEventListener('click', init);

best = 0;
init();
