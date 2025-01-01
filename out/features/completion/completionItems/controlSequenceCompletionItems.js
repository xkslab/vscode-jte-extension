"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlSequenceCompletionItems = void 0;
const vscode = require("vscode");
function controlSequenceCompletionItems(controlSequence) {
    return controlSequence.map(({ key, description }) => {
        const displayText = `\\${key.padEnd(5, ' ')} ${description}`;
        const item = new vscode.CompletionItem(displayText, vscode.CompletionItemKind.Value);
        item.insertText = key;
        item.detail = description;
        return item;
    });
}
exports.controlSequenceCompletionItems = controlSequenceCompletionItems;
