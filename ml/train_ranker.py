import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnxmltools
import onnx

print("Loading data...")
df = pd.read_csv('synthetic_csao_events.csv')

# Feature Engineering
df['timestamp'] = pd.to_datetime(df['timestamp'])
df = df.sort_values(by=['cart_id', 'timestamp'])

# Encode categorical
le_cat = LabelEncoder()
df['candidate_category_encoded'] = le_cat.fit_transform(df['candidate_category'])

features = ['candidate_item_id', 'candidate_category_encoded', 'candidate_price', 'cart_size', 'cart_value', 'hour_of_day', 'day_of_week']
target = 'is_click'

# Temporal split (80/20)
split_idx = int(len(df) * 0.8)
train = df.iloc[:split_idx]
test = df.iloc[split_idx:]

X_train = train[features]
y_train = train[target]
q_train = train.groupby('cart_id').size().values

X_test = test[features]
y_test = test[target]
q_test = test.groupby('cart_id').size().values

print("Training LightGBM Ranker...")
model = lgb.LGBMRanker(
    objective="lambdarank",
    metric="ndcg",
    n_estimators=100,
    learning_rate=0.05
)

model.fit(
    X_train, y_train,
    group=q_train,
    eval_set=[(X_test, y_test)],
    eval_group=[q_test],
    eval_at=[5]
)

print("Exporting model to ONNX...")
import warnings
warnings.filterwarnings("ignore")
try:
    initial_types = [('features', FloatTensorType([None, len(features)]))]
    # LightGBM to ONNX conversion using onnxmltools
    onnx_model = onnxmltools.convert_lightgbm(model, initial_types=initial_types)
    onnxmltools.utils.save_model(onnx_model, 'model.onnx')
    print("Successfully exported model.onnx")
except Exception as e:
    print("Export error:", e)

print("Pipeline complete.")
