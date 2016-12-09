var SerialPort = require("serialport");
var app = require('express')();
//var xbee_api = require('xbee-api');
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*
var C = xbee_api.constants;
var XBeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});
*/
var ArduinoPort = process.argv[2];
//var XbeePort = process.argv[3];
var sampleDelay = 3000;

/*
//Note that with the XBeeAPI parser, the serialport's "data" event will not fire when messages are received!
XbeeConfig = {
	baudRate: 9600,
  parser: XBeeAPI.rawParser()
};
*/
ArduinoConfig = {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
  //parser: SerialPort.parsers.readline("\n")
};
/*
var XbeeSP;
XbeeSP = new SerialPort.SerialPort(XbeePort, XbeeConfig);
*/

var ArduinoSP;
ArduinoSP = new SerialPort.SerialPort(ArduinoPort, ArduinoConfig);

app.get('/', function(req, res){
  res.sendFile(__dirname +'/keyPressTest.html');
});

/*
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
  XbeeSP.write(XBeeAPI.buildFrame(RSSIRequestPacket));
}
*/
http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('control', function(msg){
    //io.emit('control',msg);
    ArduinoSP.write(msg);
    console.log(msg);
  });
});

/*
XbeeSP.on("open", function () {
  console.log('Xbee Port Open');
  requestRSSI();
  setInterval(requestRSSI, sampleDelay);
});
*/
ArduinoSP.on("open", function(){
  console.log('Arduino Port Open');
    ArduinoSP.on('data', function(data) {
    //console.log('data received: ' + data);
    io.emit('control', data);
  });
});
/*
XBeeAPI.on("frame_object", function(frame) {
  if (frame.type == 144){
    console.log("Beacon ID: " + frame.data[1] + ", RSSI: " + (frame.data[0]));
  }
  /*
  //THIS IS WHERE LOCALIZATION CODE GOES

  //SEND DATA TO HTML SCRIPT
  var posInfo = [hallwayNum,hallLen];
  io.emit('posUpdated',posInfo);
});
*/
