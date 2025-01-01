import * as vscode from 'vscode';
import { getVariables } from '../../../utils/gameData';
import { getProjectDir } from '../../../config';

export function getVariableNameCompletionItems(config): vscode.CompletionItem[] {
    const projectDir = getProjectDir(config);
    if (!projectDir) {
        return [];
    }
    const variables = getVariables(projectDir);
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