# v0.0.6 更新内容
ブロックカラーの表示
- msg, showPicなどのコマンド種類に応じてブロックに色付きラインを表示するように
- `.jte.config.json`のプロパティ`hideBlockColor: false`によりブロックカラーを非表示にできるように
- `.jte.config.json`のプロパティ`blockColor: {}`によりブロックカラーをカスタマイズできるように
- プリセットのコマンド種類もブロックカラーに反映するように
  - `.jte.config.json`で設定した`preset`の`description`を読み取る。