# vscode-jte-extension

RPGツクールMZ用プラグイン"xksJsonTextEvent"の独自テキスト形式 (JTE) を編集するための VSCode 拡張機能です。

## 主な機能
- JTE ファイルのシンタックスハイライト
- コード補完
- コメントのトグル (`Ctrl + /`)
- ファイル保存時の通知

## インストール方法
1. [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/) からインストールする
2. または、このリポジトリからダウンロードした `.vsix` ファイルを VSCode にドラッグ＆ドロップしてインストールする

## 使用方法
1. VSCode で `.jte` ファイルを開く
2. 以下の機能を利用できます:
   - 自動補完
   - シンタックスハイライト
   - ショートカットキー (`Ctrl + /`) を使ったコメントのトグル

## 開発者向け
この拡張機能は TypeScript で記述され、VSCode API を活用しています。詳細なコードは [GitHub リポジトリ](https://github.com/your-username/vscode-jte-extension) を参照してください。

## 注意
この拡張機能は RPGツクールMZ のプロジェクトに依存しています。`.jte.config.json` ファイルで正しい `projectDir` を設定してください。

## ライセンス
MIT License
