// This #include statement was automatically added by the Particle IDE.
#include "photon-thermistor/photon-thermistor.h"


Thermistor *thermistor;
char resultstr[64];
void setup() {
  // For an NTC (negative temperature coefficient) thermistor only!
  // CONSTRUCTOR PARAMETERS:
  // 1. pin: Photon pin
  // 2. seriesResistor: The resistance value of the fixed resistor (based on your hardware setup)
  // 3. adcMax: The maximum analog-to-digital convert value returned by analogRead (Photon is 4095 NOT the typical Arduino 1023!)
  // 4. thermistorNominal: Resistance at nominal temperature (will be documented with the thermistor, usually "10k")
  // 5. temperatureNominal: Temperature for nominal resistance in celcius (will be supplied with the thermistor, assume 25 if not stated)
  // 6. bCoef: Beta coefficient of the thermistor; usually 3435 or 3950 (will be documented with the thermistor)
  // 7. samples: Number of analog samples to average (for smoothing)
  // 8. sampleDelay: Milliseconds between analog samples (for smoothing)
  thermistor = new Thermistor(A0, 4700, 4095, 10000, 25, 3950, 5, 20);
}

void loop() {
    float temp = thermistor->readTempF();
    float none = 0;
  String tempF = String(temp);
  sprintf(resultstr, "{\"data1\":%f,\"data2\":%f,\"data3\":%f,\"data4\":%f}",none,none,temp,none);
  Particle.publish("temp3", "{ \"3\": \"" + tempF + "\"}", PRIVATE);
    Particle.variable("temp3", resultstr, STRING);
  delay(7000);
}
		