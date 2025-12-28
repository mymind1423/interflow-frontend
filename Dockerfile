# Build Stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Cloud Run defaults PORT to 8080, but can be anything.
# The official nginx image supports using templates with environment variables out of the box since 1.19.
# It reads files from /etc/nginx/templates/*.template and outputs to /etc/nginx/conf.d/*.conf
# replacing ${VARIABLES}.

ENV PORT=8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
