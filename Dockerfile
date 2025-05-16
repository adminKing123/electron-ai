# Use a lightweight Node.js base image for building
FROM node:22-alpine AS build

# Set a working directory in the container
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Copy the rest of the application source code
COPY . .
ARG REACT_APP_API_URL
ARG REACT_APP_SECRET_KEY

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_SECRET_KEY=${REACT_APP_SECRET_KEY}

# Install dependencies and build the React app
RUN npm install react-scripts@5.0.1 && npm install && npm run build

# Use a lightweight Apache base image for serving the app
FROM httpd:alpine

# # Remove the default Apache index page (optional)
RUN rm -rf /usr/local/apache2/htdocs/*

# Copy the built React app from the build stage to the Apache container
COPY --from=build /app/build/ /usr/local/apache2/htdocs

COPY .htaccess /usr/local/apache2/htdocs

# Copy your custom Apache configuration file
COPY apache.conf /usr/local/apache2/conf/httpd.conf

# Start Apache to serve the React app
CMD ["httpd", "-D", "FOREGROUND"]
