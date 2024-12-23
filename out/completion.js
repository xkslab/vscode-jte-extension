"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCompletionItemProvider = registerCompletionItemProvider;
const vscode = require("vscode");
const jteConfig_1 = require("./utils/jteConfig");
const overrideSchema_1 = require("./utils/overrideSchema");
const overrideControlSequence_1 = require("./utils/overrideControlSequence");
function registerCompletionItemProvider(context) {
    const provider = new JteCompletionItemProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'jte' }, provider, '"', ':', ',', '{', '[', '\\'));
    // 設定変更時のリスナーを登録
    const configWatcher = vscode.workspace.createFileSystemWatcher('**/.jte.config.json');
    configWatcher.onDidChange(() => {
        const newConfig = (0, jteConfig_1.loadConfig)();
        if (newConfig) {
            provider.schema = (0, overrideSchema_1.overrideSchema)(newConfig);
            provider.controlSequence = (0, overrideControlSequence_1.overrideControlSequence)(newConfig);
            console.log('Updated schema and control sequence based on config change.');
        }
    });
    context.subscriptions.push(configWatcher);
}
class JteCompletionItemProvider {
    constructor() {
        this.colorMap = [
            { id: '0', color: '#ffffff（白）' },
            { id: '1', color: '#20a0d6（ライトブルー）' },
            { id: '2', color: '#ff784c（ライトレッド）' },
            { id: '3', color: '#66cc40（ライトグリーン）' },
            { id: '4', color: '#99ccff（かなり薄い青）' },
            { id: '5', color: '#ccc0ff（薄紫）' },
            { id: '6', color: '#ffffa0（ライトイエロー）' },
            { id: '7', color: '#808080（濃いグレー）' },
            { id: '8', color: '#c0c0c0（薄いグレー）' },
            { id: '9', color: '#2080cc（青）' },
            { id: '10', color: '#ff3810（オレンジ）' },
            { id: '11', color: '#00a010（緑）' },
            { id: '12', color: '#3e9ade（薄い青）' },
            { id: '13', color: '#a098ff（暗い紫）' },
            { id: '14', color: '#ffcc20（落ち着いた黄色）' },
            { id: '15', color: '#000000（黒）' },
            { id: '16', color: '#84aaff（グレーブルー）' },
            { id: '17', color: '#ffff40（黄色）' },
            { id: '18', color: '#ff2020（赤）' },
            { id: '19', color: '#202040（紺色）' },
            { id: '20', color: '#e08040（茶オレンジ）' },
            { id: '21', color: '#f0c040（落ち着いた黄色）' },
            { id: '22', color: '#4080c0（落ち着いた青）' },
            { id: '23', color: '#40c0f0（シアン）' },
            { id: '24', color: '#80ff80（蛍光黄緑）' },
            { id: '25', color: '#c08080（赤茶）' },
            { id: '26', color: '#8080ff（青紫）' },
            { id: '27', color: '#ff80ff（ピンク）' },
            { id: '28', color: '#00a040（緑）' },
            { id: '29', color: '#00e060（黄緑）' },
            { id: '30', color: '#a060e0（濃い紫）' },
            { id: '31', color: '#c080ff（紫）' },
        ];
        const userConfig = (0, jteConfig_1.loadConfig)();
        this.schema = (0, overrideSchema_1.overrideSchema)(userConfig);
        this.controlSequence = (0, overrideControlSequence_1.overrideControlSequence)(userConfig);
    }
    // 補完アイテムを提供
    provideCompletionItems(document, position, token, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const text = document.getText(); // 全文を取得
        const currentLine = document.lineAt(position).text; // 現在の行
        const cursorText = currentLine.slice(0, position.character); // カーソルまでのテキスト
        const cursorTextPost = currentLine.slice(position.character); // カーソル以降のテキスト
        // 現在のブロックの `type` を取得
        const typeMatch = currentLine.match(/"type"\s*:\s*"([^"]+)"/);
        const currentType = typeMatch ? typeMatch[1] : "default";
        // \C[ で色番号を補完
        if (/\\C\[$/.test(cursorText)) {
            return this.colorMap.map(({ id, color }) => {
                const item = new vscode.CompletionItem(id, vscode.CompletionItemKind.Color);
                item.insertText = id;
                item.detail = `Color Code: ${color}`;
                return item;
            });
        }
        // キー候補を提供
        if (/\{\s*$/.test(cursorText)) {
            // カーソルが `{` の後ろにある場合
            let insertText = "\"";
            if (cursorTextPost.slice(0, 1) === "\"") {
                insertText = "";
            }
            return (_b = (_a = this.schema[currentType]) === null || _a === void 0 ? void 0 : _a.properties.map(({ key, description }) => {
                const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
                item.insertText = `"${key}${insertText}`;
                item.detail = description;
                return item;
            })) !== null && _b !== void 0 ? _b : [];
        }
        if (/,$/.test(cursorText)) {
            // カーソルが `,` の後ろにある場合
            let insertText = "\"";
            if (cursorTextPost.slice(0, 1) === "\"") {
                insertText = "";
            }
            return (_d = (_c = this.schema[currentType]) === null || _c === void 0 ? void 0 : _c.properties.map(({ key, description }) => {
                const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
                item.insertText = ` "${key}${insertText}`;
                item.detail = description;
                return item;
            })) !== null && _d !== void 0 ? _d : [];
        }
        if (/\{\s*\"$/.test(cursorText) || /,\s*\"$/.test(cursorText)) {
            // カーソルが `{"`, `,"` の後ろにある場合
            let insertText = "\"";
            if (cursorTextPost.slice(0, 1) === "\"") {
                insertText = "";
            }
            return (_f = (_e = this.schema[currentType]) === null || _e === void 0 ? void 0 : _e.properties.map(({ key, description }) => {
                const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
                item.insertText = `${key}${insertText}`;
                item.detail = description;
                return item;
            })) !== null && _f !== void 0 ? _f : [];
        }
        // 値候補を提供
        const keyMatch = cursorText.match(/"\s*(\w+)\s*"\s*:$/);
        if (keyMatch) {
            const key = keyMatch[1];
            return (_j = (_h = (_g = this.schema[currentType]) === null || _g === void 0 ? void 0 : _g.values[key]) === null || _h === void 0 ? void 0 : _h.map(({ value, description }) => {
                const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
                item.insertText = ` "${value}"`;
                item.detail = description;
                return item;
            })) !== null && _j !== void 0 ? _j : [];
        }
        const keyMatch2 = cursorText.match(/"\s*(\w+)\s*"\s*:\s*"$/);
        if (keyMatch2) {
            const key = keyMatch2[1];
            let insertText = "\"";
            if (cursorTextPost.slice(0, 1) === "\"") {
                insertText = "";
            }
            return (_m = (_l = (_k = this.schema[currentType]) === null || _k === void 0 ? void 0 : _k.values[key]) === null || _l === void 0 ? void 0 : _l.map(({ value, description }) => {
                const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
                item.insertText = `${value}${insertText}`;
                item.detail = description;
                return item;
            })) !== null && _m !== void 0 ? _m : [];
        }
        // 制御文字を提供
        if (/\\$/.test(cursorText)) {
            return this.controlSequence.map(({ key, description }) => {
                const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Snippet);
                item.insertText = key;
                item.detail = description;
                return item;
            });
        }
        return [];
    }
}
