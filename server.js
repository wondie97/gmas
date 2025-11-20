// server.js - WonDieWorld 백엔드 (Express + PostgreSQL + JWT + socket.io)

const express = require("express");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const pool = require("./db");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

app.use(cors());
app.use(express.json());

// index.html, select.html, js, css, img... 전부 여기서 서빙
app.use(express.static(path.join(__dirname)));

// ----------------- 공통 유틸 -----------------
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (!token) return res.json({ ok: false, message: "토큰 없음" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (e) {
    return res.json({ ok: false, message: "토큰이 유효하지 않습니다." });
  }
}

function needProfile(user) {
  return !user.character_type || !user.nickname;
}

// ----------------- 회원가입 -----------------
app.post("/api/register", async (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password) {
    return res.json({ ok: false, message: "이메일과 비밀번호가 필요합니다." });
  }

  try {
    const exist = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exist.rows.length) {
      return res.json({ ok: false, message: "이미 존재하는 이메일입니다." });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname, character_type",
      [email, hash, nickname || null]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.json({
      ok: true,
      token,
      needProfile: needProfile(user), // 닉네임 없거나 캐릭터 없으면 true
      characterType: user.character_type,
      nickname: user.nickname,
      message: "회원가입 성공",
    });
  } catch (e) {
    console.error(e);
    res.json({ ok: false, message: "DB 오류가 발생했습니다." });
  }
});

// ----------------- 로그인 -----------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ ok: false, message: "이메일과 비밀번호가 필요합니다." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (!result.rows.length) {
      return res.json({ ok: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.json({ ok: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const token = createToken(user);

    res.json({
      ok: true,
      token,
      needProfile: needProfile(user),
      characterType: user.character_type,
      nickname: user.nickname,
      message: "로그인 성공",
    });
  } catch (e) {
    console.error(e);
    res.json({ ok: false, message: "DB 오류가 발생했습니다." });
  }
});

// ----------------- 내 정보 조회 -----------------
app.post("/api/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (!result.rows.length) {
      return res.json({ ok: false, message: "사용자를 찾을 수 없습니다." });
    }

    const user = result.rows[0];

    res.json({
      ok: true,
      needProfile: needProfile(user),
      characterType: user.character_type,
      nickname: user.nickname,
    });
  } catch (e) {
    console.error(e);
    res.json({ ok: false, message: "DB 오류가 발생했습니다." });
  }
});

// ----------------- 캐릭터/닉네임 설정 -----------------
app.post("/api/profile/setup", authMiddleware, async (req, res) => {
  const { characterType, nickname } = req.body;
  if (!characterType || !nickname) {
    return res.json({ ok: false, message: "캐릭터와 닉네임이 필요합니다." });
  }

  try {
    await pool.query(
      "UPDATE users SET character_type = $1, nickname = $2 WHERE id = $3",
      [characterType, nickname, req.user.id]
    );
    res.json({ ok: true, message: "프로필 설정 완료" });
  } catch (e) {
    console.error(e);
    res.json({ ok: false, message: "DB 오류가 발생했습니다." });
  }
});

// ----------------- socket.io (나중에 월드/쿵쿵따 붙일 자리) -----------------
io.on("connection", (socket) => {
  console.log("클라이언트 접속:", socket.id);

  // TODO: 여기서 이후 게임 로직 추가

  socket.on("disconnect", () => {
    console.log("클라이언트 종료:", socket.id);
  });
});

// ----------------- 서버 시작 -----------------
server.listen(PORT, () => {
  console.log(`WonDieWorld 서버 실행 중: http://localhost:${PORT}`);
});

