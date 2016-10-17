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

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
});
io.on('connection', function(socket){
  //console.log('a user connected');
  console.log('open');
  sp.write("p1\n");
  sp.flush();
  sleep(10);
  sp.write("p2\n");
  sp.flush();
  sleep(10);
  sp.write("p3\n");
  sp.flush();
  sleep(10);
  sp.write("p4\n");
  sp.flush();
  sleep(10);
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
  sp.on('data', function(data) {
    console.log('data received: ' + data);
    var node = data.split(":");
    if(node[0] == 1){
      io.emit("node1", data);
    }
    else if(node[1] ==2){
      io.emit("node2", data);
    }
    else if (node[0] == 3){
      io.emit("node3", data);
    }
    else if (node[0] == 4){
      io.emit("node4", data);
    }
    //io.emit("node status", "An XBee says: " + data);
  });
});
