import * as vscode from 'vscode';
import { getProjectDir, JteConfig } from '../../../config';
import { getActorsName } from '../../../utils/gameData';

export function getActorNameCompletionItems(config: JteConfig): vscode.CompletionItem[] {
    const projectDir = getProjectDir(config);
    if (!projectDir) {
        return [];
    }
    const actors = getActorsName(projectDir);
    if (actors.length === 0) {
        return [];
    }
    return actors.map(({ name, id }) => {
        const item = new vscode.CompletionItem(`${id.toString().padStart(4, '0')} ${name}`, vscode.CompletionItemKind.Value);
        item.insertText = id.toString();
        return item;
    });

}