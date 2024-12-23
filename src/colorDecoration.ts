import * as vscode from 'vscode';

export function registerColorDecoration(context: vscode.ExtensionContext) {
    // DocumentHighlightProvider は今回不要なら削除してOK
    const colorProvider = new JteColorProvider();
    context.subscriptions.push(
        vscode.languages.registerDocumentHighlightProvider({ language: 'jte' }, colorProvider)
    );

    // デコレーション管理クラスを生成
    const decorationManager = new JteDecorationManager();

    // テキストドキュメントの変更時にデコレーションを更新
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'jte') {
            decorationManager.updateDecorations(event.document);
        }
    });

    // アクティブエディタ変更時にデコレーションを更新
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'jte') {
            decorationManager.updateDecorations(editor.document);
        }
    });

    // 拡張機能読み込み時点でアクティブなエディタが jte なら適用
    if (vscode.window.activeTextEditor?.document.languageId === 'jte') {
        decorationManager.updateDecorations(vscode.window.activeTextEditor.document);
    }
}

class JteDecorationManager {
    // 独自の色対応表
    private colorMap: { [key: string]: string } = {
        '0': '#ffffff',
        '1': '#20a0d6',
        '2': '#ff784c',
        '3': '#66cc40',
        '4': '#99ccff',
        '5': '#ccc0ff',
        '6': '#ffffa0',
        '7': '#808080',
        '8': '#c0c0c0',
        '9': '#2080cc',
        '10': '#ff3810',
        '11': '#00a010',
        '12': '#3e9ade',
        '13': '#a098ff',
        '14': '#ffcc20',
        '15': '#000000',
        '16': '#84aaff',
        '17': '#ffff40',
        '18': '#ff2020',
        '19': '#202040',
        '20': '#e08040',
        '21': '#f0c040',
        '22': '#4080c0',
        '23': '#40c0f0',
        '24': '#80ff80',
        '25': '#c08080',
        '26': '#8080ff',
        '27': '#ff80ff',
        '28': '#00a040',
        '29': '#00e060',
        '30': '#a060e0',
        '31': '#c080ff',
    };

    private decorationTypes: { [key: string]: vscode.TextEditorDecorationType } = {};

    constructor() {
        // ここがポイント： テキスト全体を塗りつぶすのではなく
        // before で色のサンプルだけを表示するようにする
        Object.entries(this.colorMap).forEach(([key, color]) => {
            this.decorationTypes[key] = vscode.window.createTextEditorDecorationType({
                // こちらの backgroundColor や border は削除して
                // 必要に応じて overviewRulerColor も使わない場合は消してOK
                overviewRulerColor: color,
                
                // 代わりに `before` を使って小さな四角を表示
                after: {
                    contentText: '',         // 見た目は四角だけにする
                    backgroundColor: color,  // 四角の塗りつぶし色
                    margin: '0 0 0 4px',     // テキストとの余白
                    width: '0.75em',         // 四角の大きさ（好みに応じて調整）
                    height: '0.75em',
                    border: '1px solid #888', // 薄い枠線
                }
            });
        });
    }

    public updateDecorations(document: vscode.TextDocument) {
        const editor = vscode.window.visibleTextEditors.find((e) => e.document === document);
        if (!editor) return;

        // 正規表現で `\C[番号]` を検出
        const regex = /\\C\[(\d+)\]/g;
        const text = document.getText();

        // 色ごとの範囲を格納
        const decorations: { [key: string]: vscode.DecorationOptions[] } = {};

        let match;
        while ((match = regex.exec(text)) !== null) {
            const colorKey = match[1]; // \C[1] → '1'
            if (!this.decorationTypes[colorKey]) {
                continue; // 対応色がなければスキップ
            }

            // マッチした位置を取得
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            if (!decorations[colorKey]) {
                decorations[colorKey] = [];
            }
            decorations[colorKey].push({ range });
        }

        // デコレーションを適用
        for (const [key, decorationType] of Object.entries(this.decorationTypes)) {
            // 各色に対応する range 配列を設定 (無ければ空配列)
            editor.setDecorations(decorationType, decorations[key] || []);
        }
    }
}

class JteColorProvider implements vscode.DocumentHighlightProvider {
    provideDocumentHighlights(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.DocumentHighlight[] | undefined {
        // 必要に応じてハイライトロジックを追加可能
        return undefined;
    }
}
