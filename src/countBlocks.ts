import * as vscode from 'vscode';
import { loadConfig } from './utils/jteConfig';

export function registerCountBlocksProvider(context: vscode.ExtensionContext) {
  const provider = new JteCountBlocksProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider)
  );
  context.subscriptions.push(provider);
}

class JteCountBlocksProvider implements vscode.CodeLensProvider, vscode.Disposable {
  private regex = /^(?<!\{\}\s*\n?)\{.+\}$/; // １行がJSON（空JSONを除外）かどうか判定
  private excludeTypes = ["label"]; // カウント対象外のtype値

  /**
   * decorationTypes[type] => TextEditorDecorationType
   * type: 'msg' | 'showPic' | 'delPic' | 'default' など
   * すべて「before 擬似要素で左端に縦線を描画」し、テキストとの間にマージンをとる
   */
  private decorationTypes: Record<string, vscode.TextEditorDecorationType> = {};

  constructor() {
    // 各typeに対応する色を設定
    const typeColorMap: Record<string, string> = {
      msg: 'rgba(0, 128, 255, 0.5)',     // 青
      showPic: 'rgba(0, 255, 128, 0.5)', // 緑
      delPic: 'rgba(255, 0, 128, 0.5)',  // ピンク
      default: 'rgba(128, 128, 128, 0.5)'// グレー
    };

    // Decoration の本体を "before" に集中させ、
    // CSS の textDecoration に "border-left" を埋め込む形で線を描画
    // また margin: '0 8px 0 0' でテキストとの間に 8px の空白を用意
    for (const [typeKey, color] of Object.entries(typeColorMap)) {
      this.decorationTypes[typeKey] = vscode.window.createTextEditorDecorationType({
        before: {
          contentText: '',
          margin: '0 8px 0 0', // 上 右 下 左 (VSCodeの場合)
          // ※ textDecoration に擬似CSS記述
          textDecoration: `none; border-left: 4px solid ${color};`
        }
      });
    }
  }

  public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
      return [];
    }

    const lenses: vscode.CodeLens[] = [];
    const config = loadConfig();
    const lineCount = document.lineCount;

    // typeごとに行を貯めるマップ: { msg: Range[], showPic: Range[], ... }
    const decorationRangeMap: Record<string, vscode.Range[]> = {};

    // typeごとの配列を初期化
    for (const typeKey of Object.keys(this.decorationTypes)) {
      decorationRangeMap[typeKey] = [];
    }

    let i = 0;
    let blockNumber = 1;

    // 行を走査して「ブロック」を見つける
    while (i < lineCount) {
      const lineText = document.lineAt(i).text;

      // JSON行かどうか
      if (this.regex.test(lineText)) {
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(lineText);
        } catch {
          // パース失敗なら次へ
          i++;
          continue;
        }

        // excludeTypes に該当するならスキップ
        if (parsedJson.type && this.excludeTypes.includes(parsedJson.type)) {
          i++;
          continue;
        }

        // ブロック開始行
        const startLine = i;
        // 空行またはEOFまで読み飛ばし
        let j = i + 1;
        while (j < lineCount) {
          const nextLineText = document.lineAt(j).text;
          if (!nextLineText.trim()) {
            break; // 空行で終了
          }
          j++;
        }
        // ブロック最終行
        const endLine = j - 1 >= startLine ? j - 1 : startLine;

        // CodeLens: JSON行(ブロック開始行)にだけ付与
        lenses.push(
          new vscode.CodeLens(
            new vscode.Range(
              new vscode.Position(startLine, 0),
              new vscode.Position(startLine, 0)
            ),
            { title: `ブロック番号: ${blockNumber++}`, command: '' }
          )
        );

        // JSON の type を確定
        let blockType = parsedJson.type ?? 'default';

        // preset があれば上書き
        if (parsedJson.preset && config?.codeCompletion?.json?.default?.values?.preset) {
          const presetConfig = config.codeCompletion.json.default.values.preset;
          for (const item of presetConfig) {
            if (item.value === parsedJson.preset && item.description) {
              blockType = item.description.split(' ')[0];
              break;
            }
          }
        }
        // decorationTypes に存在しないなら default
        if (!this.decorationTypes[blockType]) {
          blockType = 'default';
        }

        // ブロック全行( startLine ~ endLine )に対して
        // 「before 装飾」を適用するための Range を追加
        for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
          decorationRangeMap[blockType].push(
            new vscode.Range(
              new vscode.Position(lineIndex, 0),
              new vscode.Position(lineIndex, 0)
            )
          );
        }

        // 次のブロックへ。空行をスキップ
        i = j + 1;
      } else {
        i++;
      }
    }

    // すでに適用されているデコレーションをクリア
    for (const typeKey of Object.keys(this.decorationTypes)) {
      textEditor.setDecorations(this.decorationTypes[typeKey], []);
    }

    // まとめて適用
    for (const [typeKey, ranges] of Object.entries(decorationRangeMap)) {
      textEditor.setDecorations(this.decorationTypes[typeKey], ranges);
    }

    return lenses;
  }

  public dispose() {
    // 拡張破棄時にデコレーションも破棄
    for (const typeKey of Object.keys(this.decorationTypes)) {
      this.decorationTypes[typeKey].dispose();
    }
  }
}
