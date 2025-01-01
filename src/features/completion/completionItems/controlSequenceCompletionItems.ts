import * as vscode from 'vscode';
import { ControlSequence } from '../../../config/codeCompletion/controlSequence';

export function getControlSequenceCompletionItems(controlSequence: ControlSequence[]): vscode.CompletionItem[] {
    return controlSequence.map(({ key, description }) => {
        const displayText = `\\${key.padEnd(5, ' ')} ${description}`;
        const item = new vscode.CompletionItem(displayText, vscode.CompletionItemKind.Value);
        item.insertText = key;
        item.detail = description;
        return item;
    });
}