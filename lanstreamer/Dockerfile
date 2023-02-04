# ==== CONFIGURE =====
# Use a Node 16 base image
FROM node:14-alpine
# Set the working directory to /app inside the container
WORKDIR /app
# Copy app files
COPY . .
# ==== BUILD =====
# Install dependencies (npm ci makes sure the exact versions in the lockfile gets installed)
RUN npm ci
# Build the app
RUN npm run build-lanstreamer-demo
# ==== RUN =======
# Set the env to "production"
ENV NODE_ENV production
# Start the app
CMD [ "npx", "serve", "build" ]