#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ----- Pin Definitions -----
#define IR_SENSOR_PIN 35        // IR sensor output pin
#define TEMP_SENSOR_PIN 4       // DS18B20 data pin
#define CURRENT_SENSOR_PIN 34   // ACS712 analog output (updated to GPIO 34)
#define VIBRATION_SENSOR_PIN 26 // Vibration sensor (active LOW)
#define BUZZER_PIN 23           // Buzzer pin
#define LED_PIN 2               // Inbuilt LED pin

// ----- LCD Setup -----
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C address, 16x2 display

// ----- RPM Variables -----
volatile unsigned int pulseCount = 0;
unsigned long lastRPMTime = 0;
unsigned int rpm = 0;

// ----- Temperature Sensor -----
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature sensors(&oneWire);
float temperatureC = 0.0;

// ----- Current Sensor (Custom Calibrated) -----
float sensitivity = 0.185;        // For ACS712 5A
float offsetVoltage = 2.5;        // Center voltage at no current
float addedCurrent = 13.51;       // Custom fixed offset
float current = 0.0;

// ----- Vibration Alert -----
bool vibrationActive = false;
unsigned long vibrationStartTime = 0;

// ----- LED Blinking -----
unsigned long lastBlinkTime = 0;
const unsigned long blinkInterval = 300; // Blink every 300ms
bool ledState = LOW;

void IRAM_ATTR onPulse() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);

  // LCD Init
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Starting...");

  // IR Sensor
  pinMode(IR_SENSOR_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN), onPulse, RISING);

  // Temperature Sensor
  sensors.begin();

  // Vibration Sensor
  pinMode(VIBRATION_SENSOR_PIN, INPUT);

  // Buzzer + LED
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  analogReadResolution(12); // 12-bit ADC

  delay(1000);
}

void loop() {
  unsigned long currentTime = millis();

  // ----- Vibration Detection -----
  if (digitalRead(VIBRATION_SENSOR_PIN) == LOW && !vibrationActive) {
    vibrationActive = true;
    vibrationStartTime = currentTime;

    Serial.println("!!! VIBRATION DETECTED !!!");
    lcd.setCursor(0, 0);
    lcd.print("!!! VIBRATION !!!");
    lcd.setCursor(0, 1);
    lcd.print("Check Motor Now!");
  }

  // ----- Handle Buzzer & LED during vibration alert -----
  if (vibrationActive) {
    unsigned long elapsed = currentTime - vibrationStartTime;

    // 🔊 Buzzer: ON for 2 sec
    if (elapsed <= 2000) {
      digitalWrite(BUZZER_PIN, HIGH);
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }

    // 💡 Blink LED for 3 sec
    if (elapsed <= 3000) {
      if (currentTime - lastBlinkTime >= blinkInterval) {
        lastBlinkTime = currentTime;
        ledState = !ledState;
        digitalWrite(LED_PIN, ledState);
      }
    } else {
      digitalWrite(LED_PIN, LOW); // Ensure LED is off after blinking
    }

    // Exit alert after 3 seconds
    if (elapsed > 3000) {
      vibrationActive = false;
    }

    return; // Skip sensor update during vibration
  }

  // ----- Every 1 sec: Update RPM, Temp, Current -----
  if (currentTime - lastRPMTime >= 1000) {
    detachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN));

    // RPM
    rpm = pulseCount * 60;
    pulseCount = 0;

    // Temperature
    sensors.requestTemperatures();
    temperatureC = sensors.getTempCByIndex(0);

    // Current with calibration
    int raw = analogRead(CURRENT_SENSOR_PIN);
    float voltage = (raw * 3.3) / 4095.0;
    current = (voltage - offsetVoltage) / sensitivity + addedCurrent;
  

    // Serial Output
    Serial.print("RPM: ");
    Serial.print(rpm);
    Serial.print(" | Temp: ");
    Serial.print(temperatureC);
    Serial.print(" C | Current: ");
    Serial.print(current, 2);
    Serial.println(" A");

    // LCD Output
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("R:");
    lcd.print(rpm);
    lcd.print(" T:");
    lcd.print(temperatureC, 1);
    lcd.print("C");

    lcd.setCursor(0, 1);
    lcd.print("I:");
    lcd.print(current, 2);
    lcd.print("A       ");

    lastRPMTime = currentTime;
    attachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN), onPulse, RISING);
  }
}