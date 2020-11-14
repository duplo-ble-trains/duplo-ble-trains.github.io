FROM nginx:alpine
COPY *.html /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
