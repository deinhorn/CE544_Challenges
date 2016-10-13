// Include Libraries
#include <OneWire.h>
#include <DallasTemperature.h>
#include <SoftwareSerial.h>

// Data wire is plugged into port 2 on the Arduino
#define ONE_WIRE_BUS 7
#define TEMPERATURE_PRECISION 9 // Lower resolution
// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);
int numberOfDevices; // Number of temperature devices found
DeviceAddress tempDeviceAddress; // We'll use this variable to store a found device address

//Setup Software Serial port for XBee communications
SoftwareSerial XBee(2, 3); // RX, TX

//Globar Variables
int address = 0;
String LocalAdd = "";

void setup() {
  // Begin Serial Port
  XBee.begin(9600);
  Serial.begin(9600);
  
  //Start up the temperature Library
  sensors.begin();

  //Setup the Address Pins
  pinMode(8,INPUT);
  pinMode(9,INPUT);
  pinMode(10,INPUT);
  pinMode(11,INPUT);
  pinMode(12,INPUT);

  //Determine the Address of device
  address = digitalRead(8)*pow(2,0)+ 
            digitalRead(9)*pow(2,1)+ 
            digitalRead(10)*pow(2,2)+ 
            digitalRead(11)*pow(2,3)+ 
            digitalRead(12)*pow(2,4);

  LocalAdd = "sendData" +  String(address);

  
  // Grab a count of devices on the wire
  numberOfDevices = sensors.getDeviceCount();
  sensors.getAddress(tempDeviceAddress, 0);

  //Set XBee timeout
  XBee.setTimeout(100);
}


void loop() {

  // Send the command to get temperatures
  sensors.requestTemperatures(); 
  float tempC = sensors.getTempC(tempDeviceAddress);
  
  String message = "";
  message = XBee.readStringUntil('\n');   //Wait until message with newline is found
  Serial.println(tempC);                //Debug to port

  if(message == "sendData"){                                //LocalAdd = "sendData" + Local Address  ex: "sendData2 , sendData3 etc
    delay(20);                                            //delay 20 ms for network clearout
    XBee.print(String(tempC)+":"+address+"\n");                   //Send data. Format: "22.4:1\n"
    Serial.println(String(tempC)+":"+address+"\n");               //Debug Window 
    
    XBee.flush();                                         //Flush the buffer set transmit
  }
}
