const ROWS = 18;
const COLS = 10;
const MIN_GROUP = 3;
const COLORS = ["#ff6f6f", "#ffd166", "#06d6a0", "#118ab2", "#c77dff"];

let board = [];
let activePiece = null;
let nextPiece = null;
let dropInterval = 900;
let tickInterval = null;
let timerInterval = null;
let running = false;
let paused = false;
let score = 0;
let level = 1;
let combo = 0;
let secondsElapsed = 0;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const comboEl = document.getElementById("combo");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const previewEl = document.getElementById("next-piece");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const dropBtn = document.getElementById("drop-btn");

function init() {
  boardEl.style.setProperty("--rows", ROWS);
  boardEl.style.setProperty("--cols", COLS);
  createBoardCells();
  createPreviewCells();
  bindEvents();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  dropBtn.disabled = true;
  updateMessage("새 게임 버튼을 눌러 시작하세요.");
}

function createBoardCells() {
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = r;
      cell.dataset.col = c;
      boardEl.appendChild(cell);
    }
  }
}

function createPreviewCells() {
  previewEl.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const cell = document.createElement("div");
    cell.className = "preview-cell";
    previewEl.appendChild(cell);
  }
}

function bindEvents() {
  document.addEventListener("keydown", (event) => {
    if (!running || paused) return;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        movePiece(-1, 0);
        break;
      case "ArrowRight":
        event.preventDefault();
        movePiece(1, 0);
        break;
      case "ArrowDown":
        event.preventDefault();
        movePiece(0, 1);
        break;
      case " ":
      case "Spacebar":
        event.preventDefault();
        rotatePiece();
        break;
    }
  });

  startBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", togglePause);
  dropBtn.addEventListener("click", hardDrop);
}

function resetState() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  activePiece = null;
  nextPiece = generatePiece();
  dropInterval = 900;
  score = 0;
  level = 1;
  combo = 0;
  secondsElapsed = 0;
  updateStats();
  render();
}

function startGame() {
  resetState();
  running = true;
  paused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "일시 정지";
  dropBtn.disabled = false;
  updateMessage("Q플레이가 시작되었습니다!");
  spawnPiece();
  restartDropTimer();
  startTimer();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed += 1;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function restartDropTimer() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = setInterval(gameTick, dropInterval);
}

function stopAllTimers() {
  clearInterval(tickInterval);
  clearInterval(timerInterval);
  tickInterval = null;
  timerInterval = null;
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    stopAllTimers();
    updateMessage("일시 정지 중입니다. 다시 시작하려면 버튼을 누르세요.");
    pauseBtn.textContent = "재개";
  } else {
    restartDropTimer();
    startTimer();
    updateMessage("재개되었습니다. 콤보를 노려보세요!");
    pauseBtn.textContent = "일시 정지";
  }
}

function hardDrop() {
  if (!running || paused || !activePiece) return;
  while (movePiece(0, 1)) {
    score += 1;
  }
  updateSpeed();
  updateStats();
}

function generatePiece() {
  const column = Math.floor(COLS / 2);
  const [colorA, colorB] = [randomColor(), randomColor()];
  return {
    blocks: [
      { row: -1, col: column, color: colorA },
      { row: -2, col: column, color: colorB },
    ],
  };
}

function spawnPiece() {
  activePiece = nextPiece || generatePiece();
  nextPiece = generatePiece();
  updatePreview();
  if (!canOccupy(activePiece.blocks)) {
    gameOver();
  } else {
    render();
  }
}

function canOccupy(blocks) {
  return blocks.every((block) => {
    if (block.col < 0 || block.col >= COLS) return false;
    if (block.row >= ROWS) return false;
    if (block.row >= 0 && board[block.row][block.col]) return false;
    return true;
  });
}

function movePiece(dx, dy) {
  if (!activePiece) return false;
  const moved = activePiece.blocks.map((block) => ({
    ...block,
    row: block.row + dy,
    col: block.col + dx,
  }));
  if (canOccupy(moved)) {
    activePiece.blocks = moved;
    render();
    return true;
  }
  if (dy === 1) {
    lockPiece();
  }
  return false;
}

function rotatePiece() {
  if (!activePiece) return;
  const [first, second] = activePiece.blocks;
  [first.color, second.color] = [second.color, first.color];
  render();
}

function gameTick() {
  if (!running || paused) return;
  movePiece(0, 1);
}

function lockPiece() {
  let reachedTop = false;
  activePiece.blocks.forEach((block) => {
    if (block.row < 0) {
      reachedTop = true;
      return;
    }
    board[block.row][block.col] = { color: block.color };
  });
  activePiece = null;
  if (reachedTop) {
    gameOver();
    return;
  }
  resolveBoard();
  if (running) {
    spawnPiece();
  }
}

function resolveBoard() {
  let chain = 0;
  let removedBlocks = 0;
  while (true) {
    const matches = findMatches();
    if (matches.length === 0) break;
    chain += 1;
    matches.forEach(([r, c]) => {
      removedBlocks += 1;
      board[r][c] = null;
    });
    applyGravity();
  }
  if (chain > 0) {
    combo = chain;
    const gained = removedBlocks * 15 * chain;
    score += gained;
    updateSpeed();
    updateStats();
    updateMessage(`${chain}연쇄! ${gained.toLocaleString()}점 획득`);
  } else {
    combo = 0;
    updateStats();
  }
  render();
}

function findMatches() {
  const toRemove = [];
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c] || visited[r][c]) continue;
      const color = board[r][c].color;
      const queue = [[r, c]];
      const cluster = [];
      visited[r][c] = true;
      while (queue.length) {
        const [cr, cc] = queue.shift();
        cluster.push([cr, cc]);
        directions.forEach(([dr, dc]) => {
          const nr = cr + dr;
          const nc = cc + dc;
          if (
            nr >= 0 &&
            nr < ROWS &&
            nc >= 0 &&
            nc < COLS &&
            !visited[nr][nc] &&
            board[nr][nc] &&
            board[nr][nc].color === color
          ) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        });
      }
      if (cluster.length >= MIN_GROUP) {
        toRemove.push(...cluster);
      }
    }
  }
  return toRemove;
}

function applyGravity() {
  for (let c = 0; c < COLS; c++) {
    const column = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c]) {
        column.push(board[r][c]);
      }
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      board[r][c] = column.shift() || null;
    }
  }
}

function updateSpeed() {
  const newLevel = Math.floor(score / 800) + 1;
  if (newLevel !== level) {
    level = newLevel;
    dropInterval = Math.max(200, 900 - (level - 1) * 70);
    if (!paused) restartDropTimer();
  }
}

function updateStats() {
  scoreEl.textContent = score.toLocaleString();
  levelEl.textContent = level;
  comboEl.textContent = combo;
  timerEl.textContent = formatTime(secondsElapsed);
}

function updateMessage(text) {
  messageEl.textContent = text;
}

function updatePreview() {
  const cells = previewEl.querySelectorAll(".preview-cell");
  cells.forEach((cell) => {
    cell.classList.remove("filled");
    cell.style.setProperty("--color", "transparent");
  });
  nextPiece.blocks.forEach((block, index) => {
    const cell = cells[index];
    if (!cell) return;
    cell.classList.add("filled");
    cell.style.setProperty("--color", block.color);
  });
}

function render() {
  const cells = boardEl.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.classList.remove("filled", "active");
    cell.style.removeProperty("--color");
  });
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const value = board[r][c];
      if (!value) continue;
      const cell = getCell(r, c);
      cell.classList.add("filled");
      cell.style.setProperty("--color", value.color);
    }
  }
  if (activePiece) {
    activePiece.blocks.forEach((block) => {
      if (block.row < 0) return;
      const cell = getCell(block.row, block.col);
      cell.classList.add("filled", "active");
      cell.style.setProperty("--color", block.color);
    });
  }
}

function getCell(row, col) {
  return boardEl.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function gameOver() {
  running = false;
  paused = false;
  stopAllTimers();
  pauseBtn.disabled = true;
  dropBtn.disabled = true;
  startBtn.disabled = false;
  pauseBtn.textContent = "일시 정지";
  updateMessage("게임 오버! 다시 도전해 보세요.");
}

init();
