/**
 * ファイル管理システムのモックデータ
 * 
 * RDBテーブル構造を想定したデータ形式
 * 実際のテーブル定義は README.md を参照
 */

export const mockData = {
  // files テーブルに相当
  files: [
    // ルートフォルダ
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      path: '/Documents',
      size: null,
      modified: new Date().toISOString(),
      created: '2023-12-01T09:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: true,
      permissions: 'owner',
      mimeType: null,
      etag: null,
      // リレーション用
      parentId: null,
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '2',
      name: 'Images',
      type: 'folder',
      path: '/Images',
      size: null,
      modified: '2024-01-14T15:45:00',
      created: '2023-12-01T09:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: null,
      etag: null,
      parentId: null,
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '3',
      name: 'Videos',
      type: 'folder',
      path: '/Videos',
      size: null,
      modified: '2024-01-10T12:00:00',
      created: '2023-12-01T09:00:00',
      owner: 'user@example.com',
      shared: true,
      starred: false,
      permissions: 'owner',
      mimeType: null,
      etag: null,
      parentId: null,
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '4',
      name: 'Downloads',
      type: 'folder',
      path: '/Downloads',
      size: null,
      modified: new Date().toISOString(),
      created: '2023-12-01T09:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: null,
      etag: null,
      parentId: null,
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    
    // Documents内のファイル
    {
      id: '10',
      name: '契約書_2024.pdf',
      type: 'file',
      path: '/Documents/契約書_2024.pdf',
      size: 2458624,
      modified: '2024-01-15T10:20:00',
      created: '2024-01-15T10:20:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'application/pdf',
      etag: '"abc123def456"',
      parentId: '1',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '11',
      name: '会議メモ.docx',
      type: 'file',
      path: '/Documents/会議メモ.docx',
      size: 524288,
      modified: '2024-01-12T11:30:00',
      created: '2024-01-12T11:30:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      etag: '"def456ghi789"',
      parentId: '1',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '12',
      name: '予算計画.xlsx',
      type: 'file',
      path: '/Documents/予算計画.xlsx',
      size: 892416,
      modified: '2024-01-10T09:00:00',
      created: '2024-01-10T09:00:00',
      owner: 'user@example.com',
      shared: true,
      starred: false,
      permissions: 'owner',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      etag: '"ghi789jkl012"',
      parentId: '1',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    
    // サブフォルダ
    {
      id: '20',
      name: 'Work',
      type: 'folder',
      path: '/Documents/Work',
      size: null,
      modified: '2024-01-16T08:00:00',
      created: '2023-12-15T10:00:00',
      owner: 'user@example.com',
      shared: true,
      starred: false,
      permissions: 'owner',
      mimeType: null,
      etag: null,
      parentId: '1',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '21',
      name: 'Personal',
      type: 'folder',
      path: '/Documents/Personal',
      size: null,
      modified: '2024-01-14T14:00:00',
      created: '2023-12-20T10:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: null,
      etag: null,
      parentId: '1',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    
    // Work内のファイル
    {
      id: '30',
      name: 'プレゼンテーション.pptx',
      type: 'file',
      path: '/Documents/Work/プレゼンテーション.pptx',
      size: 5242880,
      modified: '2024-01-16T14:30:00',
      created: '2024-01-15T10:00:00',
      owner: 'user@example.com',
      shared: true,
      starred: false,
      permissions: 'owner',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      etag: '"jkl012mno345"',
      parentId: '20',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '31',
      name: 'タスクリスト.md',
      type: 'file',
      path: '/Documents/Work/タスクリスト.md',
      size: 4096,
      modified: '2024-01-16T16:00:00',
      created: '2024-01-16T16:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'text/markdown',
      etag: '"mno345pqr678"',
      parentId: '20',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    
    // Images内のファイル
    {
      id: '40',
      name: 'スクリーンショット_2024-01-15.png',
      type: 'file',
      path: '/Images/スクリーンショット_2024-01-15.png',
      size: 1048576,
      modified: '2024-01-15T09:15:00',
      created: '2024-01-15T09:15:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'image/png',
      etag: '"pqr678stu901"',
      parentId: '2',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '41',
      name: 'ロゴ.svg',
      type: 'file',
      path: '/Images/ロゴ.svg',
      size: 32768,
      modified: '2024-01-13T16:00:00',
      created: '2024-01-13T16:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'image/svg+xml',
      etag: '"stu901vwx234"',
      parentId: '2',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '42',
      name: 'バナー画像.jpg',
      type: 'file',
      path: '/Images/バナー画像.jpg',
      size: 2097152,
      modified: '2024-01-12T14:00:00',
      created: '2024-01-12T14:00:00',
      owner: 'user@example.com',
      shared: true,
      starred: false,
      permissions: 'owner',
      mimeType: 'image/jpeg',
      etag: '"vwx234yz567"',
      parentId: '2',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    
    // Videos内のファイル
    {
      id: '50',
      name: 'デモ動画.mp4',
      type: 'file',
      path: '/Videos/デモ動画.mp4',
      size: 104857600, // 100MB
      modified: '2024-01-10T10:00:00',
      created: '2024-01-10T10:00:00',
      owner: 'user@example.com',
      shared: true,
      starred: false,
      permissions: 'owner',
      mimeType: 'video/mp4',
      etag: '"yz567abc890"',
      parentId: '3',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    
    // Downloads内のファイル
    {
      id: '60',
      name: 'installer.zip',
      type: 'file',
      path: '/Downloads/installer.zip',
      size: 52428800, // 50MB
      modified: new Date().toISOString(),
      created: new Date().toISOString(),
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'application/zip',
      etag: '"abc890def123"',
      parentId: '4',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    },
    {
      id: '61',
      name: 'データセット.csv',
      type: 'file',
      path: '/Downloads/データセット.csv',
      size: 1048576,
      modified: '2024-01-14T11:00:00',
      created: '2024-01-14T11:00:00',
      owner: 'user@example.com',
      shared: false,
      starred: false,
      permissions: 'owner',
      mimeType: 'text/csv',
      etag: '"def123ghi456"',
      parentId: '4',
      organizationId: 'org_001',
      createdBy: 'user_001',
      modifiedBy: 'user_001'
    }
  ],
  
  // file_permissions テーブルに相当（共有設定）
  permissions: [
    {
      id: 'perm_001',
      fileId: '3', // Videos フォルダ
      userId: 'user_002',
      permission: 'read',
      createdAt: '2024-01-10T12:00:00',
      createdBy: 'user_001'
    },
    {
      id: 'perm_002',
      fileId: '12', // 予算計画.xlsx
      userId: 'user_002',
      permission: 'write',
      createdAt: '2024-01-10T09:00:00',
      createdBy: 'user_001'
    },
    {
      id: 'perm_003',
      fileId: '20', // Work フォルダ
      userId: 'user_003',
      permission: 'read',
      createdAt: '2023-12-15T10:00:00',
      createdBy: 'user_001'
    }
  ],
  
  // users テーブルに相当
  users: [
    {
      id: 'user_001',
      email: 'user@example.com',
      name: '管理者',
      role: 'admin',
      organizationId: 'org_001'
    },
    {
      id: 'user_002',
      email: 'colleague@example.com',
      name: '同僚A',
      role: 'user',
      organizationId: 'org_001'
    },
    {
      id: 'user_003',
      email: 'partner@example.com',
      name: 'パートナー',
      role: 'guest',
      organizationId: 'org_002'
    }
  ],
  
  // organizations テーブルに相当
  organizations: [
    {
      id: 'org_001',
      name: 'サンプル企業',
      plan: 'enterprise',
      storageLimit: 10 * 1024 * 1024 * 1024 // 10GB
    },
    {
      id: 'org_002',
      name: 'パートナー企業',
      plan: 'basic',
      storageLimit: 2 * 1024 * 1024 * 1024 // 2GB
    }
  ]
};