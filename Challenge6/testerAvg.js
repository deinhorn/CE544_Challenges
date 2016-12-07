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
var hallOneLen = 30;
var hallTwoLen = 100;
var hallThreeLen = 30;
var hallFourLen = 100;
var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var portName = process.argv[2];

app.get('/', function(req, res){
  res.sendFile(__dirname +'/JS_loop_live.html');
});

var sampleDelay = 3000;

//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
portConfig = {
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};

var sp;
sp = new SerialPort.SerialPort(portName, portConfig);


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
});

http.listen(3000, function(){
  console.log('listening on *:3000');
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
        //loggerThree[iThree] = (frame.data[0]*.2452) + 52.605;
        //iThree++;
        avgThreeFull = 1;
        avgThree = (frame.data[0]*3.0439)-140;
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
        avgFour = (frame.data[0]*2.6557)-100;
        if(avgFour < 0){
          avgFour =0;
        }
      }
    }
    else{
      console.log("node number not recognized: " + node);
    }
    /*
    if(iOne>=arrLen){
      var sumOne = 0;
      for(var l = 0;l<arrLen;l++){
        sumOne = sumOne + loggerOne[l];
      }
      avgOne = math.round(sumOne/arrLen);
      avgOneFull = 1;
      iOne = 0;
    }
    if(iTwo >=arrLen){
      var sumTwo = 0;
      for(var l = 0;l<arrLen;l++){
        sumTwo = sumTwo + loggerTwo[l];        
      }
      avgTwo = math.round(sumTwo/arrLen);
      avgTwoFull = 1;
      iTwo = 0;
    }
    if(iThree >= arrLen){
      var sumThree = 0;
      for(var l = 0;l<arrLen;l++){
        sumThree = sumThree + loggerThree[l];
      }
      avgThree = math.round(sumThree/arrLen);
      avgThreeFull = 1;
      iThree = 0;
    }
    if(iFour >=arrLen){ 
      var sumFour = 0;
      for(var l = 0;l<arrLen;l++){
        sumFour = sumFour + loggerFour[l];
      }
      avgFour = math.round(sumFour/arrLen);
      avgFourFull = 1;
      iFour = 0;
    }
*/
    if(avgOneFull == 1 && avgTwoFull == 1 && avgThreeFull == 1 && avgFourFull == 1){
      //avgOneFull = 0;
      //avgTwoFull = 0;
      //avgThreeFull = 0;
      //avgFourFull = 0;  
      var avgs = [avgOne,avgTwo,avgThree,avgFour];
      var avgIndex = [0,0,0,0];
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
          /*
          if(l == 0){
            //console.log("not filling min" + +min+1);
            if(min == 1){
              MinFirst = 2;
            }
            else{
              MinFirst = min+1;
            }
          }
          else if (l == 1){
            if(+min+1 == MinFirst){
              MinSecond = 1;
            }
            else{
              MinSecond = +min+1;
            }
          }
          */
        }
        //console.log(min);
        if(Number(avgIndex[0]) == Number(min)+1){
          //console.log("correctly inside func");
          avgIndex[l] = 1;
        }
        else if(Number(avgIndex[1]) == Number(min)+1){
          avgIndex[l] = 2;
        }
        else if(Number(avgIndex[2]) == Number(min)+1){
          avgIndex[l] = 3;
        }
        else{
          avgIndex[l] = Number(min)+1;
        }
      }
      /*
      if(MinFirst == -1){
        //console.log("not filling min1");
        MinFirst = 1;
      }
      if(MinSecond == -1){
        if(MinFirst == 2){
          MinFirst = 1;
        }
        else{
          MinSecond = 2;
        }

      }
      */
      console.log(avgs[0] + " " + avgs[1] + " " + avgs[2] + " " + avgs[3]);
      console.log(avgIndex[0] + " " + avgIndex[1] + " " + avgIndex[2] + " " + avgIndex[3]); 
      if(avgIndex[0] == 1 && avgIndex[1] == 2 && avgIndex[2] == 4){
        var compLong = hallFourLen-avgs[2];
        var compShort = hallOneLen -avgs[1];
        if(compLong > compShort){
          hallwayNum = 4;
          var dist = hallFourLen - avgFour;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgOne)/2);
          if(hallLen > hallFourLen){
            hallLen = hallFourLen;
          } 
        }
        else{
          hallwayNum = 1;
          var dist = hallOneLen - avgTwo;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgOne)/2);
          if(hallLen > hallOneLen){
            hallLen = hallOneLen;
          } 
        }
      }
      else if(avgIndex[0] == 2 && avgIndex[1] == 1 && avgIndex[2] == 3){
        var compLong = hallTwoLen-avgs[2];
        var compShort = hallOneLen -avgs[1];
        if(compLong > compShort){
          hallwayNum = 2;
          var dist = hallTwoLen - avgThree;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgTwo)/2);
          if(hallLen > hallTwoLen){
            hallLen = hallTwoLen;
          } 
        }
        else{
          hallwayNum = 1;
          var dist = hallOneLen - avgTwo;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgOne)/2);
          if(hallLen > hallOneLen){
            hallLen = hallOneLen;
          } 
        }
      }
      else if(avgIndex[0] == 3 && avgIndex[1] == 4 && avgIndex[2] == 2){
        var compLong = hallTwoLen-avgs[2];
        var compShort = hallThreeLen -avgs[1];
        if(compLong > compShort){
          hallwayNum = 3;
          var dist = hallThreeLen - avgFour;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgThree)/2);
          if(hallLen > hallThreeLen){
            hallLen = hallThreeLen;
          } 
        }
        else{
          hallwayNum = 2;
          var dist = hallTwoLen - avgTwo;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgThree)/2);
          if(hallLen > hallTwoLen){
            hallLen = hallTwoLen;
          } 
        }
      }
      else if(avgIndex[0] == 4 && avgIndex[1] == 3 && avgIndex[2] == 1){
        var compLong = hallFourLen-avgs[2];
        var compShort = hallThreeLen -avgs[1];
        if(compLong > compShort){
          hallwayNum = 4;
          var dist = hallFourLen - avgOne;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgFour)/2);
          if(hallLen > hallFourLen){
            hallLen = hallFourLen;
          } 
        }
        else{
          hallwayNum = 3;
          var dist = hallThreeLen - avgThree;
          if(dist < 0){
            dist = 0;
          }
          hallLen = math.round((dist + avgFour)/2);
          if(hallLen > hallThreeLen){
            hallLen = hallThreeLen;
          } 
        }
      } 
      else if(avgIndex[1] == 1 && avgIndex[2]  == 2 || avgIndex[1] == 2 && avgIndex[2] == 1){
        hallwayNum = 1;
        var dist = hallOneLen - avgTwo;
        if(dist < 0){
          dist = 0;
        }
        hallLen = math.round((dist + avgOne)/2);
        if(hallLen > hallOneLen){
          hallLen = hallOneLen;
        }
      }
      else if (avgIndex[1] == 1 && avgIndex[2] == 4 || avgIndex[1] == 4 && avgIndex[2]  == 1){
        hallwayNum = 4;
        var dist = hallOneLen - avgOne;
        if(dist < 0){
          dist = 0;
        }
        hallLen = math.round((dist + avgFour)/2); 
        if(hallLen > hallOneLen){
          hallLen = hallOneLen;
        }
      }
      else if (avgIndex[1] == 2 && avgIndex[2] == 3 || avgIndex[1] == 3 && avgIndex[2] == 2){
        hallwayNum = 2;
        var dist = hallOneLen - avgThree;
        if(dist < 0){
          dist = 0;
        }
        hallLen = math.round((dist + avgTwo)/2); 
        if(hallLen > hallOneLen){
          hallLen = hallOneLen;
        }

      }
      else if (avgIndex[1] == 3 && avgIndex[2] == 4 || avgIndex[1] == 4 && avgIndex[2] == 3){
        hallwayNum = 3;
        var dist = hallOneLen - avgFour;
        if(dist < 0){
          dist = 0;
        }
        hallLen = math.round((dist + avgThree)/2); 
        if(hallLen > hallOneLen){
          hallLen = hallOneLen;
        }
      }
      else{
        console.log("impossible location identified");
      }
      console.log("Hallway: " + hallwayNum);
      console.log("Dist: " + hallLen);
      var posInfo = [hallwayNum,hallLen];
      io.emit('posUpdated',posInfo);
    }
  //  var dist = math.pow(10,(-(rssi/20)-math.log((2.4*10^9),10)-(32.44/20)))*1000;
    //var dist = math.pow(10,(((10+rssi)-20*math.log(2.4*1000000000,10)-20*math.log((4*3.141596/(300000000)),10))/20))
    console.log(node + ": "+ frame.data[0]);
  }
});
