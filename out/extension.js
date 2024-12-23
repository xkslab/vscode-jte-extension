"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const countBlocks_1 = require("./countBlocks");
const completion_1 = require("./completion");
const colorDecoration_1 = require("./colorDecoration");
const toggleComment_1 = require("./toggleComment");
const notice_1 = require("./notice");
function activate(context) {
    (0, countBlocks_1.registerCountBlocksProvider)(context);
    (0, completion_1.registerCompletionItemProvider)(context);
    (0, colorDecoration_1.registerColorDecoration)(context);
    (0, toggleComment_1.registerToggleComment)(context);
    (0, notice_1.registerSaveNotification)(context);
    vscode.window.showInformationMessage('JTE Extension is active!');
}
function deactivate() { }
