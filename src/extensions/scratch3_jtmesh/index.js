/**
 * @file a Scratch3 extention implement for Scratch Mesh network
 *      scaratch3_jtmesh/index.js
 * @module scratch-vm/src/extension/scartch3_jtmesh
 * @version 1.00.200310a
 * @author TANAHASHI, Jiro <jt@do-johodai.ac.jp>
 * @license MIT (see 'LICENSE' file)
 * @copyright (C) 2020 jtLab, Hokkaido Information University
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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/hJREFUeNrsm99LU2EYx6ctNtC2SU484RkIWuk2q0FCul14UQgTKgLFjewqaP0F9he4i7roRi+6K5zVRXThypvqIlMQ9MI5vXAwcMFgE3JTSKmLvmMw5tnxeH5s5xzb83AuHEfPeT/n+32e8z7vOxusX54b6ikaDXUWBEzABEzABEzABKxdGFW+X9QzNmjrUPOOc+l4aGtBM4VVpkWMM866s7TDbKkv4J3DPFVpAiZgAiZgAiZgAiZgAiZgAiZgAiZgAiZgAiZgAiZgjSL/90hL4B97P1W+YzSbKP+o9t6Sf+2dwFlvCzt/Y1SMaFPJ5ZnUqowBGHVlv5meYTEeCW1+Lt9MUAnY1WwfsXd5bSx+tp435f4cYRDf91KwECdtRMZk5wBbtglUGanD/OT2N45F1QAetHWELw+5m9sqTwUYZ677CGabTq1JwoaZJztvCXgYqJF0XLmJGiR9E89iNIW7hwLHNyB5A2oH1j9uHGTFXNZhtiz2T+DivKrOpuN4gjlZrlGkMAYU9YzyCsvLEPWMQZa502SxGk2RvnuVtECdSi5VRVWZwBH3XZG0JRLYIbafEdDZWniIYygHnLI0m96oOqo04CesB2km9epF9fqWXomkhR2Q/LGDTO1eBEaRZn7WOSDvBvA2qlE4uSxAC/eCM5LeqFaiKgVGlbLyVRSREWBcHGCkxkzvMJ6FCpLKAQ6KKMvCIuNNVppUIjWC7c7p1GqNsrQKwJJqFW/4WtgS8OKvFA79dktV+aKRw2ytr/bQIThn/A+BVSi/VQOOiZsennaRzJkBxsRddi9WivX97FmydDS7rdDPn3YTZwkYcwNFbb2spQktgTH1kz1oyKvweWlTpaeSy/IKT2hzIa+bEi0BGIPG0KW+XUJbC+XZ22ho0DUwZpS9Ta2lj2hrvSuvxesMWk73//LqbeWz1FoBY2RRz+jba/fL1yKQzL6VN+HkkrDUmCrj0XBo0SQ+vORGk6Sk8VIe/GtaGFNs4HERFZL6195z8hCn0DOOtHa5L7SVAPCbQJ1NxyuXOMYZZ2kJtugUfQFz/hWDl1l8lNMWA+0xbKIXS0M6TocEey/2T8hom2CE6Z7hyuV12FurZD5nfnSHY+YP1x+YGo2VJg8yLnR56wcZkVJDWFzqppXhPXul6aIuFgACjMtyclGB+Dii2cT8buKkHQZXsz3IOP32buGWEH7xtrDqrwRwgZ+ynlP/xm/vwmHoKay27/zOlZ+StLIZbHdqDIy8YqV06tBQSWdfeGpbmhatwghUDOSOjLXuagL7VL99cfNRM2D38S0PFcKnrcIWTSd9+uqWahTqe0pjYPU9dey1ZPv6gixNwARMwLqOfwIMAKh9io4cnYjUAAAAAElFTkSuQmCC';

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
class Scratch3jtmesh {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        //this._onTargetCreated = this._onTargetCreated.bind(this);
        //this.runtime.on('targetWasCreated', this._onTargetCreated);

        /**
         * The client to jtS3Helper
         * @type {Helper}
         */
        this._client = this.runtime.ioDevices.helper;

        /**
         * internal status
         * @typedef {object} MeshStatus
         * @property {boolean} serverRunning - started Mesh Server
         * @property {boolean} connected - connected to Mesh
         * @property {string|null} ip - the IP address of Mesh Server
         * 
         * @type {MeshStatus}
         */
        this._status = {
            'serverRunning': false,
            'connected': false,
            'ip': null
        }

        /**
         * last response from helper
         * @typedef {object} HelperResponse
         * @property {number} commID - helper communication ID
         * @property {boolean} result - request result
         * @property {string} message - result message
         * 
         * @type {HelperResponse}
         */
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
            id: 'jtmesh',
            name: formatMessage({
                id: 'jtmesh.categoryName',
                default: 'jtMesh',
                description: 'Label for the jtMesh extension category'
            }),
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'startMeshServer',
                    blockType: BlockType.COMMAND,
                    text: 'Host Mesh'
                },
                {
                    opcode: 'connectMesh',
                    blockType: BlockType.COMMAND,
                    text: 'Join Mesh on [HOST]',
                    arguments: {
                        HOST: {
                            type: ArgumentType.STRING,
                            defaultValue: "127.0.0.1"
                        }
                    }
                },
                {
                    opcode: 'stopMesh',
                    blockType: BlockType.COMMAND,
                    text: 'Stop Hosting or Leave Mesh'
                },
                {
                    opcode: 'showIPAddress',
                    blockType: BlockType.REPORTER,
                    text: 'Show IP Address'
                },
                {
                    opcode: 'getSensorUpdate',
                    blockType: BlockType.REPORTER,
                    text: '[TARGET] センサーの値',
                    arguments: {
                        TARGET: {
                            type: ArgumentType.STRING,
                            //menu: 'SENSORS',
                            defaultValue: "slider"
                        }
                    }
                }
            ],
            menus: {
                SENSORS: {
                    acceptReporters: true,
                    items: [
                        { text: 'スライダー', value: 'slider' },
                        { text: '明るさ', value: 'brightness' }
                    ]
                }
            },
        };
    }

    startMeshServer(){
        if(this._status.serverRunning){
            return 'server is already running'
        } else if(this._status.connected){
            return 'this client is already connected to other Mesh Server';
        }else{
            return this._client.request('start', 'mesh')
            .then( result => {
                console.log('startMeshServer result:', result);
                this._lastResponse = result;
                if(result.result){
                    this._status.serverRunning = true;
                    this._status.ip = result.message;
                }
                return result.message;
            });
        }
    }

    connectMesh(args){
        if(this._status.serverRunning){
            return 'server is already running on this host'
        } else {
            return this._client.request('connect ' + args.HOST, 'mesh')
            .then( result => {
                console.log('connect result:', result);
                this._lastResponse = result;
                if(result.result){
                    this._status.connected = true;
                    this._status.ip = args.HOST
                }else{
                    this._status.connected = false;
                    this._status.ip = null;
                }
                return result.message;
            });
        }
    }

    stopMesh(){
        return this._client.request('terminate', 'mesh')
        .then( result => {
            console.log('terminate result:', result);
            this._lastResponse = result;
            if(result.result){
                this._status.serverRunning = false;
                this._status.connected = false;
                this._status.ip = null;
            }
            return result.message;
        });
    }

    showIPAddress(){
        return this._status.ip;
    }

    getSensorUpdate(args){
        const result = this._client.getMeshSensorValue(args.TARGET);
        console.log('getSensorUpdate result:', result);
        this._lastResponse = result;
        return result.value;
    }
}

module.exports = Scratch3jtmesh;