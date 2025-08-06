# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.9-slim AS backend
WORKDIR /app

# Install Python dependencies
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python files
COPY api/ ./api/

# Copy built frontend
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json

# Install Node.js for serving the frontend
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*
RUN npm install --only=production

EXPOSE 3000 5000

# Start both services
CMD ["sh", "-c", "python api/convert.py & npm start"]
