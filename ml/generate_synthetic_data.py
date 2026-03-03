import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

print("Generating 150,000 synthetic CSAO recommendation events with meal-completion patterns...")

NUM_EVENTS = 150000
users = range(1, 5001)
items = range(1, 151)
restaurants = range(1, 21)

# Updated categories to match production DB
categories = [
    'Biryani', 'Pizza & Italian', 'Burgers & Cafe', 'South Indian',
    'Cold Drinks', 'Ice Cream', 'North Indian', 'Odia Special',
    'Sweets', 'Fast Food', 'Chinese', 'Beverages'
]
item_cat_map = {i: random.choice(categories) for i in items}
item_price_map = {i: random.randint(50, 500) for i in items}

# Behavioral Patterns
def get_cart_context():
    hour = random.randint(0, 23)
    day = random.randint(0, 6)  # 0=Mon, 6=Sun

    # Time slots
    is_morning = 6 <= hour <= 11
    is_afternoon = 12 <= hour <= 16
    is_evening = 17 <= hour <= 20
    is_night = hour >= 21 or hour <= 5

    cart_size = random.randint(1, 4)
    cart_items = random.sample(list(items), cart_size)
    cart_value = sum(item_price_map[i] for i in cart_items)

    return hour, day, cart_items, cart_value, is_morning, is_afternoon, is_evening, is_night

data = []
start_date = datetime(2025, 1, 1)

for i in range(NUM_EVENTS):
    user_id = random.choice(list(users))
    cart_id = f"cart_{i}"

    hour, day, cart_items, cart_value, is_morning, is_afternoon, is_evening, is_night = get_cart_context()

    candidate_id = random.choice(list(items))
    while candidate_id in cart_items:
        candidate_id = random.choice(list(items))

    candidate_cat = item_cat_map[candidate_id]
    cart_cats = [item_cat_map[c] for c in cart_items]

    # ===== CLICK PROBABILITY ENGINE =====
    prob_click = 0.05  # Base rate

    # --- MEAL COMPLETION CHAINS (strongest signals) ---
    # Biryani -> North Indian sides (Raita, Naan, Salan)
    if 'Biryani' in cart_cats and candidate_cat == 'North Indian':
        prob_click += 0.45

    # Biryani -> Cold Drinks
    if 'Biryani' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.40

    # Biryani -> Sweets (dessert after biryani)
    if 'Biryani' in cart_cats and candidate_cat == 'Sweets':
        prob_click += 0.30

    # Pizza -> Cold Drinks
    if 'Pizza & Italian' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.45

    # Pizza -> Ice Cream (dessert)
    if 'Pizza & Italian' in cart_cats and candidate_cat == 'Ice Cream':
        prob_click += 0.25

    # South Indian -> Beverages (filter coffee)
    if 'South Indian' in cart_cats and candidate_cat == 'Beverages':
        prob_click += 0.40

    # South Indian -> Sweets
    if 'South Indian' in cart_cats and candidate_cat == 'Sweets':
        prob_click += 0.25

    # Fast Food -> Cold Drinks
    if 'Fast Food' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.40

    # Fast Food -> Ice Cream
    if 'Fast Food' in cart_cats and candidate_cat == 'Ice Cream':
        prob_click += 0.25

    # Chinese -> Cold Drinks
    if 'Chinese' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.35

    # Odia Special -> Cold Drinks
    if 'Odia Special' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.35

    # Odia Special -> Sweets
    if 'Odia Special' in cart_cats and candidate_cat == 'Sweets':
        prob_click += 0.30

    # North Indian -> Sweets & Cold Drinks
    if 'North Indian' in cart_cats and candidate_cat == 'Sweets':
        prob_click += 0.30
    if 'North Indian' in cart_cats and candidate_cat == 'Cold Drinks':
        prob_click += 0.25

    # Sweets -> Beverages or Ice Cream
    if 'Sweets' in cart_cats and candidate_cat in ['Beverages', 'Ice Cream']:
        prob_click += 0.25

    # --- PROGRESSIVE MEAL COMPLETION ---
    # If cart already has main + side, boost desserts/drinks even more
    has_main = any(c in ['Biryani', 'North Indian', 'South Indian', 'Chinese', 'Odia Special'] for c in cart_cats)
    has_side = any(c in ['North Indian', 'Fast Food'] for c in cart_cats) and len(cart_items) >= 2
    if has_main and has_side and candidate_cat in ['Sweets', 'Ice Cream', 'Cold Drinks']:
        prob_click += 0.20

    # --- TIME-OF-DAY SIGNALS ---
    # Night: Ice cream and sweets cravings
    if is_night and candidate_cat == 'Ice Cream':
        prob_click += 0.35
    if is_night and candidate_cat == 'Sweets':
        prob_click += 0.20

    # Morning: South Indian & Beverages
    if is_morning and candidate_cat == 'South Indian':
        prob_click += 0.30
    if is_morning and candidate_cat == 'Beverages':
        prob_click += 0.25

    # Afternoon: Biryani preference
    if is_afternoon and candidate_cat == 'Biryani':
        prob_click += 0.15

    # Evening: Fast food & Chinese
    if is_evening and candidate_cat in ['Fast Food', 'Chinese']:
        prob_click += 0.15

    # --- PRICE SENSITIVITY ---
    # High cart value -> boost cheap add-ons (< ₹100)
    if cart_value > 800 and item_price_map[candidate_id] < 100:
        prob_click += 0.15

    # Low cart value -> boost affordable items
    if cart_value < 300 and item_price_map[candidate_id] < 150:
        prob_click += 0.10

    # --- WEEKEND BOOST ---
    if day >= 5:  # Saturday/Sunday
        if candidate_cat in ['Ice Cream', 'Sweets', 'Cold Drinks']:
            prob_click += 0.10

    # --- PENALIZE SAME CATEGORY ---
    if candidate_cat in cart_cats:
        prob_click -= 0.15

    # Clamp probability
    prob_click = max(0.02, min(0.95, prob_click))
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
print(f"Saved to synthetic_csao_events.csv")
print(f"Total events: {len(df)}")
print(f"Click-through rate: {df['is_click'].mean() * 100:.2f}%")
print(f"Categories: {df['candidate_category'].nunique()}")
print(f"\nClick rate by category:")
print(df.groupby('candidate_category')['is_click'].mean().sort_values(ascending=False).to_string())
