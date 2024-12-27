/*:
 * @target MZ
 * @plugindesc コマンドリスト管理プラグイン
 * @author xks
 * @version 0.1.0
 *
 * @param defaultMessageParams
 * @text メッセージのデフォルト値
 * @type struct<MessageDefaults>
 * @default {"bg":"window","position":"2","name":"","faceImage":"","faceIndex":"0"}
 * @desc メッセージのデフォルト値を設定します。
 *
 * @param defaultPictureParams
 * @text ピクチャのデフォルト値
 * @type struct<PictureDefaults>
 * @default {"id":"1","path":"","origin":"左上","howToSpecify":"直接指定","x":"0","y":"0","scaleX":"100","scaleY":"100","opacity":"255","blendMode":"通常"}
 * @desc ピクチャのデフォルト値を設定します。
 *
 * @param presets
 * @text コマンドプリセット
 * @type struct<Preset>[]
 * @desc プリセット名とそのパラメータを設定します。{"preset": "プリセット名"}でプリセットパラメータを適用できます。
 * 
 * @help
 * このプラグインは、メッセージ、ピクチャ表示、ピクチャ消去などのイベントコマンドを、
 * JSON + テキストの形式で定義し、リストとして管理・実行するためのプラグインです。
 *
 * 【コマンドリストの構造】
 * コマンドリストは、以下のような形式を取ります。
 *
 * 例）
 * --------------------------------
 * {"type": "show text", "name": "男", "bg": "dark"}
 * \C[1]おい
 * \
 * ここは通さないぞ
 *
 * {"type": "show picture", "id": 5, "path": "path/to/picture"}
 * サンプル画像（この行は無視されるのでメモとして使ってもいい。無くてもいい。）
 *
 * {"type": "show text"}
 * 男は刀を抜いた。
 *
 * {"type": "erase picture", "id": 5}
 * --------------------------------
 * 
 * - 各コマンドはJSON形式のヘッダーと、その下の行(または複数行)のテキストで構成されます。
 * - 空行でコマンド同士を区切ります。
 * - 文章中で空行を表現したいときは、バックスラッシュ「\」のみの行を挿入します。
 * - `type` に応じて、内部的にRPGツクールMZ標準のイベントコマンドを実行します。
 *   - "show text": メッセージの表示（"name"があれば名前ウィンドウを表示可能、"bg"が"dark"等ならウィンドウ背景設定）
 *   - "show picture": ピクチャ表示 (id, path, x, y, opacity, blendMode 等をパラメータにできる)
 *   - "erase picture": ピクチャ消去 (id指定)
 * これらはRPGツクールMZのイベントコマンドを再現します。
 * 
 * --------------------------------
 * 使い方:
 * 1. プラグインコマンド「コマンドリスト定義」を使い、上記形式のコマンドリストをプロジェクト内で定義します。
 *    複数のリストを定義することができます。それぞれリストIDで管理します。
 *
 * 2. 「次のコマンドを実行」を呼ぶたびに、リスト内の次のコマンドが実行されます。 
 *    メッセージならメッセージウィンドウ表示、ピクチャならピクチャ表示などを行い、
 *
 * 3. 「実行状態のリセット」を呼ぶと、特定のリストの進行度を最初に戻します。
 *
 * 4. 「コマンドリスト削除」を呼ぶと、指定のリストを削除します。
 *
 * --------------------------------
 * 使用できるtype／パラメータ:
 * ※Jsonは１行で記述する必要があります。
 * 
 * {
 *  "type": "show text", // (もしくは"文章の表示"でも可)
 *  "name": "男",  // 名前ウィンドウに表示する名前
 *  "bg": "dark", // 背景タイプ (window, dark, transparent)
 *  "faceImage": "Actor1.png", // 顔グラフィックファイル名
 *  "faceIndex": 0, // 顔グラフィックインデックス
 *  "position": 2 // 表示位置 (0: 上, 1: 中, 2: 下)
 * }
 * ここにメッセージ内容を記述。
 * 改行もできる。制御文字も使える。
 *
 * {
 *  "type": "show picture", // (もしくは"ピクチャの表示"でも可)
 *  "id": 5, // ピクチャID
 *  "path": "path/to/picture", // ピクチャファイルパス
 *  "origin": 左上, // 原点 (左上, 中心)
 *  "howToSpecify": 直接指定, // 座標指定方法 (直接指定, 変数で指定)
 *  "x": 0, // X座標
 *  "y": 0, // Y座標
 *  "scaleX": 100, // Xスケール
 *  "scaleY": 100, // Yスケール
 *  "opacity": 255, // 不透明度
 *  "blendMode": 通常 // 合成方法 (通常, 加算, 乗算, スクリーン)
 * }
 * 
 * {
 *  "type": "erase picture", // (もしくは"ピクチャの消去"でも可)
 *  "id": 5 // ピクチャID
 * }
 * 
 * {}
 * 空Jsonに続くテキストは無視されるため、コメントアウトとして利用できます。
 * 
 * 全タイプ共通のパラメータ:
 * - "mark": "任意の数値/文字列" // 特定のmarkまで実行したり、ジャンプするためのマーク
 * ---
 * 
 * プリセット機能:
 * プラグインパラメータでプリセットを設定することができます。
 * プリセットを設定すると、プラグインコマンドのパラメータにプリセット名を指定することで、プリセットのパラメータを適用することができます。
 * 
 * 例）
 * プリセット名: "主人公"
 * プリセットパラメータ: {"type": "show text", "bg":"dark","position":"2","name":"主人公","faceImage":"Actor1","faceIndex":"0"}
 * 
 * {"preset": "主人公", "name": "主人公（闇）"}
 * ここにメッセージ内容を記述。
 * プリセットパラメータが適用される。
 * 呼び出し時にパラメータの上書きも可能。（今回は名前の上書き）
 * 
 * ---
 * 
 * 免責：
 * このプラグインに関して生じた問題について、作者は一切の責任を負いません。
 * ご自身の責任においてご利用ください。
 * 初期バージョンのため、不具合があると思われます。
 * 今後、大きな変更があるかもしれません。
 * 
 * ---
 * 
 * @command DefineList
 * @text コマンドリスト定義
 * @desc 指定IDでコマンドリストを定義します。
 * @arg listId
 * @text リストID
 * @desc リストを識別するID
 * @type string
 *
 * @arg listContent
 * @text リスト内容
 * @desc コマンドリストを定義するテキスト。
 * @type note
 *
 * @command ExecuteNext
 * @text 次のコマンドを実行
 * @desc 指定のリストIDの次のコマンドを実行します。
 *
 * @arg listId
 * @text リストID
 * @desc 対象のリストID
 * @type string
 * 
 * @arg executeCount
 * @text 実行コマンド数
 * @desc 一度に実行するコマンド数（0以下でリストの残り全てを実行）
 * @type number
 * @default 1
 *
 * @command ResetProgress
 * @text 実行状態のリセット
 * @desc 指定のリストの進行度を最初に戻します。
 *
 * @arg listId
 * @text リストID
 * @desc 対象のリストID
 * @type string
 *
 * @command DeleteList
 * @text コマンドリスト削除
 * @desc 指定のリストを削除します。
 *
 * @arg listId
 * @text リストID
 * @desc 対象のリストID
 * @type string
 * 
 * @command JumpToIndex
 * @text 指定インデックスへジャンプ
 * @desc 指定のリストIDのインデックスにジャンプします。
 * 
 * @arg listId
 * @text リストID
 * @desc 対象のリストID
 * @type string
 * 
 * @arg index
 * @text インデックス
 * @desc 次に実行したいコマンドのインデックス（1から始まる）。負数でリストの末尾からのインデックス指定も可能。
 * @type string
 * 
 * @command GetIndex
 * @text インデックス取得
 * @desc 指定のリストIDの現在のインデックスを変数に保存します。
 * 
 * @arg listId
 * @text リストID
 * @desc 対象のリストID
 * @type string
 * 
 * @arg variableId
 * @text 変数ID
 * @desc インデックスを保存する変数ID
 * @type variable
 * 
 */

/*~struct~MessageDefaults:
 * @param bg
 * @text 背景タイプ
 * @type select
 * @option ウィンドウ
 * @value window
 * @option 暗くする
 * @value dark
 * @option 透明
 * @value transparent
 * @default window
 *
 * @param position
 * @text 表示位置
 * @type select
 * @option 上
 * @value 0
 * @option 中
 * @value 1
 * @option 下
 * @value 2
 * @default 2
 *
 * @param name
 * @text 名前ウィンドウ
 * @type string
 * @default ""
 *
 * @param faceImage
 * @text 顔グラフィック
 * @type file
 * @dir img/faces
 * @default ""
 *
 * @param faceIndex
 * @text 顔グラフィックインデックス
 * @type number
 * @default 0
 */

/*~struct~PictureDefaults:
 * @param id
 * @text ピクチャID
 * @type number
 * @default 1
 *
 * @param path
 * @text ピクチャパス
 * @type file
 * @dir img/pictures
 * @default ""
 *
 * @param origin
 * @text 原点
 * @type select
 * @option 左上
 * @value 左上
 * @option 中心
 * @value 中心
 * @default 左上
 * 
 * @param howToSpecify
 * @text 座標指定方法
 * @type select
 * @option 直接指定
 * @value 直接指定
 * @option 変数で指定
 * @value 変数で指定
 * @default 直接指定
 *
 * @param x
 * @text X座標（変数で指定時は変数番号）
 * @type number
 * @default 0
 *
 * @param y
 * @text Y座標（変数で指定時は変数番号）
 * @type number
 * @default 0
 *
 * @param scaleX
 * @text Xスケール
 * @type number
 * @default 100
 *
 * @param scaleY
 * @text Yスケール
 * @type number
 * @default 100
 *
 * @param opacity
 * @text 不透明度
 * @type number
 * @default 255
 *
 * @param blendMode
 * @text 合成方法
 * @type select
 * @option 通常
 * @value 通常
 * @option 加算
 * @value 加算
 * @option 乗算
 * @value 乗算
 * @option スクリーン
 * @value スクリーン
 * @default 通常
 */

/*~struct~Preset:
 * @param name
 * @text プリセット名
 * @type string
 * @desc プリセットを識別する名前
 *
 * @param parameters
 * @text プリセットのパラメータ
 * @type note
 * @desc プリセットに登録するJSON形式のパラメータ
 */

(() => {
    const pluginName = "xksJsonTextEvent";

    const params = PluginManager.parameters(pluginName);
    const defaultMessageParams = JSON.parse(params.defaultMessageParams || "{}");
    const defaultPictureParams = JSON.parse(params.defaultPictureParams || "{}");
    const presets = JSON.parse(params.presets || "[]").reduce((acc, preset) => {
        const { name, parameters } = JSON.parse(preset);
        acc[name] = JSON.parse(parameters
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\")
            .slice(1, -1));
        return acc;
    }, {});

    function applyPresetAndDefaults(json, defaults) {
        let baseParams = {};
        if (json.preset && presets[json.preset]) {
            baseParams = presets[json.preset];
        }
        return Object.assign({}, defaults, baseParams, json);
    }

    const commandLists = {};

    //-----------------------------------------------------------------------------
    // JSONコード変換処理
    //-----------------------------------------------------------------------------
    function jsonToCode(cmd, eventId, codeTemplate) {
        const type = cmd.json.type;
        if (type === "show text" || type === "文章の表示") {
            return makeShowTextCode(cmd.json, cmd.text, codeTemplate);
        } else if (type === "show picture" || type === "ピクチャの表示") {
            return makeShowPictureCode(cmd.json, codeTemplate);
        } else if (type === "erase picture" || type === "ピクチャの消去") {
            return makeErasePictureCode(cmd.json, codeTemplate);
        } else {
            console.warn(`未知のコマンドタイプ: ${type}`);
        }        
    }

    function makeShowTextCode(json, text, codeTemplate) {
        const settings = applyPresetAndDefaults(json, defaultMessageParams);
        const { name, bg, faceImage, faceIndex, position } = settings;
        
        const background = bg === "dark" ? 1 : bg === "transparent" ? 2 : 0;
        const faceImageBaseName = faceImage.replace(/\.[^/.]+$/, "");

        const command101 = JSON.parse(JSON.stringify(codeTemplate));
        command101.code = 101;
        command101.parameters = [faceImageBaseName, parseInt(faceIndex), background, parseInt(position), name];
        command101.isJsonTextEventPlugin = true;

        const lines = (text || "").split('\n');
        const command401s = lines.map(line => {
            const command401 = JSON.parse(JSON.stringify(codeTemplate));
            command401.code = 401;
            command401.parameters = [line];
            command401.isJsonTextEventPlugin = true;
            return command401;
        });

        return [command101, ...command401s];
    }
    
    function makeShowPictureCode(json, codeTemplate) {
        const settings = applyPresetAndDefaults(json, defaultPictureParams);
        const { id, path, origin, howToSpecify, x, y, scaleX, scaleY, opacity, blendMode } = settings;
        const basePath = path.replace(/\.[^/.]+$/, "");
        
        const command231 = JSON.parse(JSON.stringify(codeTemplate));
        command231.code = 231;
        command231.parameters = [
            parseInt(id), 
            basePath, 
            origin === "中心" ? 1 : 0,
            howToSpecify === "変数で指定"? 1 : 0,
            parseInt(x), 
            parseInt(y), 
            parseInt(scaleX), 
            parseInt(scaleY), 
            parseInt(opacity), 
            blendMode === "加算" ? 1 : blendMode === "乗算" ? 2 : blendMode === "スクリーン" ? 3 : 0
        ];
        command231.isJsonTextEventPlugin = true;

        return command231;
    }

    function makeErasePictureCode(json, codeTemplate) {
        const settings = applyPresetAndDefaults(json, defaultPictureParams);
        const { id } = settings;

        const command235 = JSON.parse(JSON.stringify(codeTemplate));
        command235.code = 235;
        command235.parameters = [parseInt(id)];
        command235.isJsonTextEventPlugin = true;

        return command235;
    }
    
    //-----------------------------------------------------------------------------
    // コマンドリスト解析処理
    //-----------------------------------------------------------------------------
    function parseCommandList(content) {
        const text = content
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, "\\")
            .slice(1, -1);
        const lines = text.split('\n');
        const commands = [];
        let currentJson = null;
        let currentText = [];
        let count = 0;
        
        function pushCommandIfNeeded() {
            if (currentJson) {
                if (Object.keys(currentJson).length > 0) {
                    const type = currentJson.type;
                    commands.push({
                        json: applyPresetAndDefaults(currentJson, {}),
                        text: currentText.join("\n"),
                    });
                    count++;
                    console.log(
                        `No.${count} command`,
                        currentJson,
                        currentText.join("\n")
                    );
                } else {
                    console.warn("コメントアウト：", currentText.join("\n"));
                }
            }
            currentJson = null;
            currentText = [];
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trimEnd();
            if (line === '') {
                pushCommandIfNeeded();
                continue;
            }
            if (line === '\\'){
                line = '';
            }

            // 最初の行がJSONと仮定
            if (!currentJson) {
                try {
                    currentJson = JSON.parse(line);
                } catch (e) {
                    console.error("コマンドリスト解析失敗: JSONパースエラー", e, line);
                    currentJson = {type:"show text"}; // fallback
                    currentText.push("\\C[18]JSONパースエラー");
                }
            } else {
                currentText.push(line);
            }
        }

        pushCommandIfNeeded();

        return commands;
    }

    //-----------------------------------------------------------------------------
    // プラグインコマンド処理
    //-----------------------------------------------------------------------------

    PluginManager.registerCommand(pluginName, "DefineList", args => {
        const listId = args.listId;
        const content = args.listContent;
        const parsed = parseCommandList(content);
        commandLists[listId] = {
            commands: parsed,
            index: 0
        };
    });

    PluginManager.registerCommand(pluginName, "ExecuteNext", function (args) {
        let executeCount = Number(args.executeCount);
        const listId = args.listId;

        // リストを取得（リストが存在しない場合はエラー）
        if (!commandLists[listId]) {
            console.error(`commandList not found: ${listId}`);
            return;
        }
        const listData = commandLists[listId];

        // 実行コマンド数が0以下の場合はリストの残り全てを実行する
        if (executeCount <= 0) {
            executeCount = listData.commands.length - listData.index;
        }

        // 挿入する実行コマンド（コード）を生成
        const interpreterIndex = this._index;
        const eventId = this._eventId;
        const cmdTemplate = this._list[interpreterIndex];
        let commands = [];
        for (let i = 0; i < executeCount; i++) {
            if (listData.index >= listData.commands.length) break;
            commands = commands.concat(jsonToCode(listData.commands[listData.index], eventId, cmdTemplate));
            listData.index++;
        }
        
        // コマンド挿入のための準備
        let i = interpreterIndex+1;
        let insertIndex = 0
        const newInterpreterList = [];
        while (i < this._list.length) {
            // 357と657はワンセットになるため、657の終わりをinsertIndexとする
            if (this._list[i].code !== 657 && insertIndex === 0) insertIndex = i;
            // 2回目以降は$gameMap._interpreter._listが変更済みなので、isJsonTextEventPluginは除外する
            if (insertIndex !== 0 && !this._list[i].isJsonTextEventPlugin) newInterpreterList.push(this._list[i]);
            i++;
        }
        // コマンドを挿入
        this._list = this._list.slice(0, insertIndex).concat(commands).concat(newInterpreterList);
    });

    PluginManager.registerCommand(pluginName, "ResetProgress", args => {
        const listId = args.listId;
        if (commandLists[listId]) {
            commandLists[listId].index = 0;
        }
    });

    PluginManager.registerCommand(pluginName, "DeleteList", args => {
        const listId = args.listId;
        delete commandLists[listId];
    });

    PluginManager.registerCommand(pluginName, "JumpToIndex", (args) => {
        const listId = args.listId;
        const index = parseInt(args.index, 10);
        if (!commandLists[listId]) {
            console.error(`List not found: ${listId}`);
            return;
        }
    
        const listLength = commandLists[listId].commands.length;
        let resolvedIndex;
    
        if (index >= 0) {
            resolvedIndex = index-1;
        } else {
            resolvedIndex = listLength + index;
        }
    
        if (resolvedIndex >= 0 && resolvedIndex < listLength) {
            commandLists[listId].index = resolvedIndex;
            console.log(`Jumped to index ${resolvedIndex} in list ${listId}`);
        } else {
            console.error(`Invalid index: ${index} (resolved as ${resolvedIndex}) for list ${listId}`);
        }
    });

    PluginManager.registerCommand(pluginName, "GetIndex", (args) => {
        const listId = args.listId;
        const variableId = parseInt(args.variableId, 10);
        if (commandLists[listId] && variableId > 0) {
            const index = commandLists[listId].index;
            $gameVariables.setValue(variableId, index);
            console.log(`Current index of list ${listId} saved to variable ${variableId}: ${index}`);
        } else {
            console.error(`Invalid list or variable ID: ${listId}, ${variableId}`);
        }
    });
})();

