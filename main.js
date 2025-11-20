/***************************
 * 캐릭터별 스프라이트 정보
 ***************************/
const CHARACTER_SPRITES = {
  // 지금은 human 하나만 사용
  human: {
    walk: {
      src: "img/sprites/human_walk.png", // 스프라이트 시트 경로
      cols: 4,  // 가로 프레임 수
      rows: 8,  // 세로 줄 수 (8방향)
    },
  },
};

// 8방향 → 스프라이트 시트에서 "몇 번째 줄"인지
const DIR8 = {
  down: 0,
  downLeft: 1,
  left: 2,
  upLeft: 3,
  up: 4,
  upRight: 5,
  right: 6,
  downRight: 7,
};

/***********************
 *  스프라이트 시트 유틸
 ***********************/
class SpriteSheet {
  /**
   * img: Image 객체
   * options:
   *   cols: 가로 프레임 수
   *   rows: 세로 프레임 수
   *   dirMap: { down: 0, left: 1, ... } 처럼 "방향 → 행 번호" 매핑
   */
  constructor(img, { cols, rows, dirMap }) {
    this.img = img;
    this.cols = cols;
    this.rows = rows;
    this.dirMap = dirMap;
    this.frameWidth = img.width / cols;
    this.frameHeight = img.height / rows;
  }

  draw(ctx, x, y, dir, frame, scale = 1) {
    const row = this.dirMap[dir] ?? 0;
    const col = Math.floor(frame) % this.cols;

    ctx.drawImage(
      this.img,
      col * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      x - (this.frameWidth * scale) / 2,
      y - (this.frameHeight * scale) / 2,
      this.frameWidth * scale,
      this.frameHeight * scale
    );
  }
}

/***************
 *  이미지 로더
 ***************/
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/****************
 * 입력 처리
 ****************/
const keyState = {};

window.addEventListener("keydown", (e) => {
  keyState[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  keyState[e.key] = false;
});

/****************
 * 플레이어 객체
 ****************/
class Player {
  constructor(spriteSheet, profile) {
    this.spriteSheet = spriteSheet;
    this.nickname = profile.nickname || "플레이어";

    this.x = 480;
    this.y = 270;
    this.vx = 0;
    this.vy = 0;
    this.speed = 2.5;

    this.dir = "down"; // down, downLeft, left, ...
    this.frame = 0;
  }

  update() {
    let dx = 0;
    let dy = 0;

    if (keyState["ArrowLeft"]) dx -= 1;
    if (keyState["ArrowRight"]) dx += 1;
    if (keyState["ArrowUp"]) dy -= 1;
    if (keyState["ArrowDown"]) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      this.vx = dx * this.speed;
      this.vy = dy * this.speed;

      // 8방향 결정
      if (dy > 0 && dx === 0) this.dir = "down";
      else if (dy > 0 && dx > 0) this.dir = "downRight";
      else if (dy === 0 && dx > 0) this.dir = "right";
      else if (dy < 0 && dx > 0) this.dir = "upRight";
      else if (dy < 0 && dx === 0) this.dir = "up";
      else if (dy < 0 && dx < 0) this.dir = "upLeft";
      else if (dy === 0 && dx < 0) this.dir = "left";
      else if (dy > 0 && dx < 0) this.dir = "downLeft";

      this.frame += 0.25; // 움직일 때만 애니메이션
    } else {
      this.vx = 0;
      this.vy = 0;
      this.frame = 0; // 멈추면 첫 프레임
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    this.spriteSheet.draw(ctx, this.x, this.y, this.dir, this.frame, 1);

    // 닉네임 표시
    const textY = this.y - this.spriteSheet.frameHeight / 2 - 8;
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(this.nickname, this.x, textY);
    ctx.fillText(this.nickname, this.x, textY);
  }
}

/************************
 *  전역 게임 시작 진입점
 ************************/
window.gameMain = {
  async start(profile) {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) {
      console.error("gameCanvas를 찾을 수 없습니다.");
      return;
    }
    const ctx = canvas.getContext("2d");

    //캐릭터 타입 (지금은 human만 있어도 됨)
    const type = profile.characterType || "human";
    const cfg = CHARACTER_SPRITES[type] || CHARACTER_SPRITES.human;
    const walkCfg = cfg.walk;

    try {
      const img = await loadImage(walkCfg.src);
      const sheet = new SpriteSheet(img, {
        cols: walkCfg.cols,
        rows: walkCfg.rows,
        dirMap: DIR8,
      });

      const player = new Player(sheet, profile);

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.update();
        player.draw(ctx);
        requestAnimationFrame(loop);
      }

      loop();
    } catch (err) {
      console.error("스프라이트 로딩 실패:", err);
    }
  },
};
