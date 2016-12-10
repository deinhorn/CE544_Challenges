var SerialPort = require("serialport");
var app = require('express')();
var xbee_api = require('xbee-api');
var math = require('mathjs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var arrLen = 1;
var loggerOne = [0];
var loggerTwo = [0];
var loggerThree = [0];
var loggerFour = [0];
var iOne = 0;
var iTwo = 0;
var iThree = 0;
var iFour = 0;
var lastAvgOne = 0;
var lastAvgTwo = 0;
var lastAvgThree = 0;
var lastAvgFour = 0;
var avgOne = 0;
var avgTwo = 0;
var avgThree = 0;
var avgFour = 0;
var avgOneFull = 0;
var avgTwoFull = 0;
var avgThreeFull = 0;
var avgFourFull = 0;
var hallwayNum  = 0;
var hallLen = 0;
var turning = 0;
var hallOneLen = 30;
var hallTwoLen = 70;
var hallThreeLen = 30;
var hallFourLen = 70;
var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];
var ArduinoPort = process.argv[3];

app.get('/', function(req, res){
  res.sendFile(__dirname +'/JS_loop_live.html');
});

var sampleDelay = 3000;

//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};
ArduinoConfig = {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
  //parser: SerialPort.parsers.readline("\n")
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);
var ArduinoSP;
ArduinoSP = new SerialPort.SerialPort(ArduinoPort, ArduinoConfig);

//Create a packet to be sent to all other XBEE units on the PAN.
// The value of 'data' is meaningless, for now.
var RSSIRequestPacket = {
  type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
  destination64: "000000000000ffff",
  broadcastRadius: 0x01,
  options: 0x00,
  data: "test"
}

var requestRSSI = function(){
  sp.write(XBeeAPI.buildFrame(RSSIRequestPacket));
}

sp.on("open", function () {
  //console.log('open');
  requestRSSI();
  setInterval(requestRSSI, sampleDelay);
});

io.on('connection', function(socket){
  //io.emit('open');
  console.log('a user connected');
  socket.on('disconnect', function(){
  });
   socket.on('control', function(msg){
    //io.emit('control',msg);
    ArduinoSP.write(msg);
    console.log(msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

ArduinoSP.on("open", function(){
  console.log('Arduino Port Open');
    ArduinoSP.on('data', function(data) {
    //console.log('data received: ' + data);
    io.emit('control', data);
  });
});

XBeeAPI.on("frame_object", function(frame) {
  if (frame.type == 144){
    var node = frame.data[1];
    if(node == 1){
      if(frame.data[0] !=255){
        //loggerOne[iOne] = (frame.data[0]*.2016)+56.002;
        avgOne = (frame.data[0]*2.8636)-135;
        if(avgOne < 0){
          avgOne =  0;
        }
        avgOneFull = 1;
        //iOne++;

      }
    }
    else if (node == 2){
      if(iTwo<arrLen&& frame.data[0] !=255){
        //loggerTwo[iTwo] = (frame.data[0]*.2402)+55.048;
        avgTwoFull = 1;
        avgTwo = (frame.data[0]*3.1603)-150;
        if(avgTwo < 0){
          avgTwo =0;
        }
        //iTwo++;
      }
    }
    else if (node == 3){
      if(iThree<arrLen&& frame.data[0] !=255){
        //loggerThree[iThree] = (frame.data[0]*.24) + 56;
        //iThree++;
        avgThreeFull = 1;
        avgThree = (frame.data[0]*3.3)-140;
        if(avgThree < 0){
          avgThree=0;
        }
      }
    }
    else if (node == 4){
      if(iFour<arrLen&& frame.data[0] !=255){
        //loggerFour[iFour] = (frame.data[0]*.2465)+55;
        //iFour++;
        avgFourFull = 1;
        avgFour = (frame.data[0]*3)-130;
        if(avgFour < 0){
          avgFour =0;
        }
      }
    }
    else{
      console.log("node number not recognized: " + node);
    }
    if(avgOneFull == 1 && avgTwoFull == 1 && avgThreeFull == 1 && avgFourFull == 1){
      //avgOneFull = 0;
      //avgTwoFull = 0;
      //avgThreeFull = 0;
      //avgFourFull = 0;  
      var avgs = [avgOne,avgTwo,avgThree,avgFour];
      var avgIndex = [1,2,3,4];
      console.log(avgs[0] + " " + avgs[1] + " " + avgs[2] + " " + avgs[3]);
      var MinFirst = -1;
      var MinSecond = -1;
      var min = 0;
      for(var l = 0;l<4;l++){
        var min = l;
        for(var j = l+1;j<4; j++){
          if(avgs[j] < avgs[min]){
            min = j;
          }
        }
        if(min != l){
          var tempi = avgs[min];
          avgs[min] = avgs[l];
          avgs[l] = tempi;
	  var tempIndex = avgIndex[min];
          avgIndex[min] = avgIndex[l];
          avgIndex[l] =tempIndex;

        }

      }

MinFirst = avgIndex[0];
MinSecond = avgIndex[1];
      console.log(avgs[0] + " " + avgs[1] + " " + avgs[2] + " " + avgs[3]);
      console.log(avgIndex[0] + " " + avgIndex[1] + " " + avgIndex[2] + " " + avgIndex[3]);
      console.log(MinFirst + " " + MinSecond); 
      if((avgIndex[0] == 1 && avgIndex[1] == 2 || avgIndex[0] == 2 && avgIndex[1] == 1)&& avgs[0] < 25 && avgs[1] < 25){
          hallwayNum = 1;
          if(avgs[0] < 3){
            if(avgIndex[0] == 1){
              hallLen = 0;
              turning = 1;
            }
            else{
              hallLen = 30;
              turning = 1;
            }
          }
          else{
            hallLen = 15;
            turning = 0;
          }
      }
      else if((avgIndex[0] == 3 && avgIndex[1] == 4 || avgIndex[0] == 4 && avgIndex[1] == 3)&& avgs[0] < 25 && avgs[1] < 25){
          hallwayNum = 3;
          if(avgs[0] < 3){
            if(avgIndex[0] == 3){
              hallLen = 0;
              turning = 1;
            }
            else{
              hallLen = 30;
              turning = 1;
            }
          }
          else{
            hallLen = 15;
            turning - 0;
          }
      }
      else if(avgIndex[0] == 4 || avgIndex[0] == 1){
          hallwayNum = 4;
          if(avgs[0] < 5){
            if(avgIndex[0] == 4){
              hallLen = 0;
              turning = 1;
            }
            else{
              hallLen = 100;
              turning=1;
            }
          }
          else{
            hallLen = 30;
            turning = 0;
          }
      }
      else if(avgIndex[0] == 2 || avgIndex[0] == 3){
          hallwayNum = 2;
          if(avgs[0] < 5){
            if(avgIndex[0] == 2){
              hallLen = 0;
              turning = 1;
            }
            else{
              hallLen = 100;
              turning = 1;
            }
          }
          else{
            hallLen = 30;
            turning = 0;
          }
      }
      else{
        console.log("impossible location identified");
      }
      console.log("Hallway: " + hallwayNum);
      console.log("Dist: " + hallLen);
      var posInfo = [hallwayNum,hallLen];
      io.emit('posUpdated',posInfo);
      io.emit('turning',turning);
      if(turning == 1){
        console.log("TURN NOW");
      }
    }
  //  var dist = math.pow(10,(-(rssi/20)-math.log((2.4*10^9),10)-(32.44/20)))*1000;
    //var dist = math.pow(10,(((10+rssi)-20*math.log(2.4*1000000000,10)-20*math.log((4*3.141596/(300000000)),10))/20))
    console.log(node + ": "+ frame.data[0]);
  }
});
