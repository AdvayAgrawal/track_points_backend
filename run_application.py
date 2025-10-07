import json
import os
import subprocess
from pathlib import Path

# Path to the JSON file
json_file_path = Path(__file__).parent / 'data.json'

# Function to read the existing JSON data or initialize it if it doesn't exist
def read_or_initialize_data():
    if json_file_path.exists():
        with open(json_file_path, 'r') as file:
            return json.load(file)
    else:
        return {
            "point_system": [],
            "targets": []
        }

# Function to write data to the JSON file
def write_data_to_file(file_path, data):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

def ensure_cache_exists():
    cache_dir = './cache'
    cache_file = os.path.join(cache_dir, 'useractions.json')

    # Check if the cache directory and file exist, and create them if necessary
    if not os.path.exists(cache_file):
        # Create the directory if it doesn't exist
        os.makedirs(cache_dir, exist_ok=True)

        # Create the useractions.json file with an empty JSON object
        data = {
            "actions": "",
            "thought": "",
            "points": 0
        }
        write_data_to_file(cache_file, data)

# Function to run the docker-compose command
def run_docker_compose():
    try:
        subprocess.run(["docker", "compose", "up", "-d"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error while running docker-compose: {e}")

def rebuild_docker_compose():
    try:
        subprocess.run(["docker", "compose", "down"], check=True)
        subprocess.run(["docker", "compose", "up", "--build"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error while running docker-compose: {e}")

def initialize_data():
    # Load or initialize the data
    data = read_or_initialize_data()

    # Check if there is already data in the point_system
    if data["point_system"]:
        print("Data already exists in point_system. Skipping initialization.")
        return

    action_key_list = [chr(i) for i in range(ord('A'), ord('Z')+1)]

    # Insert data into the point_system
    point_system_length = 0
    more_actions = True
    while more_actions:
        action_key = action_key_list[point_system_length]
        message = input('Enter message for point_system: ')
        points = int(input('Enter points for point_system: '))

        data["point_system"].append({
            "action_key": action_key,
            "message": message,
            "points": points
        })
        point_system_length+=1

        add_more_actions = input('Do you want to add more to point_system? (yes/no): ')
        more_actions = add_more_actions.lower() in ['yes', 'y']

    print("Point system added with ", point_system_length, "entries")
    print(data["point_system"])

    # Insert data into the targets table
    more_targets = True
    while more_targets:
        action_key = input('Enter action_key for targets: ').upper()
        target = int(input('Enter target for targets: '))

        data["targets"].append({
            "action_key": action_key,
            "target": target
        })

        add_more_targets = input('Do you want to add more to targets? (yes/no): ')
        more_targets = add_more_targets.lower() in ['yes', 'y']

    # Write the collected data to the JSON file
    write_data_to_file(json_file_path, data)

    print(f"Data initialization complete. Data saved to '{json_file_path}'.")

if __name__ == "__main__":
    initialize_data()
    ensure_cache_exists()
    inp = int(input("1. run, 2. rebuild"))
    if inp == 1:
        run_docker_compose()
    if inp == 2:
        rebuild_docker_compose()
