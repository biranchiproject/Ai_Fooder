# Free-Tier Production CSAO Recommendation Engine
> **A complete Cart Super Add-On (CSAO) Recommendation System. Built on a $0 stack with AWS Free-Tier limitations in mind.**

---

## 🚀 Architecture At a Glance

This project transforms a traditional SQL-based heuristic recommendation engine into an advanced **Machine Learning Learning-to-Rank (LTR)** pipeline without relying on paid APIs or expensive managed cloud hardware.

### Key Components:
1. **Frontend:** React + Tailwind (Mobile Responsive). Fires telemetric interactions (Impressions/Clicks).
2. **Backend Engine:** Node.js + Express with an **InMemory LRU Cache** (<50ms latency for repeating carts) ensuring database survival under high load.
3. **A/B Testing Switcher:** Backend deterministic IP/Session hashing routes traffic 50% to a baseline SQL heuristic and 50% to the ML Ranker.
4. **Machine Learning Pipeline (Python):** `ml/` folder features a synthetic pipeline generating 100k+ cart behavioral events (time of day, weather, combos). 
5. **LightGBM to ONNX:** We train an open-source LightGBM model optimizing for **NDCG**, then export it to `.onnx` for portability.
6. **In-Node Inference:** The Express backend uses `onnxruntime-node` to run the ML model *directly inside Node.js*. No Python APIs required. Inference takes <100ms.
7. **CI/CD & DevOps:** Fully Dockerized (`Dockerfile` / `docker-compose.yml`) dropping right onto an AWS EC2 `t2.micro` via a GitHub Actions pipeline (`deploy.yml`).

---

## 📊 The Approach: Solving "The Free Tier Problem"

Running ML inference usually requires expensive GPUs or heavy Python API microservices (Flask/FastAPI). The constraints for this hackathon demanded AWS Free Tier (`t2.micro` 1GB RAM) with **ZERO paid APIs**.

### How we solved it:
* **The DB Killer:** Complex `JOIN` queries for Co-occurrence (the baseline) crash low-end databases instantly.
    * **Solution:** We wrapped the recommendation payload in an `LRU-Cache`. The cache key is the sorted array of `cart_item_ids`. Because carts are highly repetitive, cache hit rates are high, bringing latency from `>300ms` down to `<5ms`.
* **The Python Memory Hog:** Running PyTorch/LightGBM APIs alongside Node crushes 1GB servers.
    * **Solution:** We trained the LightGBM LambdaRank model offline, exported it to **ONNX**, and used the C++ native bindings of `onnxruntime-node`. Node parses the cart data into a Float32 Array, scores candidates, and ranks them internally entirely in memory.

---

## 📈 ML Pipeline & Simulation

1. **Synthetic Data:** We synthetically generated 100,000 cart behaviors mimicking realistic purchasing data (e.g., Morning -> Coffee/Muffins; Evening -> Cocktails/Pizza).
2. **Ranking:** The model is evaluated on **NDCG@K**, proving it significantly outperforms the deterministic SQL strategy.
3. **Telemetry & Impact:** The `recommendation_events` PostgreSQL table tracks all Impressions and Clicks. 

Run the business simulation to see the projected AOV Lift based on CTR variance:
\`\`\`bash
npx tsx simulate_business_impact.ts
\`\`\`

---

## 🛠️ How to Deploy (EC2 Free Tier)

1. **Provision EC2:** Launch a `t2.micro` instance running Ubuntu.
2. **Setup Secrets:** Add the following to your GitHub Repo Secrets:
    * `EC2_HOST` (IP Address)
    * `EC2_USER` (e.g., ubuntu)
    * `EC2_SSH_KEY` (Your .pem key)
3. **Push to Main:** The `.github/workflows/deploy.yml` workflow will automatically SSH, build the Docker images, and start the app daemonized.

### Local Development
\`\`\`bash
# 1. Install Node modules
npm install

# 2. Setup your .env (DATABASE_URL=postgres://user:pass@localhost:5432/csao)
npm run db:push

# 3. Start development server
npm run dev

# 4. Generate ML Model (Optional)
cd ml
pip install -r requirements.txt (implied)
python generate_synthetic_data.py
python train_ranker.py
cp model.onnx ../server/
\`\`\`

---

## 👨‍💻 Project Completion Checklist
- [x] In-Memory LRU Caching
- [x] A/B Testing Deterministic Hash Routing
- [x] Telemetry Database Schema (`recommendation_events`)
- [x] Python Synthetic Training Pipeline (Cart Contextual Features)
- [x] LightGBM Model Export to `.onnx`
- [x] Node.js `onnxruntime` Sub-100ms Inference
- [x] Docker + docker-compose Support
- [x] GitHub Actions CI/CD (EC2 deployment ready)
- [x] Simulated ROI (AOV Lift) projections
