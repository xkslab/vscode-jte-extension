"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomCompletionItems = void 0;
const vscode = require("vscode");
const customCompletion_1 = require("../../../config/codeCompletion/customCompletion");
function getCustomCompletionItems(cursorText, config) {
    const customCompletions = (0, customCompletion_1.setupCustomCompletion)(config);
    for (const completion of customCompletions) {
        let match;
        try {
            match = cursorText.match(completion.trigger);
        }
        catch (e) {
            console.error(`Custom completion error: ${e}`, completion.trigger);
            continue;
        }
        if (match) {
            return completion.items.map((item) => {
                const completionItem = new vscode.CompletionItem(item.displayText, item.kind);
                completionItem.insertText = new vscode.SnippetString(item.insertText);
                completionItem.detail = item.description;
                return completionItem;
            });
        }
    }
    return [];
}
exports.getCustomCompletionItems = getCustomCompletionItems;
