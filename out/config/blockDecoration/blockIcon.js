"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBlockIconMapping = void 0;
const defaultBlockIconMapping = {
    "show text": '💬',
    "show picture": '🖼️',
    "erase picture": '🖼️🗑️',
    default: ''
};
/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
function setupBlockIconMapping(userConfig) {
    if (!userConfig || !userConfig.blockDecoration || !userConfig.blockDecoration.blockIcon) {
        return defaultBlockIconMapping; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定をマージ
    const combined = Object.assign(Object.assign({}, defaultBlockIconMapping), userConfig.blockDecoration.blockIcon);
    return combined;
}
exports.setupBlockIconMapping = setupBlockIconMapping;
