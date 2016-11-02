//Library
#include <Servo.h>

//Cool Library
#include <Adafruit_NeoPixel.h>

//Cool Setup
Adafruit_NeoPixel strip1 = Adafruit_NeoPixel(10, A0, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2 = Adafruit_NeoPixel(10, A1, NEO_GRB + NEO_KHZ800);


// Servo Setup
Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
bool startup = true; // used to ensure startup only happens once
int startupDelay = 1000; // time to pause at each calibration step
double maxSpeedOffset = 45; // maximum speed magnitude, in servo 'degrees'
double maxWheelOffset = 85; // maximum wheel turn magnitude, in servo 'degrees'


int initial_wheels = 90; //start angle
int center = 80;
int limit = 35;          //steering limit degrees

void setup(){
  //Serial Start
  Serial.begin(9600);  //Opens serial connection at 9600bps. 

  //Cool Start
  strip1.begin();
  strip2.begin();
  strip1.show();
  strip2.show();

  //LIDAR PWM setup
  pinMode(2, OUTPUT); // Set pin 2 as trigger pin
  pinMode(3, INPUT); // Set pin 3 as monitor pin
  pinMode(4, OUTPUT); // Set pin 2 as trigger pin
  pinMode(5, INPUT); // Set pin 3 as monitor pin

  //Crawler Control Setup
  wheels.attach(8); // initialize wheel servo to Digital IO Pin #8
  esc.attach(9); // initialize ESC to Digital IO Pin #9
  /*  If you're re-uploading code via USB while leaving the ESC powered on, 
   *  you don't need to re-calibrate each time, and you can comment this part out.
   */
  calibrateESC();
  wheels.write(initial_wheels);

  //cool wipe
  colorWipe(strip1.Color(255,0,0),200);
  colorWipe(strip1.Color(0,255,0),150);
  colorWipe(strip1.Color(0,0,255),100);
  colorWipe(strip1.Color(255,255,255),50);

  esc.write(65);
}


/* Convert radian value to degrees */
double radToDeg(double radians){
  return (radians * 4068) / 71;
}

/* Calibrate the ESC by sending a high signal, then a low, then middle.*/
void calibrateESC(){
    esc.write(180); // full backwards
    delay(startupDelay);
    esc.write(0); // full forwards
    delay(startupDelay);
    esc.write(90); // neutral
    delay(startupDelay);
    esc.write(90); // reset the ESC to neutral (non-moving) value
}

unsigned long pulse_width_1;
unsigned long pulse_width_2;

int error_prev = 0;
void loop(){
  
  char input = Serial.read();
  if (input == 'g'){
    esc.write(65);
    Serial.println("go");
  }
  if (input == 's'){
    esc.write(90);
    Serial.println("stop");
  }


  int time_init = millis();
  
  pulse_width_1 = pulseIn(3, HIGH); // Count how long the pulse is high in microseconds
  if(pulse_width_1 != 0){ // If we get a reading that isn't zero, let's print it
    pulse_width_1 = pulse_width_1/10; // 10usec = 1 cm of distance for LIDAR-Lite
 //   Serial.println(pulse_width_1); // Print the distance
  }
  pulse_width_2 = pulseIn(5, HIGH); // Count how long the pulse is high in microseconds
  if(pulse_width_2 != 0){ // If we get a reading that isn't zero, let's print it
    pulse_width_2 = pulse_width_2/10; // 10usec = 1 cm of distance for LIDAR-Lite
 //   Serial.println(pulse_width_2); // Print the distance
  }
  //Check distance
  float volts = analogRead(A4)*0.0048828125;   // value from sensor * (5/1024) - if running 3.3.volts then change 5 to 3.3
  float distance = 65*pow(volts, -1.10);          // worked out from graph 65 = theretical distance / (1/Volts)S - luckylarry.co.uk
  if (distance<30){
    esc.write(90);
  }
  
  int dt = (millis()-time_init);


  int error = (pulse_width_2 - pulse_width_1);
  int D = (((error_prev-error)*100)/dt);
  int P = error * .35;

  initial_wheels = P + initial_wheels;

  //Limit steering turn
  if (initial_wheels > (center+limit)){
    initial_wheels = (center+limit);
  }
  if (initial_wheels < (center-limit)){
    initial_wheels = (center-limit);
  }

  
  //Write to steering
  wheels.write(initial_wheels);
//  Serial.print(error);
//  Serial.print(" : ");
//  Serial.print(error_prev);
//  Serial.print("       ");
//  Serial.print(P);
//  Serial.print("   ");
//  Serial.print(dt);
//  Serial.print("   ");
////  Serial.print(D);
//  Serial.print("   ");
//  Serial.print(initial_wheels);
//  Serial.println("");
 // delay(wait);
   error_prev = error;


  for(int i = 0; i<10; i++){
      strip1.setPixelColor(i,strip1.Color(map(P*5,-100,100,0,255),map(D*10,-100,100,0,255),50));
  }
    for(int i = 0; i<10; i++){
      strip2.setPixelColor(i,strip2.Color(map(P*5,-100,100,0,255),map(D*10,-100,100,0,255),50));
  }
  strip1.show();
  strip2.show();
  
 // delay(20); //Delay so we don't overload the serial port
  

}


// Fill the dots one after the other with a color
void colorWipe(uint32_t c, uint8_t wait) {
  for(uint16_t i=0; i<strip1.numPixels(); i++) {
    strip1.setPixelColor(i, c);
    strip2.setPixelColor(i, c);
    strip1.show();
    strip2.show();
    delay(wait);
  }
}

