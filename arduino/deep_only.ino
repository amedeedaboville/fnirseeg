//#include <Brain.h>
/*
Deep Only
 We have the sensors connected as so:
 (sensors are 'x' and led pairs are 'o')
     0   2       4
 --  x---x---x---x
 --    o   o   o
 --  x---x---x---x
     1   3       5
 
 You can connect them however you want, as long as you write down the order in sensorPins.
 
 The led pairs I'll call 0, 1, and 2. For each pair, the 940nm LED is the pair#, and the 850 is pair#+1. So it goes like
 0,1,2,3,4,5
 940,850,940,850,940,850
 
 For deep only, we actually just light 
 LED pair 1 (center) and look at sensors (0,1,4,5)
 LED pair 2 (right)  and look at sensors (2,3)
 */

int ledPins[6] = { 
  0,1,2,3,4,5};      
int sensorPins[6] = { //This defines which sensors are connected to which pins. Right now it says sensor 0 is connected to pin 0, etc... 
  A0,A1,A2,A3,A4,A5}; // in general it says sensor i is connected to ledPin[i]

//here we declare a lot of arrays we're going to need.
int low_values[6]; int high_values[6];        //These hold the raw measurements, from 0 to 1023.
float low_y[6];    float high_y[6];                //We'll convert them to y values
float last_low_y[6]; float last_high_y[6];      //We also need to remember the last y values to do the difference.
float hb[6]; float hbO2[6];                     //In the end we'll get blood oxygen values

void setup() {// We do this once:
  Serial.begin(19200);
  Serial.print("Hb 0, HbO2 0, Hb 1, HbO2 1, Hb 4, HbO2 4, Hb 5, HbO2 5, Hb 2, HbO2 2, Hb 3, HbO2 3");
  Serial.println(",signal strength, attention, meditation, delta, theta, low alpha, high alpha, low beta, high beta, low gamma, high gamma");
  //this line turns on all the sensors and leds
  for(int i =0; i < 6; i++)  {
    pinMode(ledPins[i],OUTPUT);
    pinMode(sensorPins[i], INPUT);
    //Set EVERYTHING to zero at the beginning.
    hb[i] = hbO2[i] = low_values[i]=high_values[i]=low_y[i]=high_y[i]=last_low_y[i]=last_high_y[i] = 0;
  }

}
void measure (int ledPair, int n, int sensors[], int values_one[], int values_two[]) {

  /* This function turns on an LED pair and measures the given voxels:
   ledPair is the number of the led pair (either 0,1,2, or 3)
   n is how many voxels to measure (usually 2 or 4)
   sensors[] holds the numbers of the sensors (say, 0,1,2,3 for the left LED pair and its closest voxel)
   values_one[] holds the measurements on the first LED (940 nm).
   values_two[] holds the measurements on the second LED (850 nm).  (values_one and two should be the same size) */

  digitalWrite(ledPins[ledPair],HIGH); //Turn on the first LED
  for(int i = 0; i < n; i++) //read each sensor value
    values_one[i] = analogRead(sensorPins[sensors[i]]); //sensorPins[sensors[i]] gets us the correct pin value.
  digitalWrite(ledPins[ledPair],LOW); //switch to the other LED

  digitalWrite(ledPins[ledPair+1], HIGH);// do the same thing again
  for(int i = 0; i < n; i++)
    values_two[i] = analogRead(ledPins[sensors[i]]);
  digitalWrite(ledPins[ledPair],LOW);
}
void doMath(int low, int high, float last_low, float last_high, float *hb, float *hbO2) {
    float low_y = log(low+1) - last_low;
    float high_y = log(high+1) - last_high;
    unsigned long d = 105603;
    
    *hb   = ((1214.0*low_y - 1058.0*high_y)/d) + *hb; //we calculate the new delta and add it
    *hbO2 = ((691.32*high_y - 693.44*low_y))/d + *hbO2;
}
void loop() {
/* LED pair 1 (center) and look at sensors (0,1,4,5)
   LED pair 2 (right)  and look at sensors (2,3)
   Then we are going to do math and send values on the Serial. 
   */
  int sensor_pair_1[4] = {0,1,4,5 };
  measure(1, 4, sensor_pair_1,high_values,low_values);         //turn on LED pair 1, measure 4 sensors, at {0,1,4,5}, into high_values and low_values
  int sensor_pair_2[4] = {2,3 };
  measure(2, 2, sensor_pair_2, high_values+4,low_values+4);    //turn on LED pair 2, measure 2 sensors, at {2,3}, and with the next four values in high_values and low_values
  
  /*Next we do the math. The explanation for this is on the google doc.   */
  for(int i = 0; i < 6; i++)
  {
    doMath(low_values[i],high_values[i],last_low_y[i],last_high_y[i], &hb[i],&hbO2[i]);
    last_low_y[i] = low_y[i];
    last_high_y[i] = high_y[i];
  }
  /* Hb and HbO2 aren't actual values, they are deltas. And scaled by a constant. */
  int values_printed[] = {0,1,4};
  Serial.print(millis());
  Serial.print(", ");
  for(int i = 0; i < 3; i++) {
    Serial.print(hb[i]*1E4);
    Serial.print(", ");
    Serial.print(hbO2[i]*1E4);
    Serial.print(", ");
  }
  Serial.println();
}

