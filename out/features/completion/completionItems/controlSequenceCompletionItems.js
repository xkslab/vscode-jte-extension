"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getControlSequenceCompletionItems = void 0;
const vscode = require("vscode");
function getControlSequenceCompletionItems(controlSequence) {
    return controlSequence.map(({ key, description }) => {
        const displayText = `\\${key.padEnd(5, ' ')} ${description}`;
        const item = new vscode.CompletionItem(displayText, vscode.CompletionItemKind.Value);
        item.insertText = key;
        item.detail = description;
        return item;
    });
}
exports.getControlSequenceCompletionItems = getControlSequenceCompletionItems;
