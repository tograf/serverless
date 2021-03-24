
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { createLogger } from "../utils/logger";

export class S3Access {

  constructor(
    private readonly logger = createLogger('GroupAccess'),
    private readonly urlExpiration = +process.env.SIGNED_URL_EXPIRATION,
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly s3Client = createS3Client()) {
  }

  async createSignedUrl(todoId: string): Promise<string> {
    this.logger.info(`createSignedUrl: Get signed Url for ${todoId}`);

    const params = {
      Bucket: this.s3BucketName,
      Key: todoId
    }
  
    const command = new PutObjectCommand(params);

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: this.urlExpiration });

    this.logger.info(`createSignedUrl: ${JSON.stringify(url)}`);

    return url;
  }

}

function createS3Client() {
  return new S3Client({});;
}