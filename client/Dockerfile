# Dockerfile defines a new image.
# Any files we want to include in the new image
# must be in the same directory tree or below the Dockerfile.

# From specifies which container image we want to build upon.
FROM nginx

# Replace default NGINX configuration file with our modified version.
ADD default.conf /etc/nginx/conf.d/default.conf

# <relative-source-file-path> <absolute-target-file-path>
COPY dist /usr/share/nginx/html

EXPOSE 443 80