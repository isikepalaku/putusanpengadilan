FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Debug: List contents
RUN echo "Listing root directory:" && \
    ls -la && \
    echo "Listing src directory:" && \
    ls -la src && \
    echo "Listing src/lib directory:" && \
    ls -la src/lib

# Set environment variables
ARG VITE_OPENAI_API_KEY
ARG VITE_SUPABASE_URL 
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_SERVICE_KEY
ARG VITE_SITE_URL
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_SERVICE_KEY=$VITE_SUPABASE_SERVICE_KEY
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build app
RUN npm run build

EXPOSE 5086

CMD ["npm", "run", "preview"]