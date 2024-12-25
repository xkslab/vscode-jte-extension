"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCountBlocksProvider = registerCountBlocksProvider;
const vscode = require("vscode");
const jteConfig_1 = require("./utils/jteConfig");
function registerCountBlocksProvider(context) {
    const provider = new JteCountBlocksProvider();
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider));
    context.subscriptions.push(provider);
}
class JteCountBlocksProvider {
    constructor() {
        this.regex = /^(?<!\{\}\s*\n?)\{.+\}$/; // １行がJSON（空JSONを除外）かどうか判定
        this.excludeTypes = ["label"]; // カウント対象外のtype値
        this.decorationTypes = {};
        // 必要な type ごとに DecorationType を用意
        this.decorationTypes['msg'] = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(0, 128, 255, 0.5)', // 青
            borderRadius: '5px',
        });
        this.decorationTypes['showPic'] = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(0, 255, 128, 0.5)', // 緑
            borderRadius: '5px',
        });
        this.decorationTypes['delPic'] = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(255, 0, 128, 0.5)', // ピンク
            borderRadius: '5px',
        });
        this.decorationTypes['default'] = vscode.window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(128, 128, 128, 0.5)', // グレー
            borderRadius: '5px',
        });
    }
    provideCodeLenses(document) {
        var _a, _b, _c, _d, _e;
        const textEditor = vscode.window.activeTextEditor;
        if (!textEditor) {
            return [];
        }
        // 各デコレーションタイプに対応する Range の配列を用意
        const decorationRangesMap = {
            msg: [],
            showPic: [],
            delPic: [],
            default: [],
        };
        const lenses = [];
        const config = (0, jteConfig_1.loadConfig)();
        let blockNumber = 1;
        const lineCount = document.lineCount;
        let i = 0;
        // 行単位で「ブロック」を探す
        while (i < lineCount) {
            const lineText = document.lineAt(i).text;
            // この行がJSON行かどうか判定
            if (this.regex.test(lineText)) {
                // JSONとして解析し、type 等を取り出す
                let parsedJson;
                try {
                    parsedJson = JSON.parse(lineText);
                }
                catch (e) {
                    // JSONとしてパースできない場合は無視して次へ
                    i++;
                    continue;
                }
                // 指定の excludeTypes に該当する場合はスキップ
                if (parsedJson.type && this.excludeTypes.includes(parsedJson.type)) {
                    i++;
                    continue;
                }
                // ブロック開始行
                const startLine = i;
                // 次の空行またはファイル末までをブロックとする
                let j = i + 1;
                while (j < lineCount) {
                    const nextLineText = document.lineAt(j).text;
                    if (!nextLineText.trim()) {
                        // 空行に到達したらブロック終了
                        break;
                    }
                    j++;
                }
                // j は空行 or lineCount の位置
                // ブロック最終行
                const endLine = j - 1 >= startLine ? j - 1 : startLine;
                // CodeLens の表示は、通常「JSON行」に仕込みたいことが多いので
                // JSON行を Range にして CodeLens を追加する
                const jsonRange = new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(startLine, lineText.length));
                lenses.push(new vscode.CodeLens(jsonRange, {
                    title: `ブロック番号: ${blockNumber++}`,
                    command: '',
                }));
                // ボーダーの範囲 (ブロック全体)
                // startLine の先頭 ～ endLine の末尾
                const blockRange = new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(endLine, document.lineAt(endLine).text.length));
                // JSON内の type を確定
                let type = (_a = parsedJson.type) !== null && _a !== void 0 ? _a : 'default';
                // preset があれば、その description から type を上書き
                if (parsedJson.preset) {
                    const preset = parsedJson.preset;
                    if ((_e = (_d = (_c = (_b = config.codeCompletion) === null || _b === void 0 ? void 0 : _b.json) === null || _c === void 0 ? void 0 : _c.default) === null || _d === void 0 ? void 0 : _d.values) === null || _e === void 0 ? void 0 : _e.preset) {
                        const presetConfig = config.codeCompletion.json.default.values.preset;
                        for (const item of presetConfig) {
                            if (item.value === preset) {
                                if (item.description) {
                                    type = item.description.split(' ')[0];
                                }
                                break;
                            }
                        }
                    }
                }
                if (!decorationRangesMap[type]) {
                    type = 'default';
                }
                decorationRangesMap[type].push(blockRange);
                // 次のブロック探索へ。i は空行の次に進める
                // (j は空行、j+1 は次ブロックの先頭行)
                i = j + 1;
            }
            else {
                // JSON行でなければ次へ
                i++;
            }
        }
        // いったん既存デコレーションをクリア
        Object.values(this.decorationTypes).forEach(decorationType => {
            textEditor.setDecorations(decorationType, []);
        });
        // タイプごとにまとめてデコレーションを適用
        for (const [type, ranges] of Object.entries(decorationRangesMap)) {
            textEditor.setDecorations(this.decorationTypes[type], ranges);
        }
        return lenses;
    }
    dispose() {
        // Extension が dispose されるときにデコレーションも破棄
        Object.values(this.decorationTypes).forEach(decorationType => {
            decorationType.dispose();
        });
    }
}
