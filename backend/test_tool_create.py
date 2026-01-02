import requests

API_URL = "http://localhost:8000/api"

# 1. Login to get token
login_payload = {"email": "admin@toolshare.com", "password": "admin123"}
print(f"Logging in with: {login_payload}")
r = requests.post(f"{API_URL}/auth/login", json=login_payload)
print(f"Login Status: {r.status_code}")
if r.status_code != 200:
    print(r.text)
    exit()

token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Try to create a tool
tool_payload = {
    "name": "Test Tool",
    "description": "Test Descr",
    "daily_price": 10.0,
    "category": "Hand Tools",
    "image_url": ""
}
print(f"Creating tool with: {tool_payload}")

r = requests.post(f"{API_URL}/tools", json=tool_payload, headers=headers)
print(f"Create Tool Status: {r.status_code}")
print(f"Response: {r.text}")
