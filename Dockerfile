FROM ruby:3.3.4-slim

ARG DEBIAN_FRONTEND=noninteractive
ENV JEKYLL_ENV=production

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /site

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local path vendor/bundle
RUN bundle install

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
