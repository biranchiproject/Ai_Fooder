import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

print("Generating 100,000 synthetic CSAO recommendation events...")

NUM_EVENTS = 100000
users = range(1, 5001)
items = range(1, 151)
restaurants = range(1, 21)

categories = ['Biryani Special', 'Pizza & Italian', 'Burgers & Cafe', 'South Indian', 'Cold Drinks', 'Ice Cream']
item_cat_map = {i: random.choice(categories) for i in items}
item_price_map = {i: random.randint(50, 500) for i in items}

# Behavioral Patterns
def get_cart_context():
    hour = random.randint(0, 23)
    day = random.randint(0, 6) # 0=Mon, 6=Sun
    
    # Morning: Coffee/Breakfast, Night: Dinners/Desserts
    is_morning = 6 <= hour <= 11
    is_night = 19 <= hour <= 23
    
    # Generate cart total and item list
    cart_size = random.randint(1, 4)
    cart_items = random.sample(items, cart_size)
    cart_value = sum(item_price_map[i] for i in cart_items)
    
    return hour, day, cart_items, cart_value, is_morning, is_night

data = []

start_date = datetime(2025, 1, 1)

for i in range(NUM_EVENTS):
    user_id = random.choice(users)
    cart_id = f"cart_{i}"
    
    hour, day, cart_items, cart_value, is_morning, is_night = get_cart_context()
    
    # Determine candidate item to show
    candidate_id = random.choice(items)
    while candidate_id in cart_items:
        candidate_id = random.choice(items)
        
    candidate_cat = item_cat_map[candidate_id]
    
    # Simulated Click Probability Logic (The Signal)
    prob_click = 0.05
    
    # Strong correlation: Buying Pizza -> High chance of Cold Drink
    cart_cats = [item_cat_map[c] for c in cart_items]
    if 'Pizza & Italian' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.40
        
    # Correlation: Night time -> High chance of Ice Cream add-on
    if is_night and candidate_cat == 'Ice Cream':
        prob_click += 0.35
        
    # Correlation: Morning time -> South Indian
    if is_morning and candidate_cat == 'South Indian':
        prob_click += 0.30
        
    # Correlation: High cart value -> Expensive add-on
    if cart_value > 800 and item_price_map[candidate_id] > 200:
        prob_click += 0.20
        
    is_click = 1 if random.random() < prob_click else 0
    
    timestamp = start_date + timedelta(days=random.randint(0, 90), hours=hour, minutes=random.randint(0, 59))
    
    data.append({
        'event_id': i,
        'user_id': user_id,
        'cart_id': cart_id,
        'candidate_item_id': candidate_id,
        'candidate_category': candidate_cat,
        'candidate_price': item_price_map[candidate_id],
        'cart_size': len(cart_items),
        'cart_value': cart_value,
        'hour_of_day': hour,
        'day_of_week': day,
        'is_click': is_click,
        'timestamp': timestamp
    })

df = pd.DataFrame(data)
df.to_csv('synthetic_csao_events.csv', index=False)
print("Saved to synthetic_csao_events.csv. Click-through rate: {:.2f}%".format(df['is_click'].mean() * 100))
