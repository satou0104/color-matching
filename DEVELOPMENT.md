# 開発ガイド

## 次のステップ

### 1. ローカルテスト（ブラウザ）
```bash
# www/index.htmlをブラウザで開く
# または、簡易サーバーを起動
npx http-server www -p 8080
```

ブラウザで `http://localhost:8080` を開いてゲームをテスト。

---

### 2. 依存関係のインストール
```bash
npm install
```

**注意**: Capacitor 7系に統一されているか確認。

---

### 3. iOS プロジェクトの追加
```bash
npx cap add ios
```

これで `ios/App/` ディレクトリが作成されます。

---

### 4. iOS デプロイメントターゲットの確認・修正

#### Podfile
`ios/App/Podfile` を開いて、以下を確認:
```ruby
platform :ios, '14.0'
```

#### project.pbxproj
`ios/App/App.xcodeproj/project.pbxproj` を開いて、`IPHONEOS_DEPLOYMENT_TARGET` を検索し、すべて `14.0` に変更（4箇所）。

---

### 5. アプリアイコンの準備

#### 必要なサイズ
- 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024px

#### 配置場所
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`

#### Contents.json
他のアプリの `Contents.json` をそのまま流用できます。

---

### 6. Info.plist の設定

`ios/App/App/Info.plist` を編集:

```xml
<key>CFBundleDevelopmentRegion</key>
<string>ja</string>

<key>CFBundleDisplayName</key>
<string>Color Match</string>

<key>GADApplicationIdentifier</key>
<string>ca-app-pub-8707369701475326~XXXXXXXXXX</string>
```

**注意**: `GADApplicationIdentifier` はAdMobで新規アプリを登録後に取得。

---

### 7. Capacitor同期
```bash
npx cap sync ios
```

**確認事項**:
- `Found 2 Capacitor plugins` と表示されるか確認
- `CapacitorCommunityAdmob` と `CapacitorLocalNotifications` が検出されるか

---

### 8. Xcodeでビルド
```bash
npx cap open ios
```

Xcodeが開いたら:
1. Bundle Identifier を `com.satou0104.colormatch` に設定
2. Signing & Capabilities で証明書を選択
3. 実機を接続してビルド

---

### 9. 広告ユニットIDの設定

#### AdMobで新規アプリを登録
1. [AdMob](https://apps.admob.com/) にログイン
2. 「アプリ」→「アプリを追加」
3. iOS を選択、Bundle ID を入力
4. アプリIDを取得（`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`）

#### 広告ユニットを作成
1. インタースティシャル広告ユニットを作成
2. リワード広告ユニットを作成
3. 各広告ユニットIDを取得

#### app.js を編集
`www/app.js` と `app.js` の両方を編集:
```js
const INTERSTITIAL_AD_ID = 'ca-app-pub-8707369701475326/XXXXXXXXXX';
const REWARD_AD_ID = 'ca-app-pub-8707369701475326/YYYYYYYYYY';
```

#### Info.plist を編集
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-8707369701475326~ZZZZZZZZZZ</string>
```

#### 再同期
```bash
npx cap sync ios
```

---

### 10. Codemagic設定

#### codemagic.yaml を編集
```yaml
APP_STORE_APP_ID: "XXXXXXXXXX" # App Store ConnectでアプリID取得後に設定
```

#### Codemagicにプロジェクトを追加
1. [Codemagic](https://codemagic.io/) にログイン
2. GitHubリポジトリを接続
3. `codemagic.yaml` を検出
4. App Store Connect統合を設定
5. ビルドを開始

---

### 11. App Store Connect設定

#### 新規アプリを登録
1. [App Store Connect](https://appstoreconnect.apple.com/) にログイン
2. 「マイApp」→「+」→「新規App」
3. Bundle ID: `com.satou0104.colormatch`
4. アプリ名: `色合わせパズル - Color Match`

#### メタデータを入力
`APP_STORE_METADATA.md` を参考に、以下を入力:
- サブタイトル
- プロモーションテキスト
- 説明文
- キーワード
- サポートURL
- プライバシーポリシーURL
- カテゴリ
- レーティング

#### スクリーンショットを追加
実機またはシミュレーターで撮影:
1. ホーム画面
2. ステージ選択画面
3. ゲーム画面
4. クリア画面
5. 遊び方画面

#### プライバシー申告
`APP_STORE_METADATA.md` の「プライバシー申告」セクションを参考に入力。

---

### 12. app-ads.txt の設定

#### satou0104.github.io リポジトリを作成
1. GitHubで新規リポジトリ `satou0104.github.io` を作成
2. `app-ads.txt` ファイルを作成:
```
google.com, pub-8707369701475326, DIRECT, f08c47fec0942fa0
```
3. GitHub Pagesを有効化

#### App Store ConnectにサポートURLを登録
バージョンページに以下を入力:
```
https://github.com/satou0104/color-match/blob/main/SUPPORT.md
```

---

### 13. 審査提出

#### TestFlightでテスト
1. Codemagicでビルドが完了したら、TestFlightで配信される
2. 実機でテストして動作確認

#### 審査に提出
1. App Store Connectで「審査に提出」をクリック
2. 審査用メモを入力（`APP_STORE_METADATA.md` 参照）
3. 提出

---

## トラブルシューティング

### npm install でエラーが出る
```bash
npm install --legacy-peer-deps
```

### npx cap sync で Capacitor plugins が検出されない
```bash
# node_modules を削除して再インストール
rm -rf node_modules
npm install
npx cap sync ios
```

### Xcodeでビルドエラー
- `import Capacitor` が解決できない → `--workspace` を使っているか確認
- CocoaPods のインストール:
```bash
cd ios/App
pod install
```

### 広告が表示されない
- 新規アプリは広告配信開始まで数時間〜数日かかる
- テスト広告IDを使用してテスト:
```js
const INTERSTITIAL_AD_ID = 'ca-app-pub-3940256099942544/4411468910'; // テスト用
const REWARD_AD_ID = 'ca-app-pub-3940256099942544/1712485313'; // テスト用
```

---

## 開発のヒント

### ファイル同期
`www/` を編集したら、必ずルート直下にもコピー:
```bash
Copy-Item www/index.html index.html
Copy-Item www/app.js app.js
Copy-Item www/style.css style.css
```

### ステージデータの調整
`app.js` の `generateStages()` 関数で難易度を調整できます:
```js
if (i <= 20) {
  tolerance = 30;  // 許容誤差
  timeLimit = 60;  // 制限時間
}
```

### 色差計算の調整
星評価の基準を変更する場合は `getStars()` 関数を編集:
```js
function getStars(colorDiff) {
  if (colorDiff <= 5) return 3;  // ★★★
  if (colorDiff <= 10) return 2; // ★★
  if (colorDiff <= 15) return 1; // ★
  return 0;
}
```

---

## 参考リンク

- [Capacitor公式ドキュメント](https://capacitorjs.com/docs)
- [AdMob公式ドキュメント](https://developers.google.com/admob/ios/quick-start)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Codemagic](https://codemagic.io/)
