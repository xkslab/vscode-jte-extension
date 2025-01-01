"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = void 0;
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
exports.deepMerge = deepMerge;
