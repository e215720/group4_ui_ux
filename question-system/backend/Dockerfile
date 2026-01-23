FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy prisma schema to the expected location
RUN mkdir -p prisma && cp src/prisma/schema.prisma prisma/

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]
