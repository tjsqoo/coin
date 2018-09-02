// express
var express = require('express');
var app = express();
app.use(express.static('../client/'));

// request
var request = require('request');
const API_URL = 'https://api.upbit.com/';

// value
var marketList = [];

var startStatus = {
  INIT: 0,
  LOAD_MARKET_INFO:   1,
  LOAD_COMPLETE:      2
}
var fsmStatus = startStatus.INIT;
startFSM();

function startFSM() {
  console.log(fsmStatus);
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

function completeLoadInfo() {
  for (var i in marketList) {
    console.log(marketList[i]);
  }

  console.log(marketList.length);
}


























































app.listen(80, function() {
  console.log('Conneted 80 port!');
});
