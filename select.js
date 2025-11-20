// -------------------------------
// 공통 API POST 함수
// -------------------------------
async function apiPost(url, body) {
  const token = localStorage.getItem("wondie_token");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? "Bearer " + token : "",
    },
    body: JSON.stringify(body),
  });

  return res.json();
}

// -------------------------------
// UI 요소
// -------------------------------
const cards = document.querySelectorAll(".cs-card");
const descEl = document.getElementById("cs-desc");
const nicknameInput = document.getElementById("nicknameInput");
const messageBox = document.getElementById("cs-message");

// 캐릭터 설명
const descriptions = {
  human: "닝겐: 기본 인간 스타일 캐릭터입니다.",
  cat: "네코: 고양이 인간 캐릭터입니다.",
  robot: "디바: 하이테크 로봇과 함께합니다.",
};

// 카드 클릭 이벤트
cards.forEach((card) => {
  card.addEventListener("click", () => {
    cards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    descEl.textContent = descriptions[card.dataset.id];
  });
});

// 뒤로가기
function goBack() {
  window.location.href = "index.html";
}

// -------------------------------
// 캐릭터+닉네임 확정 → DB 저장
// -------------------------------
document.getElementById("confirmBtn").addEventListener("click", async () => {
  const selected = document.querySelector(".cs-card.selected");
  const characterType = selected ? selected.dataset.id : null;
  const nickname = nicknameInput.value.trim();

  if (!characterType) return showMsg("캐릭터를 선택하세요.");
  if (!nickname) return showMsg("닉네임을 입력하세요.");

  const data = await apiPost("/api/profile/setup", {
    characterType,
    nickname,
  });

  if (!data.ok) return showMsg(data.message);

  // 저장 성공 → 게임으로 진입
  window.location.href = "index.html";
});

// 메시지 표시
function showMsg(msg) {
  messageBox.textContent = msg;
}
