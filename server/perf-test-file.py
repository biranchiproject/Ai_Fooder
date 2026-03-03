import requests
import json
import time
import numpy as np
import os

URL = "http://localhost:8082/api/recommendations"

scenarios = [
    {"name": "Scenario 1: Cold Start", "payload": {"cart_item_ids": [], "user_id": 1}},
    {"name": "Scenario 2: Biryani Context", "payload": {"cart_item_ids": [11], "user_id": 1}},
    {"name": "Scenario 3: Mixed Basket", "payload": {"cart_item_ids": [11, 21, 51], "user_id": 1}},
    {"name": "Scenario 4: High Value", "payload": {"cart_item_ids": [12, 22, 1], "user_id": 2}},
    {"name": "Scenario 5: Multi-Category", "payload": {"cart_item_ids": [41, 71, 91], "user_id": 3}}
]

def run_tests():
    results = []
    
    for scenario in scenarios:
        for _ in range(10): # 10 samples per scenario for better stats
            try:
                start = time.time()
                response = requests.post(URL, json=scenario['payload'], timeout=5)
                end = time.time()
                data = response.json()
                
                results.append({
                    "latency": data.get('latency_ms', (end - start) * 1000),
                    "candidates": data.get('candidate_count', 0)
                })
            except Exception as e:
                print(f"Error: {e}")

    if not results:
        with open("perf_results.txt", "w") as f:
            f.write("No results collected. Check if server is running on 8080.")
        return

    latencies = [r['latency'] for r in results]
    candidates = [r['candidates'] for r in results]

    report = {
        "avg_candidates": float(np.mean(candidates)),
        "avg_latency": float(np.mean(latencies)),
        "p95_latency": float(np.percentile(latencies, 95)),
        "total_requests": len(results)
    }

    with open("perf_results.txt", "w") as f:
        f.write(json.dumps(report, indent=2))

if __name__ == "__main__":
    run_tests()
