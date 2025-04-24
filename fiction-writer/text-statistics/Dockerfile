# Stage 1: Builder
FROM node:22.12-alpine AS builder

# Copy the entire project because the `prepare` script requires all files
COPY . /app
WORKDIR /app

# Use a cache for npm dependencies to speed up builds
RUN --mount=type=cache,target=/root/.npm npm install

# Build the project (assumes a `build` script in package.json)
RUN npm run build

# Stage 2: Release
FROM node:22.12-alpine AS release

# Copy only the built files and necessary metadata from the builder stage
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Set environment to production
ENV NODE_ENV=production

WORKDIR /app

# Install only production dependencies
RUN npm ci --ignore-scripts --omit=dev

# Define the entry point for the MCP server
ENTRYPOINT ["node", "build/index.js"]