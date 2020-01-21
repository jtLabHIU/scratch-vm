const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const formatMessage = require('format-message');
//const ws = require('ws');
const dispatch = require('../../dispatch/central-dispatch');
const WSC = require('./lib/jtWebSockClientPromise');

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
        this._client = new WSC({portComm:5963, apiComm:'jtS3H'});
        this._client.init();
        console.log('dispatch from extention:', dispatch.services);

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
                    text: 'TELLO- [TELLOID] に接続',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TELLOID: {
                            type: ArgumentType.STRING,
                            defaultValue: "D2D555"
//                            defaultValue: "D3F077"
                        }
                    }
                },
                {
                    opcode: 'lastResponse',
                    text: 'Telloからの返答',
                    blockType: BlockType.REPORTER
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
                    opcode: 'reset',
                    text: 'リセット',
                    blockType: BlockType.COMMAND
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
    command(){
        return this._client.request('command')
        .then( result => {
            console.log('command result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }
    lastResponse(){
        return this._lastResponse.message;
    }
    battery(){
        return this._client.request('battery?')
        .then( result => {
            console.log('bettery? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }
    takeoff(){
        return this._client.request('takeoff')
        .then( result => {
            console.log('takeoff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    land(){
        return this._client.request('land')
        .then( result => {
            console.log('land result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    streamon(){
        return this._client.request('streamon')
        .then( result => {
            console.log('streamon result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    streamoff(){
        return this._client.request('streamoff')
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
        return this._client.request('emergency', 'async', 1)
        .then( result => {
            console.log('streamoff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    up(args){
        return this._client.request('up ' + args.CM)
        .then( result => {
            console.log('emergency result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    down(args){
        return this._client.request('down ' + args.CM)
        .then( result => {
            console.log('down result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    forward(args){
        return this._client.request('forward ' + args.CM)
        .then( result => {
            console.log('forward result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    back(args){
        return this._client.request('back ' + args.CM)
        .then( result => {
            console.log('back result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    left(args){
        return this._client.request('left ' + args.CM)
        .then( result => {
            console.log('left result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    right(args){
        return this._client.request('right ' + args.CM)
        .then( result => {
            console.log('right result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    cw(args){
        return this._client.request('cw ' + args.DEGREE)
        .then( result => {
            console.log('cw result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    ccw(args){
        return this._client.request('ccw ' + args.DEGREE)
        .then( result => {
            console.log('ccw result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    flip(args){
        return this._client.request('flip ' + args.DIRECTION)
        .then( result => {
            console.log('flip result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    go(args){
        return this._client.request('go ' + args.X + ' ' + args.Y + ' ' + args.Z + ' ' + args.SPEED)
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
        return this._client.request('stop', 'async', 1)
        .then( result => {
            console.log('stop result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    curve(args){
        return this._client.request('curve ' + args.X1 + ' ' + args.Y1 + ' ' + args.Z1 + ' ' + args.X2 + ' ' + args.Y2 + ' ' + args.Z2 + ' ' + args.SPEED)
        .then( result => {
            console.log('curve result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    gomid(args){
        return this._client.request('go ' + args.X + ' ' + args.Y + ' ' + args.Z + ' ' + args.SPEED + ' ' + args.MID)
        .then( result => {
            console.log('gomid result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    curvemid(args){
        return this._client.request('curve ' + args.X1 + ' ' + args.Y1 + ' ' + args.Z1 + ' ' + args.X2 + ' ' + args.Y2 + ' ' + args.Z2 + ' ' + args.SPEED + ' ' + args.MID)
        .then( result => {
            console.log('curvemid result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    jumpmid(args){
        return this._client.request('jump ' + args.X + ' ' + args.Y + ' ' + args.Z + ' ' + args.SPEED + ' ' + args.YAW + ' ' + args.MID1 + ' ' + args.MID2)
        .then( result => {
            console.log('jumpmid result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    speed(args){
        return this._client.request('speed ' + args.SPEED)
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
        return this._client.request('rc ' + args.A + ' ' + args.B + ' ' + args.C + ' ' + args.D, 'async', 1)
        .then( result => {
            console.log('rc result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    wifi(args){
        return this._client.request('wifi ' + args.SSID + ' ' + args.PASS)
        .then( result => {
            console.log('wifi result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    mon(){
        return this._client.request('mon')
        .then( result => {
            console.log('mon result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    moff(){
        return this._client.request('moff')
        .then( result => {
            console.log('moff result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    mdirection(args){
        return this._client.request('mdirection ' + args.MDIRECTION)
        .then( result => {
            console.log('mdirection result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    ap(args){
        return this._client.request('ap ' + args.SSID + ' ' + args.PASS)
        .then( result => {
            console.log('ap result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSpeed(){
        return this._client.request('speed?')
        .then( result => {
            console.log('speed? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repTime(){
        return this._client.request('time?')
        .then( result => {
            console.log('time? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSNR(){
        return this._client.request('wifi?')
        .then( result => {
            console.log('wifi? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSDK(){
        return this._client.request('sdk?')
        .then( result => {
            console.log('sdk? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    repSN(){
        return this._client.request('sn?')
        .then( result => {
            console.log('sn? result:', result);
            this._lastResponse = result;
            return result.message;
        });
    }

    reset(){
        return 'unimplemented yet';
    }

    status_mid(){
        return this._client.request('mid', 'tellostatus', 1)
        .then( result => {
            console.log('status_mid result:', result);
            return result.message;
        });
    }

    status_x(){
        return this._client.request('x', 'tellostatus', 1)
        .then( result => {
            console.log('status_x result:', result);
            return result.message;
        });
    }

    status_y(){
        return this._client.request('y', 'tellostatus', 1)
        .then( result => {
            console.log('status_y result:', result);
            return result.message;
        });
    }

    status_z(){
        return this._client.request('z', 'tellostatus', 1)
        .then( result => {
            console.log('status_z result:', result);
            return result.message;
        });
    }

    status_pitch(){
        return this._client.request('pitch', 'tellostatus', 1)
        .then( result => {
            console.log('status_pitch result:', result);
            return result.message;
        });
    }

    status_roll(){
        return this._client.request('roll', 'tellostatus', 1)
        .then( result => {
            console.log('status_roll result:', result);
            return result.message;
        });
    }

    status_yaw(){
        return this._client.request('yaw', 'tellostatus', 1)
        .then( result => {
            console.log('status_yaw result:', result);
            return result.message;
        });
    }

    status_vgx(){
        return this._client.request('vgx', 'tellostatus', 1)
        .then( result => {
            console.log('status_vgx result:', result);
            return result.message;
        });
    }

    status_vgy(){
        return this._client.request('vgy', 'tellostatus', 1)
        .then( result => {
            console.log('status_vgy result:', result);
            return result.message;
        });
    }

    status_vgz(){
        return this._client.request('vgz', 'tellostatus', 1)
        .then( result => {
            console.log('status_vgz result:', result);
            return result.message;
        });
    }

    status_templ(){
        return this._client.request('templ', 'tellostatus', 1)
        .then( result => {
            console.log('status_templ result:', result);
            return result.message;
        });
    }

    status_temph(){
        return this._client.request('temph', 'tellostatus', 1)
        .then( result => {
            console.log('status_temph result:', result);
            return result.message;
        });
    }

    status_tof(){
        return this._client.request('tof', 'tellostatus', 1)
        .then( result => {
            console.log('status_tof result:', result);
            return result.message;
        });
    }

    status_h(){
        return this._client.request('h', 'tellostatus', 1)
        .then( result => {
            console.log('status_h result:', result);
            return result.message;
        });
    }

    status_bat(){
        return this._client.request('bat', 'tellostatus', 1)
        .then( result => {
            console.log('status_bat result:', result);
            return result.message;
        });
    }

    status_baro(){
        return this._client.request('baro', 'tellostatus', 1)
        .then( result => {
            console.log('status_baro result:', result);
            return result.message;
        });
    }

    status_time(){
        return this._client.request('time', 'tellostatus', 1)
        .then( result => {
            console.log('status_time result:', result);
            return result.message;
        });
    }

    status_agx(){
        return this._client.request('agx', 'tellostatus', 1)
        .then( result => {
            console.log('status_agx result:', result);
            return result.message;
        });
    }

    status_agy(){
        return this._client.request('agy', 'tellostatus', 1)
        .then( result => {
            console.log('status_agy result:', result);
            return result.message;
        });
    }

    status_agz(){
        return this._client.request('agz', 'tellostatus', 1)
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