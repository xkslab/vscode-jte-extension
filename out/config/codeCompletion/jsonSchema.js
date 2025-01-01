"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupJsonSchema = void 0;
const deepMerge_1 = require("../../utils/deepMerge");
const commonProperties = [
    { key: "mark", description: "(JTEコマンド用)マークを設定する", kind: "JTE Params" },
];
const defaultJsonSchema = {
    default: {
        properties: [
            { key: "type", description: "コマンドを指定", kind: "Command" },
            { key: "preset", description: "プリセットを指定", kind: "Command" }
        ],
        values: {
            type: [
                { value: "show text", description: "文章の表示" },
                { value: "show picture", description: "ピクチャの表示" },
                { value: "erase picture", description: "ピクチャの消去" },
            ],
        }
    },
    "show text": {
        properties: [
            { key: "name", description: "名前", kind: "Command Params" },
            { key: "bg", description: "背景", kind: "Command Params" },
            { key: "position", description: "ウィンドウ位置", kind: "Command Params" },
            { key: "faceImage", description: "顔", kind: "Command Params" },
            { key: "faceIndex", description: "表示する顔グラフィックのインデックス。", kind: "Command Params" },
            ...commonProperties,
        ],
        values: {
            bg: [
                { value: "window", description: "ウィンドウ背景" },
                { value: "dark", description: "暗くする" },
                { value: "transparent", description: "透明" }
            ],
            position: [
                { value: "0", description: "上" },
                { value: "1", description: "中" },
                { value: "2", description: "下" }
            ],
            faceIndex: [
                { value: "0", description: "左上" },
                { value: "1", description: "左から２番目の上" },
                { value: "2", description: "左から３番目の上" },
                { value: "3", description: "右上" },
                { value: "4", description: "左下" },
                { value: "5", description: "左から２番目の下" },
                { value: "6", description: "左から２番目の下" },
                { value: "7", description: "右下" }
            ]
        }
    },
    "show picture": {
        properties: [
            { key: "id", description: "ピクチャ番号", kind: "Command Params" },
            { key: "path", description: "画像パス", kind: "Command Params" },
            { key: "x", description: "X座標", kind: "Command Params" },
            { key: "y", description: "Y座標", kind: "Command Params" },
            { key: "scaleX", description: "拡大率 幅", kind: "Command Params" },
            { key: "scaleY", description: "拡大率 高さ", kind: "Command Params" },
            { key: "blendMode", description: "合成方法", kind: "Command Params" },
            { key: "opacity", description: "不透明度", kind: "Command Params" },
            { key: "origin", description: "原点", kind: "Command Params" },
            ...commonProperties,
        ],
        values: {
            id: [
                { value: "1", description: "ピクチャ番号" },
                { value: "2", description: "ピクチャ番号" },
                { value: "3", description: "ピクチャ番号" }
            ],
            origin: [
                { value: "0", description: "左上" },
                { value: "1", description: "中心" }
            ],
            blendMode: [
                { value: "0", description: "通常" },
                { value: "1", description: "加算" },
                { value: "2", description: "減算" },
                { value: "3", description: "乗算" },
            ]
        }
    },
    "erase picture": {
        properties: [
            { key: "id", description: "ピクチャ番号", kind: "Command Params" },
            ...commonProperties,
        ],
        values: {
            id: [
                { value: "1", description: "ピクチャ番号" },
                { value: "2", description: "ピクチャ番号" },
                { value: "3", description: "ピクチャ番号" }
            ]
        }
    },
};
/**
 * デフォルトのスキーマをユーザ設定でオーバーライド
 * @param userConfig ユーザのコンフィグ
 * @returns オーバーライド済みのスキーマ
 */
function setupJsonSchema(userConfig) {
    if (!userConfig || !userConfig.codeCompletion || !userConfig.codeCompletion.json) {
        return defaultJsonSchema; // デフォルトをそのまま返す
    }
    // デフォルト設定を基準にユーザー設定を適用
    return (0, deepMerge_1.deepMerge)(JSON.parse(JSON.stringify(defaultJsonSchema)), userConfig.codeCompletion.json);
}
exports.setupJsonSchema = setupJsonSchema;
