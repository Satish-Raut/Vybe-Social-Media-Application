# ---- Stage 1: Build Stage ----

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including devDependencies like nodemon)
RUN npm ci

COPY . .

# ---- Stage 2: Production Stage ----
# Start fresh with a clean, minimal image — no build tools, no devDependencies
FROM node:20-alpine AS production

# Set NODE_ENV to production for optimized performance
ENV NODE_ENV=production

WORKDIR /app

# Copy only package files and install PRODUCTION dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy the built application code from the builder stage
COPY --from=builder /app .

# Expose the port the Express server listens on
EXPOSE 4000

CMD ["node", "server.js"]
