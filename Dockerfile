# ビルドステージ
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn run build

# 実行ステージ
FROM node:18-alpine
WORKDIR /app
# ビルドステージで生成された dist ディレクトリをコピー
COPY --from=build /app/dist ./dist
COPY package*.json ./
# 実行に必要なパッケージのみをインストール
RUN yarn install --production
CMD ["yarn", "start"]
