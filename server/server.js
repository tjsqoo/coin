// express
var express = require('express');
var app = express();
app.use(express.static('../client/'));

// request
var request = require('request');
const API_URL = 'https://api.upbit.com/';
const RAISE_RATE = 3.0;

// value
var marketList = [];

var startStatus = {
  INIT:               0,
  LOAD_MARKET_INFO:   1,
  LOAD_COMPLETE:      2
}

var fsmStatus = startStatus.INIT;
startFSM();

function startFSM() {
  // console.log(fsmStatus);
  switch (fsmStatus++) {
    case startStatus.INIT: {
      initAllData();
    }
    break;
    case startStatus.LOAD_MARKET_INFO: {
      loadMarketInfo();
    }
    break;
    case startStatus.LOAD_COMPLETE: {
      completeLoadInfo();
      fsmStatus = startStatus.INIT;
    }
    break;
  }
}

function initAllData() {
  marketList = [];

  startFSM();
}

function loadMarketInfo() {
  var options = {
    method: 'GET',
    url: API_URL + 'v1/market/all'
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    var data = JSON.parse(body);
    for (var i in data) {
      if (data[i].market.includes('KRW')) {
        marketList.push(data[i]);
      }
    }
    startFSM();
  });
}

var currentMarket = 0;

function completeLoadInfo() {

  loadLogofMonthRaiseCount(marketList[currentMarket].market, null);
  // var options = { 
  //   method: 'GET',
  //   url: API_URL + 'v1/candles/minutes/1',
  //   qs: { 
  //     market: marketList[0].market,
  //     count: 200
  //   } 
  // };

  // request(options, (error, response, body) => {
  //   if (error) throw new Error(error);

  //   var data = JSON.parse(body);
    
  //   for (var i in data) {
  //     var open = data[i].opening_price;
  //     var finish = data[i].trade_price;

  //     if (finish - open > 0) {
  //       var result = (finish - open) / open * 100;
        
  //       if (result > 1) {
  //         console.log(result);
  //         console.log(data[i].candle_date_time_kst);
  //       }
  //     }
  //   }
  //   //console.log(data);
    
  //   console.log(time);
  // });

  // var options = { 
  //   method: 'GET',
  //   url: API_URL + 'v1/ticker',
  //   qs: { 
  //     markets: marketList[0].market
  //   } 
  // };

  // request(options, function (error, response, body) {
  //   if (error) throw new Error(error);

  //   var data = JSON.parse(body);
  //   console.log(data);
  // });

}

function loadLogofMonthRaiseCount(market, time) {
  if (time == null) {
    console.log('===========' + market + '===========');
  }
  var options = { 
    method: 'GET',
    url: API_URL + 'v1/candles/minutes/1',
    qs: { 
      market: market,
      to: time,
      count: 200
    } 
  };

  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    var data = JSON.parse(body);
    for (var i in data) {
      var open = data[i].opening_price;
      var finish = data[i].trade_price;

      if (finish - open > 0) {
        var result = (finish - open) / open * 100;
        if (result > RAISE_RATE) {
          console.log(data[i].candle_date_time_kst);
        }
      }
    }
    setTimeout(() => {
      var nextTime = new Date(data[data.length - 1].candle_date_time_kst);

      if (currentMarket < marketList.length - 1) {
        var currentTime = new Date();
        currentTime.setMonth(currentTime.getMonth() - 1);
        if (currentTime.getTime() < nextTime.getTime()) {
          loadLogofMonthRaiseCount(market, nextTime.toISOString());
        } else {
          loadLogofMonthRaiseCount(marketList[++currentMarket].market, null);
        }
      }
    }, 100);
  });
}


























































app.listen(80, function() {
  console.log('Conneted 80 port!\n');
});
