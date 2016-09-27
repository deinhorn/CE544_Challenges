#include <SoftwareSerial.h>
SoftwareSerial XBee(2, 3); // RX, TX

void setup() {
  // put your setup code here, to run once:
  XBee.begin(9600);
  Serial.begin(9600);
}

void loop() {
  String message = "";
  // put your main code here, to run repeatedly:
  XBee.write("Hello, World!\n");
  delay(1000);
  message = XBee.readString();
  if(message == "2:sendData\n"){
    Serial.print("message recieved from PC: ");
    Serial.print(message);
  }
}
