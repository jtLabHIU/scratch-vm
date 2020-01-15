/**
 * @file IO Device to jtS3Helper for Scratch3
 *      helper.js
 * @module scratch-vm/src/io/helper
 * @version 0.01.200104a
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
        return new Promise( resolve => {
            const status = this._comm.sock && this._comm.sock.readyState == WebSocket.OPEN;
            if(status){
                
            }
        }).then( result => {
            return result;
        });
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
            log.log(`helper attempt to connect ws://${this._comm.host}:${this._comm.port}/${this._comm.endpoint}`);
            this._comm.sock = new WebSocket(`ws://${this._comm.host}:${this._comm.port}/${this._comm.endpoint}`);
            this._comm.sock.addEventListener('open', () => { this._onOpen() });
            this._comm.sock.addEventListener('close', () => { this._onClose() });
            this._comm.sock.addEventListener('error', (e) => { this._onError(e) });
            this._comm.sock.addEventListener('message', (sock) => { this._onMessage(sock) });
        } catch(exception) {
            log.error('unable to open WebSocket for helper.', exception);
            this.close();
        }
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

    request(message = 'command', type = 'sync', timeout = 10000){
        return new Promise( resolve => {
            let result = null;
            let response = null;
            let timer = timeout;
            const interval = 5;
            let watchdog = null;

            const commID = (++this._comm.id);
            const req =  commID + ':' + type + ':' + message;

            const waitPromise = new Promise( resolve => {
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