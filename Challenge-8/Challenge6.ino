#include <Printers.h>
#include <XBee.h>
/**
 * Copyright (c) 2009 Andrew Rapp. All rights reserved.
 *
 * This file is part of XBee-Arduino.
 *
 * XBee-Arduino is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * XBee-Arduino is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with XBee-Arduino.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 *
 * This file has been modified by Aaron Heuckroth for use in EC544: Networking the Physical World at Boston University, Fall 2015.
 */

 /**
 * Modified by Emily Lam for continued use in EC544.
 * Modified to work with the 
 * Photon.
 * Fall 2016.
 */

 /*
 This example is for Series 2 XBee
 */

// Should be a unique ID between 0 and 255.
uint8_t BEACON_ID = 3;

XBee xbee = XBee();
XBeeResponse response = XBeeResponse();

// create reusable response objects for responses we expect to handle
ZBRxResponse rx = ZBRxResponse();
ModemStatusResponse msr = ModemStatusResponse();

uint8_t dbCommand[] = {'D','B'};
AtCommandRequest atRequest = AtCommandRequest(dbCommand);

ZBTxStatusResponse txStatus = ZBTxStatusResponse();
AtCommandResponse atResponse = AtCommandResponse();

// Particle Cloud variables
int RSSIvalue = 50;

// Function prototypes
int sendATCommand(AtCommandRequest atRequest);
void sendRSSIValue(XBeeAddress64 targetAddress, int rssiValue);
void sendTx(ZBTxRequest zbTx);
void processResponse();

int boardLed = 13; // This is the LED that is already on your device.

// SoftwareSerial xbeeSerial(2,3); // Arduino RX/TX

void setup() {
  // start serial
  Serial.begin(9600);
 // Serial1.begin(9600);  // Using Serial1 RX/TX on Photon
  
  //Set board LED
  pinMode(boardLed,OUTPUT); // Our on-board LED is output as well

  // Start XBee
  xbee.begin(Serial);
  xbee.setSerial(Serial);
  Serial.println("Initializing beacon...");

  //Particle.variable("RSSIvalue", &RSSIvalue, INT);           //Particle Variable Setup  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  
  digitalWrite(boardLed,HIGH);
  delay(1000);
  digitalWrite(boardLed,LOW);
}

int sendATCommand(AtCommandRequest atRequest) {
  int value = -1;
  Serial.println("Sending command to the XBee");

  // send the command
  xbee.send(atRequest);

  // wait up to 5 seconds for the status response
  if (xbee.readPacket(5000)) {
    // got a response!

    // should be an AT command response
    if (xbee.getResponse().getApiId() == AT_COMMAND_RESPONSE) {
      xbee.getResponse().getAtCommandResponse(atResponse);

      if (atResponse.isOk()) {
        Serial.print("Command [");
        Serial.print(atResponse.getCommand()[0]);
        Serial.print(atResponse.getCommand()[1]);
        Serial.println("] was successful!");

        if (atResponse.getValueLength() > 0) {
          Serial.print("Command value length is ");
          Serial.println(atResponse.getValueLength(), DEC);

          Serial.print("Command value: ");

          for (int i = 0; i < atResponse.getValueLength(); i++) {
            value = atResponse.getValue()[i];
            Serial.print(atResponse.getValue()[i]);
            Serial.print(" ");
          }

          Serial.println("");
        }
      }
      else {
        Serial.print("Command return error code: ");
        Serial.println(atResponse.getStatus(), HEX);
      }
    } else {
      Serial.print("Expected AT response but got ");
      Serial.print(xbee.getResponse().getApiId(), HEX);
    }
  } else {
    // at command failed
    if (xbee.getResponse().isError()) {
      Serial.print("Error reading packet.  Error code: ");
      Serial.println(xbee.getResponse().getErrorCode());
    }
    else {
      Serial.print("No response from radio");
    }
  }
  return value;
}

void sendRSSIValue(XBeeAddress64 targetAddress, int rssiValue){
  uint8_t value = (uint8_t) rssiValue;
  uint8_t values[] = {value, BEACON_ID};
  ZBTxRequest zbTx = ZBTxRequest(targetAddress, values, sizeof(values));
  sendTx(zbTx);
}

void sendTx(ZBTxRequest zbTx){
  xbee.send(zbTx);

   if (xbee.readPacket(500)) {
    Serial.println("Got a response!");
    // got a response!

    // should be a znet tx status
    if (xbee.getResponse().getApiId() == ZB_TX_STATUS_RESPONSE) {
      xbee.getResponse().getZBTxStatusResponse(txStatus);

      // get the delivery status, the fifth byte
      if (txStatus.getDeliveryStatus() == SUCCESS) {
        // success.  time to celebrate
        Serial.println("SUCCESS!");
      } else {
        Serial.println("FAILURE!");
        // the remote XBee did not receive our packet. is it powered on?
      }
    }
  } else if (xbee.getResponse().isError()) {
    Serial.print("Error reading packet.  Error code: ");
    Serial.println(xbee.getResponse().getErrorCode());
  } else {
    // local XBee did not provide a timely TX Status Response -- should not happen
    Serial.println("This should never happen...");
  }
}

void processResponse(){
  if (xbee.getResponse().isAvailable()) {
      Serial.println("get something?");
      // got something

      if (xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
        // got a zb rx packet

        // now fill our zb rx class
        xbee.getResponse().getZBRxResponse(rx);

        Serial.println("Got an rx packet!");

        if (rx.getOption() == ZB_PACKET_ACKNOWLEDGED) {
            // the sender got an ACK
            Serial.println("packet acknowledged");
        } else {
            Serial.println("packet not acknowledged");
        }

        Serial.print("checksum is ");
        Serial.println(rx.getChecksum(), HEX);

        Serial.print("packet length is ");
        Serial.println(rx.getPacketLength(), DEC);

        for (int i = 0; i < rx.getDataLength(); i++) {
          Serial.print("payload [");
          Serial.print(i, DEC);
          Serial.print("] is ");
          Serial.println(rx.getData()[i], HEX);
        }

       for (int i = 0; i < xbee.getResponse().getFrameDataLength(); i++) {
        Serial.print("frame data [");
        Serial.print(i, DEC);
        Serial.print("] is ");
        Serial.println(xbee.getResponse().getFrameData()[i], HEX);
      }


      XBeeAddress64 replyAddress = rx.getRemoteAddress64();
      int rssi = sendATCommand(dbCommand);
      sendRSSIValue(replyAddress, rssi);
      RSSIvalue = rssi;
      Serial.println("");

      }
    } else if (xbee.getResponse().isError()) {
      Serial.print("error code:");
      Serial.println(xbee.getResponse().getErrorCode());
    }
}

// continuously reads packets, looking for ZB Receive or Modem Status
void loop() {
    xbee.readPacket();
    processResponse();

  //  Particle.publish("RSSIvalue",String(RSSIvalue),60,PRIVATE);
    
    
    
    digitalWrite(boardLed,HIGH);
    delay(200);
    digitalWrite(boardLed,LOW);
    delay(200);
}


























