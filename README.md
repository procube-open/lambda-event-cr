# lambda-event-cr
Lambda event trigger emulater

# 仕様

このプログラムは AWS　において Event Bridge のスケジューラが Lambda に対してイベントを投入するのをエミュレートするものであり、 TypeScript で記述されている。
このプログラムは起動時に S3 から Event Bridge のスケジューラの設定ファイルを読み出す。
設定ファイルは以下の環境変数にしたがって読み出される

|環境変数名|説明|例|
|--|--|--|
|S3_END_POINT|取得先のS3のURLで省略可能である。格納先としてMinIOを使用する場合に指定し、AWS環境では省略する。|http://minio.app-network:9000|
|CONFIG_BUCKET_NAME|設定ファイルが格納されているバケット名|config-bucket|
|CONFIG_KEY|設定ファイルが格納されているキー。このキーの下にあり拡張子がymlであるファイルをすべて読み出す|scheduler-configs|

スケジューラの設定ファイルは YAMLで記述されており、以下の形式を持つ。

|項目名|説明|例|
|--|--|--|
|targetUrl|イベントを投入するURL|http://resume-engine.local-app-network|
|rateExpression|イベントを投入する間隔をあらわす rate式|rate(3minutes)|

設定ファイルごとにスケジューラを起動し、 rateExpression で指定された間隔で targetUrl にイベントデータを POST する。
イベントデータはJSONであり、内容は AWS の EventBridge と互換性のある形式とする。 