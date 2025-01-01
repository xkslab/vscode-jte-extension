"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCustomCompletion = void 0;
const vscode = require("vscode");
const completionKindMap = {
    Text: vscode.CompletionItemKind.Text,
    Method: vscode.CompletionItemKind.Method,
    Function: vscode.CompletionItemKind.Function,
    Constructor: vscode.CompletionItemKind.Constructor,
    Field: vscode.CompletionItemKind.Field,
    Variable: vscode.CompletionItemKind.Variable,
    Class: vscode.CompletionItemKind.Class,
    Struct: vscode.CompletionItemKind.Struct,
    Interface: vscode.CompletionItemKind.Interface,
    Module: vscode.CompletionItemKind.Module,
    Property: vscode.CompletionItemKind.Property,
    Unit: vscode.CompletionItemKind.Unit,
    Value: vscode.CompletionItemKind.Value,
    Enum: vscode.CompletionItemKind.Enum,
    Keyword: vscode.CompletionItemKind.Keyword,
    Snippet: vscode.CompletionItemKind.Snippet,
    Color: vscode.CompletionItemKind.Color,
    File: vscode.CompletionItemKind.File,
    Reference: vscode.CompletionItemKind.Reference,
    Folder: vscode.CompletionItemKind.Folder,
    EnumMember: vscode.CompletionItemKind.EnumMember,
    Constant: vscode.CompletionItemKind.Constant,
    Event: vscode.CompletionItemKind.Event,
    Operator: vscode.CompletionItemKind.Operator,
    TypeParameter: vscode.CompletionItemKind.TypeParameter
};
/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
function setupCustomCompletion(userConfig) {
    var _a;
    if (!((_a = userConfig === null || userConfig === void 0 ? void 0 : userConfig.codeCompletion) === null || _a === void 0 ? void 0 : _a.customCompletion)) {
        return [];
    }
    return userConfig.codeCompletion.customCompletion.map((customCompletion) => {
        return {
            trigger: customCompletion.trigger,
            items: customCompletion.items.map((item) => {
                return {
                    insertText: item.insertText,
                    displayText: item.displayText,
                    description: item.description,
                    kind: completionKindMap[item.kind]
                };
            })
        };
    });
}
exports.setupCustomCompletion = setupCustomCompletion;
