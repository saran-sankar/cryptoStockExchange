var request = require("request");
var express = require("express");
var app =express();
var mysql = require('mysql');
var con = mysql.createConnection({
                                 host: "localhost",
                                 user: "user",
                                 password: "password",
                                 database: "mysql",
                                 socketPath: "/tmp/mysql.sock"
                                 });
con.connect(function(err) {
            if (err) throw err;
            var options = { method: 'POST',
            url: 'http://localhost:5000/nodes/register',
            headers:
            { 'Postman-Token': 'cb606df5-3603-4bf3-90a6-c1ae17bfef77',
            'cache-control': 'no-cache',
            'Content-Type': 'application/json' },
            body:
            { nodes:
            [ 'http://0.0.0.0:5001',
             'http://0.0.0.0:5002',
             'http://0.0.0.0:5003',
             'http://0.0.0.0:5004'] },
            json: true };
            //var sender = 'c8adbb86a08647108cfbf6478bbfe08a'
            var assets ={}
            app.get('/', function(req,res){
                    res.sendFile(__dirname + 'webapp/exchange.html');
                    })
            app.get('/stocks', function(req,res){
                    sql = "select* from stocks"
                    con.query(sql, function (err, result) {
                              if (err) throw err;
                              stocks = {}
                              //console.log(result[0].stockSymbol)
                              for(var i=0;i<result.length;i++){
                              stocks[result[i].stockSymbol]=[result[i].outstanding,result[i].changes,result[i].price,result[i].marketCap]
                              }
                              //console.log(JSON.parse(stocks))
                              res.end(JSON.stringify(stocks))
                              });
                    });
            app.get('/portfolio', function(req,res){
                    sql = "select* from stockportfolio"
                    con.query(sql, function (err, result) {
                              if (err) throw err;
                              stocks = {}
                              //console.log(result[0].stockSymbol)
                              for(var i=0;i<result.length;i++){
                              stocks[result[i].stockSymbol]=[result[i].stockSymbol,result[i].amount,result[i].purchasePrice,result[i].currentPrice,result[i].totalValue,result[i].totalGain_Loss]
                              }
                              //console.log(JSON.parse(stocks))
                              res.end(JSON.stringify(stocks))
                              });
                    });
            app.get('/register', function(req, res){
                    request(options, function (error, response, body) {
                            if (error) throw new Error(error);
                            
                            //console.log(body);
                            console.log("nodes registered")
                            var request = require("request");
                            
                            var options = { method: 'GET',
                            url: 'http://0.0.0.0:5000/nodes/resolve',
                            headers:
                            { 'Postman-Token': 'e31124ed-b423-4b81-ad81-d0519618795a',
                            'cache-control': 'no-cache' } };
                            
                            request(options, function (error, response, body) {
                                    if (error) throw new Error(error);
                                    //console.log(body);
                                    res.end("resolved");
                                    console.log("resolved")
                                    });
                            });
                    });
            app.post('/trade', function(req, res){
                     req.on('data', function(chunk) {
                            
                            var formdata = chunk.toString()
                            var stocksymbol = formdata.split("&")[0]
                            var amount = parseInt(formdata.split("&")[2])
                            var sender = formdata.split("&")[1]
                            console.log(sender)
                            
                            var options = { method: 'POST',
                            url: 'http://localhost:3600/recaddr',
                            headers:
                            { 'Postman-Token': 'a44b65cd-a189-4b1a-a78d-90e6f50662d5',
                            'cache-control': 'no-cache' },
                            body: stocksymbol };
                            
                            request(options, function (error, response, body) {
                                    if (error) throw new Error(error);
                                    var recipient = body.toString()
                                    console.log(body);
                                    
                                    //var recipient = formdata.split("&")[3]
                                    //var recipient = 'qqqqq' //^
                                    
                                    var options = { method: 'POST',
                                    url: 'http://localhost:5003/nodes/register',
                                    body: { nodes: [ 'http://0.0.0.0:5000', 'http://0.0.0.0:5001','http://0.0.0.0:5002']}, //ask three networks
                                    json: true };
                                    
                                    //get nodes request
                                    request(options, function (error, response, body) {
                                            if (error) throw new Error(error);
                                            
                                            //console.log(body);
                                            
                                            //resolve conflicts
                                            var request = require("request");
                                            
                                            var options = { method: 'GET',
                                            url: 'http://0.0.0.0:5003/nodes/resolve'}
                                            
                                            //resolve conflicts request
                                            request(options, function (error, response, body) {
                                                    if (error) throw new Error(error);
                                                    
                                                    chain = JSON.parse(body);
                                                    
                                                    //for finding the assets (for loop)
                                                    for (block in chain['chain']){
                                                    if(chain['chain'][block]['transactions'].length!=0){
                                                    
                                                    //find senderid for the block
                                                    public_key = (chain['chain'][blockd]['previous_hash'])
                                                    public_code = sender+public_key
                                                    var crypto = require('crypto');
                                                    var hash = crypto.createHash('sha256').update(public_code).digest('hex');
                                                    var i;
                                                    var hash_new = ""
                                                    for (i=0;i<32;i++){
                                                    hash_new+=hash[i]
                                                    }
                                                    hash = hash_new; //senderid for the block
                                                    //console.log(hash)
                                                    
                                                    for(transaction in chain['chain'][block]['transactions']){
                                                    //get senderid from the chain
                                                    sender_id=(chain['chain'][block]['transactions'][transaction]['sender']);
                                                    //console.log(sender_id)
                                                    
                                                    if(hash==sender_id){
                                                    keys = Object.keys(assets)
                                                    if(keys.includes(chain['chain'][block]['transactions'][transaction]['stocksymbol'])){
                                                    assets[chain['chain'][block]['transactions'][transaction]['stocksymbol']]+=chain['chain'][block]['transactions'][transaction]['amount']
                                                    }
                                                    else{
                                                    assets[chain['chain'][block]['transactions'][transaction]['stocksymbol']]=chain['chain'][block]['transactions'][transaction]['amount']
                                                    }
                                                    }
                                                    }
                                                    }
                                                    blockd = block
                                                    }
                                                    console.log("\nassets:",assets)
                                                    
                                                    
                                                    //buy stocks
                                                    var request = require("request");
                                                    previous_hash = chain['chain'][chain['chain'].length-1]['previous_hash']
                                                    //console.log(stocksymbol,amount,recipient)
                                                    
                                                    sender_id = sender+previous_hash
                                                    var crypto = require('crypto');
                                                    sender_id = crypto.createHash('sha256').update(sender_id).digest('hex'); //generate senderid from private key and prev hash
                                                    hash_new = ""
                                                    for (i=0;i<32;i++){
                                                    hash_new+=sender_id[i]
                                                    }
                                                    sender_id = hash_new;
                                                    console.log("\nsender address:",sender_id)
                                                    var options = { method: 'POST',
                                                    url: 'http://0.0.0.0:5003/transactions/new',
                                                    headers:
                                                    { 'Postman-Token': '9683322f-8488-4a84-8aad-3803a14dc478',
                                                    'cache-control': 'no-cache',
                                                    'Content-Type': 'application/json' },
                                                    body:
                                                    { sender: sender_id,
                                                    stocksymbol: stocksymbol,
                                                    recipient: recipient,
                                                    amount: amount },
                                                    json: true };
                                                    //console.log(options)
                                                    //buy stocks request
                                                    flag = -1
                                                    if(amount>=0){
                                                    flag = 0
                                                    }
                                                    if(amount<0){
                                                    //console.log(-1*amount)
                                                    if(assets[stocksymbol]>=-1*amount){flag = 0
                                                    }
                                                    else{
                                                    console.log("\nDon't own enough shares to sell")
                                                    }
                                                    }
                                                    if(flag==0){
                                                    //console.log("Connected!");
                                                    sql = "select* from stockPortfolio"
                                                    con.query(sql, function (err, result) {
                                                              if (err) throw err;
                                                              portFolio = result
                                                              //console.log(portFolio)
                                                              sql = "select* from stocks"
                                                              con.query(sql, function (err, result) {
                                                                        if (err) throw err;
                                                                        stocks = result
                                                                        //console.log(stocks)
                                                                        //console.log(assets['AAPL'])
                                                                        console.log("\n",stocksymbol,amount,recipient)
                                                                        for (var j=0;j<stocks.length;j++){
                                                                        if(stocks[j].stockSymbol==stocksymbol){
                                                                        currentPrice=parseFloat(stocks[j].price)
                                                                        cash=currentPrice*amount
                                                                        flag2=-1
                                                                        for (var i=0;i<portFolio.length;i++){
                                                                        if(portFolio[i].stockSymbol==stocksymbol){
                                                                        purchasePrice=parseFloat(portFolio[i].purchasePrice)
                                                                        qty = parseFloat(portFolio[i].amount)
                                                                        purchasePrice_new = (purchasePrice*qty+currentPrice*amount)/(qty+amount)
                                                                        console.log("\nstock price:",purchasePrice)
                                                                        sql='update stockportfolio set amount='+(qty+amount)+',purchasePrice='+purchasePrice_new+',currentPrice='+currentPrice+',totalValue='+((qty+amount)*currentPrice)+',totalGain_Loss='+((qty+amount)*currentPrice-(qty+amount)*purchasePrice_new)+' where stockSymbol="'+stocksymbol+'"'
                                                                        //console.log(sql)
                                                                        flag2=0
                                                                        }
                                                                        }
                                                                        if(flag2==-1){
                                                                        sql='insert into stockPortfolio values("'+sender+'","'+stocksymbol+'",'+amount+','+stocks[j].price+','+stocks[j].price+','+amount*stocks[j].price+',0)'
                                                                        }
                                                                        break
                                                                        }
                                                                        }
                                                                        con.query(sql, function (err, result) {
                                                                                  if (err) throw err;
                                                                                  sql='update account set cash=cash-'+(cash)+' where secretKey="'+(sender)+'"';
                                                                                  //console.log(sql)
                                                                                  con.query(sql, function (err, result) {
                                                                                            sql='select* from stockportfolio'
                                                                                            con.query(sql, function (err, result) {
                                                                                                      if (err) throw err;
                                                                                                      stocks=result;
                                                                                                      sql = 'select cash from account where secretKey="'+(sender)+'"'
                                                                                                      con.query(sql, function (err, result) {
                                                                                                                if (err) throw err;
                                                                                                                console.log("\ncash:",result[0]['cash'])
                                                                                                                cash=result[0]['cash']
                                                                                                                var totalStockValue=0
                                                                                                                for(var i=0;i<stocks.length;i++){
                                                                                                                totalStockValue+=stocks[i].totalValue;
                                                                                                                }
                                                                                                                accountValue=cash+totalStockValue;
                                                                                                                buyingPower=cash+totalStockValue/2
                                                                                                                sql='update account set accountValue='+(accountValue)+',buyingPower='+(buyingPower)+' where secretKey="'+(sender)+'"';
                                                                                                                con.query(sql, function (err, result) {
                                                                                                                          res.end("finished")
                                                                                                                          if (err) throw err;
                                                                                                                          })
                                                                                                                })
                                                                                                      })
                                                                                            if (err) throw err;
                                                                                            })
                                                                                  })
                                                                        request(options, function (error, response, body) {
                                                                                if (error) throw new Error(error);
                                                                                console.log("\n",body['message']);
                                                                                });
                                                                        });
                                                              });
                                                    }
                                                    });
                                            });
                                    });
                            });
                     });
            app.listen(3500);
            });
