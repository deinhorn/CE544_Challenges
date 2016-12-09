//Library
#include <Servo.h>

//Cool Library
#include <Adafruit_NeoPixel.h>

//Ultrasonic Sensor
#define trigPin A1
#define echoPin A0


//Cool Setup
Adafruit_NeoPixel strip1 = Adafruit_NeoPixel(10, 8, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2 = Adafruit_NeoPixel(10, 9, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip3 = Adafruit_NeoPixel(10, 12, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip4 = Adafruit_NeoPixel(10, 13, NEO_GRB + NEO_KHZ800);


//Servo Setup
Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
bool startup = true; // used to ensure startup only happens once
int startupDelay = 1000; // time to pause at each calibration step
double maxSpeedOffset = 70; // maximum speed magnitude, in servo 'degrees'
double maxWheelOffset = 85; // maximum wheel turn magnitude, in servo 'degrees'


//Crawler Control Variables
int initial_wheels = 90; //start angle
int prev_wheels = 0;
int center = 80;
int limit = 35;          //steering limit degrees
int boundD = 10;
int speedControl = 90;
int right_wheels = 90;
int left_wheels = 90;
int turning = 0;
int autonomous = 1;
long dist;


void setup() {
  //Serial Start
  Serial.begin(9600);  //Opens serial connection at 9600bps.

  //Cool Start
  strip1.begin();
  strip2.begin();
  strip3.begin();
  strip4.begin();
  strip1.show();
  strip2.show();
  strip3.show();
  strip4.show();

  //LIDAR PWM setup
  pinMode(7, OUTPUT); // Set pin 2 as trigger pin
  pinMode(6, INPUT); // Set pin 3 as monitor pin
  pinMode(5, OUTPUT); // Set pin 2 as trigger pin
  pinMode(4, INPUT); // Set pin 3 as monitor pin

  //HC-SR04 Ultrasonic Sensor
  //pinMode(A0, INPUT);// Set pin A0 as echo pin
  //pinMode(A1, OUTPUT); // Set pin A1 as trigger pin

  //Crawler Control Setup
  wheels.attach(11); // initialize wheel servo to Digital IO Pin #11
  esc.attach(10); // initialize ESC to Digital IO Pin #10
  /*  If you're re-uploading code via USB while leaving the ESC powered on,
      you don't need to re-calibrate each time, and you can comment this part out.
  */
  calibrateESC();
  wheels.write(initial_wheels);
  esc.write(90);
  
}


/* Convert radian value to degrees */
double radToDeg(double radians) {
  return (radians * 4068) / 71;
}

/* Calibrate the ESC by sending a high signal, then a low, then middle.*/
void calibrateESC() {
  esc.write(180); // full backwards
  delay(startupDelay);
  esc.write(0); // full forwards
  delay(startupDelay);
  esc.write(90); // neutral
  delay(startupDelay);
  esc.write(90); // reset the ESC to neutral (non-moving) value
}


////////////////////////////////////////////////////////////////////////////
//////////////////////////// MAIN LOOP /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
unsigned long pulse_width_1;
unsigned long pulse_width_2;

int error_prev = 0;
void loop() {

  //Set time
  int time_init = millis();

///////////////////////////////////////
//////////// COMMS ////////////////////
///////////////////////////////////////
  //Remote Input
  char input = 'n';
  //if (Serial.available() > 0) {
    input = Serial.read();
  //}
  if (input == 'g') {
    esc.write(60);
    Serial.println("go");
  }
  if (input == 's') {
    esc.write(90);
    speedControl = 90;
    Serial.println("stop");
  }
  if (input == 't') {
    turning = 1;
    Serial.println("initiate turn");
  }
  if (input == 'x') {
    turning = 0;
    Serial.println("turn done");
  }
  if (input == 'f') {
    speedControl = speedControl - 10;
    esc.write(speedControl);
    Serial.println("faster");
  }
  if (input == 'b') {
    speedControl = speedControl + 10;
    esc.write(speedControl);
    Serial.println("slower");
  }
  if (input == 'r') {
    autonomous = 0;
    if (initial_wheels - 15 > 45) {
      initial_wheels = initial_wheels - 15;
      wheels.write(initial_wheels);
    } else {
      initial_wheels = 45;
      wheels.write(initial_wheels);
    }
    Serial.println(initial_wheels);
  }
  if (input == 'l') {
    autonomous = 0;
    if (initial_wheels + 15 < 115) {
      initial_wheels = initial_wheels + 15;
      wheels.write(initial_wheels);
    } else {
      initial_wheels = 115;
      wheels.write(initial_wheels);
    }
    Serial.println(initial_wheels);
  }
  if (input == 'a') {
    autonomous = 1;
    esc.write(70);
    Serial.println("autonomous mode");
  }



///////////////////////////////////////
//////////// INPUTS ///////////////////
///////////////////////////////////////

  //LIDAR distance data collection
  pulse_width_1 = pulseIn(6, HIGH); // Count how long the pulse is high in microseconds
  if (pulse_width_1 != 0) { // If we get a reading that isn't zero, let's print it
    pulse_width_1 = pulse_width_1 / 10; // 10usec = 1 cm of distance for LIDAR-Lite
  }

  //LIDAR 2 Sensor
  pulse_width_2 = pulseIn(4, HIGH); // Count how long the pulse is high in microseconds
  if (pulse_width_2 != 0) { // If we get a reading that isn't zero, let's print it
    pulse_width_2 = pulse_width_2 / 10; // 10usec = 1 cm of distance for LIDAR-Lite
  }
  
  //SHARP IR Sensor
  float volts_front = analogRead(A5) * 0.0048828125; // value from sensor * (5/1024) - if running 3.3.volts then change 5 to 3.3
  float dist_front = 65 * pow(volts_front, -1.10);        // worked out from graph 65 = theretical distance / (1/Volts)S - luckylarry.co.uk
  if (dist_front < 30) {
    //Serial.println(dist_front);
    esc.write(90);
  }


///////////////////////////////////////
//////////// Control //////////////////
///////////////////////////////////////


  //PD Controller for Autonomous Driving

  int dt = (millis() - time_init);

  if (autonomous == 1) {
    int error = (pulse_width_2 - pulse_width_1);
    float D = ((error_prev - error) * 20 / dt);
    int P = error * .4;
    initial_wheels = P + (int)D + initial_wheels;
    // Serial.println(D);
    //Serial.println(error_prev-error);

    //Limit steering turn
    if (initial_wheels > (center + limit)) {
      initial_wheels = (center + limit);
    }
    if (initial_wheels < (center - limit)) {
      initial_wheels = (center - limit);
    }
    if (error < 21 && error > -21) {
      initial_wheels = center;
    }
    if (error < -450 && turning == 0) {
      initial_wheels = (center - 5);
    }
    if (error > 450 && turning == 0) {
      initial_wheels = (center + 5);
    }

    if (initial_wheels !=  prev_wheels) {
      //Write to steering
      wheels.write(initial_wheels);
    }

    prev_wheels = initial_wheels;

    //  Serial.print(pulse_width_2);
    //  Serial.print(" : ");
    //  Serial.print(pulse_width_1);
    //  Serial.print(" : ");
    //  Serial.print(error);
    //  Serial.print(" : ");
    //  Serial.print(error_prev);
    //  Serial.print("       ");
    //  Serial.print(P);
    //  Serial.print("   ");
    //  Serial.print(dt);
    //  Serial.print("   ");
    //  Serial.print(D);
      //Serial.print(" -- wheel turn: ");
      //Serial.print(initial_wheels);
    // Serial.print(": ");
    // Serial.print(dist);
    // delay(wait);
    error_prev = error;


 
  }
}
