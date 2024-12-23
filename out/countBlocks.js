"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCountBlocksProvider = registerCountBlocksProvider;
const vscode = require("vscode");
function registerCountBlocksProvider(context) {
    const provider = new JteCountBlocksProvider();
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider));
}
class JteCountBlocksProvider {
    constructor() {
        this.regex = /^(?<!\{\}\s*\n?)\{.+\}$/gm; // 空JSONを除くJSON部分を検出する正規表現
        this.excludeTypes = ["label"]; // カウント対象外のtype値
    }
    provideCodeLenses(document) {
        const lenses = [];
        const text = document.getText();
        let match;
        let blockNumber = 1;
        // 正規表現でJSON部分を検出
        while ((match = this.regex.exec(text)) !== null) {
            try {
                const jsonText = match[0]; // マッチした文字列
                const parsedJson = JSON.parse(jsonText); // JSONとして解析
                // typeプロパティをチェックして、対象外の値の場合はスキップ
                if (this.excludeTypes.includes(parsedJson.type)) {
                    continue;
                }
                const startPosition = document.positionAt(match.index);
                const endPosition = document.positionAt(match.index + match[0].length);
                // CodeLens を追加
                const range = new vscode.Range(startPosition, endPosition);
                lenses.push(new vscode.CodeLens(range, {
                    title: `ブロック番号: ${blockNumber++}`,
                    command: '',
                }));
            }
            catch (e) {
                // JSON解析に失敗した場合（無効なJSON）はスキップ
                continue;
            }
        }
        return lenses;
    }
}
