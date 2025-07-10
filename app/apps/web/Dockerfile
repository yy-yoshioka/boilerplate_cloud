########################################
# ---------- builder ----------
########################################
FROM node:20-bullseye AS builder

# 作業ディレクトリ
WORKDIR /app

# Yarn Berry を同一バージョンで固定して利用
ENV YARN_ENABLE_GLOBAL_CACHE=1 \
    HUSKY=0                                

# 依存解決に必要なファイル & ソースを一括コピー
COPY package.json yarn.lock ./
# ルート依存をインストール
RUN yarn install --immutable

# ソースをコピー
COPY . .

# ★ web アプリディレクトリでビルド
RUN yarn --cwd app/apps/web build

########################################
# ---------- runtime ----------
########################################
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

# スタンドアロン出力をコピー
COPY --from=builder /app/app/apps/web/.next/standalone ./
COPY --from=builder /app/app/apps/web/.next/static    ./static
COPY --from=builder /app/public                      ./public

# 任意: 画像やフォントを public 以外に置く場合はここで追加 COPY

EXPOSE 3000
CMD ["node", "server.js"]
