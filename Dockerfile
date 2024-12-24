FROM node:14 AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Build stage for the main app
FROM base AS app-build
RUN npm run build

# Build stage for the admin panel
FROM base AS admin-build
WORKDIR /usr/src/app/admin
RUN npm install
RUN npm run build

# Final stage
FROM node:14-alpine

WORKDIR /usr/src/app

# Copy built assets from the app build stage
COPY --from=app-build /usr/src/app ./

# Copy built assets from the admin build stage
COPY --from=admin-build /usr/src/app/admin/.next ./admin/.next
COPY --from=admin-build /usr/src/app/admin/package*.json ./admin/

# Install production dependencies for both app and admin
RUN npm install --production
RUN cd admin && npm install --production

# Expose the ports the app and admin panel run on
EXPOSE 3000 3001

# Define the command to run the application
CMD ["npm", "run", "start:docker"]

