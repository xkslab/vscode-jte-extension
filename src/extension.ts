import * as vscode from 'vscode';
import { registerBlockDecorationProvider } from './features/blockDecoration';
import { registerCompletionItemProvider } from './features/completion';
import { registerColorPreview } from './features/colorPreview';
import { registerToggleComment } from './features/toggleComment';
import { registerSaveNotification } from './features/notice';
import { registerHoverPreview } from './features/hoverPreview';

export function activate(context: vscode.ExtensionContext) {
	registerBlockDecorationProvider(context);

    registerCompletionItemProvider(context);

    registerColorPreview(context);

    registerToggleComment(context);

    registerSaveNotification(context);

    registerHoverPreview(context);

	vscode.window.showInformationMessage('JTE Extension is active!');
}

export function deactivate() {}
