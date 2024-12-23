import * as vscode from 'vscode';
import { registerCountBlocksProvider } from './countBlocks';
import { registerCompletionItemProvider } from './completion';
import { registerColorDecoration } from './colorDecoration';
import { registerToggleComment } from './toggleComment';
import { registerSaveNotification } from './notice';
import { registerHoverPreview } from './hoverPreview';

export function activate(context: vscode.ExtensionContext) {
	registerCountBlocksProvider(context);

    registerCompletionItemProvider(context);

    registerColorDecoration(context);

    registerToggleComment(context);

    registerSaveNotification(context);

    registerHoverPreview(context);

	vscode.window.showInformationMessage('JTE Extension is active!');
}

export function deactivate() {}
