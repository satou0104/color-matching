# iOSアプリ開発ノウハウ（Capacitor + Codemagic）

このドキュメントは「todo崩し」「左右」「日割りダイエット」アプリ開発で培ったノウハウをまとめたものです。

---

## ソースコード管理

- `www/` を編集したら必ずルート直下の同名ファイルにもコピーする（Codemagicが `cp index.html www/` で上書きするため）
- コピーコマンド例: `Copy-Item todo-kuzushi/www/app.js todo-kuzushi/app.js`
- `npx cap sync ios` で `www/` の内容が `ios/App/App/public/` に同期される（Windowsから実行可能）
- アイコンは `ios/App/App/Assets.xcassets/AppIcon.appiconset/` に配置、`Contents.json` に全サイズを登録する
- `Contents.json` は他アプリのものをそのまま流用できる

---

## Capacitorプロジェクト構成

- `package.json` で Capacitor 7系に統一（`@capacitor/cli`, `core`, `ios` すべて `^7.0.0`）
- `capacitor.config.json` の `webDir` 設定: `"www"`
- `www/` ディレクトリに `index.html`, `app.js`, `style.css` を配置
- ルートのファイルと `www/` のファイルを常に同期する
- `ios/App/App/public/` のファイルは `npx cap sync` で自動コピーされる
- Codemagicビルド時も `codemagic.yaml` でコピースクリプトを実行

---

## iOSデプロイメントターゲット

- Capacitor 7 は iOS 14以上が必要
- `ios/App/Podfile` で `platform :ios, '14.0'` に設定
- `ios/App/App.xcodeproj/project.pbxproj` の `IPHONEOS_DEPLOYMENT_TARGET` も `14.0` に変更（4箇所）

---

## アプリアイコン

- `Contents.json` に各サイズのアイコンファイル名を正しく記載する
  - iPhone用: 40, 58, 60, 80, 87, 120, 180px
  - iPad用: 20, 29, 40, 58, 76, 80, 152, 167px
  - ios-marketing用: 1024px

---

## Info.plist の設定

- `CFBundleDevelopmentRegion`: `ja`（日本語化、日付ピッカーの言語に影響）
- `CFBundleDisplayName`: アプリ表示名
- `GADApplicationIdentifier`: AdMobアプリID

---

## AdMob広告の実装

- `npm install @capacitor-community/admob@^7.0.3`（Capacitor 7に合わせる）
- `Podfile` に `pod 'CapacitorCommunityAdmob'` を追加
- `Info.plist` に `GADApplicationIdentifier` を追加
- `app.js` で `Capacitor.Plugins.AdMob` から初期化・`showBanner` 呼び出し
- 新規アプリは広告配信開始まで数時間〜数日かかる場合がある

---

## ローカル通知の実装

- `npm install @capacitor/local-notifications@^7.0.0`（バージョン指定が重要）
- 最新版（8.x）は Capacitor 8以上が必要なのでエラーになる
- `Podfile` に `pod 'CapacitorLocalNotifications'` を追加
- `Capacitor.Plugins.LocalNotifications` でアクセス
- `requestPermissions()` で通知許可を取得
- `schedule()` で `every: 'day'` の繰り返し通知を設定

---

## npx cap sync の重要性

- `npm install` の後は必ず `npx cap sync` を実行
- プラグインが `Podfile` に自動登録される
- `Found X Capacitor plugins` の表示でプラグイン検出を確認
- 検出されない場合は `npm install` が失敗している可能性あり

---

## Capacitorバージョン管理

- Capacitor本体とプラグインのメジャーバージョンを揃える（全て7系 or 全て8系）
- バージョン不一致は `npm install` で `ERESOLVE` エラーになる
- `@^7.0.0` のようにバージョン指定でインストール

---

## App Store Connect メタデータ

- プロモーションテキスト: 170文字以内
- キーワード: 100文字以内、カンマ区切り、ゲーム系とTODO系の両方を入れて流入を広げる
- 著作権: `© 2026 satou0104`
- カテゴリ: ゲーム / サブ: パズル
- レーティング: 4+（年齢制限の質問はすべていいえ）
- サポートURLはバージョンページに入力（アプリ情報ページではない）
- 配信済みバージョンは編集不可。次のバージョンアップ時に修正する

---

## 広告（AdMob）関連の申告

- 年齢制限の「機能」セクションで広告だけ「はい」、他はすべて「いいえ」
- プライバシーデータ収集で申告が必要なもの: デバイスID・広告データ・製品の操作・クラッシュデータ
- 広告データのトラッキング目的使用: いいえ（ATT未実装の場合）

---

## app-ads.txt

- 開発者ウェブサイトのルートに置くファイル（アプリごとではなく開発者単位で1つ）
- `satou0104.github.io` リポジトリを作成してGitHub Pagesで公開するのが最も手軽
- 内容: `google.com, pub-8707369701475326, DIRECT, f08c47fec0942fa0`
- App StoreのアプリリスティングにサポートURLを登録しないとAdMobが検出できない
- 配信済みアプリはバージョンアップ時にサポートURLを追加する

---

## PRIVACY.md / SUPPORT.md

- GitHubリポジトリのルートに作成してpush
- プライバシーポリシーURL: `https://github.com/satou0104/<repo>/blob/main/PRIVACY.md`
- サポートURL: `https://github.com/satou0104/<repo>/blob/main/SUPPORT.md`
- AdMobを使っている場合は `PRIVACY.md` にAdMob/Googleのプライバシーポリシーへのリンクを明記する

---

## Apple審査対応

### Guideline 4.2 (Minimum Functionality)
- WebViewベースのアプリは「Webサイトでもできる」と判断されやすい
- ネイティブ機能（ローカル通知等）の追加が効果的
- グラフ、マスコット、独自機能を追加
- 異議申し立て（App Reviewへの返信）も有効

### Guideline 1.4.1 (Safety - Physical Harm)
- 体重管理アプリは「医療情報」と見なされる
- アプリ内に免責事項と引用元リンクを記載する必要がある
- 「医療アドバイスではない」旨の明記
- 厚生労働省等の公的機関へのリンクを追加
- e-ヘルスネットは2025年3月末で閉鎖 → 健康日本21（kennet.mhlw.go.jp）に移行

---

## プライバシーポリシーの更新（広告追加時）

- AdMob使用時は「データ収集なし」から変更が必要
- App Store Connectの「アプリのプライバシー」で使用状況データ・デバイスIDを申告
- `README.md` のプライバシーポリシーにAdMobのデータ収集について追記
- Googleのプライバシーポリシーへのリンクを追加

---

## .gitignore の設定

- 証明書ファイル（`.key`, `.p12`, `.pem`, `.cer`, `.mobileprovision`）を必ず除外
- `node_modules/`, `ios/App/Pods/`, `DerivedData/` を除外
- OS生成ファイル（`.DS_Store`, `Thumbs.db`）を除外

---

## UI実装ノウハウ

### Canvas APIによるグラフ
- 外部ライブラリなしで Canvas API で描画
- `devicePixelRatio` に合わせてcanvas解像度を設定（Retina対応）
- Y軸ラベルは0.5単位に丸め、範囲に応じてステップを自動調整（0.5/1/2）
- 7日/30日の切り替えボタン

### スワイプ機能
- `touchstart`/`touchmove`/`touchend` イベントで実装
- `touchmove` で指の動きに追従して `translateX` でスライド
- `touchend` でスワイプ距離を判定（閾値40px）
- アニメーション付きで月を切り替え
- `{ passive: true }` オプションでパフォーマンス最適化

### セーフエリア対応（iPhoneノッチ・ホームバー）
- viewportに `viewport-fit=cover` を追加
- bodyに `padding-top: env(safe-area-inset-top)` と `padding-bottom: env(safe-area-inset-bottom)`
- 横スクロール防止: `html, body { overflow-x: hidden; width: 100%; }`

### マスコット画像
- SVGでの描画は品質に限界がある → PNG画像を推奨
- ChatGPTで複数パターンの画像を生成
- 透過PNGで作成し、全画像を同じサイズに統一
- グラフ内に `position: absolute` で中央配置、`opacity: 0.3` で透過表示
- `pointer-events: none` でグラフ操作を妨げない

### 保留色モード
- CSSの `repeating-linear-gradient` で斜線模様を実現
- 白16px + 色16pxの32px間隔連続
- 成功日数に応じてクラスを切り替え
- 色が薄い場合はrgbaの透明度を上げる（0.15→0.25〜0.3）
- レインボーは各色を16px間隔で配置

### トグルスイッチ
- CSSのみでiOS風トグルスイッチを実装
- `LocalStorage` で設定値を保存・復元
- トグル変更時にリアルタイムで画面に反映
- デフォルト値の管理（イルカ: ON、保留色: OFF、リマインダー: OFF）

### CSSレイアウト
- flexboxの `gap` プロパティで要素間の間隔を制御（paddingではない）
- `position: absolute` で画像を配置すると、テキストの位置に影響しない
- カレンダーセルは固定px（`height: 80px`）でテキスト量による変動を防止
- `text-overflow: ellipsis` ではみ出すテキストを省略

---

## 既存環境の流用

- 左右アプリで作成済みの証明書・Provisioning Profileを再利用
- Codemagicの環境変数（API Key等）は共通で使用可能
- 新しいBundle IDの登録: `com.satou0104.<appname>`

---

## Toggle-Nで得たノウハウ（2026年4月）

### Codemagic: xcworkspace vs xcodeproj
- CocoaPods使用時は必ず `--workspace` を使う（`--project` だと `import Capacitor` が解決できずビルド失敗）
- `codemagic.yaml` の変数名も `XCODE_WORKSPACE` にする
- 正しい設定:
  ```yaml
  vars:
    XCODE_WORKSPACE: "ios/App/App.xcworkspace"
    XCODE_SCHEME: "App"
  scripts:
    - name: Build iOS
      script: |
        xcode-project build-ipa \
          --workspace "$XCODE_WORKSPACE" \
          --scheme "$XCODE_SCHEME"
  ```

### Codemagic: ビルド番号インクリメント必須
- 同じビルド番号を2回アップロードすると `The bundle version must be higher than the previously uploaded version` エラーになる
- `agvtool new-version` で毎回自動インクリメントする
- CocoaPods installの後、code signing設定の前に実行する:
  ```yaml
  - name: Increment build number
    script: |
      cd ios/App
      agvtool new-version -all $(($(date +%s) / 60))
  ```

### Codemagic: app_store_connect の認証方式
- `api_key` / `key_id` / `issuer_id` 方式ではなく `auth: integration` を使う
- `integrations: app_store_connect: codemagic` と組み合わせる
- `instance_type: mac_mini_m1` を指定する

### npx cap sync の実行場所
- `package.json` があるフォルダ（アプリのルート）で実行する
- 一つ上のフォルダで実行すると `could not determine executable to run` エラーになる

### Capacitor: iOSデプロイメントターゲット
- `npx cap add ios` で生成される `Podfile` と `project.pbxproj` は自動で `14.0` になる場合がある
- 念のため確認してから修正する（毎回手動修正が不要なこともある）

### セーフエリアの背景色
- iPhoneのホームバー周辺（セーフエリア）がWebViewのデフォルト白になる場合がある
- `capacitor.config.json` の `ios.backgroundColor` でアプリ背景色を指定して解消:
  ```json
  "ios": {
    "contentInset": "always",
    "backgroundColor": "#0a0a0f"
  }
  ```

### AdMob: インタースティシャル + リワード実装パターン
- `@capacitor-community/admob@^7.0.3` をインストール（Capacitor 7に合わせる）
- `npx cap sync ios` でPodfileに `CapacitorCommunityAdmob` が自動追加される
- `app.js` での実装パターン:
  ```js
  async function initAdMob() {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) return;
    await AdMob.initialize({ requestTrackingAuthorization: false });
  }

  async function showInterstitialAd() {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) return;
    await AdMob.prepareInterstitial({ adId: '広告ユニットID' });
    await AdMob.showInterstitial();
  }

  async function showRewardedAd(onRewarded) {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) { onRewarded(); return; }
    await AdMob.prepareRewardVideoAd({ adId: '広告ユニットID' });
    AdMob.addListener('onRewarded', () => { onRewarded(); });
    await AdMob.showRewardVideoAd();
  }
  ```
- 広告取得失敗時もコールバックを実行してユーザー体験を損なわないようにする

### App Store Connect: 概要テキストの注意点
- `★` などの特殊文字は「無効な文字」として弾かれる
- `×`（全角）も弾かれる場合がある → `x`（半角）を使う
- 絵文字は使用可能

### App Store Connect: プライバシー申告（AdMob使用時）
- 「データを収集する」→ はい
- 申告項目: デバイスID（サードパーティ広告）・広告データ・製品の操作・クラッシュデータ
- トラッキング目的の使用: いいえ（ATT未実装の場合）
- 連絡先情報（名前・メール・電話・所在地）はすべてチェックなし

### Contents.json: アイコンサイズ
- 新規プロジェクトの `Contents.json` はデフォルトで1サイズしか登録されていない
- 他アプリの `Contents.json` をそのまま流用する
- iPhoneのみ対応の場合に必要なサイズ: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024px

---

## セーフエリア・レイアウト安定化（Toggle-N追記・調査中）

### ダイアログ表示後にレイアウトが変化する問題
- iOSでダイアログ（overlay）を表示・非表示するとレイアウトが変化することがある
- ブラウザ（PC・GitHub Pages）では再現しない → iOS WebView固有の挙動
- 動的テキスト（innerHTML）をダイアログ内に追加してから発生するようになった
- 原因はまだ特定中。以下の対策を試したが完全解決には至っていない

### 試した対策
- `dialog-box` に `min-height` を設定してテキスト量でサイズが変わらないようにする
- `dialog-hint-desc` に `min-height` を設定
- ボードサイズを起動時に一度だけ計算して変数に固定する
- `DOMContentLoaded` 後に100ms遅延させてセーフエリア確定後にサイズ計算する
- 起動時の `window.innerHeight` をCSS変数 `--app-height` に固定して `.screen` の高さを固定する

### capacitor.config.jsonのbackgroundColor設定
- セーフエリア（ホームバー周辺）がWebViewのデフォルト白になる場合がある
- `ios.backgroundColor` にアプリ背景色を指定して解消する:
  ```json
  "ios": {
    "contentInset": "always",
    "backgroundColor": "#0a0a0f"
  }
  ```
- `contentInset: "always"` と組み合わせて使う

---

## AdMob リワード広告の正しい実装（@capacitor-community/admob v7）

### 重要: showRewardVideoAd() は Promise<AdMobRewardItem> を返す
- v7では `showRewardVideoAd()` の `await` が広告クローズ後に解決し、報酬情報を直接返す
- イベントリスナー（`'onRewarded'` 等）は不要
- 古い記事にある `AdMob.addListener('onRewarded', ...)` は v7では動作しない

### 正しい実装パターン
```js
async function showRewardedAd(onRewarded) {
  try {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) { onRewarded(); return; }
    await AdMob.prepareRewardVideoAd({ adId: REWARD_AD_ID });
    const rewardItem = await AdMob.showRewardVideoAd();
    if (rewardItem) { onRewarded(); }
  } catch (e) {
    onRewarded(); // 広告失敗時もコールバック実行
  }
}
```

### CSSアニメーション vs setInterval（iOS WebView）
- iOSのWebViewでは広告（ネイティブUI）表示中にCSSアニメーションが停止する
- `setInterval` も同様に停止する
- 解決策: 広告が閉じた後にアニメーション/点滅を開始する（`await` 解決後）
- `showRewardVideoAd()` の `await` が解決 = 広告が完全に閉じた後なので、その直後に処理を実行すれば問題ない

---

## 100ステージゲームのテンプレート構成（Toggle-Nベース）

### アプリ構成
- `www/index.html`, `www/app.js`, `www/style.css` の3ファイル構成
- ルート直下にも同名ファイルをコピー（Codemagic対応）
- Capacitor 7 + iOS 14以上

### ステージ設計
- 固定シード（`seededRandom`）で再現性のあるステージ生成
- `tapCounts`（難易度）と `seeds`（乱数シード）の配列で100ステージを定義
- ステージ構成例: 易しい10 → 普通20 → 難しめ30 → 上級25 → 最上級15
- `minMoves`（最短手数）をステージデータに含めて星評価に使用
- 解のタップ列（`solution`）も保存してヒント機能に使用

### 星評価
- ★★★: 最短手数以内
- ★★: 最短×1.5以内
- ★: 最短×2以内
- ベストスコアを `localStorage` に保存（`{ moves, stars }`）
- ステージ選択画面に星バッジ表示
- クリア画面に星アニメーション + 手数/最短の比較表示

### ヒント機能
- 解のタップ列を保存しておき、`hintStep` で何手目まで案内済みかを管理
- ヒント使用時: 初期状態から `hintStep` 手分だけ再現 → 次の1手を点滅
- 点滅は `setInterval` で制御（CSSアニメーションはiOS広告表示後に停止するため）
- タップ・リセット・次のヒントで点滅停止（`stopHintBlink`）
- リワード広告連動: `await AdMob.showRewardVideoAd()` 解決後に `applyHint()` 実行

### 広告構成
- インタースティシャル: 5ステージ連続クリアで表示（`consecutiveClear % 5 === 0`）
- リワード: ヒント使用時に表示
- ホーム・ステージ選択に戻ると連続クリアカウントリセット
- 広告失敗時もコールバック実行（ユーザー体験を損なわない）

### 画面構成
- ホーム画面: ロゴ + PLAY + 遊び方 + クリア数/ステージ数
- ステージ選択: 5列グリッド + クリア済みバッジ + 星バッジ
- ゲーム画面: ヘッダー（戻る・ステージ名・リセット）+ 手数/残り + 星基準 + ボード + プログレスバー + ヒントボタン
- クリア画面: 星アニメーション + 手数/最短 + 次のステージ/ステージ選択
- 遊び方画面: ルール説明 + インタラクティブデモ

### UI共通パターン
- ダークテーマ（`--bg: #0a0a0f`）
- セーフエリア対応（`env(safe-area-inset-top/bottom)`）
- `capacitor.config.json` の `ios.backgroundColor` でセーフエリア背景色を統一
- 画面遷移: `opacity` + `translateY` のCSSトランジション
- 初期画面は `no-transition` クラスでアニメーションスキップ
- ヒント確認ダイアログ: `dialog-overlay` + `dialog-box`

### codemagic.yaml テンプレート
- `instance_type: mac_mini_m1`
- `integrations: app_store_connect: codemagic`
- `xcworkspace` を使う（CocoaPods使用時は必須）
- `agvtool new-version` でビルド番号自動インクリメント
- `auth: integration` で App Store Connect 認証

---


## Color Match（色合わせパズル）の作り方

### アプリコンセプト
- 目標色を見て、RGBスライダーを調整して同じ色を再現するパズルゲーム
- 100ステージで難易度が上がる（許容誤差、制限時間、色の複雑さ）
- 星評価: 色の一致度で★1〜3を獲得
- Toggle-Nのテンプレート構成をベースに開発

---

### ステージ設計

#### ステージデータ構造
```js
const stages = [
  { 
    id: 1, 
    targetColor: { r: 255, g: 100, b: 50 },
    tolerance: 30,        // 許容誤差（色差）
    timeLimit: 60,        // 制限時間（秒）
    difficulty: 'easy'
  },
  // ... 100ステージ
];
```

#### 難易度構成
- **ステージ1-20（易しい）**: 許容誤差30、制限時間60秒、原色に近い色
- **ステージ21-40（普通）**: 許容誤差20、制限時間45秒、中間色
- **ステージ41-60（難しめ）**: 許容誤差15、制限時間30秒、微妙な色合い
- **ステージ61-80（上級）**: 許容誤差10、制限時間20秒、グレー系・パステル系
- **ステージ81-100（最上級）**: 許容誤差5、制限時間15秒、複雑な色

#### 星評価基準
- ★★★: 色差5以内（ほぼ完璧）
- ★★: 色差10以内（良い）
- ★: 色差15以内（クリア）
- 色差の計算: `Math.sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2)`（ユークリッド距離）

---

### UI設計

#### 画面構成
1. **ホーム画面**: ロゴ + PLAY + 遊び方 + クリア数/100
2. **ステージ選択**: 5列グリッド + クリア済みバッジ + 星バッジ
3. **ゲーム画面**: 
   - ヘッダー（戻る・ステージ番号・残り時間）
   - 目標色の表示エリア（上半分）
   - 作成中の色の表示エリア（下半分）
   - RGBスライダー（3本）
   - RGB数値表示（0-255）
   - 色差メーター（リアルタイム）
   - 決定ボタン
4. **クリア画面**: 星アニメーション + 色差/許容誤差 + 次のステージ/ステージ選択
5. **失敗画面**: 時間切れ表示 + リトライ/ステージ選択

#### 色表示エリア
- 目標色: 画面上部に大きく表示（200x200pxの正方形）
- 作成中の色: 画面中央に表示（200x200pxの正方形）
- 両方を並べて比較しやすくする
- 背景は暗色（`#0a0a0f`）で色が映えるようにする

#### スライダーデザイン
- 各スライダーに色ラベル（R・G・B）と数値表示
- スライダーのトラック色をそれぞれの色に対応させる
  - Rスライダー: 赤のグラデーション
  - Gスライダー: 緑のグラデーション
  - Bスライダー: 青のグラデーション
- `input[type="range"]` のカスタムCSS（iOS対応）

#### 色差メーター
- リアルタイムで色差を表示（0〜100のプログレスバー）
- 色差が小さいほど緑、大きいほど赤にグラデーション
- 「あと少し！」「近い！」「遠い」などのテキスト表示

---

### ゲームロジック

#### 色差計算（ユークリッド距離）
```js
function calculateColorDifference(color1, color2) {
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}
```

#### 星評価判定
```js
function getStars(colorDiff) {
  if (colorDiff <= 5) return 3;
  if (colorDiff <= 10) return 2;
  if (colorDiff <= 15) return 1;
  return 0;
}
```

#### タイマー処理
```js
let timeLeft = stage.timeLimit;
let timerInterval = setInterval(() => {
  timeLeft--;
  updateTimerDisplay(timeLeft);
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    showFailScreen();
  }
}, 1000);
```

#### スライダー変更時の処理
```js
function onSliderChange() {
  const r = parseInt(rSlider.value);
  const g = parseInt(gSlider.value);
  const b = parseInt(bSlider.value);
  
  // 作成中の色を更新
  currentColorBox.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  
  // RGB数値表示を更新
  rValue.textContent = r;
  gValue.textContent = g;
  bValue.textContent = b;
  
  // 色差をリアルタイム計算
  const diff = calculateColorDifference(
    { r, g, b },
    stage.targetColor
  );
  updateColorDiffMeter(diff);
}
```

#### 決定ボタン処理
```js
function onSubmit() {
  clearInterval(timerInterval);
  
  const r = parseInt(rSlider.value);
  const g = parseInt(gSlider.value);
  const b = parseInt(bSlider.value);
  
  const diff = calculateColorDifference(
    { r, g, b },
    stage.targetColor
  );
  
  const stars = getStars(diff);
  
  if (stars > 0) {
    saveBestScore(stageId, { diff, stars });
    showClearScreen(stars, diff);
  } else {
    showFailScreen();
  }
}
```

---

### ヒント機能

#### ヒントの種類
1. **1色のヒント**: R・G・Bのうち1色の正解値を表示（リワード広告）
2. **範囲ヒント**: 各色の正解値の±20の範囲を表示（リワード広告）
3. **完全ヒント**: すべての正解値を表示（リワード広告×2）

#### ヒント実装
```js
async function showColorHint() {
  try {
    const { AdMob } = Capacitor.Plugins;
    if (!AdMob) { applyHint(); return; }
    await AdMob.prepareRewardVideoAd({ adId: REWARD_AD_ID });
    const rewardItem = await AdMob.showRewardVideoAd();
    if (rewardItem) { applyHint(); }
  } catch (e) {
    applyHint(); // 広告失敗時もヒント表示
  }
}

function applyHint() {
  // 未使用のヒントを1つ適用
  if (!hintUsed.r) {
    rSlider.value = stage.targetColor.r;
    hintUsed.r = true;
    showHintMessage('Rの値をセットしました！');
  } else if (!hintUsed.g) {
    gSlider.value = stage.targetColor.g;
    hintUsed.g = true;
    showHintMessage('Gの値をセットしました！');
  } else if (!hintUsed.b) {
    bSlider.value = stage.targetColor.b;
    hintUsed.b = true;
    showHintMessage('Bの値をセットしました！');
  }
  onSliderChange(); // 色を更新
}
```

---

### 広告構成

#### インタースティシャル広告
- 5ステージ連続クリアで表示（Toggle-Nと同じパターン）
- ホーム・ステージ選択に戻ると連続クリアカウントリセット

#### リワード広告
- ヒント使用時に表示
- 広告視聴後にヒント適用
- 広告失敗時もヒント表示（ユーザー体験を損なわない）

---

### ステージ生成スクリプト

#### 100ステージの自動生成
```js
function generateStages() {
  const stages = [];
  
  for (let i = 1; i <= 100; i++) {
    let difficulty, tolerance, timeLimit;
    
    if (i <= 20) {
      difficulty = 'easy';
      tolerance = 30;
      timeLimit = 60;
    } else if (i <= 40) {
      difficulty = 'normal';
      tolerance = 20;
      timeLimit = 45;
    } else if (i <= 60) {
      difficulty = 'hard';
      tolerance = 15;
      timeLimit = 30;
    } else if (i <= 80) {
      difficulty = 'expert';
      tolerance = 10;
      timeLimit = 20;
    } else {
      difficulty = 'master';
      tolerance = 5;
      timeLimit = 15;
    }
    
    // ランダムな目標色を生成（seededRandom使用）
    const seed = 10000 + i * 137; // 固定シード
    const rng = seededRandom(seed);
    
    const targetColor = {
      r: Math.floor(rng() * 256),
      g: Math.floor(rng() * 256),
      b: Math.floor(rng() * 256)
    };
    
    stages.push({
      id: i,
      targetColor,
      tolerance,
      timeLimit,
      difficulty
    });
  }
  
  return stages;
}
```

---

### 色覚対応（アクセシビリティ）

#### 色盲モード
- 設定画面でトグルスイッチを追加
- 色差メーターに数値表示を追加（色だけに頼らない）
- スライダーに明確なラベルと数値表示

#### ハイコントラストモード
- 背景色と文字色のコントラスト比を確保（WCAG AA基準）
- ボタンに明確な枠線を追加

---

### LocalStorage保存データ

```js
// ベストスコア
localStorage.setItem('colorMatchBest_' + stageId, JSON.stringify({
  diff: colorDifference,
  stars: stars,
  time: timeUsed
}));

// 設定
localStorage.setItem('colorMatchSettings', JSON.stringify({
  colorBlindMode: false,
  highContrast: false,
  soundEnabled: true
}));

// 進行状況
localStorage.setItem('colorMatchProgress', JSON.stringify({
  clearedStages: [1, 2, 3, ...],
  totalStars: 150
}));
```

---

### 開発の流れ

1. **Toggle-Nのコピー**: プロジェクトフォルダをコピーして `color-match` にリネーム
2. **Bundle ID変更**: `com.satou0104.colormatch` に変更
3. **app.js書き換え**: ゲームロジックを色合わせに変更
4. **style.css調整**: スライダー、色表示エリアのスタイル追加
5. **ステージデータ生成**: 100ステージの目標色を生成
6. **ヒント機能実装**: リワード広告連動
7. **ローカルテスト**: ブラウザで動作確認
8. **iOS同期**: `npx cap sync ios`
9. **Xcodeでビルド**: 実機テスト
10. **Codemagic設定**: `codemagic.yaml` の Bundle ID とアプリ名を変更
11. **App Store Connect**: 新規アプリ登録、メタデータ入力
12. **審査提出**: プライバシーポリシー、スクリーンショット、説明文

---

### App Store メタデータ案

#### アプリ名
- 日本語: 色合わせパズル - Color Match
- 英語: Color Match Puzzle

#### サブタイトル
- 日本語: RGBで色を作る脳トレゲーム
- 英語: RGB Color Mixing Brain Game

#### キーワード
```
色,パズル,RGB,脳トレ,カラー,デザイン,ゲーム,クイズ,学習,教育
```

#### 説明文
```
目標の色を見て、RGBスライダーを調整して同じ色を再現するパズルゲーム！

【特徴】
・100ステージの色合わせチャレンジ
・星評価で腕試し
・制限時間内にクリアを目指そう
・ヒント機能で初心者も安心
・色覚に配慮したアクセシビリティ対応

【こんな人におすすめ】
・デザイナー、イラストレーター
・色彩感覚を鍛えたい人
・脳トレが好きな人
・パズルゲームが好きな人

RGBの仕組みを楽しく学べる教育的な要素もあります！
```

#### カテゴリ
- プライマリ: ゲーム
- セカンダリ: パズル

---

### プライバシーポリシー追記

`PRIVACY.md` に以下を追記:
```markdown
## 色覚対応について
本アプリは色盲モードを搭載しており、色だけに頼らない情報表示を行っています。
設定画面から有効化できます。
```

---

### 注意点

- **色差計算の精度**: ユークリッド距離は人間の色知覚と完全には一致しないが、ゲームとしては十分
- **スライダーの操作性**: iOSのタッチ操作で細かい調整ができるよう、スライダーのサイズを大きめに
- **タイマーの停止**: 広告表示中はタイマーを一時停止する（`clearInterval` → 広告終了後に再開）
- **色の見やすさ**: 背景色を暗くして目標色が映えるようにする
- **審査対策**: 「教育的要素」を強調してMinimum Functionality回避

---
