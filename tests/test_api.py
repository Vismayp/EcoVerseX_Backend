import unittest
import requests
import time
import os
import json

# Configuration
BASE_URL = "http://localhost:3001/api"
MOCK_TOKEN = "mock-token"
HEADERS = {
    "Authorization": f"Bearer {MOCK_TOKEN}",
    "Content-Type": "application/json"
}

class TestEcoVerseXAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n--- Starting API Tests ---")
        # Ensure backend is reachable
        cls.wait_for_backend()

    @classmethod
    def wait_for_backend(cls):
        retries = 5
        for i in range(retries):
            try:
                response = requests.get(f"{BASE_URL}/health")
                if response.status_code == 200:
                    print("Backend is up and running.")
                    return
            except requests.exceptions.ConnectionError:
                print(f"Waiting for backend... ({i+1}/{retries})")
                time.sleep(2)
        raise Exception("Backend is not reachable. Please start the server.")

    def test_01_sync_user(self):
        print("\nTesting User Sync...")
        response = requests.post(f"{BASE_URL}/user/sync", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['email'], 'test@example.com')
        print("User Synced Successfully.")

    def test_02_get_profile(self):
        print("\nTesting Get Profile...")
        response = requests.get(f"{BASE_URL}/user/profile", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['email'], 'test@example.com')
        print("Profile Retrieved Successfully.")

    def test_03_create_activity(self):
        print("\nTesting Create Activity...")
        payload = {
            "type": "CYCLING",
            "title": "Morning Commute",
            "description": "Cycled 5km to work",
            "co2Saved": 1.2
        }
        # Note: The backend expects multipart/form-data for image upload usually, 
        # but let's see if it accepts JSON if no image is provided or if we need to adjust.
        # Looking at activity.routes.js, it uses upload.single("image").
        # If we send JSON, multer might ignore it or we might need to send empty file.
        # Let's try sending as data without file first, but requests.post(json=...) sends application/json.
        # If the backend middleware strictly expects multipart, this might fail.
        # Let's try to send as multipart/form-data without file.
        
        # Actually, let's check activity.controller.js to see if it handles body fields.
        # Assuming it does.
        
        # We need to remove Content-Type header for multipart to let requests set boundary
        headers = HEADERS.copy()
        del headers["Content-Type"]
        
        response = requests.post(
            f"{BASE_URL}/activities", 
            headers=headers,
            data=payload
        )
        
        if response.status_code != 201 and response.status_code != 200:
             print(f"Failed to create activity: {response.text}")
        
        self.assertIn(response.status_code, [200, 201])
        print("Activity Created Successfully.")

    def test_04_get_activities(self):
        print("\nTesting Get Activities...")
        response = requests.get(f"{BASE_URL}/activities", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        print(f"Retrieved {len(data)} Activities.")

    def test_05_get_missions(self):
        print("\nTesting Get Missions...")
        response = requests.get(f"{BASE_URL}/missions", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        # We seeded missions, so there should be some
        self.assertGreaterEqual(len(data), 1)
        self.mission_id = data[0]['id']
        # Store mission_id for next test
        TestEcoVerseXAPI.mission_id = data[0]['id']
        print(f"Retrieved {len(data)} Missions.")

    def test_06_join_mission(self):
        print("\nTesting Join Mission...")
        if not hasattr(TestEcoVerseXAPI, 'mission_id'):
            self.skipTest("No mission ID available")
        
        mission_id = TestEcoVerseXAPI.mission_id
        response = requests.post(f"{BASE_URL}/missions/{mission_id}/join", headers=HEADERS)
        
        # It might be 200 or 201, or 400 if already joined (if we run tests multiple times)
        if response.status_code == 400 and "already joined" in response.text.lower():
            print("Mission already joined.")
        else:
            self.assertIn(response.status_code, [200, 201])
            print("Joined Mission Successfully.")

    def test_07_get_shop_items(self):
        print("\nTesting Get Shop Items...")
        response = requests.get(f"{BASE_URL}/shop/items", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        print(f"Retrieved {len(data)} Shop Items.")

    def test_08_get_tours(self):
        print("\nTesting Get AgriTours...")
        response = requests.get(f"{BASE_URL}/tours", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        print(f"Retrieved {len(data)} Tours.")

    def test_09_get_circles(self):
        print("\nTesting Get EcoCircles...")
        response = requests.get(f"{BASE_URL}/circles", headers=HEADERS)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)
        self.circle_id = data[0]['id']
        TestEcoVerseXAPI.circle_id = data[0]['id']
        print(f"Retrieved {len(data)} Circles.")

    def test_10_join_circle(self):
        print("\nTesting Join EcoCircle...")
        if not hasattr(TestEcoVerseXAPI, 'circle_id'):
            self.skipTest("No circle ID available")
            
        circle_id = TestEcoVerseXAPI.circle_id
        response = requests.post(f"{BASE_URL}/circles/{circle_id}/join", headers=HEADERS)
        
        if response.status_code == 400 and "already" in response.text.lower():
             print("Circle already joined.")
        else:
            self.assertIn(response.status_code, [200, 201])
            print("Joined Circle Successfully.")

if __name__ == '__main__':
    unittest.main()
