# Builder Stage
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client and Build TypeScript
RUN npx prisma generate
RUN npm run build

# Production Stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --only=production
RUN npx prisma generate

# Copy built artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port (Cloud Run defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Start command
CMD [ "npm", "start" ]
