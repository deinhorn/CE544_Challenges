var serialport = require("serialport"),
SerialPort = serialport.SerialPort;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var currentData = [0,0,0,0];

var task_is_running = false;
setInterval(function(){
    if(!task_is_running){
        task_is_running = true;
        periodicFunction();
        task_is_running = false;
      }}, 2000);


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


var periodicFunction = function(){
   sp.write("sendData\n");
   sp.flush();
 
  //console.log('in periodic function');
}

var portName = process.argv[2],
portConfig = {
	baudRate: 9600,
	parser: serialport.parsers.readline("\n")
};
var sp;
sp = new SerialPort(portName, portConfig);

app.get('/', function(req, res){
  res.sendFile(__dirname +'/index.html');
});

io.emit('initialize');

io.on('connection', function(socket){
  io.emit('open');
  //console.log('a user connected');
  socket.on('disconnect', function(){
      });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

sp.on("open", function () {
  console.log('open');
  sp.on('data', function(data) {
    var num = data.split(".");
    var node = data.split(":");
    //console.log('test sum = ' + testSum);
    if(((+currentData[node[1]-1] + 50) > +num[0]) && ((+currentData[node[1]-1]- +50) < +num[0])){ 
	currentData[node[1]-1] = num[0];
	}
    else if((+currentData[node[1]-1]==0) &&(+currentData[node[1]-1]+100 > +num[0])&&(+num[0] > 0)){
	currentData[node[1]-1] = num[0];
	}
/*
    else if (isNan(+currentData[node[1]-1]) &&(+currentData[node[1]-1]+100 > +num[0])&&(+num[0] > 0)){
        currentData[node[1]-1] = num[0];
        }    
*/
    else{
	console.log('*****Received improper data: ' + num[0]+" : CurrentData: "+(currentData[node[1]-1]+50));
    }
    //console.log('current data index '+ node[1] + 'value is ' + currentData[node[1]]);
    var sum = 0;
    var avg = 0;
    var i = 0;
    var divisor = 4;
    for(i=0; i< 4;i++){
      //console.log(currentData[i]);
      if(currentData[i] != 0){
        sum = sum + parseInt(currentData[i]);
      }
      else{
        divisor = divisor-1;
      }
    }
    avg = sum/divisor;
    console.log("recieved data packet: " + data);
    //console.log("retrieving data from node " + node[1]);
    //console.log('data received from node ' + node[1] + ': ' + num[0]);
    //console.log('current temp average: ' + avg);
    io.emit("average update", avg);
    io.emit("node1 update", currentData[0]);
    io.emit("node2 update", currentData[1]);
    io.emit("node3 update", currentData[2]);
    io.emit("node4 update", currentData[3]);
  });
});
