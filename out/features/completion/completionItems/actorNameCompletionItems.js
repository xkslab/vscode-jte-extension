"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActorNameCompletionItems = void 0;
const vscode = require("vscode");
const config_1 = require("../../../config");
const gameData_1 = require("../../../utils/gameData");
function getActorNameCompletionItems(config) {
    const projectDir = (0, config_1.getProjectDir)(config);
    if (!projectDir) {
        return [];
    }
    const actors = (0, gameData_1.getActorsName)(projectDir);
    if (actors.length === 0) {
        return [];
    }
    return actors.map(({ name, id }) => {
        const item = new vscode.CompletionItem(`${id.toString().padStart(4, '0')} ${name}`, vscode.CompletionItemKind.Value);
        item.insertText = id.toString();
        return item;
    });
}
exports.getActorNameCompletionItems = getActorNameCompletionItems;
