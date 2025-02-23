"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerColorPreview = void 0;
const vscode = require("vscode");
const config_1 = require("../../config");
const colors_1 = require("../../config/codeCompletion/colors");
function registerColorPreview(context) {
    var _a;
    // DocumentHighlightProvider は今回不要なら削除してOK
    const colorProvider = new JteColorProvider();
    context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider({ language: 'jte' }, colorProvider));
    // デコレーション管理クラスを生成
    const colorPreviewManager = new ColorPreviewManager();
    // テキストドキュメントの変更時にデコレーションを更新
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'jte') {
            colorPreviewManager.updateColorPreviews(event.document);
        }
    });
    // アクティブエディタ変更時にデコレーションを更新
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'jte') {
            colorPreviewManager.updateColorPreviews(editor.document);
        }
    });
    // 拡張機能読み込み時点でアクティブなエディタが jte なら適用
    if (((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.languageId) === 'jte') {
        colorPreviewManager.updateColorPreviews(vscode.window.activeTextEditor.document);
    }
}
exports.registerColorPreview = registerColorPreview;
class ColorPreviewManager {
    constructor() {
        this.config = null;
        this.colorPreviewTypes = {};
        this.config = (0, config_1.loadConfig)();
        this.colorMap = (0, colors_1.setupColorMapping)(this.config);
        Object.entries(this.colorMap).map(([key, { color, description }]) => {
            this.colorPreviewTypes[key] = vscode.window.createTextEditorDecorationType({
                overviewRulerColor: color,
                after: {
                    contentText: '',
                    backgroundColor: color,
                    margin: '0 0 0 4px',
                    width: '0.75em',
                    height: '0.75em',
                    border: '1px solid #888', // 薄い枠線
                }
            });
        });
    }
    updateColorPreviews(document) {
        const editor = vscode.window.visibleTextEditors.find((e) => e.document === document);
        if (!editor)
            return;
        // 正規表現で `\C[番号]` を検出
        const regex = /\\C\[(\d+)\]/g;
        const text = document.getText();
        // 色ごとの範囲を格納
        const decorations = {};
        let match;
        while ((match = regex.exec(text)) !== null) {
            const colorKey = match[1]; // \C[1] → '1'
            if (!this.colorPreviewTypes[colorKey]) {
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
        for (const [key, decorationType] of Object.entries(this.colorPreviewTypes)) {
            // 各色に対応する range 配列を設定 (無ければ空配列)
            editor.setDecorations(decorationType, decorations[key] || []);
        }
    }
}
class JteColorProvider {
    provideDocumentHighlights(document, position) {
        // 必要に応じてハイライトロジックを追加可能
        return undefined;
    }
}
