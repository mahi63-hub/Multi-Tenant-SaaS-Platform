FROM node:20.15-alpine3.19

WORKDIR /app

# Install build tools REQUIRED for native modules like bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy only package files first
COPY package*.json ./

# Install dependencies INSIDE container (not from host)
# This ensures bcrypt compiles for Alpine Linux
RUN npm install

# Copy application code
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
