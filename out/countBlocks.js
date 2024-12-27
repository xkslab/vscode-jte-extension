"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCountBlocksProvider = registerCountBlocksProvider;
const vscode = require("vscode");
const jteConfig_1 = require("./utils/jteConfig");
const defaultConfig_1 = require("./utils/defaultConfig");
function registerCountBlocksProvider(context) {
    const provider = new JteCountBlocksProvider();
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: 'jte' }, provider));
    context.subscriptions.push(provider);
}
class JteCountBlocksProvider {
    constructor() {
        // １行がJSON（空JSONを除外）かどうか判定
        this.regex = /^(?<!\{\}\s*\n?)\{.+\}$/;
        // ブロックの先頭行に `{}のみ` があればコメントアウトとみなす
        this.emptyJsonRegex = /^\{\}\s*$/;
        this.excludeTypes = [""]; // カウント対象外のtype値
        /**
         * ユーザが「blockColor = false」やカスタムタイプを設定しているかを反映し、
         * 実際に使う DecorationType 一式を保持するマップ
         *   type => TextEditorDecorationType
         */
        this.decorationTypes = {};
        // コンストラクタ内でまとめて初期化
        this.initializeDecorationTypes();
    }
    /**
     * デフォルトカラー + ユーザ設定を反映して decorationTypes を初期化
     */
    initializeDecorationTypes() {
        const config = (0, jteConfig_1.loadConfig)();
        const userBlockColor = config === null || config === void 0 ? void 0 : config.blockColor;
        const hideBlockColor = config === null || config === void 0 ? void 0 : config.hideBlockColor;
        if (hideBlockColor) {
            this.decorationTypes = {};
            return;
        }
        // デフォルト + ユーザ上書き
        const mergedColorMap = Object.assign({}, defaultConfig_1.defaultTypeColorMap);
        if (typeof userBlockColor === 'object') {
            for (const [typeKey, colorOrOff] of Object.entries(userBlockColor)) {
                if (colorOrOff === false) {
                    delete mergedColorMap[typeKey];
                }
                else if (typeof colorOrOff === 'string') {
                    mergedColorMap[typeKey] = colorOrOff;
                }
            }
        }
        // mergedColorMap にある全ての type について DecorationType を作成
        const decorationTypes = {};
        for (const [typeKey, color] of Object.entries(mergedColorMap)) {
            decorationTypes[typeKey] = vscode.window.createTextEditorDecorationType({
                before: {
                    contentText: '',
                    margin: '0 8px 0 0', // テキストとの間に余白
                    // left border を擬似CSSで描画
                    textDecoration: color !== ''
                        ? `none; border-left: 4px solid ${color};`
                        : 'none; border-left: 4px solid rgba(0, 0, 0, 0);'
                }
            });
        }
        this.decorationTypes = decorationTypes;
    }
    /**
     * 実際にブロックを検出し、各行に decoration を適用する
     */
    provideCodeLenses(document) {
        var _a, _b, _c, _d, _e;
        const textEditor = vscode.window.activeTextEditor;
        if (!textEditor) {
            return [];
        }
        const lenses = [];
        const config = (0, jteConfig_1.loadConfig)();
        const lineCount = document.lineCount;
        // 全ての typeKey について行リストを初期化
        const decorationRangeMap = {};
        for (const typeKey of Object.keys(this.decorationTypes)) {
            decorationRangeMap[typeKey] = [];
        }
        let i = 0;
        let blockNumber = 1;
        while (i < lineCount) {
            const lineText = document.lineAt(i).text;
            // --- コメントアウトされたブロック（先頭行が {} の場合） ---
            if (this.emptyJsonRegex.test(lineText)) {
                // この行を先頭とし、次の空行（or EOF）までをコメントアウトとしてスキップ
                let j = i + 1;
                while (j < lineCount) {
                    const nextLineText = document.lineAt(j).text;
                    if (!nextLineText.trim()) {
                        // 空行に到達したので終了
                        break;
                    }
                    j++;
                }
                // j は空行 or EOF
                // この範囲はコメントアウトなので何もしない
                i = j + 1;
                continue;
            }
            // --- 実際のブロック開始行かどうか ---
            if (this.regex.test(lineText)) {
                let parsedJson;
                try {
                    parsedJson = JSON.parse(lineText);
                }
                catch (_f) {
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
                // 空行 or EOF まで読み進める
                let j = i + 1;
                while (j < lineCount) {
                    const nextLineText = document.lineAt(j).text;
                    if (!nextLineText.trim()) {
                        break; // 空行で終了
                    }
                    j++;
                }
                const endLine = j - 1 >= startLine ? j - 1 : startLine;
                // CodeLens は JSON行(=ブロック開始行)にだけ付与
                lenses.push(new vscode.CodeLens(new vscode.Range(new vscode.Position(startLine, 0), new vscode.Position(startLine, 0)), { title: `ブロック番号: ${blockNumber++}`, command: '' }));
                // JSON の type
                let blockType = (_a = parsedJson.type) !== null && _a !== void 0 ? _a : 'default';
                // preset があれば上書き
                if (parsedJson.preset && ((_e = (_d = (_c = (_b = config === null || config === void 0 ? void 0 : config.codeCompletion) === null || _b === void 0 ? void 0 : _b.json) === null || _c === void 0 ? void 0 : _c.default) === null || _d === void 0 ? void 0 : _d.values) === null || _e === void 0 ? void 0 : _e.preset)) {
                    const presetConfig = config.codeCompletion.json.default.values.preset;
                    for (const item of presetConfig) {
                        if (item.value === parsedJson.preset && item.description) {
                            blockType = item.description.split(':')[0];
                            break;
                        }
                    }
                }
                // decorationTypes に無い場合は default
                if (!this.decorationTypes[blockType]) {
                    blockType = 'default';
                }
                // default も無い可能性がある → その場合はスキップ
                if (!this.decorationTypes[blockType]) {
                    i = j + 1;
                    continue;
                }
                // ブロック全行にデコレーションを適用
                for (let lineIndex = startLine; lineIndex <= endLine; lineIndex++) {
                    decorationRangeMap[blockType].push(new vscode.Range(new vscode.Position(lineIndex, 0), new vscode.Position(lineIndex, 0)));
                }
                // 次のブロックへ（空行スキップ）
                i = j + 1;
            }
            else {
                // JSON行でなければ次へ
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
            if (!decoration)
                continue;
            textEditor.setDecorations(decoration, ranges);
        }
        return lenses;
    }
    dispose() {
        // Extension dispose 時にデコレーションを破棄
        for (const typeKey of Object.keys(this.decorationTypes)) {
            this.decorationTypes[typeKey].dispose();
        }
    }
}
