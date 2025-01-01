"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorCompletionItems = void 0;
const vscode = require("vscode");
function getColorCompletionItems(colorMap) {
    return Object.entries(colorMap).map(([key, { color, description }]) => {
        const item = new vscode.CompletionItem(`${key.padStart(2, '0')} (${description})`, vscode.CompletionItemKind.Color);
        item.insertText = key;
        item.detail = `${color} (${description})`;
        const colorHex = color.slice(1, 7);
        item.documentation = new vscode.MarkdownString(`**Preview:**\n\n![](https://dummyimage.com/16x16/${colorHex}/${colorHex})`);
        return item;
    });
}
exports.getColorCompletionItems = getColorCompletionItems;
