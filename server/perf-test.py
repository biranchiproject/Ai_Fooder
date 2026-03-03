import requests
import json
import time
import numpy as np

# API Endpoint (adjust if 8080 is not the port)
URL = "http://localhost:8080/api/recommendations"

scenarios = [
    {
        "name": "Scenario 1: Cold Start (Empty Cart, User 1)",
        "payload": {
            "cart_item_ids": [],
            "user_id": 1,
            "hour_of_day": 12,
            "day_of_week": 1
        }
    },
    {
        "name": "Scenario 2: Biryani Context (Item 11)",
        "payload": {
            "cart_item_ids": [11],
            "user_id": 1,
            "hour_of_day": 13,
            "day_of_week": 1
        }
    },
    {
        "name": "Scenario 3: High Value Cart (Items 11, 21, 12)",
        "payload": {
            "cart_item_ids": [11, 21, 12],
            "user_id": 1,
            "hour_of_day": 20,
            "day_of_week": 5
        }
    },
    {
        "name": "Scenario 4: Evening Snacks (Item 71)",
        "payload": {
            "cart_item_ids": [71],
            "user_id": 2,
            "hour_of_day": 18,
            "day_of_week": 3
        }
    },
    {
        "name": "Scenario 5: Multi-item Mixed (Items 1, 41, 61)",
        "payload": {
            "cart_item_ids": [1, 41, 61],
            "user_id": 3,
            "hour_of_day": 14,
            "day_of_week": 0
        }
    }
]

def run_tests():
    latencies = []
    candidate_counts = []
    
    print("Starting Manual Scenario Testing...")
    print("-" * 50)
    
    for scenario in scenarios:
        print(f"Running {scenario['name']}...")
        start_time = time.time()
        try:
            # Trigger multiple times to get stable average
            for _ in range(5):
                response = requests.post(URL, json=scenario['payload'])
                data = response.json()
                latencies.append(data.get('latency_ms', 0))
                candidate_counts.append(data.get('candidate_count', 0))
            
            print(f"  Success! Sample Latency: {data.get('latency_ms')}ms | Candidates: {data.get('candidate_count')}")
        except Exception as e:
            print(f"  Failed! {e}")
        print("-" * 50)

    avg_latency = np.mean(latencies)
    p95_latency = np.percentile(latencies, 95)
    avg_candidates = np.mean(candidate_counts)

    print("\nFINAL PERFORMANCE REPORT:")
    print(f"Total Requests: {len(latencies)}")
    print(f"Avg Candidate Count: {avg_candidates:.2f}")
    print(f"Recommendation API Avg Latency: {avg_latency:.2f} ms")
    print(f"P95 Approx: {p95_latency:.2f} ms")

if __name__ == "__main__":
    run_tests()
