"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariableNameCompletionItems = void 0;
const vscode = require("vscode");
const gameData_1 = require("../../../utils/gameData");
const config_1 = require("../../../config");
function getVariableNameCompletionItems(config) {
    const projectDir = (0, config_1.getProjectDir)(config);
    if (!projectDir) {
        return [];
    }
    const variables = (0, gameData_1.getVariables)(projectDir);
    if (variables.length === 0) {
        return [];
    }
    return variables.slice(1).map((variable, index) => {
        index += 1;
        const item = new vscode.CompletionItem(`${index.toString().padStart(4, '0')} ${variable}`, vscode.CompletionItemKind.Variable);
        item.insertText = index.toString();
        return item;
    });
}
exports.getVariableNameCompletionItems = getVariableNameCompletionItems;
