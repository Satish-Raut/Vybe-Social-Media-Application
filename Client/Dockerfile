# ---- Stage 1: Build Stage ----
# Use a specific Node.js version to build the React application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Vite/React app for production
RUN npm run build


# ---- Stage 2: Production Stage ----

FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration to handle React Router SPA routing
COPY nginx.conf /etc/nginx/conf.d/

# Copy the built artifacts from the builder stage to Nginx's web root
# Note: Vite builds to the 'dist' directory by default
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
