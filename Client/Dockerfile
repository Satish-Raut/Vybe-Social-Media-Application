# ---- Stage 1: Build Stage ----
# Use a specific Node.js version to build the React application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite/React app for production
RUN npm run build


# ---- Stage 2: Production Stage ----
# Use a lightweight Nginx web server to serve the static frontend files
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration to handle React Router SPA routing
COPY nginx.conf /etc/nginx/conf.d/

# Copy the built artifacts from the builder stage to Nginx's web root
# Note: Vite builds to the 'dist' directory by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (HTTP)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
