"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCompletionItemProvider = void 0;
const vscode = require("vscode");
const config_1 = require("../../config");
const jsonSchema_1 = require("../../config/codeCompletion/jsonSchema");
const controlSequence_1 = require("../../config/codeCompletion/controlSequence");
const systemPath_1 = require("../../utils/systemPath");
const colors_1 = require("../../config/codeCompletion/colors");
const colorCompletionItems_1 = require("./completionItems/colorCompletionItems");
const variableNameCompletionItems_1 = require("./completionItems/variableNameCompletionItems");
const iconIdCompletionItems_1 = require("./completionItems/iconIdCompletionItems");
const actorNameCompletionItems_1 = require("./completionItems/actorNameCompletionItems");
const pathCompletionItems_1 = require("./completionItems/pathCompletionItems");
const keyCompletionItems_1 = require("./completionItems/keyCompletionItems");
const valueCompletionItems_1 = require("./completionItems/valueCompletionItems");
const controlSequenceCompletionItems_1 = require("./completionItems/controlSequenceCompletionItems");
const customCompletionItems_1 = require("./completionItems/customCompletionItems");
function registerCompletionItemProvider(context) {
    const provider = new JteCompletionItemProvider();
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'jte' }, provider, '"', ':', ',', '{', '[', '\\', '/'));
}
exports.registerCompletionItemProvider = registerCompletionItemProvider;
class JteCompletionItemProvider {
    constructor() {
        this.config = null;
        this.config = (0, config_1.loadConfig)();
        this.schema = (0, jsonSchema_1.setupJsonSchema)(this.config);
        this.controlSequence = (0, controlSequence_1.setupControlSequence)(this.config);
        this.colorMap = (0, colors_1.setupColorMapping)(this.config);
        console.log('Completion provider initialized.');
    }
    // 補完アイテムを提供
    provideCompletionItems(document, position, token, context) {
        var _a, _b;
        const currentLine = document.lineAt(position).text; // 現在の行
        const cursorText = currentLine.slice(0, position.character); // カーソルまでのテキスト
        const cursorTextPost = currentLine.slice(position.character); // カーソル以降のテキスト
        // 現在のブロックの `type` を取得
        const typeMatch = currentLine.match(/"type"\s*:\s*"([^"]+)"/);
        const currentType = typeMatch ? typeMatch[1] : "default";
        // カスタム補完
        const customCompletionItems = (0, customCompletionItems_1.getCustomCompletionItems)(cursorText, this.config);
        if (customCompletionItems.length > 0) {
            return customCompletionItems;
        }
        // \C[ で色番号を補完
        if (/\\C\[$/.test(cursorText)) {
            return (0, colorCompletionItems_1.getColorCompletionItems)(this.colorMap);
        }
        // \V[ で変数名を見ながら補完
        if (/\\V\[$/.test(cursorText)) {
            return (0, variableNameCompletionItems_1.getVariableNameCompletionItems)(this.config);
        }
        // \I[ でIconSet.pngを見ながらアイコン番号を補完
        if (/\\I\[$/.test(cursorText)) {
            return (0, iconIdCompletionItems_1.getIconIdCompletionItems)(this.config);
        }
        // \N[ でアクター名を補完
        if (/\\N\[$/.test(cursorText)) {
            return (0, actorNameCompletionItems_1.getActorNameCompletionItems)(this.config);
        }
        // Path 補完
        const pathCompletionItems = (0, pathCompletionItems_1.getPathCompletionItemsByType)(currentType, cursorText, cursorTextPost, this.config, systemPath_1.commandPathMapping);
        if (pathCompletionItems.length > 0) {
            return pathCompletionItems;
        }
        // キー候補を提供
        if (/\{\s*\"?$/.test(cursorText) || /,\s*\"?$/.test(cursorText)) {
            return (0, keyCompletionItems_1.getKeyCompletionItems)(cursorText, cursorTextPost, position, (_a = this.schema[currentType]) === null || _a === void 0 ? void 0 : _a.properties);
        }
        // 値候補を提供
        const keyMatch = cursorText.match(/"\s*(\w+)\s*"\s*:\s*"?$/);
        if (keyMatch) {
            return (0, valueCompletionItems_1.getValueCompletionItems)(cursorText, cursorTextPost, keyMatch[1], (_b = this.schema[currentType]) === null || _b === void 0 ? void 0 : _b.values);
        }
        // 制御文字を提供
        if (/\\$/.test(cursorText)) {
            return (0, controlSequenceCompletionItems_1.getControlSequenceCompletionItems)(this.controlSequence);
        }
        return [];
    }
}
