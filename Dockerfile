# Skyward Travel — Static site container (Nginx on Alpine)
FROM nginx:alpine

# Copy custom Nginx config (listens on 8080 and serves index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy site contents into Nginx default web root
COPY . /usr/share/nginx/html

# Expose internal port used by Fly proxy
EXPOSE 8080

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]