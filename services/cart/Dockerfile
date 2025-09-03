# Basic Dockerfile for Cart Service (Node.js)
# Educational: Start with simple, clear Dockerfile

FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm install since we don't have package-lock.json yet
RUN npm install --omit=dev

# Copy application code
COPY src/ ./src/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cart -u 1001

# Change ownership of app directory
RUN chown -R cart:nodejs /app
USER cart

# Expose port
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8082/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "src/server.js"]