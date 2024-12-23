import * as vscode from 'vscode';

export function registerSaveNotification(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            if (document.fileName.endsWith('.jte')) {
                vscode.window.showWarningMessage(
                    'RPGツクールのイベントにコピーしないと変更が反映されないので注意してください！'
                );
            }
        })
    );
}
