import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fetch from 'node-fetch';
import YAML from 'js-yaml';

const s3Endpoint = process.env.S3_END_POINT;
const configBucketName = process.env.CONFIG_BUCKET_NAME || 'config-bucket';
const configKey = process.env.CONFIG_KEY || 'scheduler-configs';

const s3Client = new S3Client({ 
  endpoint: s3Endpoint, 
  forcePathStyle: true // MinIOを使用する場合に必要
});

interface SchedulerConfig {
  targetUrl: string;
  rateExpression: string;
}

/**
 * rate式をcron式に変換する関数
 * @param rateExpression rate式
 * @returns cron式
 */
const convertRateExpressionToCron = (rateExpression: string): string => {
  // rate式をcron式に変換するロジックを実装
  // 例: rate(3 minutes) => */3 * * * *
  // ここでは簡略化のため、rate(minutes) のみに対応
  const match = rateExpression.match(/rate\((\d+) minutes?\)/);
  if (match) {
    const minutes = match[1];
    return `*/${minutes} * * * *`;
  } else {
    throw new Error(`Invalid rate expression: ${rateExpression}`);
  }
};

interface EventData {
  version: string;
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: unknown; // detailは複雑な構造になる可能性があるので、unknownのままとする
}

/**
 * イベントデータを生成する関数
 * @returns イベントデータ
 */
const generateEventData = (): EventData => {
  // EventBridge と互換性のあるイベントデータを生成
  return {
    "version": "0",
    "id": "abcdefgh-1234-5678-90ab-cdefghijklmn",
    "detail-type": "Scheduled Event",
    "source": "scheduler.local",
    "account": "123456789012",
    "time": new Date().toISOString(),
    "region": "ap-northeast-1",
    "resources": [],
    "detail": {}
  };
};

/**
 * スケジューラを実行する関数
 * @param config スケジューラの設定
 */
const runScheduler = (config: SchedulerConfig) => {
  const cronExpression = convertRateExpressionToCron(config.rateExpression);

  // cron式に基づいてイベントを定期的に送信
  setInterval(() => {
    const eventData = generateEventData();
    fetch(config.targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })
    .then(res => {
      if (!res.ok) {
        console.error(`Failed to send event to ${config.targetUrl}: ${res.status} ${res.statusText}`);
      } else {
        console.log(`Sent event to ${config.targetUrl}`);
      }
    })
    .catch(err => {
      console.error(`Failed to send event to ${config.targetUrl}: ${err}`);
    });
  }, cronExpressionToMilliseconds(cronExpression)); // cron式をミリ秒に変換
};

/**
 * cron式をミリ秒に変換する関数
 * @param cronExpression cron式
 * @returns ミリ秒
 */
const cronExpressionToMilliseconds = (cronExpression: string): number => {
  // cron式をミリ秒に変換するロジックを実装
  // ここでは簡略化のため、"* * * * *" の形式のみに対応
  const [minute] = cronExpression.split(' ');
  return parseInt(minute) * 60 * 1000;
};

/**
 * S3から設定ファイルを読み込む関数
 * @returns 設定ファイルの配列
 */
const loadConfigsFromS3 = async (): Promise<SchedulerConfig[]> => {
  try {
    const command = new GetObjectCommand({
      Bucket: configBucketName,
      Key: configKey,
    });
    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();
    if (!body) {
      throw new Error('Failed to load config file from S3.');
    }
    const configs = YAML.load(body) as SchedulerConfig[];
    return configs;
  } catch (error) {
    console.error('Error loading configs from S3:', error);
    return [];
  }
};

/**
 * メイン関数
 */
const main = async () => {
  const configs = await loadConfigsFromS3();
  configs.forEach(config => {
    runScheduler(config);
  });
};

main();