"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideControlSequence = overrideControlSequence;
const defaultConfig_1 = require("./defaultConfig");
/**
 * デフォルトの制御文字補完設定をユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みの制御文字補完設定
 */
function overrideControlSequence(userConfig) {
    if (!userConfig || !userConfig.codeCompletion || !userConfig.codeCompletion.controlSequence) {
        return defaultConfig_1.defaultControlSequence; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定をマージ
    const combined = [...defaultConfig_1.defaultControlSequence, ...userConfig.codeCompletion.controlSequence];
    return Array.from(new Map(combined.map((item) => [item.key, item])).values() // 重複を排除
    );
}
