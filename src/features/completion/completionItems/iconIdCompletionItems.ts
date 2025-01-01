import * as vscode from 'vscode';
import { getProjectDir, JteConfig } from '../../../config';
import { getIconSetPath } from '../../../utils/systemPath';

export function getIconIdCompletionItems(config: JteConfig): vscode.CompletionItem[] {
    const projectDir = getProjectDir(config);
    if (!projectDir) {
        return [];
    }
    const iconSetPath = getIconSetPath(projectDir);
    if (!iconSetPath) {
        return [];
    }

    const maxCols = 16;
    const maxRows = config.iconSetRows || 20;
    const items: vscode.CompletionItem[] = [];
    for (let i = 0; i < maxRows; i++) {
        const iconNumber = i * maxCols;
        const item = new vscode.CompletionItem(`${iconNumber.toString().padStart(4, '0')}  (${i+1}行, 1列)`, vscode.CompletionItemKind.Value);
        item.insertText = iconNumber.toString();
        item.documentation = new vscode.MarkdownString(`![](${vscode.Uri.file(iconSetPath).toString()})`);
        items.push(item);
    }
    return items;
}