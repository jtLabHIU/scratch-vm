/**
 * @file a Scratch3 extention implement for Tello
 *      scaratch3_jttello/index.js
 * @module scratch-vm/src/extension/scartch3_jttello
 * @version 1.00.200310a
 * @author TANAHASHI, Jiro <jt@do-johodai.ac.jp>
 * @license MIT (see 'LICENSE' file)
 * @copyright (C) 2019-2020 jtLab, Hokkaido Information University
 */

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const formatMessage = require('format-message');
const dispatch = require('../../dispatch/central-dispatch');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

/**
 * Icon svg to be displayed in the category menu, encoded as a data URI.
 * @type {string}
 */
const menuIconURI = blockIconURI;

/**
 * Class for the new blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3jttello {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        //this._onTargetCreated = this._onTargetCreated.bind(this);
        //this.runtime.on('targetWasCreated', this._onTargetCreated);

        this._client = this.runtime.ioDevices.helper;

        this._lastResponse = {
            'commID': 0,
            'result': false,
            'message': 'nothing has been requested'
        };
    }


    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'jttello',
            name: 'jtLab Tello Controller',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'connect',
                    text: 'TELLO- [TELLOID] に接続する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TELLOID: {
                            type: ArgumentType.STRING,
                            defaultValue: "D2D555"
                        }
                    }
                },
                {
                    opcode: 'disconnect',
                    text: 'TELLOとの接続を切る',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'isAlive',
                    text: 'TELLOとの接続完了',
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'lastResult',
                    text: 'コマンドが成功した',
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'lastResponse',
                    text: 'Telloからの返答',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'reset',
                    text: 'リセット',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'command',
                    text: 'コマンドモードにする',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'battery',
                    text: 'バッテリー残量',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'takeoff',
                    blockType: BlockType.COMMAND,
                    text: '離陸する'
                },
                {
                    opcode: 'land',
                    blockType: BlockType.COMMAND,
                    text: '着陸する'
                },
                {
                    opcode: 'streamon',
                    blockType: BlockType.COMMAND,
                    text: 'カメラ映像を表示する'
                },
                {
                    opcode: 'streamoff',
                    blockType: BlockType.COMMAND,
                    text: 'カメラ映像を切る'
                },
                {
                    opcode: 'emergency',
                    blockType: BlockType.COMMAND,
                    text: 'その場で緊急着陸する'
                },
                {
                    opcode: 'up',
                    text: '[CM] cm 上昇する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'down',
                    text: '[CM] cm 下降する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'forward',
                    text: '[CM] cm 前へ飛ぶ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'back',
                    text: '[CM] cm 後ろへ飛ぶ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'left',
                    text: '[CM] cm 左へ飛ぶ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'right',
                    text: '[CM] cm 右へ飛ぶ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'cw',
                    text: '時計周りに [DEGREE] ° 旋回する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEGREE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'ccw',
                    text: '反時計周りに [DEGREE] ° 旋回する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEGREE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'flip',
                    blockType: BlockType.COMMAND,
                    text: '[DIRECTION] に宙返りする',
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'FLIP_DIRECTIONS',
                            defaultValue: 'f'
                        }
                    }
                },
                {
                    opcode: 'go',
                    blockType: BlockType.COMMAND,
                    text: '( [X] , [Y] , [Z] )へ [SPEED] cm/秒で飛ぶ',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'stop',
                    blockType: BlockType.COMMAND,
                    text: 'その場でホバリングする'
                },
                {
                    opcode: 'curve',
                    blockType: BlockType.COMMAND,
                    text: '( [X1] , [Y1] , [Z1] )を通って、( [X2] , [Y2] , [Z2] )へ [SPEED] cm/秒でカーブしながら飛ぶ',
                    arguments: {
                        X1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        Y1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        Z1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        X2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        },
                        Y2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 40
                        },
                        Z2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                {
                    opcode: 'gomid',
                    blockType: BlockType.COMMAND,
                    text: '( [X] , [Y] , [Z] )のミッションパッド [MID] まで [SPEED] cm/秒で飛ぶ',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        },
                        MID: {
                            type: ArgumentType.STRING,
                            menu: 'MISSION_PAD_ID',
                            defaultValue: 'm1'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'curvemid',
                    blockType: BlockType.COMMAND,
                    text: '( [X1] , [Y1] , [Z1] )を通って、( [X2] , [Y2] , [Z2] )のミッションパッド [MID] まで [SPEED] cm/秒でカーブしながら飛ぶ',
                    arguments: {
                        X1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        Y1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        Z1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        },
                        X2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        },
                        Y2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 40
                        },
                        Z2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        },
                        MID: {
                            type: ArgumentType.STRING,
                            menu: 'MISSION_PAD_ID',
                            defaultValue: 'm1'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                {
                    opcode: 'jumpmid',
                    blockType: BlockType.COMMAND,
                    text: '( [X] , [Y] , [Z] )のミッションパッド [MID1] から [MID2] まで [SPEED] cm/秒で飛び、 [YAW] ° に向く',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        },
                        MID1: {
                            type: ArgumentType.STRING,
                            menu: 'MISSION_PAD_ID',
                            defaultValue: 'm1'
                        },
                        MID2: {
                            type: ArgumentType.STRING,
                            menu: 'MISSION_PAD_ID',
                            defaultValue: 'm1'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        YAW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'speed',
                    text: '速度を [SPEED] cm/秒にする',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                },
                {
                    opcode: 'rc',
                    text: 'ラジコン：左右 [A] /前後 [B] /上下 [C] /向き [D]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        A: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        B: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        C: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        D: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'wifi',
                    text: 'Wi-FiのSSIDを [SSID] に、パスワードを [PASS] にする',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SSID: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        PASS: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'mon',
                    text: 'ミッションパッド検出を有効にする',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'moff',
                    text: 'ミッションパッド検出を無効にする',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'mdirection',
                    text: 'ミッションパッド検出を [MDIRECTION] にする',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MDIRECTION: {
                            type: ArgumentType.NUMBER,
                            menu: 'MID_DIRECTIONS',
                            defaultValue: 2
                        }
                    }
                },
                {
                    opcode: 'ap',
                    text: '接続先のSSID [SSID] 、パスワード [PASS] でステーションモードにする',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SSID: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        PASS: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'repSpeed',
                    text: '飛行速度(cm/秒)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'repTime',
                    text: '飛行時間',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'repSNR',
                    text: 'Wi-Fi電波強度',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'repSDK',
                    text: 'Tello SDKバージョン',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'repSN',
                    text: 'Telloシリアルナンバー',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_mid',
                    text: 'ミッションパッドID',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_x',
                    text: 'ミッションパッドX座標',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_y',
                    text: 'ミッションパッドY座標',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_z',
                    text: 'ミッションパッドZ座標',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_pitch',
                    text: 'ピッチ角(°)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_roll',
                    text: 'ロール角(°)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_yaw',
                    text: 'ヨー角(°)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_vgx',
                    text: 'X軸速度(cm/秒)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_vgy',
                    text: 'Y軸速度(cm/秒)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_vgz',
                    text: 'Z軸速度(cm/秒)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_templ',
                    text: '最低温度(℃)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_temph',
                    text: '最高温度(℃)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_tof',
                    text: '飛行距離(cm)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_h',
                    text: '飛行高度(cm)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_bat',
                    text: 'バッテリー残量(％)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_baro',
                    text: '気圧換算高度(cm)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_time',
                    text: 'モーター使用時間',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_agx',
                    text: 'X軸加速度(mG)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_agy',
                    text: 'Y軸加速度(mG)',
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'status_agz',
                    text: 'Z軸加速度(mG)',
                    blockType: BlockType.REPORTER
                }
            ],
            menus: {
                DIRECTIONS: {
                    acceptReporters: true,
                    items: [
                        { text: '前', value: 'f' },
                        { text: '後', value: 'b' },
                        { text: '左', value: 'l' },
                        { text: '右', value: 'r' },
                        { text: '上', value: 'u' },
                        { text: '下', value: 'd' }
                    ]
                },
                FLIP_DIRECTIONS: {
                    acceptReporters: true,
                    items: [
                        { text: '前', value: 'f' },
                        { text: '後', value: 'b' },
                        { text: '左', value: 'l' },
                        { text: '右', value: 'r' }
                    ]
                },
                MISSION_PAD_ID: {
                    acceptReporters: true,
                    items: [
                        { text: 'm1', value: 'm1' },
                        { text: 'm2', value: 'm2' },
                        { text: 'm3', value: 'm3' },
                        { text: 'm4', value: 'm4' },
                        { text: 'm5', value: 'm5' },
                        { text: 'm6', value: 'm6' },
                        { text: 'm7', value: 'm7' },
                        { text: 'm8', value: 'm8' }
                    ]
                },
                MID_DIRECTIONS: {
                    acceptReporters: true,
                    items: [
                        { text: '下のみ', value: 0 },
                        { text: '前のみ', value: 1 },
                        { text: '下前両方', value: 2 }
                    ]
                }
            },
        };
    }

    connect(args){
        const deviceInfo =
            {
                'name': args.TELLOID,
                'ssid': 'TELLO-' + args.TELLOID,
                'mac': args.TELLOID,
                'ip': '',   //192.168.10.1
                'port': {'udp':8889},
                'via': {'udp':8889},
                'downstream': [{'udp':8890}, {'udp':11111}]
            };
            this.log(`connect start`);
        return this._client.request('addDevice ' + JSON.stringify(deviceInfo), 'module')
        .then( result => {
            return this._client.request('connect ' + args.TELLOID, 'module');
        }).then( result => {
            this.log('connect result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }
    disconnect(){
        return this._client.request('disconnect', 'module')
        .then( result => {
            console.log('disconnect result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }
    command(){
        return this._client.request('command', 'tello')
        .then( result => {
            console.log('command result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }
    isAlive(){
        return this._client.request('isAlive', 'module')
        .then( result => {
            console.log('isAlive result:', result);
            this._lastResponse = result;
            return result.result;
        });
    }
    lastResult(){
        return this._lastResponse.result;
    }
    lastResponse(){
        return this._lastResponse.message;
    }
    battery(){
        return this._client.request('battery?', 'tello')
        .then( result => {
            console.log('bettery? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }
    takeoff(){
        return this._client.request('takeoff', 'tello')
        .then( result => {
            console.log('takeoff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    land(){
        return this._client.request('land', 'tello')
        .then( result => {
            console.log('land result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    streamon(){
        return this._client.request('streamon', 'tello')
        .then( result => {
            console.log('streamon result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    streamoff(){
        return this._client.request('streamoff', 'tello')
        .then( result => {
            console.log('streamoff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    /**
     * ToDo: this command must be immediately
     */
    emergency(){
        return this._client.request('emergency', 'tello', 'async')
        .then( result => {
            console.log('streamoff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    up(args){
        return this._client.request('up ' + args.CM, 'tello')
        .then( result => {
            console.log('emergency result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    down(args){
        return this._client.request('down ' + args.CM, 'tello')
        .then( result => {
            console.log('down result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    forward(args){
        return this._client.request('forward ' + args.CM, 'tello')
        .then( result => {
            console.log('forward result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    back(args){
        return this._client.request('back ' + args.CM, 'tello')
        .then( result => {
            console.log('back result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    left(args){
        return this._client.request('left ' + args.CM, 'tello')
        .then( result => {
            console.log('left result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    right(args){
        return this._client.request('right ' + args.CM, 'tello')
        .then( result => {
            console.log('right result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    cw(args){
        return this._client.request('cw ' + args.DEGREE, 'tello')
        .then( result => {
            console.log('cw result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    ccw(args){
        return this._client.request('ccw ' + args.DEGREE, 'tello')
        .then( result => {
            console.log('ccw result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    flip(args){
        return this._client.request('flip ' + args.DIRECTION, 'tello')
        .then( result => {
            console.log('flip result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    go(args){
        return this._client.request('go ' + args.X + ' ' + args.Y + ' ' + args.Z + ' ' + args.SPEED, 'tello')
        .then( result => {
            console.log('go result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    /**
     * ToDo: this command must be immediately
     */
    stop(){
        return this._client.request('stop', 'tello', 'async')
        .then( result => {
            console.log('stop result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    curve(args){
        return this._client.request('curve ' + args.X1 + ' ' + args.Y1 + ' ' + args.Z1 + ' ' + args.X2 + ' ' + args.Y2 + ' ' + args.Z2 + ' ' + args.SPEED, 'tello')
        .then( result => {
            console.log('curve result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    gomid(args){
        return this._client.request('go ' + args.X + ' ' + args.Y + ' ' + args.Z + ' ' + args.SPEED + ' ' + args.MID, 'tello')
        .then( result => {
            console.log('gomid result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    curvemid(args){
        return this._client.request('curve ' + args.X1 + ' ' + args.Y1 + ' ' + args.Z1 + ' ' + args.X2 + ' ' + args.Y2 + ' ' + args.Z2 + ' ' + args.SPEED + ' ' + args.MID, 'tello')
        .then( result => {
            console.log('curvemid result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    jumpmid(args){
        return this._client.request('jump ' + args.X + ' ' + args.Y + ' ' + args.Z + ' ' + args.SPEED + ' ' + args.YAW + ' ' + args.MID1 + ' ' + args.MID2, 'tello')
        .then( result => {
            console.log('jumpmid result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    speed(args){
        return this._client.request('speed ' + args.SPEED, 'tello')
        .then( result => {
            console.log('speed result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    /**
     * ToDo: this command must be immediately
     */
    rc(args){
        return this._client.request('rc ' + args.A + ' ' + args.B + ' ' + args.C + ' ' + args.D, 'tello', 'async')
        .then( result => {
            console.log('rc result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    wifi(args){
        return this._client.request('wifi ' + args.SSID + ' ' + args.PASS, 'tello')
        .then( result => {
            console.log('wifi result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    mon(){
        return this._client.request('mon', 'tello')
        .then( result => {
            console.log('mon result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    moff(){
        return this._client.request('moff', 'tello')
        .then( result => {
            console.log('moff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    mdirection(args){
        return this._client.request('mdirection ' + args.MDIRECTION, 'tello')
        .then( result => {
            console.log('mdirection result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    ap(args){
        return this._client.request('ap ' + args.SSID + ' ' + args.PASS, 'tello')
        .then( result => {
            console.log('ap result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSpeed(){
        return this._client.request('speed?', 'tello')
        .then( result => {
            console.log('speed? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repTime(){
        return this._client.request('time?', 'tello')
        .then( result => {
            console.log('time? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSNR(){
        return this._client.request('wifi?', 'tello')
        .then( result => {
            console.log('wifi? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSDK(){
        return this._client.request('sdk?', 'tello')
        .then( result => {
            console.log('sdk? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSN(){
        return this._client.request('sn?', 'tello')
        .then( result => {
            console.log('sn? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    reset(){
        return this._client.request('reset', 'module', 'async', 1000)
        .then( result => {
            console.log('reset(module) result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    status_mid(){
        return this._client.request('mid', 'tello', 'status')
        .then( result => {
            console.log('status_mid result:', result);
            return result.message;
        });
    }

    status_x(){
        return this._client.request('x', 'tello', 'status')
        .then( result => {
            console.log('status_x result:', result);
            return result.message;
        });
    }

    status_y(){
        return this._client.request('y', 'tello', 'status')
        .then( result => {
            console.log('status_y result:', result);
            return result.message;
        });
    }

    status_z(){
        return this._client.request('z', 'tello', 'status')
        .then( result => {
            console.log('status_z result:', result);
            return result.message;
        });
    }

    status_pitch(){
        return this._client.request('pitch', 'tello', 'status')
        .then( result => {
            console.log('status_pitch result:', result);
            return result.message;
        });
    }

    status_roll(){
        return this._client.request('roll', 'tello', 'status')
        .then( result => {
            console.log('status_roll result:', result);
            return result.message;
        });
    }

    status_yaw(){
        return this._client.request('yaw', 'tello', 'status')
        .then( result => {
            console.log('status_yaw result:', result);
            return result.message;
        });
    }

    status_vgx(){
        return this._client.request('vgx', 'tello', 'status')
        .then( result => {
            console.log('status_vgx result:', result);
            return result.message;
        });
    }

    status_vgy(){
        return this._client.request('vgy', 'tello', 'status')
        .then( result => {
            console.log('status_vgy result:', result);
            return result.message;
        });
    }

    status_vgz(){
        return this._client.request('vgz', 'tello', 'status')
        .then( result => {
            console.log('status_vgz result:', result);
            return result.message;
        });
    }

    status_templ(){
        return this._client.request('templ', 'tello', 'status')
        .then( result => {
            console.log('status_templ result:', result);
            return result.message;
        });
    }

    status_temph(){
        return this._client.request('temph', 'tello', 'status')
        .then( result => {
            console.log('status_temph result:', result);
            return result.message;
        });
    }

    status_tof(){
        return this._client.request('tof', 'tello', 'status')
        .then( result => {
            console.log('status_tof result:', result);
            return result.message;
        });
    }

    status_h(){
        return this._client.request('h', 'tello', 'status')
        .then( result => {
            console.log('status_h result:', result);
            return result.message;
        });
    }

    status_bat(){
        return this._client.request('bat', 'tello', 'status')
        .then( result => {
            console.log('status_bat result:', result);
            return result.message;
        });
    }

    status_baro(){
        return this._client.request('baro', 'tello', 'status')
        .then( result => {
            console.log('status_baro result:', result);
            return result.message;
        });
    }

    status_time(){
        return this._client.request('time', 'tello', 'status')
        .then( result => {
            console.log('status_time result:', result);
            return result.message;
        });
    }

    status_agx(){
        return this._client.request('agx', 'tello', 'status')
        .then( result => {
            console.log('status_agx result:', result);
            return result.message;
        });
    }

    status_agy(){
        return this._client.request('agy', 'tello', 'status')
        .then( result => {
            console.log('status_agy result:', result);
            return result.message;
        });
    }

    status_agz(){
        return this._client.request('agz', 'tello', 'status')
        .then( result => {
            console.log('status_agz result:', result);
            return result.message;
        });
    }

    log(msg, ...msgs){
        if(msgs.length){
            console.log(msg, ...msgs);
        }else{
            console.log(msg);
        }
    }
}

module.exports = Scratch3jttello;