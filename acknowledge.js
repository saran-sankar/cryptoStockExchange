var stocklist = {
    "NKE":'d59a72c9e028d6d9c8be35eb491f03fe',
    "SBUX":'7ba0b7e34c820cca4eb3e9a971e3f060',
    "WMT":'afc60c9d263be645e327aee7c62441ca',
    "AAPL":'cb716131cd43471fbe2dded005588750',
    "KO":'765566298b6a9e28624d4d1fd208fc07',
    "NFLX":'c97e270dcf666c863fe0544ab71d93bb',
    "DIS":'f1ebf9dceb64d01814e356504efc1bd5',
    "TSLA":'362f2cdffee32adc7ba17204ea559ec8',
    "FB":'2a73c51087caa0c370a50fc59f067557',
    "MCD":'8544e6c08f4b9b48a67e518d20506663',
    "PG":'5b9c99d4125a74d2b69a329302eee3e8',
    "WMT":'96f0950d520fc35ccbee51b45b7f18c3',
}
var assets ={}
k=[]
//eg: node acknowledge.js AAPL ef716131cd43471fbe2dded005588789
process.argv.forEach((val, index) => {
                     //console.log(`${index}: ${val}`);
                     k.push(`${val}`)
                     });
sender = k[k.length-1]
stocksymbol = k[k.length-2]
var reciever = stocklist[stocksymbol]
//get nodes
var request = require("request");
var chain

var options = { method: 'POST',
url: 'http://localhost:5004/nodes/register',
body: { nodes: [ 'http://0.0.0.0:5000', 'http://0.0.0.0:5001','http://0.0.0.0:5002']}, //ask three networks
    json: true };

//get nodes request
request(options, function (error, response, body) {
        if (error) throw new Error(error);
        
        //console.log(body);
        
        //resolve conflicts
        var request = require("request");
        
        var options = { method: 'GET',
        url: 'http://0.0.0.0:5004/nodes/resolve'}
        
        //resolve conflicts request
        request(options, function (error, response, body) {
                if (error) throw new Error(error);
                
                chain = JSON.parse(body);
                
                previous_hash = chain['chain'][chain['chain'].length-1]['previous_hash']
                //console.log(previous_hash)
                
                receiver_id = reciever+previous_hash
                var crypto = require('crypto');
                receiver_id = crypto.createHash('sha256').update(receiver_id).digest('hex'); //generate receiverid from private key and prev hash
                hash_new = ""
                for (i=0;i<32;i++){
                hash_new+=receiver_id[i]
                }
                receiver_id = hash_new;
                
                console.log(receiver_id)
                var request = require("request");
                
                var options = { method: 'POST',
                url: 'http://localhost:5004/transactions/ack/new',
                headers:
                { 'Postman-Token': '0e2fd5c1-5b9d-43b2-b416-23cbaeadbd7d',
                'cache-control': 'no-cache',
                'Content-Type': 'application/json' },
                body:
                { sender: sender,
                recipient: receiver_id,
                stocksymbol: stocksymbol },
                json: true };
                
                request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        
                        console.log(body);
                        });

                });
        });


