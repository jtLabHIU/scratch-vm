/**
 * @file Synchronized WebSocket client for jtWebSocketRepeater
 *      jtWebSockRepeater.js
 * @module ./jtWebSockClientPromise
 * @version 1.01.191012a
 * @author TANAHASHI, Jiro <jt@do-johodai.ac.jp>
 * @license MIT (see 'LICENSE' file)
 * @copyright (C) 2019 jtLab, Hokkaido Information University
 */
//const WebSocket = require('ws');

/**
 * WARNING
 * 
 * THIS MODULE WAS DEPRECATED
 * MOVED TO scratch-vm/src/io/helper
 */

class jtWebSockClientPromise{
    constructor(args){
        this._hostComm = 'localhost';
        if(args.hostComm){
            this._hostComm = args.hostComm;
        }

        this._portComm = 8888;
        if(args.portComm){
            this._portComm = args.portComm;
        }

        this._apiComm = 'api';
        if(args.apiComm){
            this._apiComm = args.apiComm;
        }

        this._commID = 0;
        this._sock = null;
        this._watchdogTerminater = false;

        this._responseBuffer = [];
    }

    init(){
        return new Promise( (resolve) => {
            let result = null;
            try{
                this._sock = new WebSocket('ws://' + this._hostComm + ':' + this._portComm + '/' + this._apiComm);
                this._sock.addEventListener('open', () => {
                    this._sock.addEventListener('message', (sock) => {
                        this.log('WSC onMessage:', sock.data);
                        this._responseBuffer.push(JSON.parse(sock.data));
                    });
                    this._sock.addEventListener('close', () => {
                        this.log('client close');
                    });
                    this._sock.addEventListener('error', (e) => {
                        this.log('client error:', e);
                    });
                });
                Promise.resolve(this.waitReadyState())
                .then( () => {
                    resolve(true);
                });
            }catch(e){
                this.log('WSC.init: catch exeption:', e);
                resolve(false);
            }
        });
    }

    waitReadyState(){
        return new Promise( resolve => {
            let timer = 5000;
            const interval = 10;
            let watchdog = null;
            let result = new Promise( resolve => {
                watchdog = setInterval( () => {
                    if(this._sock.readyState === WebSocket.OPEN){
                        resolve(true);
                    }
                    timer = timer - interval;
                    if(timer<0){
                        resolve(false);
                    }
                }, interval);
            }).then( (result) => {
                clearInterval(watchdog);
                this.log('WSC WebSock connection:' + this._sock.url);
                resolve(result);
            });
        });
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

            const commID = (++this._commID);
            const req =  commID + ':' + target + ':' + type + ':' + message;

            const waitPromise = new Promise( resolve => {
                const innerPromise = new Promise( resolve => {
                    if(this._sock.readyState != WebSocket.OPEN){
                        this.log('request: oops readyState is not WebSocket.OPEN');
                        Promise.resolve(this.close())
                        .then( (result) => {
                            Promise.resolve(this.init())
                            .then( (result) => {
                                this.log('reconnect maneuver: init()', result);
                                resolve(true);
                            });
                        });
                    }else{
                        resolve(false);
                    }
                }).then( (result) => {
                    this.log('reconnect maneuver: result', result);
                    this.log('WSC request:', req);
                    this._sock.send(req);
                    watchdog = setInterval( () => {
                        response = this.getResponse(commID)
                        if(response && response.length){
                            this.log('WSC request response.length:', response.length, commID);
                            response = response[0];

                            if(response){
                                resolve(response);
                            }
                            timer = timer - interval;
                            if(timer<0){
                                this.log('WSC request response timeout:', commID);
                                resolve(false);
                            }
                        }
                    }, interval);
                });
            }).then( (response) => {
                clearInterval(watchdog);
                if(response){
                    this.log('WSC response:',response);
                } else {
                    this.log('WSC request: response is null');
                }
                resolve(response);
            }).catch( e => {
                this.log('WSC request() send rejected:', e);
            });
        }).then( response => {
            return response;
        });
    }

    close(){
        this._watchdogTerminater = true;
        this._sock.close();
    }

    log(msg, ...msgs){
        if(msgs.length){
            console.log(msg, ...msgs);
        }else{
            console.log(msg);
        }
    }
}

module.exports = jtWebSockClientPromise;