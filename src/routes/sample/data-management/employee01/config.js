/**
 * 社員管理システム設定
 * 
 * このファイルはシステムの動作モードや各種設定を管理します。
 * 本番環境では環境変数から設定を読み込むことを想定しています。
 */

// 動作モード設定
export const CONFIG = {
  // モックモードフラグ
  IS_MOCK_MODE: true,
  
  // API設定
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    TIMEOUT: 30000,
    RETRY_COUNT: 3
  },
  
  // ページネーション設定
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
  },
  
  // ファイルアップロード設定
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_CSV_TYPES: ['text/csv', 'application/vnd.ms-excel'],
    MAX_CSV_ROWS: 1000
  },
  
  // 組織設定
  ORGANIZATION: {
    MAX_DEPARTMENT_DEPTH: 5,                   // 最大部署階層
    MAX_DIRECT_REPORTS: 20,                    // 直属部下の最大数
    RETIREMENT_AGE: 65                         // 定年年齢
  },
  
  // UI設定
  UI: {
    SHOW_MOCK_CONTROLS: true,
    DEFAULT_VIEW_MODE: 'list',
    ANIMATION_DURATION: 300,
    AVATAR_SIZE: {
      SM: 32,
      MD: 48,
      LG: 64,
      XL: 96
    }
  },
  
  // セキュリティ設定
  SECURITY: {
    MASK_SALARY: true,                         // 給与情報のマスク
    MASK_PERSONAL_INFO: false,                 // 個人情報のマスク
    REQUIRE_APPROVAL_FOR_SENSITIVE_DATA: true  // 機密データ変更時の承認要求
  }
};

// 機能フラグ
export const FEATURES = {
  // 組織図機能
  ORG_CHART: true,
  // スキルマトリックス機能
  SKILL_MATRIX: true,
  // 勤怠管理機能
  ATTENDANCE_TRACKING: false,
  // 給与管理機能
  SALARY_MANAGEMENT: false,
  // 一括インポート/エクスポート機能
  BULK_OPERATIONS: true,
  // 承認ワークフロー
  APPROVAL_WORKFLOW: false,
  // 通知機能
  NOTIFICATIONS: false,
  // レポート機能
  REPORTS: true
};

// 検証ルール
export const VALIDATION = {
  EMPLOYEE: {
    FIRST_NAME_MIN_LENGTH: 1,
    FIRST_NAME_MAX_LENGTH: 50,
    LAST_NAME_MIN_LENGTH: 1,
    LAST_NAME_MAX_LENGTH: 50,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    EMPLOYEE_NUMBER_PATTERN: /^[A-Z0-9]{4,10}$/,
    PHONE_PATTERN: /^[\d\-\+\(\)\s]+$/,
    MIN_AGE: 16,
    MAX_AGE: 100
  },
  DEPARTMENT: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    CODE_PATTERN: /^[A-Z0-9]{2,10}$/,
    MAX_DEPTH: 5
  },
  POSITION: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    LEVEL_MIN: 1,
    LEVEL_MAX: 10
  },
  SKILL: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    CATEGORY_MAX_LENGTH: 50
  }
};

// ステータス定義
export const STATUS = {
  EMPLOYEE: {
    ACTIVE: { value: 'active', label: '在籍中', color: 'badge-success' },
    INACTIVE: { value: 'inactive', label: '休職中', color: 'badge-warning' },
    RETIRED: { value: 'retired', label: '退職済', color: 'badge-ghost' }
  },
  CONTRACT_TYPE: {
    FULLTIME: { value: 'fulltime', label: '正社員', color: 'badge-primary' },
    PARTTIME: { value: 'parttime', label: 'パート', color: 'badge-secondary' },
    CONTRACT: { value: 'contract', label: '契約社員', color: 'badge-accent' },
    INTERN: { value: 'intern', label: 'インターン', color: 'badge-info' }
  },
  SKILL_LEVEL: {
    BEGINNER: { value: 'beginner', label: '初級', color: 'badge-ghost' },
    INTERMEDIATE: { value: 'intermediate', label: '中級', color: 'badge-info' },
    ADVANCED: { value: 'advanced', label: '上級', color: 'badge-warning' },
    EXPERT: { value: 'expert', label: 'エキスパート', color: 'badge-error' }
  }
};

// 権限定義
export const PERMISSIONS = {
  // 社員情報の権限
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_WRITE: 'employee:write',
  EMPLOYEE_DELETE: 'employee:delete',
  
  // 部署情報の権限
  DEPARTMENT_READ: 'department:read',
  DEPARTMENT_WRITE: 'department:write',
  DEPARTMENT_DELETE: 'department:delete',
  
  // 給与情報の権限
  SALARY_READ: 'salary:read',
  SALARY_WRITE: 'salary:write',
  
  // レポートの権限
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  
  // システム管理の権限
  SYSTEM_ADMIN: 'system:admin',
  USER_MANAGEMENT: 'users:manage'
};

// デフォルト値
export const DEFAULTS = {
  EMPLOYEE: {
    status: 'active',
    contractType: 'fulltime',
    skills: [],
    workLocation: '本社'
  },
  DEPARTMENT: {
    level: 0,
    sortOrder: 0,
    isActive: true
  },
  POSITION: {
    level: 1,
    isManagement: false,
    permissions: [PERMISSIONS.EMPLOYEE_READ],
    isActive: true
  },
  SKILL: {
    level: 'intermediate',
    color: 'badge-info',
    isActive: true
  },
  FILTERS: {
    search: '',
    departmentId: null,
    positionId: null,
    skills: [],
    contractType: [],
    status: [],
    hireYearRange: { start: null, end: null },
    ageRange: { min: null, max: null },
    workLocation: null,
    sortBy: 'employeeNumber',
    sortOrder: 'asc'
  }
};

// スキルカテゴリー
export const SKILL_CATEGORIES = [
  '技術',
  '言語',
  'マネジメント',
  'ビジネス',
  'デザイン',
  'マーケティング',
  '営業',
  '財務・経理',
  '法務',
  'その他'
];

// 勤務地リスト
export const WORK_LOCATIONS = [
  '本社',
  '東京支社',
  '大阪支社',
  '名古屋支社',
  '福岡支社',
  'リモート',
  '海外（アメリカ）',
  '海外（ヨーロッパ）',
  '海外（アジア）'
];

// 部署ID定数（ハードコード回避用）
export const DEPARTMENT_IDS = {
  EXECUTIVE: 'dept-executive',
  ENGINEERING: 'dept-engineering',
  SALES: 'dept-sales',
  MARKETING: 'dept-marketing',
  HR: 'dept-hr',
  FINANCE: 'dept-finance',
  // 開発部門
  FRONTEND: 'dept-frontend',
  BACKEND: 'dept-backend',
  MOBILE: 'dept-mobile',
  QA: 'dept-qa',
  // 営業部門
  SALES_ENTERPRISE: 'dept-sales-enterprise',
  SALES_RETAIL: 'dept-sales-retail',
  // チーム
  UI_TEAM: 'dept-ui-team',
  UX_TEAM: 'dept-ux-team'
};

// 役職ID定数
export const POSITION_IDS = {
  CEO: 'pos-ceo',
  CTO: 'pos-cto',
  DIRECTOR: 'pos-director',
  DEPT_MANAGER: 'pos-dept-manager',
  MANAGER: 'pos-manager',
  LEADER: 'pos-leader',
  SENIOR: 'pos-senior',
  REGULAR: 'pos-regular',
  JUNIOR: 'pos-junior'
};

// スキルID定数
export const SKILL_IDS = {
  // 技術系
  JAVASCRIPT: 'skill-js',
  TYPESCRIPT: 'skill-ts',
  PYTHON: 'skill-python',
  JAVA: 'skill-java',
  CSHARP: 'skill-csharp',
  REACT: 'skill-react',
  VUE: 'skill-vue',
  SVELTE: 'skill-svelte',
  NODEJS: 'skill-nodejs',
  SQL: 'skill-sql',
  AWS: 'skill-aws',
  DOCKER: 'skill-docker',
  KUBERNETES: 'skill-k8s',
  SWIFT: 'skill-swift',
  KOTLIN: 'skill-kotlin',
  REACT_NATIVE: 'skill-react-native',
  TESTING: 'skill-testing',
  AUTOMATION: 'skill-automation',
  // 言語系
  ENGLISH: 'skill-english',
  CHINESE: 'skill-chinese',
  KOREAN: 'skill-korean',
  // マネジメント系
  TEAM_MGMT: 'skill-team-mgmt',
  PROJECT_MGMT: 'skill-project-mgmt',
  AGILE: 'skill-agile',
  // ビジネス系
  SALES: 'skill-sales',
  MARKETING: 'skill-marketing',
  ACCOUNTING: 'skill-accounting',
  ANALYTICS: 'skill-analytics',
  NEGOTIATION: 'skill-negotiation',
  CUSTOMER_SERVICE: 'skill-customer-service',
  PRESENTATION: 'skill-presentation',
  HR: 'skill-hr',
  LAW: 'skill-law',
  FINANCE: 'skill-finance',
  EXCEL: 'skill-excel',
  // デザイン系
  UI_DESIGN: 'skill-ui-design',
  UX_DESIGN: 'skill-ux-design',
  FIGMA: 'skill-figma',
  CSS: 'skill-css',
  RESEARCH: 'skill-research'
};

// 部署の必要スキル定義（スキルギャップ分析用）
export const DEPARTMENT_REQUIRED_SKILLS = {
  [DEPARTMENT_IDS.FRONTEND]: [
    SKILL_IDS.REACT,
    SKILL_IDS.TYPESCRIPT,
    SKILL_IDS.FIGMA
  ],
  [DEPARTMENT_IDS.BACKEND]: [
    SKILL_IDS.JAVA,
    SKILL_IDS.PYTHON,
    SKILL_IDS.SQL
  ],
  [DEPARTMENT_IDS.MOBILE]: [
    SKILL_IDS.REACT_NATIVE,
    SKILL_IDS.SWIFT,
    SKILL_IDS.KOTLIN
  ],
  [DEPARTMENT_IDS.QA]: [
    SKILL_IDS.TESTING,
    SKILL_IDS.AUTOMATION
  ],
  [DEPARTMENT_IDS.SALES]: [
    SKILL_IDS.SALES,
    SKILL_IDS.ENGLISH
  ],
  [DEPARTMENT_IDS.MARKETING]: [
    SKILL_IDS.MARKETING,
    SKILL_IDS.ANALYTICS
  ]
};