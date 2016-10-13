#! /usr/bin/python

# Demo to talk to an XBee ZigBee device
# Per Magnusson, 2015-07-28

from xbee import ZigBee
import serial
import serial.tools.list_ports
import time
import sys

addr1 = b'\x00\x01'
Node1 = b'\x00\x00\x00\x00\x00\x00\x00\x01'
addr2 = b'\x00\x02'
Node2 = b'\x00\x00\x00\x00\x00\x00\x00\x02'
addr3 = b'\x00\x03'
Node3 = b'\x00\x00\x00\x00\x00\x00\x00\x03'
addr4 = b'\x18\x57'
Node4 = b'\x00\x00\x00\x00\x00\x00\x00\x04'


# Look for COM port that might have an XBee connected
portfound = False
ports = list(serial.tools.list_ports.comports())
for p in ports:
    # The SparkFun XBee Explorer USB board uses an FTDI chip as USB interface
    if "FTDIBUS" in p[2]:
        print "Found possible XBee on " + p[0]
        if not portfound:
            portfound = True
            portname = p[0]
            print "Using " + p[0] + " as XBee COM port."
        else:
            print "Ignoring this port, using the first one that was found."

if portfound:

    ser = serial.Serial(portname, 9600)
else:
    sys.exit("No serial port seems to have an XBee connected.")
# Flash the LED attached to DIO1 of the XBee

try:
    xbee = ZigBee(ser)
    print "XBee test"
    while(1):
        xbee.send("tx", dest_addr_long=Node4, dest_addr=addr4, data="helloworld")  # Pin 1 high
        resp = xbee.wait_read_frame()
        print ("recieved from node 4: ", resp)
        # xbee.send("tx", dest_addr=addr1, dest_addr_long=Node1)  # Pin 1 high
        # resp = xbee.wait_read_frame()
        # print ("recieved from node 1: ",resp)
        # xbee.send("tx", dest_addr=addr2, dest_addr_long=Node2)  # Pin 1 high
        # resp = xbee.wait_read_frame()
        # print ("recieved from node 1: ", resp)
        # xbee.send("tx", dest_addr=addr3, dest_addr_long=Node3)  # Pin 1 high
        # resp = xbee.wait_read_frame()
        # print ("recieved from node 1: ", resp)
        # xbee.send("tx", dest_addr=addr4, dest_addr_long=Node4)  # Pin 1 high
        # resp = xbee.wait_read_frame()
        # print ("recieved from node 1: ", resp)
        time.sleep(.5)


except:
    print "Error!"
    ser.close()

raw_input("Press Enter to continue...")