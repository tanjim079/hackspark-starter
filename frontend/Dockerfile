# Builder stage
FROM nginx:alpine AS builder
# Nothing needed to build for a placeholder frontend

# Runtime stage
FROM nginx:alpine AS runtime
EXPOSE 3000
RUN echo 'server { listen 3000; location / { return 200 "OK"; } }' > /etc/nginx/conf.d/default.conf