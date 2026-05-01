# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 8000
CMD ["npm", "start"]