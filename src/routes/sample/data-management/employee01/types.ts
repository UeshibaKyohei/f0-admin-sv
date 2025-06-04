// 社員管理システム関連の型定義

export interface Employee {
  id: string;
  employeeNumber: string;                      // 社員番号
  firstName: string;                           // 名
  lastName: string;                            // 姓
  firstNameKana: string;                       // 名（カナ）
  lastNameKana: string;                        // 姓（カナ）
  email: string;                               // メールアドレス
  phoneNumber?: string;                        // 電話番号
  departmentId: string;                        // 部署ID
  positionId: string;                          // 役職ID
  skills: string[];                            // スキルID配列
  hireDate: Date;                              // 入社日
  birthDate?: Date;                            // 生年月日
  avatar?: string;                             // プロフィール画像URL
  status: 'active' | 'inactive' | 'retired';   // 在籍状況
  contractType: 'fulltime' | 'parttime' | 'contract' | 'intern'; // 雇用形態
  salary?: number;                             // 基本給（管理者のみ表示）
  workLocation: string;                        // 勤務地
  emergencyContact?: EmergencyContact;         // 緊急連絡先
  notes?: string;                              // 備考
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;                                // 部署名
  code: string;                                // 部署コード（例: "DEV001"）
  description?: string;                        // 部署説明
  parentId: string | null;                     // 親部署ID（自己参照）
  managerId?: string;                          // 部署長の社員ID
  level: number;                               // 階層レベル（0がルート）
  path: string;                                // パス（例: "company/engineering/backend"）
  sortOrder: number;                           // 表示順序
  budget?: number;                             // 部署予算
  isActive: boolean;                           // 有効フラグ
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  name: string;                                // 役職名
  code: string;                                // 役職コード
  level: number;                               // 役職レベル（1-10、数字が大きいほど上位）
  description?: string;                        // 役職説明
  permissions: string[];                       // 権限ID配列
  salaryRange?: {                              // 給与レンジ
    min: number;
    max: number;
  };
  isManagement: boolean;                       // 管理職フラグ
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;                                // スキル名
  category: string;                            // スキルカテゴリー
  description?: string;                        // スキル説明
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // 推奨レベル
  color: string;                               // 表示色クラス
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSkill {
  employeeId: string;
  skillId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // 習熟度
  certifiedDate?: Date;                        // 認定日
  expiryDate?: Date;                           // 有効期限
  notes?: string;                              // 備考
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkHistory {
  id: string;
  employeeId: string;
  departmentId: string;
  positionId: string;
  startDate: Date;                             // 開始日
  endDate?: Date;                              // 終了日（現職の場合はnull）
  reason?: string;                             // 異動理由
  notes?: string;                              // 備考
  createdAt: Date;
}

export interface EmergencyContact {
  name: string;                                // 連絡先氏名
  relationship: string;                        // 続柄
  phoneNumber: string;                         // 電話番号
  email?: string;                              // メールアドレス
  address?: string;                            // 住所
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;                                  // 勤務日
  clockIn?: Date;                              // 出勤時刻
  clockOut?: Date;                             // 退勤時刻
  breakMinutes: number;                        // 休憩時間（分）
  workMinutes: number;                         // 実働時間（分）
  overtimeMinutes: number;                     // 残業時間（分）
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'holiday'; // 勤怠状況
  notes?: string;                              // 備考
  createdAt: Date;
  updatedAt: Date;
}

// フィルター関連の型
export interface EmployeeFilters {
  search: string;                              // 名前・社員番号での検索
  departmentId: string | null;                 // 部署フィルター
  positionId: string | null;                   // 役職フィルター
  skills: string[];                            // スキルフィルター
  contractType: string[];                      // 雇用形態フィルター
  status: string[];                            // 在籍状況フィルター
  hireYearRange: {                             // 入社年範囲
    start: number | null;
    end: number | null;
  };
  ageRange: {                                  // 年齢範囲
    min: number | null;
    max: number | null;
  };
  workLocation: string | null;                 // 勤務地フィルター
  sortBy: 'name' | 'employeeNumber' | 'hireDate' | 'department' | 'position';
  sortOrder: 'asc' | 'desc';
}

// UI関連の型
export interface EmployeeUIState {
  viewMode: 'list' | 'grid' | 'org_chart' | 'skill_matrix'; // 表示モード
  selectedEmployees: string[];                 // 選択された社員ID
  isLoading: boolean;
  error: string | null;
  expandedDepartments: string[];               // 展開された部署（組織図用）
}

// 組織図用の型
export interface OrgChartNode {
  employee: Employee;
  department: Department;
  position: Position;
  subordinates: OrgChartNode[];                // 部下
  level: number;                               // 組織図上の階層
}

// スキルマトリックス用の型
export interface SkillMatrixData {
  employee: Employee;
  skills: {
    skill: Skill;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    certified?: boolean;
  }[];
}

// CSV インポート/エクスポート用の型
export interface EmployeeCSVData {
  employeeNumber: string;
  lastName: string;
  firstName: string;
  email: string;
  departmentCode: string;
  positionCode: string;
  hireDate: string;
  status: string;
  contractType: string;
}

// 統計データの型
export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  averageAge: number;
  averageTenure: number;                       // 平均勤続年数
  departmentCounts: { [departmentId: string]: number };
  positionCounts: { [positionId: string]: number };
  contractTypeCounts: { [type: string]: number };
  skillCounts: { [skillId: string]: number };
  turnoverRate: number;                        // 離職率（年率）
}