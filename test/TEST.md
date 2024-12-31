# テスト手順

ここでは、テストの手順について説明します。

## コンテナのビルド

docker build -t lambda-event:latest .

## 環境の起動
まず、以下のコマンドでテスト用の環境を起動してください。

```
cd test
docker-compose --profile background up -d
```

これにより以下の4つのコンテナが起動する。

|サービス名|説明|ビルド|
|--|--|--|
|lambda-python|python で記述された Lambda のサンプルコンテナ|test/python/Dockerfile でビルド|
|lambda-ts|typescript で記述された Lambda のサンプルコンテナ|test/ts/Dockerfile でビルド|
|minio|MinIO|minio のオフィシャルイメージを dockerhub から pull|
|createbucket|MinIO にバケットを作成するツール|minio/mc のオフィシャルイメージを dockerhub から pull｜

参考：

[コンテナイメージで Python Lambda 関数をデプロイする](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/python-image.html)

[コンテナイメージを使用して、トランスパイルされた TypeScript コードを Lambda にデプロイする](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/typescript-image.html)

### minio バケットの初期化

以下のコマンドで minio のバケットを初期化してください。

```
cd test
docker compose --profile init up
```

### minio バケットの内容の確認

vscode のポート転送で minio.app-network:9001 を転送して Web UI から minio のバケットの内容を確認できます。

## テストの実行

以下のコマンドでテストを実行してしてください。

```
cd test
docker compose --profile test up
```
