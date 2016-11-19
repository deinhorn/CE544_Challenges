#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
SoftwareSerial XBee(2, 3); // RX, TX

#define PIN 7
#define NUM_LEDS 10
#define BRIGHTNESS 50

int buttonPin = 10;
int buttonState = 0;
int state = HIGH;
int reading;
int previous = LOW;
char message;

//leader variable
int leader = 2;

//Infection variable
int infection = 0;

long time = 0;
long debounce = 100;
int last = millis();
int count = 0;
int count2 = 0;
int three_sec = 0;

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, PIN, NEO_GRB + NEO_KHZ800);

ISR(TIMER1_COMPA_vect) {
  int now = millis()-last;
  //Serial.println(now);
  last = millis();
  if (infection == 1){
    count++;
    if (count % 2 == 0){
      Serial.println("Infection Message");
    }
  }
    if (three_sec == 1){
      count2++;
      Serial.println(count2);
      if (count2 % 3 == 0){
        three_sec = 0;
        count2 = 0;
        TIMSK1 &= (0 << OCIE1A);
    }
   }
};

void setup() {
  XBee.begin(9600);
  pinMode(buttonPin, INPUT);
  Serial.begin(9600);

  strip.setBrightness(BRIGHTNESS);
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'

    TCCR1A = 0x00; // normal operation page 148 (mode0);
    TCNT1= 0x0000; // 16bit counter register
    TCCR1B = 0x0C; // 16MHZ with 64 prescalar
    OCR1A = (62500-1);  // 10 Hz
    //TIMSK1 |= (1 << OCIE1A); //Enable timer compare interrupt
}


void loop(){
  //Leader decision where leader is blue (leader == 1) 
  if (leader == 1){
    colorWipe(strip.Color(0, 0, 255), 50); \
    
    //button press
    reading = digitalRead(buttonPin);
    
    if (reading == LOW && millis() - time > debounce) {
       if (state == HIGH)
        state = LOW;
      else
        state = HIGH;
        //Pressing button will cause the leader to send a CLEAR INFECTION MESSAGE
        //Clear Infection should happen only once per button press (not continuous)
        XBee.write("clear");
  }
  time = millis(); 
  }
  //non-leader is green (leader = 2);
  else{ 
    if (infection == 0){
      colorWipe(strip.Color(0, 255, 0), 50); //non-leader
    }

      //Search for a CLEAR INFECTION MESSAGE
      message = Serial.read();
      //If receive clear infection message, change back to green
      if (message == 'c'){
        colorWipe(strip.Color(0, 255, 0), 50); //clear infection turn green
        infection = 0;
        three_sec = 1;
        TIMSK1 &= (0 << OCIE1A); // Turn off infection message timer
        TCCR1A = 0x00; // normal operation page 148 (mode0);
        TCNT1= 0x0000; // 16bit counter register
        TIMSK1 |= (1 << OCIE1A); // Turn on immunity timer
      }
     
    //button press
    reading = digitalRead(buttonPin);

    if (reading == LOW && millis() - time > debounce) {
       if (state == HIGH)
        state = LOW;
        else
        state = HIGH;
        //Infect itself
        if (three_sec == 0){
          infection = 1;
          colorWipe(strip.Color(255, 0, 0), 50);  
          TIMSK1 |= (1 << OCIE1A); //Turn on infection message timer
        }
    }
      
    time = millis();    
  }

  digitalWrite(PIN, state);

  previous = reading;
}

void colorWipe(uint32_t c, uint8_t wait) {
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}
