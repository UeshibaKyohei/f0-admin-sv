// S3互換のアダプター層
// 実際のS3 APIレスポンスとローカルファイルシステムを変換

export class S3Adapter {
  constructor() {
    this.bucketName = 'my-bucket';
    this.region = 'ap-northeast-1';
  }

  // S3のListObjectsV2レスポンスを模倣
  async listObjects(prefix = '', delimiter = '/') {
    // 実際のS3では以下のようなレスポンスが返る
    return {
      Name: this.bucketName,
      Prefix: prefix,
      Delimiter: delimiter,
      MaxKeys: 1000,
      IsTruncated: false,
      Contents: [], // ファイル一覧
      CommonPrefixes: [] // フォルダ一覧
    };
  }

  // ローカルファイル情報をS3オブジェクト形式に変換
  fileToS3Object(file) {
    return {
      Key: file.path.substring(1), // 先頭の/を除去
      LastModified: new Date(file.modified),
      ETag: `"${this.generateETag(file)}"`,
      Size: file.size || 0,
      StorageClass: 'STANDARD',
      Owner: {
        DisplayName: file.owner,
        ID: 'owner-id'
      }
    };
  }

  // S3オブジェクトをローカルファイル形式に変換
  s3ObjectToFile(obj, isFolder = false) {
    const name = obj.Key.split('/').pop() || obj.Prefix.split('/').filter(Boolean).pop();
    return {
      id: this.generateId(obj.Key || obj.Prefix),
      name: name,
      type: isFolder ? 'folder' : 'file',
      path: '/' + (obj.Key || obj.Prefix),
      size: obj.Size || null,
      modified: obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString(),
      created: obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString(),
      owner: obj.Owner?.DisplayName || 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: this.getMimeType(name),
      etag: obj.ETag
    };
  }

  // ファイル名からMIMEタイプを推定
  getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      
      // Videos
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      
      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      
      // Archives
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      
      // Code
      js: 'text/javascript',
      ts: 'text/typescript',
      html: 'text/html',
      css: 'text/css',
      json: 'application/json',
      
      // Text
      txt: 'text/plain',
      md: 'text/markdown'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // ETag生成（簡易版）
  generateETag(file) {
    return btoa(file.name + file.size + file.modified).substring(0, 32);
  }

  // IDを生成
  generateId(key) {
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  }

  // S3のPutObject操作を模倣
  async putObject(key, body, metadata = {}) {
    return {
      ETag: `"${this.generateETag({ name: key, size: body.length, modified: new Date() })}"`,
      VersionId: null
    };
  }

  // S3のDeleteObject操作を模倣
  async deleteObject(key) {
    return {
      DeleteMarker: false,
      VersionId: null
    };
  }

  // S3のCopyObject操作を模倣（移動/リネーム用）
  async copyObject(sourceKey, destinationKey) {
    return {
      CopyObjectResult: {
        ETag: `"${this.generateETag({ name: destinationKey, size: 0, modified: new Date() })}"`,
        LastModified: new Date()
      }
    };
  }

  // プリサインドURLを生成（ダウンロード用）
  getPresignedUrl(key, expiresIn = 3600) {
    // 実際のS3では署名付きURLを生成
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}?X-Amz-Expires=${expiresIn}`;
  }
}

export const s3Adapter = new S3Adapter();