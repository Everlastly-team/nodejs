'use strict';

let crypto = require("crypto");
let request = require("request");
let querystring = require('querystring');
let url = require("url");


const rootUrl = 'https://everlastly.com/api/v1/';

let Everlastly = function(publicKey, privateKey){
    if (!(this instanceof Everlastly)) {
        return new Everlastly(publicKey, privateKey);
    }
    if (publicKey && privateKey) {
        this.publicKey  = publicKey;
        this.privateKey = privateKey;
    }    
}

Everlastly.prototype._sendRequest = function(command, payload, callback){
    //console.log(payload);
    let queryString = querystring.stringify(payload);
    let opts = {
        "url": rootUrl+command,
        "method": "POST",
        "headers": {
            "User-Agent": "NodeJS-Everlastly-Wrapper",
            "Content-Type": "application/x-www-form-urlencoded",
            "pub-key": this.publicKey,
            "sign": crypto.createHmac("sha512", this.privateKey).update(queryString).digest("hex")
        },
        "body": queryString
    };
    request(opts, function (error, response, body) {

      if (!error && response.statusCode == 200) {
        try {
          response=JSON.parse(body);
          callback({"success": true, "response": response  });
          return;
        } catch(e) {
          callback({"success": false, "error_message": "Strange answer from server" });
          return;
        }        
      }
      else {
          callback( {"success": false, "error_message": error+ " statusCode: "+response.statusCode  } );
          return;
      }
    })

};

Everlastly.prototype.getReceipts = function(receiptIDs, callback, params){
      let payload = {'uuids':JSON.stringify(receiptIDs)};
      params = params || {};
      if(!params["no_nonce"]) {
        payload["nonce"] = new Date().getTime();
      };
      let processGetReceiptsResponse = function(result){
        if(!result["success"]){
          callback(result)
          return;
        }
        callback( {"success": true, "receipts": result["response"]["receipts"]  });
        return;
      };
      this._sendRequest('get_receipts', payload, processGetReceiptsResponse);
    };

Everlastly.prototype.anchor = function(dochash, callback, params){
      let payload = {'hash':dochash}
      params = params || {};
      if(!params["no_nonce"]) {
        payload["nonce"] = new Date().getTime();
      } else {
        payload["no_nonce"] = 'True';
      }
      if(params["metadata"]) {
        payload["metadata"] = JSON.stringify(params["metadata"])
      }
      if(params["no_salt"]) {
        payload["no_salt"] = 'True';
      }
      if(params["save_dochash_in_receipt"]) {
        payload["save_dochash_in_receipt"] = 'True';
      }

      let processAnchorResponse = function(result){
        if(!result['success']) {
          callback(result)
          return;
        } else {
          var ret = {};
          if(result['response']['status']=='Accepted') {
            ret['success']=true;
            ret['receiptID']=result['response']['receiptID'];
            callback(ret);
            return;
          } else {
            ret['success']=false;
            ret['error_message']=result['response']['error'];
            callback(ret);
            return;
          }
        } 
      }  
      this._sendRequest('anchor', payload, processAnchorResponse)
    };

module.exports = Everlastly;
