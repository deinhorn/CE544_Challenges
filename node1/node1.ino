#include <OneWire.h>
#include <DallasTemperature.h>
// Data wire is plugged into port 2 on the Arduino
#define ONE_WIRE_BUS A0
#define TEMPERATURE_PRECISION 9 // Lower resolution
// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature. 
DallasTemperature sensors(&oneWire);
int numberOfDevices; // Number of temperature devices found
DeviceAddress tempDeviceAddress; // We'll use this variable to store a found device address
#include <SoftwareSerial.h>
SoftwareSerial XBee(2, 3); // RX, TX
void setup() {
  // put your setup code here, to run once:
  XBee.begin(9600);
  Serial.begin(9600);
  
   // Start up the library
  sensors.begin();
  
  // Grab a count of devices on the wire
  numberOfDevices = sensors.getDeviceCount();
  sensors.getAddress(tempDeviceAddress, 0);
}
void loop() {
  sensors.requestTemperatures(); // Send the command to get temperatures
  
  float tempC = sensors.getTempC(tempDeviceAddress);
  
  String message = "";
  message = XBee.readStringUntil('\n');
  Serial.println(message);
 
  //Serial.print(tempC);
  XBee.flush();
  if(message == "sendData"){
    delay(25);
    XBee.print(tempC);
    XBee.write(":1\n");
    //Serial.println(tempC);
  XBee.flush();
  }
}
