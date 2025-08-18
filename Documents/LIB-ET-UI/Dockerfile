# Use a Node.js image with a specific version
FROM node:latest as build

# Set the working directory
WORKDIR /app

# Copy the entire project (assuming it already has node_modules and build directory)
COPY . .

# Expose the port (replace with your application's port if different)
EXPOSE 5000
# Run the application using npm run ng serve
CMD ["npm", "run", "ng", "serve", "--", "--host", "0.0.0.0", "--port", "4200"]
