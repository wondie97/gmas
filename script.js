const canvasLeft = document.getElementById("scene-left");
const canvasRight = document.getElementById("scene-right");
const ctxLeft = canvasLeft.getContext("2d");
const ctxRight = canvasRight.getContext("2d");

const timerEl = document.getElementById("timer");
const foundEl = document.getElementById("found-count");
const levelTitleEl = document.getElementById("level-title");
const levelDescEl = document.getElementById("level-desc");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("event-log");
const playerListEl = document.getElementById("player-list");
const hintBtn = document.getElementById("hint-btn");
const resetBtn = document.getElementById("reset-btn");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");

const COLORS = {
  hint: "#ffd166",
  success: "#59ffa6"
};

const LEVELS = [
  {
    id: "market",
    title: "주말 마켓",
    description: "도심 야시장 부스에서 조명과 장식을 유심히 살펴보세요.",
    timeLimit: 150,
    differences: [
      { id: "crate", x: 130, y: 215, radius: 28, hint: "왼쪽 상단 과일 상자" },
      { id: "awning", x: 250, y: 95, radius: 30, hint: "캐노피 줄무늬" },
      { id: "flag", x: 380, y: 55, radius: 24, hint: "깃발 장식" },
      { id: "sign", x: 340, y: 255, radius: 32, hint: "판매대 간판" },
      { id: "bench", x: 420, y: 200, radius: 26, hint: "오른쪽 벤치" }
    ],
    draw(ctx, side) {
      const variant = side === "right";
      const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      grad.addColorStop(0, "#1d2244");
      grad.addColorStop(1, "#090b18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = "#141835";
      ctx.fillRect(0, 220, ctx.canvas.width, 120);
      ctx.fillStyle = "#262b55";
      ctx.fillRect(0, 230, ctx.canvas.width, 90);

      // Stall base
      ctx.fillStyle = "#1b9aaa";
      ctx.fillRect(50, 130, 300, 120);
      ctx.fillStyle = variant ? "#f063a4" : "#ffd25a";
      ctx.fillRect(70, 150, 120, 100);

      // Fruit crate (difference: cloth color)
      ctx.fillStyle = variant ? "#7b4bff" : "#f4a261";
      ctx.fillRect(90, 200, 80, 60);
      ctx.fillStyle = variant ? "#f4a261" : "#7b4bff";
      ctx.fillRect(100, 210, 60, 20);

      // Awning stripes
      ctx.fillStyle = "#ee4266";
      ctx.fillRect(180, 80, 200, 30);
      ctx.fillStyle = variant ? "#f3d34a" : "#50b2c0";
      ctx.fillRect(180, 110, 200, 40);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < 4; i++) {
        if (variant && i === 2) continue;
        ctx.fillRect(180 + i * 50, 80, 20, 70);
      }

      // Hanging lamps (difference: missing lamp)
      ctx.fillStyle = variant ? "#f5d547" : "#f5ff8f";
      ctx.beginPath();
      ctx.arc(240, 65, variant ? 12 : 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(320, 65, 14, 0, Math.PI * 2);
      ctx.fill();

      // Flags
      ctx.fillStyle = variant ? "#ff9a8b" : "#8bffd6";
      ctx.beginPath();
      ctx.moveTo(360, 30);
      ctx.lineTo(400, 60);
      ctx.lineTo(360, 60);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = variant ? "#8bffd6" : "#ff9a8b";
      ctx.beginPath();
      ctx.moveTo(400, 40);
      ctx.lineTo(440, 70);
      ctx.lineTo(400, 70);
      ctx.closePath();
      ctx.fill();

      // Sign board difference
      ctx.fillStyle = "#1f2042";
      ctx.fillRect(300, 220, 140, 80);
      ctx.fillStyle = variant ? "#ff8e72" : "#6ef2ff";
      ctx.font = "bold 28px 'Pretendard', 'Noto Sans KR'";
      ctx.textAlign = "center";
      ctx.fillText(variant ? "SALE" : "QPLAY", 370, 265);

      // Bench difference
      ctx.fillStyle = "#403d56";
      ctx.fillRect(400, 210, 120, variant ? 12 : 20);
      ctx.fillStyle = "#1f1c2c";
      ctx.fillRect(405, 222, 110, variant ? 12 : 8);
    }
  },
  {
    id: "shore",
    title: "새벽 바닷가",
    description: "파도, 보트, 갈매기를 눈여겨보세요.",
    timeLimit: 135,
    differences: [
      { id: "sun", x: 110, y: 70, radius: 32, hint: "태양 주변" },
      { id: "wave", x: 220, y: 210, radius: 30, hint: "큰 파도" },
      { id: "boat", x: 360, y: 200, radius: 34, hint: "보트 돛" },
      { id: "bird", x: 280, y: 90, radius: 24, hint: "갈매기" },
      { id: "buoy", x: 430, y: 260, radius: 24, hint: "부표" }
    ],
    draw(ctx, side) {
      const variant = side === "right";
      const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      grad.addColorStop(0, "#1a2a6c");
      grad.addColorStop(1, "#16213e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Sun difference
      ctx.fillStyle = variant ? "#ffd166" : "#f6f740";
      ctx.beginPath();
      ctx.arc(100, 70, variant ? 38 : 32, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(200, 90, 35, 0, Math.PI * 2);
      ctx.arc(235, 80, 30, 0, Math.PI * 2);
      ctx.arc(270, 95, 28, 0, Math.PI * 2);
      ctx.fill();

      // Sea gradient
      const sea = ctx.createLinearGradient(0, 140, 0, 320);
      sea.addColorStop(0, "#243b55");
      sea.addColorStop(1, "#141e30");
      ctx.fillStyle = sea;
      ctx.fillRect(0, 140, ctx.canvas.width, 200);

      // Waves
      ctx.strokeStyle = variant ? "#6ef2ff" : "#a0ffe6";
      ctx.lineWidth = variant ? 6 : 4;
      ctx.beginPath();
      for (let x = 0; x < 480; x += 40) {
        ctx.quadraticCurveTo(x + 20, 190, x + 40, 210);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < 480; x += 40) {
        ctx.quadraticCurveTo(x + 20, 230, x + 40, 250);
      }
      ctx.stroke();

      // Boat difference
      ctx.fillStyle = "#ef476f";
      ctx.beginPath();
      ctx.moveTo(300, 220);
      ctx.lineTo(400, 220);
      ctx.lineTo(380, 260);
      ctx.lineTo(320, 260);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = variant ? "#ffd166" : "#06d6a0";
      ctx.beginPath();
      ctx.moveTo(340, 220);
      ctx.lineTo(340, 160);
      ctx.lineTo(380, 210);
      ctx.closePath();
      ctx.fill();

      // Bird difference
      ctx.strokeStyle = variant ? "#ffd166" : "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(260, 100);
      ctx.quadraticCurveTo(280, 80, 300, 100);
      ctx.moveTo(300, 100);
      ctx.quadraticCurveTo(320, 80, 340, 100);
      ctx.stroke();

      // Buoy difference
      ctx.fillStyle = variant ? "#ff6bd6" : "#59ffa6";
      ctx.beginPath();
      ctx.arc(420, 260, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(415, 240, 10, 20);
    }
  },
  {
    id: "arcade",
    title: "Q플레이 아케이드",
    description: "기계 패널과 조명 색이 조금씩 달라졌어요.",
    timeLimit: 150,
    differences: [
      { id: "screen", x: 160, y: 140, radius: 36, hint: "왼쪽 아케이드 화면" },
      { id: "joystick", x: 90, y: 230, radius: 26, hint: "조이스틱" },
      { id: "neon", x: 360, y: 70, radius: 30, hint: "네온 사인" },
      { id: "floor", x: 300, y: 260, radius: 34, hint: "바닥 조명" },
      { id: "poster", x: 420, y: 160, radius: 28, hint: "포스터" }
    ],
    draw(ctx, side) {
      const variant = side === "right";
      const grad = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
      grad.addColorStop(0, "#1c1c2a");
      grad.addColorStop(1, "#090612");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Floor grid
      ctx.strokeStyle = "rgba(110, 242, 255, 0.3)";
      for (let y = 200; y < 320; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(480, y);
        ctx.stroke();
      }
      for (let x = 0; x < 480; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 200);
        ctx.lineTo(x, 320);
        ctx.stroke();
      }

      // Left arcade cabinet
      ctx.fillStyle = "#3a0ca3";
      ctx.fillRect(60, 80, 160, 200);
      ctx.fillStyle = variant ? "#ff9f1c" : "#4cc9f0";
      ctx.fillRect(80, 110, 120, 90);
      ctx.fillStyle = "#1f1a38";
      ctx.fillRect(80, 200, 120, 60);

      ctx.fillStyle = variant ? "#ff4d6d" : "#59ffa6";
      ctx.beginPath();
      ctx.arc(100, 240, variant ? 10 : 14, 0, Math.PI * 2);
      ctx.fill();

      // Right arcade cabinet
      ctx.fillStyle = "#f72585";
      ctx.fillRect(260, 60, 180, 220);
      ctx.fillStyle = variant ? "#6ef2ff" : "#ffd166";
      ctx.fillRect(280, 90, 140, 110);

      // Neon sign difference
      ctx.strokeStyle = variant ? "#ff6bd6" : "#6ef2ff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(340, 60);
      ctx.lineTo(420, 60);
      ctx.arc(420, 80, 20, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(340, 100);
      ctx.stroke();

      // Poster difference
      ctx.fillStyle = "#1f2a44";
      ctx.fillRect(400, 120, 60, 120);
      ctx.fillStyle = variant ? "#59ffa6" : "#ff8e72";
      ctx.font = "bold 18px 'Pretendard', 'Noto Sans KR'";
      ctx.textAlign = "center";
      ctx.fillText(variant ? "VS" : "Q!", 430, 190);

      // Floor light difference
      const floorGrad = ctx.createRadialGradient(300, 260, 10, 300, 260, 120);
      floorGrad.addColorStop(0, variant ? "rgba(255,109,214,0.9)" : "rgba(110,242,255,0.9)");
      floorGrad.addColorStop(1, "transparent");
      ctx.fillStyle = floorGrad;
      ctx.beginPath();
      ctx.arc(300, 260, 80, 0, Math.PI * 2);
      ctx.fill();
    }
  }
];

const state = {
  levelIndex: 0,
  roundActive: false,
  timeLeft: 0,
  timerId: null,
  found: new Set(),
  hintsUsed: 0,
  hintTargetId: null,
  activePlayerId: null
};

const players = [];

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function setStatus(text) {
  statusEl.textContent = text;
}

function logEvent(message) {
  const item = document.createElement("li");
  item.textContent = message;
  const time = document.createElement("time");
  time.dateTime = new Date().toISOString();
  time.textContent = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  item.appendChild(time);
  logEl.prepend(item);
  while (logEl.children.length > 40) {
    logEl.removeChild(logEl.lastChild);
  }
}

function renderPlayers() {
  playerListEl.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = `player-card${
      player.id === state.activePlayerId ? " active" : ""
    }`;
    button.innerHTML = `
      <span class="name">${player.name}</span>
      <span class="score">${player.score} pts</span>
    `;
    button.addEventListener("click", () => {
      state.activePlayerId = player.id;
      renderPlayers();
      setStatus(`${player.name} 차례!`);
    });
    li.appendChild(button);
    playerListEl.appendChild(li);
  });
}

function addPlayer(name) {
  const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
  players.push({ id, name, score: 0 });
  if (!state.activePlayerId) {
    state.activePlayerId = id;
  }
  renderPlayers();
  logEvent(`${name} 님이 참가했습니다.`);
}

function updateFoundCount() {
  const total = LEVELS[state.levelIndex].differences.length;
  foundEl.textContent = `${state.found.size} / ${total}`;
}

function renderScene() {
  const level = LEVELS[state.levelIndex];
  level.draw(ctxLeft, "left");
  level.draw(ctxRight, "right");
  renderHighlights();
}

function renderHighlights() {
  const level = LEVELS[state.levelIndex];
  const drawRing = (ctx, diff, isHint) => {
    ctx.save();
    ctx.strokeStyle = isHint ? COLORS.hint : COLORS.success;
    ctx.lineWidth = isHint ? 5 : 4;
    ctx.setLineDash(isHint ? [10, 6] : []);
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  level.differences.forEach((diff) => {
    if (state.found.has(diff.id)) {
      drawRing(ctxLeft, diff, false);
      drawRing(ctxRight, diff, false);
    } else if (state.hintTargetId === diff.id) {
      drawRing(ctxLeft, diff, true);
      drawRing(ctxRight, diff, true);
    }
  });
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(state.timeLeft);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer(duration) {
  stopTimer();
  state.timeLeft = duration;
  updateTimerDisplay();
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    updateTimerDisplay();
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateTimerDisplay();
      endRound("시간 종료! 다음 라운드를 시도해 보세요.");
    }
  }, 1000);
}

function awardPoints(diffId) {
  if (!state.activePlayerId) return;
  const player = players.find((p) => p.id === state.activePlayerId);
  if (!player) return;
  const base = 120;
  const bonus = Math.max(0, Math.floor(state.timeLeft / 5));
  player.score += base + bonus;
  renderPlayers();
  logEvent(`${player.name} 님이 차이를 발견했습니다! (+${base + bonus}점)`);
}

function applyHintPenalty() {
  if (!state.activePlayerId) return;
  const player = players.find((p) => p.id === state.activePlayerId);
  if (!player) return;
  player.score = Math.max(0, player.score - 40);
  renderPlayers();
}

function handleDifferenceFound(diff) {
  state.found.add(diff.id);
  updateFoundCount();
  awardPoints(diff.id);
  state.hintTargetId = null;
  renderScene();
  setStatus(`${state.found.size}번째 차이를 찾았습니다!`);

  if (state.found.size === LEVELS[state.levelIndex].differences.length) {
    endRound("모든 차이를 찾았어요! 다음 장면으로 넘어가세요.");
  }
}

function handleCanvasClick(event, ctx) {
  if (!state.roundActive) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * ctx.canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * ctx.canvas.height;
  const diff = LEVELS[state.levelIndex].differences.find(
    (d) => !state.found.has(d.id) && distance(x, y, d) <= d.radius
  );
  if (diff) {
    handleDifferenceFound(diff);
  } else {
    setStatus("해당 위치에는 차이가 없어요.");
  }
}

function distance(x, y, diff) {
  return Math.hypot(x - diff.x, y - diff.y);
}

function endRound(message) {
  if (!state.roundActive) return;
  state.roundActive = false;
  stopTimer();
  setStatus(message);
  nextBtn.disabled = false;
  hintBtn.disabled = true;
  resetBtn.disabled = false;
}

function startLevel(index) {
  state.levelIndex = (index + LEVELS.length) % LEVELS.length;
  state.found = new Set();
  state.hintsUsed = 0;
  state.hintTargetId = null;
  state.roundActive = true;

  const level = LEVELS[state.levelIndex];
  levelTitleEl.textContent = level.title;
  levelDescEl.textContent = level.description;
  foundEl.textContent = `0 / ${level.differences.length}`;
  setStatus("차이를 찾아보세요!");

  renderScene();
  startTimer(level.timeLimit);
  nextBtn.disabled = true;
  hintBtn.disabled = false;
  resetBtn.disabled = false;
}

function ensurePlayers() {
  if (players.length === 0) {
    ["1P", "2P"].forEach((name) => addPlayer(name));
  }
}

function useHint() {
  if (!state.roundActive) return;
  const level = LEVELS[state.levelIndex];
  if (state.hintsUsed >= 2) {
    setStatus("이 장면에서 사용할 수 있는 힌트를 모두 썼어요.");
    return;
  }
  const remaining = level.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintTargetId = diff.id;
  state.hintsUsed += 1;
  applyHintPenalty();
  renderScene();
  setStatus(`힌트! ${diff.hint}`);
  logEvent(`힌트 사용: ${diff.hint}`);
  setTimeout(() => {
    if (state.hintTargetId === diff.id) {
      state.hintTargetId = null;
      renderScene();
    }
  }, 4000);
}

canvasLeft.addEventListener("click", (event) => handleCanvasClick(event, ctxLeft));
canvasRight.addEventListener("click", (event) => handleCanvasClick(event, ctxRight));

hintBtn.addEventListener("click", useHint);
resetBtn.addEventListener("click", () => {
  if (!LEVELS[state.levelIndex]) return;
  startLevel(state.levelIndex);
  logEvent("현재 장면을 리셋했습니다.");
});

startBtn.addEventListener("click", () => {
  ensurePlayers();
  startLevel(0);
  logEvent("새 게임이 시작되었습니다.");
});

nextBtn.addEventListener("click", () => {
  ensurePlayers();
  startLevel(state.levelIndex + 1);
  logEvent("다음 장면으로 이동했습니다.");
});

nextBtn.disabled = true;
hintBtn.disabled = true;
resetBtn.disabled = true;

const playerForm = document.getElementById("player-form");
playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("player-name");
  const value = input.value.trim();
  if (!value) return;
  addPlayer(value);
  input.value = "";
});

ensurePlayers();
renderScene();
setStatus("플레이어를 추가하고 새 게임을 눌러주세요.");
