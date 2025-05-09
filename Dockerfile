# Builder
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm install socket.io-client
RUN npm run build
RUN ls -la dist

# Static server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
