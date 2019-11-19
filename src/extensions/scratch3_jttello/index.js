const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
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
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TELLOID: {
                            type: ArgumentType.STRING,
                            defaultValue: "D2D555"
                        }
                    }
                },
                {
                    opcode: 'command',
                    text: 'コマンドモードにする',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'popResponse',
                    text: 'レスポンスのみ取得する',
                    blockType: BlockType.REPORTER
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
                    opcode: 'flip',
                    blockType: BlockType.COMMAND,
                    text: '宙返りする'
                },
                {
                    opcode: 'land',
                    blockType: BlockType.COMMAND,
                    text: '着陸する'
                },
                {
                    opcode: 'streamon',
                    blockType: BlockType.COMMAND,
                    text: 'ストリームをオンにする'
                },
                {
                    opcode: 'streamoff',
                    blockType: BlockType.COMMAND,
                    text: 'ストリームをオフにする'
                },
                {
                    opcode: 'up',
                    text: '[CM] cm 上昇する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
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
                            defaultValue: 20
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
                            defaultValue: 20
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
                            defaultValue: 20
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
                            defaultValue: 20
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
                            defaultValue: 20
                        }
                    }
                },
                {
                    opcode: 'cw',
                    text: '[DEGREE] ° 時計周りに旋回する',
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
                    text: '[DEGREE] ° 反時計周りに旋回する',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEGREE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        }
                    }
                }
            ],
            menus: {
            },
        };
    }

    connect(args){
        const deviceInfo =
            {
                'name': args.TELLOID,
                'ssid': 'TELLO-' + args.TELLOID,
                'mac': args.TELLOID,
                'ip': '192.168.10.1',
                'port': {'udp':8889},
                'via': {'udp':8889},
                'downstream': [{'udp':8890}, {'udp':11111}]
            };
            this.log(`connect start`);
        return this._client.request('addDevice ' + JSON.stringify(deviceInfo), 'module')
        .then( result => {
            this._client.request('connect ' + args.TELLOID, 'module');
        }).then( result => {
            this.log('connect result:', result);
            return result.message;
        });
    }
    command(){
        return this._client.request('command')
        .then( result => {
            console.log('command result:', result);
            return result.message;
        });
    }
    popResponse(){
        return this._client.request('popResponse')
        .then( result => {
            console.log('popResponse result:', result);
            return result.message;
        });
    }
    battery(){
        return this._client.request('battery?')
        .then( result => {
            console.log('bettery? result:', result);
            return result.message;
        });
    }
    takeoff(){
        return this._client.request('takeoff')
        .then( result => {
            console.log('takeoff result:', result);
            return result.message;
        });
    }
    flip(){
        return this._client.request('flip f')
        .then( result => {
            console.log('flip result:', result);
            return result.message;
        });
    }

    land(){
        return this._client.request('land')
        .then( result => {
            console.log('land result:', result);
            return result.message;
        });
    }

    up(args){
        return this._client.request('up ' + args.CM)
        .then( result => {
            console.log('up result:', result);
            return result.message;
        });
    }

    down(args){
        return this._client.request('down ' + args.CM)
        .then( result => {
            console.log('down result:', result);
            return result.message;
        });
    }

    forward(args){
        return this._client.request('forward ' + args.CM)
        .then( result => {
            console.log('forward result:', result);
            return result.message;
        });
    }

    back(args){
        return this._client.request('back ' + args.CM)
        .then( result => {
            console.log('back result:', result);
            return result.message;
        });
    }

    left(args){
        return this._client.request('left ' + args.CM)
        .then( result => {
            console.log('left result:', result);
            return result.message;
        });
    }

    right(args){
        return this._client.request('right ' + args.CM)
        .then( result => {
            console.log('right result:', result);
            return result.message;
        });
    }

    cw(args){
        return this._client.request('cw ' + args.DEGREE)
        .then( result => {
            console.log('cw result:', result);
            return result.message;
        });
    }

    ccw(args){
        return this._client.request('ccw ' + args.DEGREE)
        .then( result => {
            console.log('ccw result:', result);
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