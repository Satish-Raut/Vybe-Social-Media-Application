# ---- Stage 1: Build Stage ----
# Use a specific, lightweight Node.js version for reproducibility
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package files first to leverage Docker layer caching.
# Docker caches this layer. If package.json hasn't changed,
# it won't re-run npm install on the next build — saving huge time!
COPY package*.json ./

# Install ALL dependencies (including devDependencies like nodemon)
RUN npm ci

# Copy the rest of the application source code
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

# The command to start the server in production
CMD ["node", "server.js"]
