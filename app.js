// =========================================================
// คู่มือดิจิตอลและโต๊ะจำลองบอร์ดเกม “เมี้ยวไม่อยากแห่”
// Interactive Digital Companion & 3D Rulebook Engine
// =========================================================

// 1. Web Audio Synthesizer for Tactile Tabletop Feedback
class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playTick(freq = 520, dur = 0.04) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }
  playPageFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.playTick(320, 0.06);
    setTimeout(() => this.playTick(480, 0.05), 45);
  }
  playCoinDrop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.playTick(880, 0.07);
    setTimeout(() => this.playTick(1180, 0.09), 55);
  }
  playChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTick(f, 0.14), i * 80);
    });
  }
}

const sfx = new SoundFX();

// 2. Game Components Data (Exact 11 items from Canva Slide 4)
const COMPONENTS_DATA = [
  {
    id: 'board',
    name: 'กระดานบอร์ด (4 ชิ้น)',
    qty: '4 ชิ้นประกบ',
    category: 'board',
    img: 'assets/elements/item_board.png',
    desc: 'กระดานแปดเหลี่ยม 8 หมู่บ้าน พร้อมวงแหวนกลางและลูกศรระบุทิศทาง',
    usage: 'ประกอบกลางโต๊ะ สวมวงล้อหมุนตรงกลาง'
  },
  {
    id: 'palanquin',
    name: 'เสลี่ยงนางแมว (3D)',
    qty: '1 หลัง',
    category: 'board',
    img: 'assets/elements/item_palanquin.png',
    desc: 'หุ่นจำลองเสลี่ยง 3 มิติ ใช้เป็นหมากเดินขบวนหลัก',
    usage: 'วางที่จุดเริ่ม และเคลื่อนที่ตามผลโหวตเหรียญ'
  },
  {
    id: 'spinner',
    name: 'วงล้อสุ่มทิศ',
    qty: '1 ชุด',
    category: 'board',
    img: 'assets/elements/item_spinner.png',
    desc: 'วงล้อพร้อมเข็มลูกศรหมุนอิสระ สำหรับสุ่มสถานะเริ่มเกม',
    usage: 'หมุนสุ่มหมู่บ้านที่เปลี่ยนเป็นสีเหลือง (ปกติ) ตอนเริ่มเกม'
  },
  {
    id: 'status_pins',
    name: 'หมุดสถานะหมู่บ้าน',
    qty: '8 ตัว',
    category: 'tokens',
    img: 'assets/elements/item_status_pins.png',
    desc: 'หมุดระบุระดับความอุดมสมบูรณ์ เขียว/เหลือง/แดง',
    usage: 'ปรับระดับ +1 เมื่อขบวนแห่ผ่าน หรือ -1 เมื่อถูกละเลย'
  },
  {
    id: 'card_villager',
    name: 'การ์ดบทบาท: ชาวบ้าน',
    qty: '6 ใบ',
    category: 'cards',
    img: 'assets/elements/item_card_villager.png',
    desc: 'เป้าหมาย: พาขบวนแห่ไปฟื้นฟูหมู่บ้านให้รอดจากภัยแล้ง',
    usage: 'ร่วมมือโหวตเหรียญทิศทาง เพื่อชนะฝ่ายทาสแมว'
  },
  {
    id: 'card_catslave',
    name: 'การ์ดบทบาท: ทาสแมว',
    qty: '2 ใบ',
    category: 'cards',
    img: 'assets/elements/item_card_catslave.png',
    desc: 'เป้าหมายลับ: ปั่นป่วนให้ขบวนแห่ล้มเหลว (ช่วยน้องแมว)',
    usage: 'แฝงตัวขัดขวางโหวต ให้หมู่บ้านแห้งแล้งครบตามเงื่อนไข'
  },
  {
    id: 'bag_center',
    name: 'ถุงโหวตส่วนกลาง',
    qty: '1 ใบ',
    category: 'bags',
    img: 'assets/elements/item_bag_center.png',
    desc: 'ถุงกำมะหยี่สีแดง สำหรับรวบรวมเหรียญโหวตลับในแต่ละรอบ',
    usage: 'ใส่เหรียญโหวตเพื่อรวมผลทิศทาง'
  },
  {
    id: 'bag_player',
    name: 'ถุงเหรียญผู้เล่น',
    qty: '8 ใบ',
    category: 'bags',
    img: 'assets/elements/item_bag_player.png',
    desc: 'ถุงกำมะหยี่สีน้ำเงิน ใช้เก็บเหรียญโหวตส่วนตัวเป็นความลับ',
    usage: 'ใช้ล้วงส่งเหรียญเข้าถุงกลางอย่างลับๆ'
  },
  {
    id: 'coin_left',
    name: 'เหรียญซ้าย (ม่วง)',
    qty: '32 เหรียญ',
    category: 'tokens',
    img: 'assets/elements/item_coin_left.png',
    desc: 'เหรียญโหวตทิศทางซ้าย (ทวนเข็มนาฬิกา)',
    usage: 'ส่งเข้าถุงกลางเมื่อต้องการให้ขบวนเดินไปทางซ้าย'
  },
  {
    id: 'coin_right',
    name: 'เหรียญขวา (ชมพู)',
    qty: '32 เหรียญ',
    category: 'tokens',
    img: 'assets/elements/item_coin_right.png',
    desc: 'เหรียญโหวตทิศทางขวา (ตามเข็มนาฬิกา)',
    usage: 'ส่งเข้าถุงกลางเมื่อต้องการให้ขบวนเดินไปทางขวา'
  },
  {
    id: 'color_tokens',
    name: 'โทเคนสีประจำตัว',
    qty: '8 สี',
    category: 'tokens',
    img: 'assets/elements/item_color_tokens.png',
    desc: 'หมากไม้ 8 สี ระบุตัวตนผู้เล่นและลำดับหัวหน้าขบวน',
    usage: 'วางหน้าผู้เล่นเพื่อแสดงสถานะและลำดับสิทธิ์'
  }
];

// 3. Role & Turn Distribution Table (Exact from Slides 5, 6, 8)
const PLAYER_CONFIG = {
  5: { villagers: 4, catSlaves: 1, coins: 5, turns: 5 },
  6: { villagers: 5, catSlaves: 1, coins: 6, turns: 6 },
  7: { villagers: 5, catSlaves: 2, coins: 7, turns: 7 },
  8: { villagers: 6, catSlaves: 2, coins: 8, turns: 8 }
};

// 4. 8 Villages on the Octagonal Board (Clockwise starting from Top 12:00)
// Note: On the board artwork (Slide 7):
// Pink arrow ("ขวา") points Clockwise; Purple arrow ("ซ้าย") points Counter-Clockwise!
const VILLAGES_INIT = [
  { id: 0, name: 'บ้านดงไผ่', angle: -90, x: 50, y: 11 },
  { id: 1, name: 'บ้านแหลมผักเบี้ย', angle: -45, x: 78, y: 22 },
  { id: 2, name: 'บ้านบึงน้ำใส', angle: 0, x: 88, y: 50 },
  { id: 3, name: 'บ้านร่มไทร', angle: 45, x: 78, y: 78 },
  { id: 4, name: 'บ้านหุบเขาสายลม', angle: 90, x: 50, y: 89 },
  { id: 5, name: 'บ้านโคกศิลาแดง', angle: 135, x: 22, y: 78 },
  { id: 6, name: 'บ้านทุ่งรวงทอง', angle: 180, x: 12, y: 50 },
  { id: 7, name: 'บ้านคลองสายธาร', angle: -135, x: 22, y: 22 }
];

// Status levels: 2 = เขียว (อุดมสมบูรณ์), 1 = เหลือง (ปกติ), 0 = แดง (แห้งแล้ง)
let boardState = {
  villages: VILLAGES_INIT.map(v => ({ ...v, status: 2 })),
  palanquinPos: 6, // Default starting at บ้านทุ่งรวงทอง (matches Slide 7 example!)
  stayCount: 1,
  turn: 1,
  maxTurns: 6,
  spinnerRotation: 0,
  initialSpunVillage: 2 // บ้านบึงน้ำใส (matches Slide 7 example!)
};

// Initialize default Slide 7 setup state
boardState.villages[2].status = 1; // บ้านบึงน้ำใส starts at Yellow per Slide 7

// =========================================================
// MODE & TAB NAVIGATION
// =========================================================
let currentTopMode = 'interactive'; // 'interactive' | 'flipbook'

function switchTopMode(mode) {
  currentTopMode = mode;
  sfx.playPageFlip();
  document.getElementById('btnModeInteractive').classList.toggle('active', mode === 'interactive');
  document.getElementById('btnModeFlipbook').classList.toggle('active', mode === 'flipbook');
  document.getElementById('interactiveNavWrapper').style.display = mode === 'interactive' ? 'flex' : 'none';
  document.getElementById('interactiveMainContainer').style.display = mode === 'interactive' ? 'block' : 'none';
  document.getElementById('flipbookMainContainer').style.display = mode === 'flipbook' ? 'block' : 'none';

  // Sync mobile bottom navigation
  document.querySelectorAll('.mb-nav-btn').forEach(btn => {
    if (mode === 'flipbook') {
      btn.classList.toggle('active', btn.dataset.mode === 'flipbook');
    } else {
      if (btn.dataset.mode === 'flipbook') btn.classList.remove('active');
    }
  });
}

function switchTab(tabId) {
  if (currentTopMode !== 'interactive') {
    switchTopMode('interactive');
  }
  sfx.playTick(600, 0.05);
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.mb-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `tab-${tabId}`);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================
// RENDER COMPONENTS GRID & MODAL INSPECTOR
// =========================================================
function renderComponents(filter = 'all') {
  const grid = document.getElementById('componentsGrid');
  if (!grid) return;
  const items = filter === 'all'
    ? COMPONENTS_DATA
    : COMPONENTS_DATA.filter(c => c.category === filter);

  grid.innerHTML = items.map(item => `
    <div class="comp-item-card" onclick="openComponentModal('${item.id}')">
      <div class="comp-img-stage">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
      </div>
      <div>
        <span class="comp-qty-badge">${item.qty}</span>
        <div class="comp-title">${item.name}</div>
        <div class="comp-sub">แตะเพื่อดูรายละเอียด</div>
      </div>
    </div>
  `).join('');
}

function filterComponents(cat, btnEl) {
  sfx.playTick(540, 0.04);
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderComponents(cat);
}

function openComponentModal(compId) {
  const item = COMPONENTS_DATA.find(c => c.id === compId);
  if (!item) return;
  sfx.playCoinDrop();
  document.getElementById('modalImg').src = item.img;
  document.getElementById('modalQty').textContent = item.qty;
  document.getElementById('modalTitle').textContent = item.name;
  document.getElementById('modalDesc').textContent = item.desc;
  document.getElementById('modalUsage').textContent = '💡 วิธีใช้: ' + item.usage;
  document.getElementById('componentModal').classList.add('open');
}

function closeComponentModal(e) {
  if (!e || e.target.id === 'componentModal' || e.target.classList.contains('modal-close')) {
    document.getElementById('componentModal').classList.remove('open');
  }
}

// =========================================================
// ROLE, COIN & TURN CALCULATOR (TAB 3)
// =========================================================
function selectPlayerCount(count) {
  sfx.playCoinDrop();
  const cfg = PLAYER_CONFIG[count];
  document.querySelectorAll('.p-count-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === count);
  });

  document.getElementById('calcVillagers').textContent = `${cfg.villagers} คน`;
  document.getElementById('calcCatSlaves').textContent = `${cfg.catSlaves} คน`;
  document.getElementById('calcCoins').textContent = `${cfg.coins} เหรียญ/คน`;
  document.getElementById('calcTurns').textContent = `${cfg.turns} เทิร์น`;

  // Render visual cards row
  const visualRow = document.getElementById('calcVisualCards');
  let html = '';
  for (let i = 0; i < cfg.villagers; i++) {
    html += `
      <div class="mini-role-icon">
        <img src="assets/elements/item_card_villager.png" alt="ชาวบ้าน">
        <span style="color:var(--status-green)">ชาวบ้าน #${i + 1}</span>
      </div>
    `;
  }
  for (let i = 0; i < cfg.catSlaves; i++) {
    html += `
      <div class="mini-role-icon" style="border-color:var(--thai-red); background:#FFF5F5">
        <img src="assets/elements/item_card_catslave.png" alt="ทาสแมว">
        <span style="color:var(--thai-red)">ทาสแมว #${i + 1}</span>
      </div>
    `;
  }
  visualRow.innerHTML = html;
}

function toggleSetupStep(el) {
  sfx.playTick(700, 0.05);
  el.classList.toggle('done');
}

// =========================================================
// INTERACTIVE 8-VILLAGE BOARD & SPINNER SIMULATOR (TAB 4)
// =========================================================
function renderBoardSimulator() {
  const container = document.getElementById('villageNodesContainer');
  if (!container) return;

  const statusMeta = {
    2: { label: 'เขียว (อุดมสมบูรณ์)', cls: 'green', icon: '🟢' },
    1: { label: 'เหลือง (ปกติ)', cls: 'yellow', icon: '🟡' },
    0: { label: 'แดง (แห้งแล้ง)', cls: 'red', icon: '🔴' }
  };

  container.innerHTML = boardState.villages.map((v, idx) => {
    const st = statusMeta[v.status];
    const hasPal = boardState.palanquinPos === idx;
    return `
      <div class="village-node ${hasPal ? 'has-palanquin' : ''}"
           style="left: ${v.x}%; top: ${v.y}%;"
           onclick="clickVillageNode(${idx})"
           title="แตะเพื่อย้ายเสลี่ยง หรือดูสถานะ ${v.name}">
        ${hasPal ? `<img src="assets/elements/item_palanquin.png" class="palanquin-marker" alt="เสลี่ยง">` : ''}
        <div class="v-name">${v.name}</div>
        <div class="v-status-pill ${st.cls}">${st.icon} ${st.cls === 'green' ? 'สมบูรณ์' : st.cls === 'yellow' ? 'ปกติ' : 'แห้งแล้ง'}</div>
      </div>
    `;
  }).join('');

  // Update summary counts
  const gCount = boardState.villages.filter(v => v.status === 2).length;
  const yCount = boardState.villages.filter(v => v.status === 1).length;
  const rCount = boardState.villages.filter(v => v.status === 0).length;

  document.getElementById('simCountGreen').textContent = `${gCount} แห่ง`;
  document.getElementById('simCountYellow').textContent = `${yCount} แห่ง`;
  document.getElementById('simCountRed').textContent = `${rCount} แห่ง`;
  document.getElementById('simCurrentTurn').textContent = `เทิร์นที่ ${boardState.turn} / ${boardState.maxTurns}`;
  document.getElementById('simCurrentVillage').textContent = boardState.villages[boardState.palanquinPos].name;

  // Check Endgame Status Banner
  const banner = document.getElementById('simEndgameBanner');
  if (rCount >= 8) {
    banner.style.display = 'block';
    banner.style.background = '#FEE2E2';
    banner.style.color = '#991B1B';
    banner.innerHTML = '🐱 <strong>ทาสแมวชนะทันที!</strong> แห้งแล้งครบทั้ง 8 หมู่บ้าน';
  } else if (boardState.turn >= boardState.maxTurns) {
    banner.style.display = 'block';
    if (rCount >= 3) {
      banner.style.background = '#FEE2E2';
      banner.style.color = '#991B1B';
      banner.innerHTML = `🐱 <strong>จบเกม (${boardState.maxTurns} เทิร์น): ทาสแมวชนะ!</strong> แห้งแล้ง ${rCount} แห่ง (เกณฑ์ 3 แห่งขึ้นไป)`;
    } else {
      banner.style.background = '#DCFCE7';
      banner.style.color = '#166534';
      banner.innerHTML = `🌾 <strong>จบเกม (${boardState.maxTurns} เทิร์น): ชาวบ้านชนะ!</strong> แห้งแล้งเพียง ${rCount} แห่ง (รอดพ้นวิกฤต)`;
    }
  } else {
    banner.style.display = 'none';
  }
}

function logSimMessage(msg) {
  const logBox = document.getElementById('simLogBox');
  if (!logBox) return;
  const item = document.createElement('div');
  item.style.marginBottom = '6px';
  item.innerHTML = msg;
  logBox.prepend(item);
}

function spinCenterWheel() {
  const arrow = document.getElementById('spinnerArrowEl');
  if (!arrow) return;

  // Pick a random village 0..7
  const chosenIdx = Math.floor(Math.random() * 8);
  const targetVillage = boardState.villages[chosenIdx];

  // Calculate rotation so the arrow points to targetVillage.angle
  const extraSpins = (3 + Math.floor(Math.random() * 3)) * 360;
  const currentMod = ((boardState.spinnerRotation % 360) + 360) % 360;
  const targetMod = ((targetVillage.angle % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta < 0) delta += 360;

  boardState.spinnerRotation += extraSpins + delta;
  arrow.style.transform = `rotate(${boardState.spinnerRotation}deg)`;

  // Play ticking sound during spin
  for (let i = 0; i < 12; i++) {
    setTimeout(() => sfx.playTick(400 + i * 25, 0.03), i * 150);
  }

  setTimeout(() => {
    sfx.playChime();
    // Per Setup Step 4: หมุนวงล้อเลือกหมู่บ้านที่จะฟื้นฟู โดยหมู่บ้านนั้นสถานะจะเป็นสีเหลืองในทันที
    boardState.villages.forEach(v => { v.status = 2; });
    boardState.villages[chosenIdx].status = 1;
    boardState.turn = 1;
    boardState.stayCount = 1;
    renderBoardSimulator();
    logSimMessage(`🎡 <strong>สุ่มเริ่มเกม:</strong> ชี้ <strong>${targetVillage.name}</strong> → ปรับเป็น <span style="color:#B45309;font-weight:700">สีเหลือง (ปกติ)</span>`);
  }, 2200);
}

function movePalanquin(direction) {
  // direction: 'left' (Purple coin = Counter-Clockwise = -1), 'right' (Pink coin = Clockwise = +1), 'stay' (0)
  sfx.playCoinDrop();
  const prevPos = boardState.palanquinPos;
  let newPos = prevPos;

  if (direction === 'left') {
    newPos = (prevPos + 7) % 8; // Counter-clockwise along purple arrow
    boardState.stayCount = 1;
  } else if (direction === 'right') {
    newPos = (prevPos + 1) % 8; // Clockwise along pink arrow
    boardState.stayCount = 1;
  } else {
    boardState.stayCount += 1;
  }

  boardState.palanquinPos = newPos;
  const visitedVillage = boardState.villages[newPos];

  // Step 4: ปรับสถานะหมู่บ้าน
  // - หมู่บ้านที่ได้รับการแห่เคลื่อนผ่าน: +1 ระดับ (แต่ถ้าอยู่ที่เดิมเกิน 1 เทิร์น หรือครั้งที่ 2 เป็นต้นไป ให้ลดลง -1 ระดับ)
  // - หมู่บ้านที่ไม่ได้รับการแห่ในรอบนั้น: สามารถกดจำลองภัยแล้งลดลง -1 ระดับ
  boardState.villages.forEach((v, idx) => {
    if (idx === newPos) {
      if (direction === 'stay' && boardState.stayCount >= 2) {
        v.status = Math.max(0, v.status - 1);
      } else {
        v.status = Math.min(2, v.status + 1);
      }
    } else {
      // In each turn, unvisited villages drop by 1 level (-1) OR let user see the exact rule effect
      v.status = Math.max(0, v.status - 1);
    }
  });

  if (boardState.turn < boardState.maxTurns) {
    boardState.turn += 1;
  }

  renderBoardSimulator();

  if (direction === 'stay') {
    logSimMessage(`⏸️ <strong>อยู่ที่เดิม (${visitedVillage.name}) รอบที่ ${boardState.stayCount}:</strong> สถานะลดลง -1 ทุกแห่ง`);
  } else {
    const dirText = direction === 'left' ? 'ซ้าย (เหรียญม่วง ↺)' : 'ขวา (เหรียญชมพู ↻)';
    logSimMessage(`🐈‍⬛ <strong>เดินขบวนไป${dirText}:</strong> สู่ <strong>${visitedVillage.name}</strong> (+1 ระดับ) / หมู่บ้านอื่น (-1 ระดับ)`);
  }
}

function clickVillageNode(idx) {
  sfx.playTick(660, 0.05);
  // Cycle status of clicked village or move palanquin if shift/setup
  const v = boardState.villages[idx];
  boardState.palanquinPos = idx;
  boardState.stayCount = 1;
  renderBoardSimulator();
  logSimMessage(`📍 ย้ายเสลี่ยงไปที่ <strong>${v.name}</strong>`);
}

function resetBoardSimulator() {
  sfx.playPageFlip();
  boardState.villages.forEach((v, i) => {
    v.status = (i === 2) ? 1 : 2;
  });
  boardState.palanquinPos = 6;
  boardState.turn = 1;
  boardState.stayCount = 1;
  renderBoardSimulator();
  logSimMessage(`🔄 <strong>รีเซ็ตกระดาน:</strong> เสลี่ยงอยู่ที่บ้านทุ่งรวงทอง, บ้านบึงน้ำใสเป็นสีเหลือง`);
}

// =========================================================
// TAB 5: VOTING BAG MINI-SIMULATOR (ถุงส่วนกลาง)
// =========================================================
let secretBagCoins = [];

function addCoinToBag(color) {
  // color: 'purple' (ซ้าย) | 'pink' (ขวา)
  if (secretBagCoins.length >= 8) {
    secretBagCoins = [];
  }
  secretBagCoins.push(color);
  sfx.playCoinDrop();

  const bagWrap = document.getElementById('bagVisualWrap');
  bagWrap.classList.remove('shake');
  void bagWrap.offsetWidth;
  bagWrap.classList.add('shake');

  document.getElementById('bagCountBadge').textContent = `เหรียญในถุงกลาง: ${secretBagCoins.length} เหรียญ`;
  document.getElementById('bagResultText').innerHTML =
    secretBagCoins.length < 3
      ? `ใส่แล้ว ${secretBagCoins.length} เหรียญ (ต้องใช้อย่างน้อย 3 เหรียญ)`
      : `ครบ ${secretBagCoins.length} เหรียญแล้ว! แตะ <strong>“เปิดถุงนับเหรียญ”</strong> ได้เลย`;
  document.getElementById('bagCoinsTray').innerHTML = secretBagCoins.map(() => `
    <span style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:#3A2214;color:#FFE699;font-family:'Mali';font-weight:700;border:2px solid #FFE699;">?</span>
  `).join('');
}

function revealBagCoins() {
  if (secretBagCoins.length === 0) {
    // Auto-generate 3 random coins if user hasn't added any
    secretBagCoins = [
      Math.random() > 0.5 ? 'purple' : 'pink',
      Math.random() > 0.5 ? 'purple' : 'pink',
      Math.random() > 0.5 ? 'purple' : 'pink'
    ];
  }
  sfx.playChime();
  const purpleCount = secretBagCoins.filter(c => c === 'purple').length;
  const pinkCount = secretBagCoins.filter(c => c === 'pink').length;

  document.getElementById('bagCoinsTray').innerHTML = secretBagCoins.map(c => `
    <img class="revealed-coin" src="assets/elements/${c === 'purple' ? 'item_coin_left.png' : 'item_coin_right.png'}" alt="${c}">
  `).join('');

  let outcome = '';
  if (purpleCount > pinkCount) {
    outcome = `🟣 <strong>เหรียญซ้ายชนะ (${purpleCount} : ${pinkCount})!</strong> → ขบวนแห่เดิน <strong>ซ้าย (ม่วง)</strong>`;
  } else if (pinkCount > purpleCount) {
    outcome = `🩷 <strong>เหรียญขวาชนะ (${pinkCount} : ${purpleCount})!</strong> → ขบวนแห่เดิน <strong>ขวา (ชมพู)</strong>`;
  } else {
    outcome = `⚖️ <strong>คะแนนเท่ากัน (${purpleCount} : ${pinkCount})!</strong> → หัวหน้าขบวนเป็นผู้ตัดสินชี้ขาด`;
  }
  document.getElementById('bagResultText').innerHTML = outcome;
}

function clearBagCoins() {
  sfx.playTick(420, 0.04);
  secretBagCoins = [];
  document.getElementById('bagCountBadge').textContent = 'เหรียญในถุงกลาง: 0 เหรียญ';
  document.getElementById('bagCoinsTray').innerHTML = '';
  document.getElementById('bagResultText').textContent = 'เลือกใส่เหรียญซ้าย (ม่วง) หรือขวา (ชมพู) อย่างน้อย 3 เหรียญเพื่อจำลองมติโหวต';
}

// =========================================================
// MODE 1: 3D INTERACTIVE FLIPBOOK ENGINE (10 PAGES)
// =========================================================
let currentSpreadIndex = 0;
// Spreads:
// 0: Cover [Page 1] & History 1 [Page 2]
// 1: History 2 [Page 3] & Components [Page 4]
// 2: Goals/Roles [Page 5] & Setup Rules [Page 6]
// 3: Setup Board [Page 7] & Gameplay 1-3 [Page 8]
// 4: Gameplay 4-5 & Endgame [Page 9] & Credits [Page 10]
const SPREAD_PAIRS = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8],
  [9, 10]
];

const PAGE_TITLES = {
  1: 'หน้าปก',
  2: 'ประวัติแห่นางแมว',
  3: 'คุณค่า & การประยุกต์',
  4: 'อุปกรณ์ในกล่อง (11 ชิ้น)',
  5: 'เป้าหมาย & บทบาทผู้เล่น',
  6: 'วิธีจัดเตรียมเกม 5 ขั้นตอน',
  7: 'ตัวอย่างจัดกระดานบอร์ด',
  8: 'รอบการเล่น & ขั้นที่ 1–3',
  9: 'ขั้นที่ 4–5 & เงื่อนไขจบเกม',
  10: 'คณะผู้จัดทำ'
};

function renderFlipbookSpread() {
  const [leftNum, rightNum] = SPREAD_PAIRS[currentSpreadIndex];
  const leftImg = document.getElementById('bookLeftImg');
  const rightImg = document.getElementById('bookRightImg');
  if (!leftImg || !rightImg) return;

  leftImg.src = `assets/pages/page_${String(leftNum).padStart(2, '0')}.jpg`;
  rightImg.src = `assets/pages/page_${String(rightNum).padStart(2, '0')}.jpg`;

  document.getElementById('bookLeftRibbon').textContent = `หน้า ${leftNum}/10 • ${PAGE_TITLES[leftNum]}`;
  document.getElementById('bookRightRibbon').textContent = `หน้า ${rightNum}/10 • ${PAGE_TITLES[rightNum]}`;
  document.getElementById('spreadIndicatorText').textContent = `คู่หน้า ${currentSpreadIndex + 1}/${SPREAD_PAIRS.length} (หน้า ${leftNum}–${rightNum})`;

  // Update active thumbnails
  document.querySelectorAll('.page-thumb-btn').forEach(btn => {
    const p = parseInt(btn.dataset.page, 10);
    btn.classList.toggle('active', p === leftNum || p === rightNum);
  });
}

function changeSpread(delta) {
  const next = currentSpreadIndex + delta;
  if (next < 0 || next >= SPREAD_PAIRS.length) return;
  sfx.playPageFlip();
  currentSpreadIndex = next;
  renderFlipbookSpread();
}

function jumpToPage(pageNum) {
  sfx.playPageFlip();
  const idx = Math.floor((pageNum - 1) / 2);
  currentSpreadIndex = Math.max(0, Math.min(SPREAD_PAIRS.length - 1, idx));
  renderFlipbookSpread();
}

function zoomBookPage(side) {
  const [leftNum, rightNum] = SPREAD_PAIRS[currentSpreadIndex];
  const pNum = side === 'left' ? leftNum : rightNum;
  sfx.playTick(680, 0.05);
  document.getElementById('modalImg').src = `assets/pages/page_${String(pNum).padStart(2, '0')}.jpg`;
  document.getElementById('modalQty').textContent = `หน้า ${pNum}/10`;
  document.getElementById('modalTitle').textContent = PAGE_TITLES[pNum];
  document.getElementById('modalDesc').textContent = 'เปิดโหมดจำลองเพื่อทดลองเล่นบอร์ด หมุนวงล้อ และโหวตเหรียญแบบโต้ตอบ';
  document.getElementById('modalUsage').textContent = '💡 แตะพื้นที่ว่างหรือเครื่องหมาย ✕ เพื่อปิด';
  document.getElementById('componentModal').classList.add('open');
}

// =========================================================
// WEATHER PARTICLE CANVAS (DROUGHT PETALS vs RAIN DROPS)
// =========================================================
let isRainMode = false;
let particles = [];

function toggleWeatherMode() {
  isRainMode = !isRainMode;
  sfx.playChime();
  document.body.classList.toggle('rain-mode', isRainMode);
  const btn = document.getElementById('btnWeatherToggle');
  btn.classList.toggle('active-weather', isRainMode);
  btn.innerHTML = isRainMode
    ? '<span class="lbl-desktop">🌧️ คืนฝนตก (โหมดมืด)</span><span class="lbl-mobile">🌧️ มืด</span>'
    : '<span class="lbl-desktop">☀️ กลางวัน (โหมดสว่าง)</span><span class="lbl-mobile">☀️ สว่าง</span>';

  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', isRainMode ? '#070D18' : '#9AD9EA');
  }

  initParticles();
}

function toggleSoundMode() {
  sfx.enabled = !sfx.enabled;
  const btn = document.getElementById('btnSoundToggle');
  btn.innerHTML = sfx.enabled
    ? '<span class="lbl-desktop">🔊 เสียง: เปิด</span><span class="lbl-mobile">🔊 เปิด</span>'
    : '<span class="lbl-desktop">🔇 เสียง: ปิด</span><span class="lbl-mobile">🔇 ปิด</span>';
  if (sfx.enabled) sfx.playTick(660, 0.05);
}

function initParticles() {
  const canvas = document.getElementById('weatherCanvas');
  if (!canvas) return;
  const isMobile = window.innerWidth < 768;
  const count = isRainMode ? (isMobile ? 55 : 95) : (isMobile ? 14 : 24);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: isRainMode ? -1.6 : (Math.random() - 0.5) * 0.8,
      vy: isRainMode ? 10 + Math.random() * 8 : 0.7 + Math.random() * 0.9,
      size: isRainMode ? 16 + Math.random() * 12 : 6 + Math.random() * 6,
      color: isRainMode
        ? (Math.random() > 0.4 ? 'rgba(56, 189, 248, 0.9)' : 'rgba(186, 230, 253, 0.95)')
        : (Math.random() > 0.5 ? '#FFB7C5' : '#FFE082'),
      width: isRainMode ? (Math.random() > 0.6 ? 2.2 : 1.6) : 1
    });
  }
}

function animateParticles() {
  const canvas = document.getElementById('weatherCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y > canvas.height + 25) {
      p.y = -20;
      p.x = Math.random() * (canvas.width + 50);
    }
    if (p.x < -30) p.x = canvas.width + 20;

    if (isRainMode) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 1.6, p.y + p.size);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.y * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  requestAnimationFrame(animateParticles);
}

// =========================================================
// SHARE QR CODE MODAL HELPERS
// =========================================================
function openShareQrModal() {
  sfx.playChime();
  const m = document.getElementById('shareQrModal');
  if (m) m.classList.add('open');
}

function closeShareQrModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  sfx.playTick(400, 0.04);
  const m = document.getElementById('shareQrModal');
  if (m) m.classList.remove('open');
}

function copySiteLink() {
  sfx.playChime();
  const url = 'https://matareal.github.io/meow-boardgame/';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('คัดลอกลิงก์สำเร็จแล้ว! ส่งต่อให้เพื่อนได้เลยครับ 🎉\n' + url);
    }).catch(() => {
      prompt('คัดลอกลิงก์ด้านล่างนี้ได้เลยครับ:', url);
    });
  } else {
    prompt('คัดลอกลิงก์ด้านล่างนี้ได้เลยครับ:', url);
  }
}

// =========================================================
// INITIALIZE ON DOM READY
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  renderComponents('all');
  selectPlayerCount(6);
  renderBoardSimulator();
  renderFlipbookSpread();
  initParticles();
  animateParticles();

  // Keyboard navigation for 3D Flipbook
  window.addEventListener('keydown', (e) => {
    if (currentTopMode === 'flipbook') {
      if (e.key === 'ArrowRight') changeSpread(1);
      if (e.key === 'ArrowLeft') changeSpread(-1);
    }
    if (e.key === 'Escape') closeComponentModal();
  });
});
