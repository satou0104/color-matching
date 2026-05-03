// ========================================
// グローバル変数
// ========================================
let currentStage = 1;
let consecutiveClear = 0;
let hintUsed = false; // 色の近さメーター表示フラグ

const INTERSTITIAL_AD_ID = 'ca-app-pub-8707369701475326/2504085461'; // インタースティシャル
const REWARD_AD_ID = 'ca-app-pub-8707369701475326/9261065507'; // リワード

// ========================================
// 乱数生成（固定シード）
// ========================================
function seededRandom(seed) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// ========================================
// ステージデータ生成
// ========================================
function generateStages() {
  const stages = [];
  
  for (let i = 1; i <= 100; i++) {
    let difficulty, goldThreshold, silverThreshold, bronzeThreshold;
    
    if (i <= 30) {
      difficulty = 'easy';
      goldThreshold = 10;
      silverThreshold = 20;
      bronzeThreshold = 30;
    } else if (i <= 60) {
      difficulty = 'normal';
      goldThreshold = 8;
      silverThreshold = 15;
      bronzeThreshold = 25;
    } else if (i <= 90) {
      difficulty = 'hard';
      goldThreshold = 5;
      silverThreshold = 10;
      bronzeThreshold = 15;
    } else {
      difficulty = 'master';
      goldThreshold = 3;
      silverThreshold = 5;
      bronzeThreshold = 10;
    }
    
    // ランダムな目標色を生成
    const seed = 10000 + i * 137;
    const rng = seededRandom(seed);
    
    const targetColor = {
      r: Math.floor(rng() * 256),
      g: Math.floor(rng() * 256),
      b: Math.floor(rng() * 256)
    };
    
    stages.push({
      id: i,
      targetColor,
      goldThreshold,
      silverThreshold,
      bronzeThreshold,
      difficulty
    });
  }
  
  return stages;
}

const stages = generateStages();

// ========================================
// 色差計算
// ========================================
function calculateColorDifference(color1, color2) {
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// ========================================
// 星評価判定（銅・銀・金）
// ========================================
function getStars(colorDiff, stage) {
  if (colorDiff <= stage.goldThreshold) return 3;   // 金
  if (colorDiff <= stage.silverThreshold) return 2;  // 銀
  if (colorDiff <= stage.bronzeThreshold) return 1;  // 銅
  return 0; // 失敗
}

// ========================================
// LocalStorage管理
// ========================================
function saveBestScore(stageId, data) {
  const key = 'colorMatchBest_' + stageId;
  const existing = localStorage.getItem(key);
  
  if (existing) {
    const existingData = JSON.parse(existing);
    // より良いスコアの場合のみ保存
    if (data.stars > existingData.stars || 
        (data.stars === existingData.stars && data.diff < existingData.diff)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function getBestScore(stageId) {
  const key = 'colorMatchBest_' + stageId;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function getClearedStages() {
  const cleared = [];
  for (let i = 1; i <= 100; i++) {
    if (getBestScore(i)) {
      cleared.push(i);
    }
  }
  return cleared;
}

// ========================================
// 画面遷移
// ========================================
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function showHome() {
  showScreen('home-screen');
  updateHomeProgress();
  consecutiveClear = 0;
}

function showStageSelect() {
  showScreen('stage-select-screen');
  renderStageGrid();
  consecutiveClear = 0;
}

function showHowToPlay() {
  showScreen('howto-screen');
}

function backToStageSelect() {
  showStageSelect();
}

// ========================================
// ホーム画面
// ========================================
function updateHomeProgress() {
  const cleared = getClearedStages().length;
  document.getElementById('cleared-count').textContent = cleared;
  
  // プログレスバーを更新
  const percentage = (cleared / 100) * 100;
  document.getElementById('progress-bar').style.width = percentage + '%';
}

// ========================================
// ステージ選択画面
// ========================================
function renderStageGrid() {
  const grid = document.getElementById('stage-grid');
  grid.innerHTML = '';
  
  const cleared = getClearedStages();
  
  for (let i = 1; i <= 100; i++) {
    const btn = document.createElement('button');
    btn.className = 'stage-btn';
    btn.textContent = i;
    
    if (cleared.includes(i)) {
      btn.classList.add('cleared');
      const best = getBestScore(i);
      if (best && best.stars > 0) {
        const starsDiv = document.createElement('div');
        starsDiv.className = 'stage-stars';
        
        // 星の色を設定
        if (best.stars === 3) {
          starsDiv.classList.add('gold');
          starsDiv.textContent = '★★★';
        } else if (best.stars === 2) {
          starsDiv.classList.add('silver');
          starsDiv.textContent = '★★';
        } else if (best.stars === 1) {
          starsDiv.classList.add('bronze');
          starsDiv.textContent = '★';
        }
        
        btn.appendChild(starsDiv);
      }
    }
    
    btn.onclick = () => startStage(i);
    grid.appendChild(btn);
  }
}

// ========================================
// ゲーム画面
// ========================================
function startStage(stageId) {
  currentStage = stageId;
  const stage = stages[stageId - 1];
  
  // 画面表示
  showScreen('game-screen');
  
  // ステージ情報表示
  document.getElementById('stage-title').textContent = `Stage ${stageId}`;
  
  // 色差基準を表示
  document.querySelector('.standard-item.gold .value').textContent = stage.goldThreshold;
  document.querySelector('.standard-item.silver .value').textContent = stage.silverThreshold;
  document.querySelector('.standard-item.bronze .value').textContent = stage.bronzeThreshold;
  
  // 目標色を表示
  const targetBox = document.getElementById('target-color');
  targetBox.style.backgroundColor = `rgb(${stage.targetColor.r}, ${stage.targetColor.g}, ${stage.targetColor.b})`;
  
  // スライダーを中央値にリセット
  document.getElementById('r-slider').value = 128;
  document.getElementById('g-slider').value = 128;
  document.getElementById('b-slider').value = 128;
  
  // ヒント使用状況をリセット
  hintUsed = false;
  
  // ヒントボタンを有効化
  const hintBtn = document.querySelector('.btn-hint');
  hintBtn.disabled = false;
  hintBtn.style.opacity = '1';
  hintBtn.style.cursor = 'pointer';
  
  // 色の近さメーターを非表示
  const meterElement = document.getElementById('color-diff-meter');
  meterElement.classList.remove('visible');
  
  // 色を更新
  updateCurrentColor();
}

function updateCurrentColor() {
  const r = parseInt(document.getElementById('r-slider').value);
  const g = parseInt(document.getElementById('g-slider').value);
  const b = parseInt(document.getElementById('b-slider').value);
  
  // 色を表示
  const currentBox = document.getElementById('current-color');
  currentBox.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  
  // RGB数値表示
  document.getElementById('r-value').textContent = r;
  document.getElementById('g-value').textContent = g;
  document.getElementById('b-value').textContent = b;
  
  // ヒント使用時のみ色差を表示
  if (hintUsed) {
    const stage = stages[currentStage - 1];
    const diff = calculateColorDifference(
      { r, g, b },
      stage.targetColor
    );
    updateColorDiffMeter(diff);
  }
}

function updateColorDiffMeter(diff) {
  const maxDiff = 441; // sqrt(255^2 * 3) ≈ 441
  const percentage = Math.max(0, 100 - (diff / maxDiff * 100));
  
  const fill = document.getElementById('meter-fill');
  fill.style.width = percentage + '%';
  
  const text = document.getElementById('meter-text');
  if (diff <= 5) {
    text.textContent = '完璧！';
  } else if (diff <= 10) {
    text.textContent = 'とても近い！';
  } else if (diff <= 20) {
    text.textContent = '近い！';
  } else if (diff <= 40) {
    text.textContent = 'もう少し';
  } else {
    text.textContent = '調整してください';
  }
}

// スライダーイベント
document.getElementById('r-slider').addEventListener('input', updateCurrentColor);
document.getElementById('g-slider').addEventListener('input', updateCurrentColor);
document.getElementById('b-slider').addEventListener('input', updateCurrentColor);

// ========================================
// 回答送信
// ========================================
function submitAnswer() {
  const r = parseInt(document.getElementById('r-slider').value);
  const g = parseInt(document.getElementById('g-slider').value);
  const b = parseInt(document.getElementById('b-slider').value);
  
  const stage = stages[currentStage - 1];
  const diff = calculateColorDifference(
    { r, g, b },
    stage.targetColor
  );
  
  const stars = getStars(diff, stage);
  
  if (stars > 0) {
    // 銅以上でクリア
    saveBestScore(currentStage, { diff: Math.round(diff), stars });
    consecutiveClear++;
    showClearScreen(stars, Math.round(diff), stage.bronzeThreshold);
    
    // 5ステージ連続クリアでインタースティシャル広告
    if (consecutiveClear % 5 === 0) {
      setTimeout(() => {
        showInterstitialAd();
      }, 1500);
    }
  } else {
    // 銅未満は失敗
    showFailScreen(Math.round(diff), stage.bronzeThreshold);
  }
}

// ========================================
// クリア画面
// ========================================
function showClearScreen(stars, diff, tolerance) {
  showScreen('clear-screen');
  
  // 銅・銀・金の星表示
  let starsHTML = '';
  if (stars === 3) {
    starsHTML = '<span class="star gold">★★★</span>'; // 金
  } else if (stars === 2) {
    starsHTML = '<span class="star silver">★★</span>'; // 銀
  } else if (stars === 1) {
    starsHTML = '<span class="star bronze">★</span>'; // 銅
  }
  
  document.getElementById('clear-stars').innerHTML = starsHTML;
  document.getElementById('clear-diff').textContent = diff;
  document.getElementById('clear-tolerance').textContent = tolerance;
}

function nextStage() {
  if (currentStage < 100) {
    startStage(currentStage + 1);
  } else {
    showStageSelect();
  }
}

// ========================================
// 失敗画面
// ========================================
function showFailScreen(diff, tolerance) {
  showScreen('fail-screen');
  document.getElementById('fail-diff').textContent = diff;
  document.getElementById('fail-tolerance').textContent = tolerance;
}

function retryStage() {
  startStage(currentStage);
}

// ========================================
// ヒント機能
// ========================================
function showHintDialog() {
  if (hintUsed) {
    return; // 既に使用済みの場合は何もしない
  }
  
  document.getElementById('hint-desc').textContent = '色の近さメーターを表示します';
  document.getElementById('hint-dialog').classList.add('active');
}

function closeHintDialog() {
  document.getElementById('hint-dialog').classList.remove('active');
}

async function useHint() {
  closeHintDialog();
  
  try {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) {
      applyHint();
      return;
    }
    
    await AdMob.prepareRewardVideoAd({ adId: REWARD_AD_ID });
    const rewardItem = await AdMob.showRewardVideoAd();
    
    if (rewardItem) {
      applyHint();
    }
  } catch (e) {
    console.log('広告エラー:', e);
    applyHint(); // 広告失敗時もヒント表示
  }
}

function applyHint() {
  hintUsed = true;
  
  // 色の近さメーターを表示
  const meterElement = document.getElementById('color-diff-meter');
  meterElement.classList.add('visible');
  
  // ヒントボタンをグレーアウト
  const hintBtn = document.querySelector('.btn-hint');
  hintBtn.disabled = true;
  hintBtn.style.opacity = '0.5';
  hintBtn.style.cursor = 'not-allowed';
  
  // 現在の色差を更新
  updateCurrentColor();
}

// ========================================
// AdMob初期化
// ========================================
async function initAdMob() {
  try {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) return;
    
    await AdMob.initialize({
      requestTrackingAuthorization: false
    });
    
    console.log('AdMob初期化完了');
  } catch (e) {
    console.log('AdMob初期化エラー:', e);
  }
}

async function showInterstitialAd() {
  try {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) return;
    
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_AD_ID });
    await AdMob.showInterstitial();
  } catch (e) {
    console.log('インタースティシャル広告エラー:', e);
  }
}

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // 初期画面を表示
  showHome();
  
  // AdMob初期化
  initAdMob();
});
