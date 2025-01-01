"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const countBlocks_1 = require("./features/countBlocks");
const completion_1 = require("./features/completion");
const colorPreview_1 = require("./features/colorPreview");
const toggleComment_1 = require("./features/toggleComment");
const notice_1 = require("./features/notice");
const hoverPreview_1 = require("./features/hoverPreview");
function activate(context) {
    (0, countBlocks_1.registerCountBlocksProvider)(context);
    (0, completion_1.registerCompletionItemProvider)(context);
    (0, colorPreview_1.registerColorPreview)(context);
    (0, toggleComment_1.registerToggleComment)(context);
    (0, notice_1.registerSaveNotification)(context);
    (0, hoverPreview_1.registerHoverPreview)(context);
    vscode.window.showInformationMessage('JTE Extension is active!');
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
