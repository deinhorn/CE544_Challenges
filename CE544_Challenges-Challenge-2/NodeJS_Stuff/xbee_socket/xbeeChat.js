var SerialPort = require("serialport");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var portName = process.argv[2],
portConfig = {
  baudRate: 9600,
  parser: SerialPort.parsers.readline("\n")
};
var sp;
sp = new SerialPort.SerialPort(portName, portConfig);

app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
});
io.on('connection', function(socket){
  //console.log('a user connected');
  socket.on('disconnect', function(){
  });
  socket.on("1:",function(msg){
    //console.log("hello");
    sendString = "1:" + msg+"\n";
    console.log(sendString);
    sp.write(sendString);
    sp.flush();
  });
    socket.on("2:",function(msg){
    //console.log("hello");
    sendString = "2:" + msg+"\n";
    console.log(sendString);
    sp.write(sendString);
    sp.flush();
  });
      socket.on("3:",function(msg){
    //console.log("hello");
    sendString = "3:" + msg+"\n";
    console.log(sendString);
    sp.write(sendString);
    sp.flush();
  });
  socket.on("4:",function(msg){
    sendString = "4:" + msg+"\n";
    console.log(sendString);
    sp.write(sendString);
    sp.flush();
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

sp.on("open", function () {
  console.log('open');
});
