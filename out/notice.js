"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSaveNotification = void 0;
const vscode = require("vscode");
function registerSaveNotification(context) {
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.fileName.endsWith('.jte')) {
            vscode.window.showWarningMessage('RPGツクールのイベントにコピーしないと変更が反映されないので注意してください！');
        }
    }));
}
exports.registerSaveNotification = registerSaveNotification;
