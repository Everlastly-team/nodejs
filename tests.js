let e = require('everlastly');
Everlastly = e('-', '-')

anchor_tests = [
 { 'arguments': {'hash': '1'.repeat(64), 'kwargs': {} }, 'success': true, 'error': null},
 { 'arguments': {'hash': '1'.repeat(64), 'kwargs': {'metadata':{"隨機詞":'👌'}} }, 'success': true, 'error': null},
 { 'arguments': {'hash': '1'.repeat(64), 'kwargs': {'metadata':{"隨機詞":'👌'}, 'save_dochash_in_receipt':true} }, 'success':true, 'error': null},
 { 'arguments': {'hash': '1'.repeat(64), 'kwargs': {'metadata':{"隨機詞":'👌'}, 'save_dochash_in_receipt':true, 'no_salt': true} }, 'success':true, 'error': null},
 { 'arguments': {'hash': '1'.repeat(64), 'kwargs': {'metadata':{"隨機詞":'👌'}, 'save_dochash_in_receipt':true, 'no_salt': true, 'no_nonce': true} }, 'success':true, 'error': null},
 { 'arguments': {'hash': '1'.repeat(63), 'kwargs': {} }, 'success': false, 'error': 'Wrong length of `hash` parameter\n'},
]

function process_anchor_response(test_num, test, response) {
 if(response['success']!=test['success']){
   console.log("Error! Got " + JSON.stringify(response) + " for test "  + JSON.stringify(test));
 } else {
   if(response['error_message']!=test['error']) {
     console.log("We expected another error! Got " + JSON.stringify(response) + " for test "  + JSON.stringify(test));
   } else {
     console.log("👌OK\tAnchor test "+test_num+" done correctly");
     if(response['success']) {
       check_anchoring(response);
     }
   }
 }
 
}

function check_receipt(receipt) {
  if(receipt['success'] && receipt['receipts'][0]['status']=='Success') {
    console.log("👌OK Anchor " +receipt['receipts'][0]['receiptID']);
  }
  else {
    console.log("Error " +receipt['receipts'][0]['receiptID']);
  }
}

function check_anchoring(receipt) {
  gR = Everlastly.getReceipts.bind(Everlastly, [receipt["receiptID"]], check_receipt);
  setTimeout(gR, 3000);
}

function run_anchor_tests() {
  for(counter in anchor_tests) {
    test=anchor_tests[counter];
    try {
      dochash = test['arguments']['hash']
      params = test['arguments']['params']
      success = test['success']
      error = test['error']
    }    catch (err) {
      throw new Error("Bad formed test %s"%test)
    }
    callback = process_anchor_response.bind(null, counter, test);
    //res = Everlastly.anchor(dochash, callback, params);
    setTimeout( (function(dochash, callback, params){return function(){Everlastly.anchor(dochash, callback, params);}} )(dochash, callback, params), counter*105 )
  }
}


run_anchor_tests()
