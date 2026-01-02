import urllib.request
import json
import sys

API_URL = "http://localhost:8000/api"

def run():
    # 1. Login
    login_data = json.dumps({"email": "admin@toolshare.com", "password": "admin123"}).encode('utf-8')
    req = urllib.request.Request(f"{API_URL}/auth/login", data=login_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            token = data['access_token']
    except urllib.error.HTTPError as e:
        print(f"Login Failed: {e.read().decode()}")
        return

    # 2. Create Tool
    tool_data = json.dumps({
        "name": "Urllib Tool",
        "description": "Created via python",
        "daily_price": 15.5,
        "category": "Power Tools",
        "image_url": ""
    }).encode('utf-8')
    
    req = urllib.request.Request(f"{API_URL}/tools", data=tool_data, headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    })

    try:
        with urllib.request.urlopen(req) as response:
            print("Tool Created Successfully!")
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Tool Creation Failed: {e.code}")
        print(e.read().decode())

if __name__ == "__main__":
    run()
