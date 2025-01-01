import * as vscode from 'vscode';

export function registerSaveNotification(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            if (document.fileName.endsWith('.jte')) {
                vscode.window.showWarningMessage(
                    'ツクールのイベントにコピーしないと変更が反映されません！'
                );
            }
        })
    );
}
