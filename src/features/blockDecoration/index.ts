import * as vscode from 'vscode';
import { loadConfig } from '../../config';
import { setupBlockColorMapping } from '../../config/blockDecoration/blockColor';
import { BlockIcon, setupBlockIconMapping } from '../../config/blockDecoration/blockIcon';

export function registerBlockDecorationProvider(context: vscode.ExtensionContext) {
  const provider = new JteBlockDecorationProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider)
  );
  context.subscriptions.push(provider);
}

class JteBlockDecorationProvider implements vscode.CodeLensProvider, vscode.Disposable {
  private regex = /^(?<!\{\}\s*\n?)\{.+\}$/;
  private emptyJsonRegex = /^\{\}\s*$/;
  private decorationTypes: Record<string, vscode.TextEditorDecorationType> = {};
  private blockIcon: BlockIcon;

  constructor() {
    this.initializeDecorationTypes();
  }

  private initializeDecorationTypes() {
    const config = loadConfig();

    // ブロックの色付けを非表示にする場合
    if (config?.blockDecoration?.hideBlockColor) {
      this.decorationTypes = {};
    } else {
      // ブロックの種類ごとの色を設定
      const blockColor = setupBlockColorMapping(config);
      const decorationTypes: Record<string, vscode.TextEditorDecorationType> = {};
      for (const [typeKey, color] of Object.entries(blockColor)) {
        decorationTypes[typeKey] = vscode.window.createTextEditorDecorationType({
          before: {
            contentText: '',
            margin: '0 8px 0 0',
            textDecoration: color !== ''
              ? `none; border-left: 4px solid ${color};`
              : 'none; border-left: 4px solid rgba(0, 0, 0, 0);'
          }
        });
      }
      this.decorationTypes = decorationTypes;
    }

    if (config?.blockDecoration?.hideBlockIcon) {
      this.blockIcon = {};
    } else {
      this.blockIcon = setupBlockIconMapping(config);
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

    // 全ての typeKey について行リストを初期化
    const decorationRangeMap: Record<string, vscode.Range[]> = {};
    for (const typeKey of Object.keys(this.decorationTypes)) {
      decorationRangeMap[typeKey] = [];
    }

    let i = 0;
    let blockNumber = 1;

    while (i < lineCount) {
      const lineText = document.lineAt(i).text;

      // コメントアウトブロックの場合はスキップ
      if (this.emptyJsonRegex.test(lineText)) {
        let j = i + 1;
        while (j < lineCount) {
          const nextLineText = document.lineAt(j).text;
          if (!nextLineText.trim()) {
            break;
          }
          j++;
        }
        i = j + 1;
        continue;
      }

      // JSON行の場合
      if (this.regex.test(lineText)) {
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(lineText);
        } catch {
          i++;
          continue;
        }

        // ブロックの種類を決定
        let blockType = parsedJson.type ?? 'default';
        // preset があれば preset に応じた blockType に変更
        if (parsedJson.preset && config?.codeCompletion?.json?.default?.values?.preset) {
          const presetConfig = config.codeCompletion.json.default.values.preset;
          for (const item of presetConfig) {
            if (item.value === parsedJson.preset && item.description) {
              blockType = item.description.split(':')[0];
              break;
            }
          }
        }

        // ブロックのアイコンを決定
        let blockIcon = this.blockIcon[blockType];
        if (!blockIcon) {
          blockIcon = '';
        }

        // マークがあればデコレーションテキストに追加
        let decorationText = "";
        if (parsedJson.mark) {
          decorationText = `🚩${parsedJson.mark}`;
        }

        const startLine = i;
        let j = i + 1;
        while (j < lineCount) {
          const nextLineText = document.lineAt(j).text;
          if (!nextLineText.trim()) {
            break;
          }
          j++;
        }
        const endLine = j - 1 >= startLine ? j - 1 : startLine;

        // CodeLens に追加
        lenses.push(
          new vscode.CodeLens(
            new vscode.Range(
              new vscode.Position(startLine, 0),
              new vscode.Position(startLine, 0)
            ),
            { title: `${blockIcon} ブロック番号: ${blockNumber++}　${decorationText}`, command: '' }
          )
        );

        if (!this.decorationTypes[blockType]) {
          blockType = 'default';
        }
        if (!this.decorationTypes[blockType]) {
          i = j + 1;
          continue;
        }

        // ブロック全行にデコレーションを適用
        for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
          decorationRangeMap[blockType].push(
            new vscode.Range(
              new vscode.Position(lineIndex, 0),
              new vscode.Position(lineIndex, 0)
            )
          );
        }

        i = j + 1;
      } else {
        i++;
      }
    }

    // 既存のデコレーションをクリア
    for (const [typeKey, decoration] of Object.entries(this.decorationTypes)) {
      textEditor.setDecorations(decoration, []);
    }

    // まとめて適用
    for (const [typeKey, ranges] of Object.entries(decorationRangeMap)) {
      const decoration = this.decorationTypes[typeKey];
      if (!decoration) continue;
      textEditor.setDecorations(decoration, ranges);
    }

    return lenses;
  }

  public dispose() {
    // Extension dispose 時にデコレーションを破棄
    for (const typeKey of Object.keys(this.decorationTypes)) {
      this.decorationTypes[typeKey].dispose();
    }
  }
}
