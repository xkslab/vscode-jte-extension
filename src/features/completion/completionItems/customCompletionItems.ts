import * as vscode from 'vscode';
import { JteConfig } from '../../../config';
import { CustomCompletion, setupCustomCompletion } from '../../../config/codeCompletion/customCompletion';

export function getCustomCompletionItems(cursorText: string, config: JteConfig): vscode.CompletionItem[] {
    const customCompletions: CustomCompletion[] = setupCustomCompletion(config);
    for (const completion of customCompletions) {
        let match: RegExpMatchArray | null;
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