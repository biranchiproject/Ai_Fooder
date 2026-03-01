FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for node-gyp and onnxruntime
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/model.onnx ./server/model.onnx

EXPOSE 5000

# Start server
CMD ["npm", "run", "start"]
