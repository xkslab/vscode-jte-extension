// プロパティと値の対応表
export const defaultSchema = {
    default: {
        properties: [
            { key: "type", description: "コマンドを指定" },
            { key: "preset", description: "プリセットを指定" }
        ],
        values: {
            type: [
                { value: "show text", description: "文章の表示" },
                { value: "文章の表示", description: "文章の表示" },
                { value: "show picture", description: "ピクチャの表示" },
                { value: "ピクチャの表示", description: "ピクチャの表示" },
                { value: "erase picture", description: "ピクチャの消去" },
                { value: "ピクチャの消去", description: "ピクチャの消去" }
            ],
        }
    },
    "show text": {
        properties: [
            { key: "name", description: "名前" },
            { key: "bg", description: "背景" },
            { key: "position", description: "ウィンドウ位置" },
            { key: "faceImage", description: "顔" },
            { key: "faceIndex", description: "表示する顔グラフィックのインデックス。" },
            { key: "mark", description: "マーク" },
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
            { key: "id", description: "ピクチャ番号" },
            { key: "path", description: "画像パス" },
            { key: "x", description: "X座標" },
            { key: "y", description: "Y座標" },
            { key: "scaleX", description: "拡大率 幅" },
            { key: "scaleY", description: "拡大率 高さ" },
            { key: "blendMode", description: "合成方法" },
            { key: "opacity", description: "不透明度" },
            { key: "origin", description: "原点" },
            { key: "mark", description: "マーク" }
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
            { key: "id", description: "ピクチャ番号" },
            { key: "mark", description: "マーク" }
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

defaultSchema["文章の表示"] = defaultSchema["show text"];
defaultSchema["ピクチャの表示"] = defaultSchema["show picture"];
defaultSchema["ピクチャの消去"] = defaultSchema["erase picture"];

export const defaultControlSequence = [
    { key: "V", description: "\\V[n] 変数n番の値に置き換えられます。" },
    { key: "N", description: "\\N[n] アクターn番の名前に置き換えられます。" },
    { key: "P", description: "\\P[n] パーティーメンバーn番に置き換えられます。" },
    { key: "G", description: "\\G 通貨単位に置き換えられます。" },
    { key: "C", description: "\\C[n] 以降の文字色をn番の色で表示します。" },
    { key: "I", description: "\\I[n] アイコンn番を描画します。" },
    { key: "{", description: "\\{ 文字サイズを1段階大きくします。" },
    { key: "}", description: "\\} 文字サイズを1段階小さくします。" },
    { key: "\\", description: "\\\\ バックスラッシュに置き換えられます。" },
    { key: "$", description: "\\$ 所持金のウィンドウを開きます。" },
    { key: ".", description: "\\. 1/4秒待ちます。" },
    { key: "|", description: "\\| 1秒待ちます。" },
    { key: "!", description: "\\! ボタン入力を待ちます。" },
    { key: ">", description: "\\> 同じ行の残りの文字を一瞬で表示します。" },
    { key: "<", description: "\\< 文字を一瞬で表示する効果を取り消します。" },
    { key: "^", description: "\\^ 文章表示後の入力待ちをしません。" },
];

export const defaultTypeColorMap: Record<string, string> = {
    "show text": 'rgba(255, 150, 70, 0.5)',     // 青
    "show picture": 'rgba(0, 212, 198, 0.5)', // 緑
    "erase picture": 'rgba(255, 0, 128, 0.5)',  // ピンク
    default: 'rgba(128, 128, 128, 0.5)'// グレー
};