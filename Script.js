// Squid Slot Survival - Core Slot Logic

const SYMBOLS = [
  { name: 'mask',    img: 'assets/mask.png',   payout: 20 },
  { name: 'doll',    img: 'assets/doll.png',   payout: 40 },
  { name: 'money',   img: 'assets/money.png',  payout: 100 },
  { name: 'skull',   img: 'assets/skull.png',  payout: 0 }
];

const REELS = 3;
const INITIAL_BALANCE = 1000;
const BETS = [1, 2, 5, 10, 20, 50, 100];

let currentBetIndex = 0;
let balance = INITIAL_BALANCE;
let spinning = false;

const reelEls = [];
const resultMessage = document.getElementById('result-message');
const spinBtn = document.getElementById('spin-btn');
const betAmountEl = document.getElementById('bet-amount');
const betMinusBtn = document.getElementById('bet-minus');
const betPlusBtn = document.getElementById('bet-plus');
const balanceEl = document.getElementById('balance');
const winAudio = document.getElementById('win-sound');
const loseAudio = document.getElementById('lose-sound');

// Preload images
SYMBOLS.forEach(sym => {
  const img = new window.Image();
  img.src = sym.img;
});

for (let i = 0; i < REELS; i++) {
  reelEls[i] = document.getElementById(`reel-${i}`);
}

// Helper: Draw a static symbol in each reel
function setReels(symbolIndexes) {
  for (let i = 0; i < REELS; i++) {
    reelEls[i].innerHTML = `<img src="${SYMBOLS[symbolIndexes[i]].img}" alt="${SYMBOLS[symbolIndexes[i]].name}">`;
  }
}

// Helper: Random symbol indexes
function randomSymbols() {
  return Array(REELS).fill(0).map(() => Math.floor(Math.random() * SYMBOLS.length));
}

// Helper: Spin animation
function animateSpin(targetIndexes, cb) {
  const SPIN_LOOPS = [12, 16, 20];
  let loops = [0, 0, 0];
  let curSymbols = [0, 0, 0];

  function spinStep() {
    let spinningNow = false;
    for (let i = 0; i < REELS; i++) {
      if (loops[i] < SPIN_LOOPS[i]) {
        curSymbols[i] = Math.floor(Math.random() * SYMBOLS.length);
        reelEls[i].innerHTML = `<img src="${SYMBOLS[curSymbols[i]].img}" alt="${SYMBOLS[curSymbols[i]].name}">`;
        loops[i]++;
        spinningNow = true;
      } else if (loops[i] === SPIN_LOOPS[i]) {
        // Show final symbol
        reelEls[i].innerHTML = `<img src="${SYMBOLS[targetIndexes[i]].img}" alt="${SYMBOLS[targetIndexes[i]].name}">`;
        loops[i]++;
      }
    }
    if (spinningNow) {
      setTimeout(spinStep, 70);
    } else {
      cb();
    }
  }
  spinStep();
}

// Slot math: Win if all three symbols match (except skull: always lose)
function checkWin(symbolIndexes) {
  const [a, b, c] = symbolIndexes;
  if (a === b && b === c && SYMBOLS[a].name !== 'skull') {
    return SYMBOLS[a].payout;
  }
  return 0;
}

// Bet panel
function updateBetDisplay() {
  betAmountEl.textContent = BETS[currentBetIndex];
}

betMinusBtn.onclick = () => {
  if (!spinning && currentBetIndex > 0) {
    currentBetIndex--;
    updateBetDisplay();
  }
};
betPlusBtn.onclick = () => {
  if (!spinning && currentBetIndex < BETS.length - 1) {
    currentBetIndex++;
    updateBetDisplay();
  }
};

function updateBalance() {
  balanceEl.textContent = balance;
}

function setResultMessage(msg, isWin) {
  resultMessage.textContent = msg;
  resultMessage.style.color = isWin ? '#fffc59' : '#fff';
  resultMessage.style.textShadow = isWin ? '0 0 10px #fffc59, 0 2px 0 #000' : '';
}

function spin() {
  if (spinning) return;
  if (balance < BETS[currentBetIndex]) {
    setResultMessage('Insufficient balance!', false);
    loseAudio.currentTime = 0; loseAudio.play();
    return;
  }
  spinning = true;
  spinBtn.disabled = true;
  setResultMessage('Spinning...', false);

  // Deduct bet immediately
  balance -= BETS[currentBetIndex];
  updateBalance();

  // Target symbols
  let targetIndexes = randomSymbols();
  animateSpin(targetIndexes, function() {
    // Math Check
    const winAmount = checkWin(targetIndexes) * BETS[currentBetIndex];
    if (winAmount > 0) {
      // Win
      balance += winAmount;
      updateBalance();
      setResultMessage(`WIN! +${winAmount}`, true);
      winAudio.currentTime = 0; winAudio.play();
    } else {
      setResultMessage('You lost! Try again.', false);
      loseAudio.currentTime = 0; loseAudio.play();
    }
    spinning = false;
    spinBtn.disabled = false;
  });
}

// Keyboard & touch support
spinBtn.onclick = spin;
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === ' ') {
    spin();
  }
});
spinBtn.addEventListener('touchstart', spin);

// Initial state
setReels([0,1,2]);
updateBetDisplay();
updateBalance();
setResultMessage('Ready to play!', false);
