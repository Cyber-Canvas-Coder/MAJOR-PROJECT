import json
import time
from datetime import datetime
import serial
import serial.tools.list_ports
import re
import sys
import os

def find_esp32_port():
    """Find the COM port where ESP32 is connected"""
    try:
        ports = serial.tools.list_ports.comports()
        print("\nAvailable ports:")
        for port in ports:
            print(f"Port: {port.device}, Description: {port.description}, Hardware ID: {port.hwid}")
        
        for port in ports:
            if any(id in port.description.upper() for id in ["CP210", "CH340", "CH910", "UART", "USB SERIAL", "SILICON LABS"]):
                return port.device
    except Exception as e:
        print(f"Error accessing ports: {e}")
    return None

def read_sensor_data(ser):
    """Read and parse sensor data from ESP32"""
    try:
        # Clear input buffer to get fresh data
        ser.reset_input_buffer()
        
        # Request new data (if your ESP32 is set up to respond to this)
        ser.write(b'R\n')
        
        # Wait for data to arrive
        time.sleep(0.1)
        
        if ser.in_waiting:
            line = ser.readline().decode('utf-8').strip()
            print(f"Raw data received: {line}")
            
            # Parse the formatted string using regex
            rpm_match = re.search(r'RPM:\s*(-?\d+(?:\.\d+)?)', line)
            temp_match = re.search(r'Temp:\s*(-?\d+(?:\.\d+)?)', line)
            current_match = re.search(r'Current:\s*(-?\d+(?:\.\d+)?)', line)
            
            if rpm_match and temp_match and current_match:
                data = {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "rpm": float(rpm_match.group(1)),
                    "temperature": float(temp_match.group(1)),
                    "current": float(current_match.group(1))
                }
                return data
            else:
                print("Could not parse all values from the data")
    except Exception as e:
        print(f"Error reading data: {e}")
    return None

def save_data_to_json(data):
    """Save sensor data to JSON file"""
    try:
        with open('sensor_data.json', 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Data updated at {data['timestamp']}: RPM={data['rpm']}, Temp={data['temperature']}°C, Current={data['current']}A")
    except PermissionError:
        print("Error: Permission denied when writing to sensor_data.json")
        print("Please ensure you have write permissions in this directory")
        sys.exit(1)
    except Exception as e:
        print(f"Error saving to JSON: {e}")

def main():
    # Check if running with admin privileges
    try:
        is_admin = os.getuid() == 0
    except AttributeError:
        # Windows doesn't have getuid, assume not admin
        is_admin = False

    if not is_admin:
        print("Warning: Script is not running with administrator privileges")
        print("You may need to:")
        print("1. Right-click on Command Prompt/PowerShell and select 'Run as administrator'")
        print("2. Then run the script again")
        print("\nTrying to continue anyway...\n")

    print("Searching for ESP32...")
    port = find_esp32_port()
    if not port:
        print("ESP32 not found! Please check:")
        print("1. ESP32 is properly connected via USB")
        print("2. Drivers are installed (CP210x, CH340, or CH9102)")
        print("3. No other program is using the port")
        return

    print(f"ESP32 found on port: {port}")
    last_update_time = 0
    
    try:
        ser = serial.Serial(
            port=port,
            baudrate=115200,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=1
        )
        print("Connected to ESP32")
        print("Reading sensor data every 1 second...")
        
        while True:
            current_time = time.time()
            
            # Check if 1 second has passed since last update
            if current_time - last_update_time >= 1.0:
                data = read_sensor_data(ser)
                if data:
                    save_data_to_json(data)
                    last_update_time = current_time
            
            # Small sleep to prevent CPU overuse
            time.sleep(0.1)

    except serial.SerialException as e:
        print(f"\nError: Could not access port {port}")
        print("This might be because:")
        print("1. Another program is using the port")
        print("2. You don't have permission to access the port")
        print("3. The ESP32 was disconnected")
        print(f"\nTechnical details: {e}")
        print("\nTry:")
        print("1. Close any other programs that might be using the ESP32")
        print("2. Run this script as administrator")
        print("3. Unplug and replug the ESP32")
    except KeyboardInterrupt:
        print("\nStopping data collection...")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("Serial connection closed")

if __name__ == "__main__":
    main() 