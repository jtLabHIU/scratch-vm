/**
 * @file IO Device to jtS3Helper for Scratch3
 *      helper.js
 * @module scratch-vm/src/io/helper
 * @version 0.00.191106a
 * @author TANAHASHI, Jiro <jt@do-johodai.ac.jp>
 * @license MIT (see 'LICENSE' file)
 * @copyright (C) 2019 jtLab, Hokkaido Information University
 */

const dispatch = require('../dispatch/central-dispatch');
const Variable = require('../engine/variable');
const JSONRPC = require('../util/jsonrpc');
const log = require('../util/log');

class Helper extends JSONRPC{
    constructor(runtime){
        super(runtime);

        this._comm = {};
        this._comm.host = 'localhost';
        this._comm.port = 8888;
        this._comm.endpoint = 'api';
        this._comm.sock = null;
    }

    /**
     * is open
     * @returns {boolean} true if connection has been established with jtS3Helper 
     */
    isOpen(){
        return this._comm.sock && this._comm.sock.readyState == WebSocket.OPEN;
    }

    open(param){
        if(param){
            if(param.hasOwnProperty('host')){
                this._comm.host = param.host;
            }
            if(param.hasOwnProperty('port')){
                this._comm.port = param.port;
            }
            if(param.hasOwnProperty('endpoint')){
                this._comm.endpoint = param.endpoint;
            }
        }
        
        try{
            this._comm.sock = new WebSocket(`ws://${this._comm.host}:${this._comm.port}/${this._comm.endpoint}`);
            this._comm.sock.onopen = _onOpen;
            this._comm.sock.onclose = _onClose;
            this._comm.sock.onerror = _onError;
            this._comm.sock.onmessage = _onMessage;
        } catch(exception) {
            log.error('unable to open WebSocket for helper.');
            this.close();
        }
    }

    _onOpen(event){
        log.log('success to open the WebSocket for helper:', this._sock.url);
        log.log(event);
    }

    _onClose(event){
        log.log('success to open the WebSocket for helper:', this._sock.url);
        log.log(event);
    }

    _onError(event){
        log.log('an error is observed in the WebSocket for helper:', this._sock.url);
        log.log(event);
    }

    _onMessage(event){
        log.log('an message is received from the WebSocket for helper:', this._sock.url);
        log.log(event);
    }

    close(){
        try{
            this._comm.sock.close();
            this._comm.sock = null;
        }catch(e){}
    }

    /**
     * has been called from setter on Variable
     * @param {Variable} variable 
     */
    onChangeVariable(variable){
        if(this.isOpen()){
            log.log('hi from helper.onChangeValiable:', variable);
        }else{
            log.log('unable to connect:', this._comm.sock);
        }
    }

    /**
     * has been called from broadcast[AndWait] on scratch3_event
     * @param {Variable} variable 
     */
    onBroadcast(variable){
        if(this.isOpen()){
            log.log('hi from helper.onBroadcast:', variable);
        }else{
            log.log('unable to connect:', this._comm.sock);
        }
    }
}

module.exports = Helper;