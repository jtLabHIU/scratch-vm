/**
 * @file IO Device to jtS3Helper for Scratch3
 *      helper.js
 * @module scratch-vm/src/io/helper
 * @version 1.00.200122a
 * @author TANAHASHI, Jiro <jt@do-johodai.ac.jp>
 * @license MIT (see 'LICENSE' file)
 * @copyright (C) 2019 jtLab, Hokkaido Information University
 */

const dispatch = require('../dispatch/central-dispatch');
const Variable = require('../engine/variable');
const JSONRPC = require('../util/jsonrpc');
const log = require('../util/log');

const LOCATION = { port:5963, endpoint:'jtS3H' };

class Helper extends JSONRPC{
    constructor(runtime){
        super(runtime);

        this._comm = {};
        this._comm.host = 'localhost';
        this._comm.port = 8888;
        this._comm.endpoint = 'api';
        this._comm.sock = null;
        this._comm.id = 0;

        this._watchdogTerminater = false;
        this._responseBuffer = [];

        this.open(LOCATION);
    }

    /**
     * is open
     * @returns {boolean} true if connection has been established with jtS3Helper 
     */
    isOpen(){
        return this._comm.sock && this._comm.sock.readyState == WebSocket.OPEN;
    }

    /**
     * wait readyState become OPEN
     * @returns {Promise} - returns false if socket timeout
     */
    waitReadyState(){
        return new Promise( resolve => {
            let timer = 5000;
            const interval = 10;
            let watchdog = null;
            let result = new Promise( resolve => {
                watchdog = setInterval( () => {
                    if(this.isOpen()){
                        resolve(true);
                    }
                    timer = timer - interval;
                    if(timer<0){
                        resolve(false);
                    }
                }, interval);
            }).then( (result) => {
                clearInterval(watchdog);
                log.log('helper WebSock connection:' + this._comm.sock.url);
                resolve(result);
            });
        });
    }

    /**
     * open helper WebSocket
     * @param {object} param 
     * @returns {Promise} - returns true if successed
     */
    open(param){
        return new Promise( (resolve) => {
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
                log.log(`helper attempt to connect ws://${this._comm.host}:${this._comm.port}/${this._comm.endpoint}`);
                this._comm.sock = new WebSocket(`ws://${this._comm.host}:${this._comm.port}/${this._comm.endpoint}`);
                this._comm.sock.addEventListener('open', () => { this._onOpen() });
                this._comm.sock.addEventListener('close', () => { this._onClose() });
                this._comm.sock.addEventListener('error', (e) => { this._onError(e) });
                this._comm.sock.addEventListener('message', (sock) => { this._onMessage(sock) });
                Promise.resolve(this.waitReadyState())
                .then( () => {
                    resolve(true);
                });

            } catch(exception) {
                log.error('unable to open WebSocket for helper.', exception);
                this.close();
                resolve(false);
            }
        });
    }

    _onOpen(){
        log.log('success to open the WebSocket for helper:', this._comm.sock.url);
    }

    _onClose(sock){
        log.log('success to open the WebSocket for helper:', this._comm.sock.url);
    }

    _onError(e){
        log.log('an error is observed in the WebSocket for helper:', this._comm.sock.url);
        log.log(e);
    }

    _onMessage(sock){
        log.log('an message is received from the WebSocket for helper:', this._comm.sock.url);
        const response = JSON.parse(sock.data);
        log.log(response);
        if(response.commID === -1 && response.message === 'broadcast'){
            log.log('broadcast invoked: ', response.key);
            const broadcastVar = dispatch.services.runtime.getTargetForStage().lookupBroadcastMsg(
                null, response.key);
            if (broadcastVar) {
                log.log('broadcast lookup successed');
                const broadcastOption = response.key;
                dispatch.services.runtime.startHats('event_whenbroadcastreceived', {
                    BROADCAST_OPTION: broadcastOption
                });
            }else{
                log.log('broadcast not found');
            }
        }else if(response.commID === 0){
            log.log('notify:', response);
        }else{
            log.log('mesh: ', response.message);
            this._responseBuffer.push(response);
        }
    }

    get responseBuffer(){
        return this._responseBuffer;
    }

    getResponse(commID){
        let result = null;
        let idx = 0;
        let len = this._responseBuffer.length;
        if(len){
            result = [];
            while(idx < len){
                if(this._responseBuffer[idx].commID === commID){
                    result.push(this._responseBuffer[idx]);
                    this._responseBuffer.splice(idx,1);
                    len--;
                }else{
                    idx++;
                }
            }
        }
        return result;
    }

    clearResponseBuffer(){
        this._responseBuffer = [];
        return;
    }

    request(message = 'command', target = 'module', type = 'sync', timeout = null){
        return new Promise( resolve => {
            let result = null;
            let response = null;
            const interval = 5;
            let watchdog = null;
            let timer = timeout;
            if(timeout === null){
                if(type == 'async' || type == 'broadcast' || type == 'status'){
                    timer = 1;
                }else{
                    timer = 10000;
                } 
            }

            const commID = (++this._comm.id);
            const req =  commID + ':' + target + ':' + type + ':' + message;

            const waitPromise = new Promise( resolve => {
                const innerPromise = new Promise( resolve => {
                    if(this._comm.sock.readyState != WebSocket.OPEN){
                        log.log('request: oops readyState is not WebSocket.OPEN');
                        Promise.resolve(this.close())
                        .then( (result) => {
                            Promise.resolve(this.open(LOCATION))
                            .then( (result) => {
                                log.log('reconnect maneuver: init()', result);
                                resolve(true);
                            });
                        });
                    }else{
                        resolve(false);
                    }
                }).then( (result) => {
                    log.log('reconnect maneuver: result', result);
                    log.log('helper request:', req);
                    this._comm.sock.send(req);
                    watchdog = setInterval( () => {
                        response = this.getResponse(commID)
                        if(response && response.length){
                            response = response[0];

                            if(response){
                                resolve(response);
                            }
                            timer = timer - interval;
                            if(timer<0){
                                resolve(false);
                            }
                        }
                    }, interval);
                });
            }).then( (response) => {
                clearInterval(watchdog);
                if(response){
                    log.log('helper response:',response);
                } else {
                    log.log('helper request: response is null');
                }
                resolve(response);
            }).catch( e => {
                log.log('helper request() send rejected:', e);
            });
        }).then( response => {
            return response;
        });
    }

    close(){
        this._watchdogTerminater = true;
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
            log.log('helper: onChangeVariable: unable to connect:', this._comm.sock.url);
        }
    }

    /**
     * has been called from broadcast[AndWait] on scratch3_event
     * @param {Variable} variable 
     */
    onBroadcast(variable){
        log.log(dispatch.services.vm.runtime);
        if(this.isOpen()){
            log.log('hi from helper.onBroadcast:', variable);
            //if(variable.split(' ')[0] === 'connect'){
                this.request(variable, 'mesh');
            //}
        }else{
            log.log('helper: onBroadCast: unable to connect:', this._comm.sock.url);
        }
    }
}

module.exports = Helper;