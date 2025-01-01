"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBlockColorMapping = void 0;
const defaultBlockColorMapping = {
    "show text": 'rgba(255, 150, 70, 0.5)',
    "show picture": 'rgba(0, 212, 198, 0.5)',
    "erase picture": 'rgba(255, 0, 128, 0.5)',
    default: 'rgba(128, 128, 128, 0.5)' // グレー
};
/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
function setupBlockColorMapping(userConfig) {
    if (!userConfig || !userConfig.blockDecoration || !userConfig.blockDecoration.blockColor) {
        return defaultBlockColorMapping; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定をマージ
    const combined = Object.assign(Object.assign({}, defaultBlockColorMapping), userConfig.blockDecoration.blockColor);
    return combined;
}
exports.setupBlockColorMapping = setupBlockColorMapping;
