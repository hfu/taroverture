# taroverture
Overture Maps Vector Tiles by Taro M., consumed through x-24b

# 指揮者の指示
- MapLibre GL JS を用いて地図を表示するサイトを docs に作成すること
  - docs のサイトは GitHub Pages でホスティングすること
  - docs のサイトは Vite でビルドすること。そのために必要な設定を行うこと
  - MapLibre GL JS は最新のバージョンを用いること
- そのウェブサイトでは、次の URL で tile.json が供給されるベクトルタイルを全て用いること
  - https://tunnel.optgeo.org/martin/addresses
  - https://tunnel.optgeo.org/martin/base
  - https://tunnel.optgeo.org/martin/buildings
  - https://tunnel.optgeo.org/martin/divisions
  - https://tunnel.optgeo.org/martin/places
  - https://tunnel.optgeo.org/martin/transportation
- まず、上記の tile.json を分析して、どのようなレイヤーがどのようなズームレベルの範囲にあるか確認すること。
  - Web へのアクセスが CLI で必要な場合は、curl または aria2c を用いること
  - 一時ファイルを保存することなく、なるべくパイプラインで処理すること
  - JSON の解析には https://superdb.org/ の super か、 jq を用いること
  - 分析の結果は、LAYERS.md にドキュメント化すること
- ドキュメントは日本語で書くこと
- GitHub Pages のベースURL設定（リポジトリ名に基づく）
  - https://hfu.github.io/taroverture になる
- Vite の設定における GitHub Pages デプロイメント用の base パス設定
  - 上記の通り、 `/taroverture/` に設定すること
- MapLibre GL JS の具体的なバージョン（"最新"の定義の明確化）
  - latest を用いること
- ベクトルタイルのスタイリング方針（デフォルトスタイル vs カスタムスタイル）
  - カスタムスタイルを用いること
  - レイヤ名から推論して、適切なスタイルを設定すること
- 各レイヤーの表示優先度・z-index の設定方針
  - 原則として、面、線、点の順番で表示すること
  - ただし、建築物は交通よりも上位になる。点の真下に置くようにすること
- レスポンシブデザインの要件（モバイル対応など）
  - モバイル対応を試みること
- ブラウザサポート範囲の明確化
  - 主要なブラウザでは動作すること
- パフォーマンス要件（初期表示速度、タイル読み込み速度など）
  - 可能な限り高速に表示できるようにすること
- エラーハンドリング方針（タイル読み込み失敗時の動作など）
  - コンソールにエラーメッセージを表示すること
- デフォルトの地図表示範囲・ズームレベルの設定
  - 東京駅付近とすること
- ユーザーインタラクション機能の要件（ズーム、パン、クリックイベントなど）
  - クリックすると地物の属性が表示されるようにすること
- デバッグ・開発用機能の要件（レイヤー切り替え、座標表示など）
  - あとで考える
- GitHub Actions ワークフローの設定要件（自動デプロイなど）
  - 使用しない
- LAYERS.md の具体的なフォーマット・記載項目の詳細
  - tile.json から主要な情報を抽出して、レイヤー名、ズームレベル範囲、ジオメトリタイプ、主な属性を記載すること
- 各タイルソースの認証・API キー要件の確認
  - 認証・API キーは不要である
- プロジェクトのライセンス・著作権表示要件
  - 自ら設定できるものは CC0 とすること
  - 使用するリソースのライセンスを尊重すること

## Copilot の情報要求
- FIXME

## Copilot の設計

### プロジェクト構成
- **ルートディレクトリ**: Viteプロジェクトとして設定
- **`docs/`**: GitHub Pages用の静的ファイル出力先（`vite build`で生成）
- **`src/`**: TypeScriptソースコード
- **`src/styles/`**: MapLibreスタイル生成ロジック

### 技術スタック
- **Vite**: 開発サーバー・ビルドツール
- **TypeScript**: 型安全なJavaScript
- **MapLibre GL JS**: ベクトルタイル地図ライブラリ（最新版）
- **GitHub Pages**: 静的サイトホスティング（`/taroverture/`ベースパス）

### スタイル生成戦略
- `src/styles/mapStyle.ts`でプログラマティックにMapLibreスタイルを生成
- レイヤータイプ（面・線・点）別にスタイル定義関数を分離
- LAYERS.mdの分析結果に基づく表示優先度設定
- カスタム色パレットによる統一感のあるデザイン

### レイヤー表示順序（下→上）
1. **基盤レイヤー**: bathymetry → land → land_cover → water → land_use
2. **行政区域**: division_area → division_boundary
3. **交通**: segment → connector
4. **建築物**: infrastructure → building → building_part
5. **地点**: place → division → address

### インタラクション機能

- **地図クリック**: 地物属性をポップアップ表示（最大10属性）
- **座標表示**: クリック位置の経緯度・ズームレベル表示
- **ナビゲーション**: ズーム・パンコントロール
- **スケール**: スケールバー表示
- **Globe Control**: 3D地球儀表示切り替え
- **Geolocation**: 現在位置の取得・表示・追跡機能
- **URL Hash**: 地図の状態（位置・ズーム）をURLに保存

### 開発・デプロイフロー
```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド（GitHub Pages用）
npm run build

# プレビュー
npm run preview
```

### エラーハンドリング
- MapLibre GL JSエラーをコンソールに出力
- タイルソース読み込み状況をログ表示
- 地物が見つからない場合は座標のみ表示
