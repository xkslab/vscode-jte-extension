"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iconIdCompletionItems = void 0;
const vscode = require("vscode");
const config_1 = require("../../../config");
const systemPath_1 = require("../../../utils/systemPath");
function iconIdCompletionItems(config) {
    const projectDir = (0, config_1.getProjectDir)(config);
    if (!projectDir) {
        return [];
    }
    const iconSetPath = (0, systemPath_1.getIconSetPath)(projectDir);
    if (!iconSetPath) {
        return [];
    }
    const maxCols = 16;
    const maxRows = config.iconSetRows || 20;
    const items = [];
    for (let i = 0; i < maxRows; i++) {
        const iconNumber = i * maxCols;
        const item = new vscode.CompletionItem(`${iconNumber.toString().padStart(4, '0')}  (${i + 1}行, 1列)`, vscode.CompletionItemKind.Value);
        item.insertText = iconNumber.toString();
        item.documentation = new vscode.MarkdownString(`![](${vscode.Uri.file(iconSetPath).toString()})`);
        items.push(item);
    }
    return items;
}
exports.iconIdCompletionItems = iconIdCompletionItems;
