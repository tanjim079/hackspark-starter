FROM nginx:alpine

# Teach nginx to serve .jsx files as JavaScript (needed for Babel standalone)
RUN echo "text/javascript  jsx;" >> /etc/nginx/mime.types

# Copy all frontend source files into nginx web root
COPY . /usr/share/nginx/html

# nginx config: serve on port 3000, handle SPA routing
RUN printf 'server {\n\
    listen 3000;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
