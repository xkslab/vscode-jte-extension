# VSCode拡張

## デバッグ方法
1. `npx tsc`でコンパイル
2. VSCodeの`Run and Debug`でExtensionの実行ボタンを押す

## リリース方法
1. `package.json`でバージョンを修正
2. `CHANGELOG.md`で修正内容を書く
3. 必要に応じて`README.md`や`docs/`の使い方ページを修正
4. `vsce package`でパッケージ化
5. `https://marketplace.visualstudio.com/manage/publishers/xks`に行き、Updateボタンでvsceファイルをアップロードする
6. `git tag vx.x.x` & push & Pull Request

# プラグイン
`docs/xksJsonTextEvent.js`に配置

## リリース方法
1. `docs/CHANGELOG.md`, `docs/CHANGELOG/vx.x.x.md`, `docs/index.md`を修正
2. `git tag Plugin-vx.x.x` & push & Pull Request

