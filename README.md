# xksJsonTextEvent

RPGツクールMZ用のプラグイン `xksJsonTextEvent` は、独自形式 "JTE (Json Text Event)" を使用してイベントを簡単かつ柔軟に記述・管理できるツールです。このプラグインにより、イベント作成の効率化と可読性向上を実現します。

## 概要
このプラグインでは、イベントの構造をJSONとテキストの組み合わせで記述します。JTE形式に基づき、以下のようなイベント機能をサポートします：

- **メッセージ表示**：背景、名前、顔グラフィック、位置指定などをサポート。
- **ピクチャの表示と削除**：X/Y座標やスケール、透明度などを指定可能。
- **ラベルとジャンプ**：特定のラベルやインデックスへのジャンプ機能。
- **柔軟なプリセット**：繰り返し使用する設定を簡単に適用可能。

## 特徴
- **シンプルな構造**: JTE形式で簡潔にイベントを記述。
- **柔軟なコマンド実行**: RPGツクールMZのイベント機能を直接活用。
- **プリセット機能**: 設定の再利用を簡単に行える。
- **多言語対応**: RPGツクールMZの標準フォーマットと連携。

## プラグインのインストール
1. [xksJsonTextEvent.js](https://xkslab.github.io/vscode-jte-extension/xksJsonTextEvent.js) をダウンロードします。
2. プロジェクトの `js/plugins/` フォルダにファイルを配置します。
3. RPGツクールMZのプラグイン管理で `xksJsonTextEvent` を有効化します。

## 使用方法

### JTE形式の基本構造
JTE形式は、以下のような構造を持ちます：

```json
{"type": "msg", "name": "主人公", "bg": "dark"}
メッセージ内容

{"type": "showPic", "id": 1, "path": "img/pictures/sample.png"}

{"type": "delPic", "id": 1}
```

#### 主なコマンドタイプ
- **`msg`**: メッセージを表示。
- **`showPic`**: ピクチャを表示。
- **`delPic`**: ピクチャを削除。
- **`label`**: ラベルを定義。
- **`preset`**: プリセットパラメータを適用。

#### コメント
JSONヘッダーが空の場合、コメントとして扱われます。

```json
{}
この行はコメントになります。
```

### プリセットの使用
プラグインパラメータで事前に設定したプリセットを使用して、記述を簡略化できます。

```json
{"preset": "主人公", "name": "主人公（怒り）"}
怒りのセリフ内容。
```

### プラグインコマンド
- **コマンドリスト定義** (`DefineList`): イベントリストを定義します。
- **次のコマンドを実行** (`ExecuteNext`): リスト内の次のコマンドを実行します。
- **実行状態のリセット** (`ResetProgress`): 実行位置をリセットします。
- **コマンドリスト削除** (`DeleteList`): 指定のリストを削除します。
- **指定インデックスへジャンプ** (`JumpToIndex`): リスト内の特定インデックスへ移動。
- **指定ラベルへジャンプ** (`JumpToLabel`): 指定ラベルへジャンプします。
- **インデックス取得** (`GetIndex`): 現在のインデックスを取得。

## JTE形式の編集を支援するVSCode拡張
JTE形式のコーディングを支援するVisual Studio Code拡張機能 [vscode-jte-extension](https://marketplace.visualstudio.com/items?itemName=xks.vscode-jte-extension) を提供しています。この拡張機能を使用すると、以下のメリットがあります：

- シンタックスハイライト
- 補完機能
- 色プレビューや画像プレビュー
- コメントトグル

詳細は[こちら](https://marketplace.visualstudio.com/items?itemName=xks.vscode-jte-extension)をご覧ください。

## 更新情報
プラグインの最新情報や更新履歴は、[CHANGELOG](https://xkslab.github.io/vscode-jte-extension/CHANGELOG) を参照してください。

## 貢献
バグ報告や機能リクエストは、GitHubリポジトリで受け付けています。

## ライセンス
このプラグインはMITライセンスで提供されています。

