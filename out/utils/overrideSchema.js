"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overrideSchema = void 0;
const defaultConfig_1 = require("./defaultConfig");
/**
 * デフォルトのスキーマをユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みのスキーマ
 */
function overrideSchema(userConfig) {
    if (!userConfig || !userConfig.codeCompletion || !userConfig.codeCompletion.json) {
        return defaultConfig_1.defaultSchema; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定を適用
    return deepMerge(JSON.parse(JSON.stringify(defaultConfig_1.defaultSchema)), userConfig.codeCompletion.json);
}
exports.overrideSchema = overrideSchema;
/**
 * 深いマージを行う（重複を排除）
 * @param target マージ先のオブジェクト
 * @param source マージ元のオブジェクト
 * @returns マージ後のオブジェクト
 */
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key])) {
            // 配列の場合は重複を排除
            const targetArray = target[key] || [];
            target[key] = Array.from(new Set([...targetArray, ...source[key]]));
        }
        else if (source[key] instanceof Object) {
            // オブジェクトの場合は再帰的にマージ
            target[key] = deepMerge(target[key] || {}, source[key]);
        }
        else {
            // 値は上書き
            target[key] = source[key];
        }
    }
    return target;
}
