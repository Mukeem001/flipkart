# ---------------- Development Stage ----------------
FROM node:20-alpine AS development

WORKDIR /app/client

COPY client/package*.json client/.npmrc ./

RUN npm ci --legacy-peer-deps

COPY client/ ./
COPY assetsicon/ /app/assetsicon/
COPY backgroung-images/ /app/backgroung-images/
COPY flipkart-icon-svg/ /app/flipkart-icon-svg/
COPY sliicons/ /app/sliicons/

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc ./

RUN npm ci --legacy-peer-deps

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Production Stage ----------
FROM nginx:alpine AS production

COPY --from=builder /app/client/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]