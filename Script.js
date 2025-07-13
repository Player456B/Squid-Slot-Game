const symbols = ['mask.png', 'doll.png', 'money.png', 'skull.png'];

function spin() {
  const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
  const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

  document.getElementById('reel1').src = 'assets/' + reel1;
  document.getElementById('reel2').src = 'assets/' + reel2;
  document.getElementById('reel3').src = 'assets/' + reel3;

  const resultText = document.getElementById('result');
  if (reel1 === reel2 && reel2 === reel3) {
    resultText.innerText = "🎉 You Win!";
  } else {
    resultText.innerText = "❌ Try Again!";
  }
}
