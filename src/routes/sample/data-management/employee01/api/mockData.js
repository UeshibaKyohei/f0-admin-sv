// 社員管理システム用モックデータ生成

import { SKILL_CATEGORIES, WORK_LOCATIONS } from '../config.js';

// 部署データ
export const departments = [
  // 第1階層（本部レベル）
  { id: 'dept-executive', name: '経営陣', code: 'EXEC', description: '経営幹部', parentId: null, path: 'executive', level: 1, sortOrder: 1, managerId: 'emp-001', budget: 50000000, isActive: true },
  { id: 'dept-engineering', name: '開発本部', code: 'ENG', description: 'システム開発全般', parentId: null, path: 'engineering', level: 1, sortOrder: 2, managerId: 'emp-002', budget: 300000000, isActive: true },
  { id: 'dept-sales', name: '営業本部', code: 'SALES', description: '営業・販売活動', parentId: null, path: 'sales', level: 1, sortOrder: 3, managerId: 'emp-015', budget: 200000000, isActive: true },
  { id: 'dept-marketing', name: 'マーケティング本部', code: 'MKT', description: 'マーケティング戦略', parentId: null, path: 'marketing', level: 1, sortOrder: 4, managerId: 'emp-020', budget: 150000000, isActive: true },
  { id: 'dept-hr', name: '人事本部', code: 'HR', description: '人事・労務管理', parentId: null, path: 'hr', level: 1, sortOrder: 5, managerId: 'emp-025', budget: 80000000, isActive: true },
  { id: 'dept-finance', name: '財務本部', code: 'FIN', description: '財務・経理業務', parentId: null, path: 'finance', level: 1, sortOrder: 6, managerId: 'emp-030', budget: 60000000, isActive: true },
  
  // 第2階層（開発本部配下）
  { id: 'dept-frontend', name: 'フロントエンド開発部', code: 'FE', description: 'フロントエンド開発', parentId: 'dept-engineering', path: 'engineering/frontend', level: 2, sortOrder: 1, managerId: 'emp-003', budget: 80000000, isActive: true },
  { id: 'dept-backend', name: 'バックエンド開発部', code: 'BE', description: 'バックエンド開発', parentId: 'dept-engineering', path: 'engineering/backend', level: 2, sortOrder: 2, managerId: 'emp-007', budget: 100000000, isActive: true },
  { id: 'dept-mobile', name: 'モバイル開発部', code: 'MOB', description: 'モバイルアプリ開発', parentId: 'dept-engineering', path: 'engineering/mobile', level: 2, sortOrder: 3, managerId: 'emp-010', budget: 70000000, isActive: true },
  { id: 'dept-qa', name: 'QA部', code: 'QA', description: '品質保証・テスト', parentId: 'dept-engineering', path: 'engineering/qa', level: 2, sortOrder: 4, managerId: 'emp-012', budget: 50000000, isActive: true },
  
  // 第2階層（営業本部配下）
  { id: 'dept-sales-enterprise', name: '法人営業部', code: 'SALESE', description: '法人向け営業', parentId: 'dept-sales', path: 'sales/enterprise', level: 2, sortOrder: 1, managerId: 'emp-016', budget: 120000000, isActive: true },
  { id: 'dept-sales-retail', name: '個人営業部', code: 'SALESR', description: '個人向け営業', parentId: 'dept-sales', path: 'sales/retail', level: 2, sortOrder: 2, managerId: 'emp-018', budget: 80000000, isActive: true },
  
  // 第3階層（フロントエンド開発部配下）
  { id: 'dept-ui-team', name: 'UIチーム', code: 'UI', description: 'ユーザーインターフェース開発', parentId: 'dept-frontend', path: 'engineering/frontend/ui', level: 3, sortOrder: 1, managerId: 'emp-004', budget: 40000000, isActive: true },
  { id: 'dept-ux-team', name: 'UXチーム', code: 'UX', description: 'ユーザーエクスペリエンス設計', parentId: 'dept-frontend', path: 'engineering/frontend/ux', level: 3, sortOrder: 2, managerId: 'emp-006', budget: 40000000, isActive: true },
];

// 役職データ
export const positions = [
  { id: 'pos-ceo', name: '代表取締役', code: 'CEO', level: 10, description: '最高経営責任者', permissions: ['system:admin'], salaryRange: { min: 20000000, max: 50000000 }, isManagement: true, isActive: true },
  { id: 'pos-cto', name: '技術取締役', code: 'CTO', level: 9, description: '最高技術責任者', permissions: ['system:admin', 'employee:write'], salaryRange: { min: 15000000, max: 30000000 }, isManagement: true, isActive: true },
  { id: 'pos-director', name: '本部長', code: 'DIR', level: 8, description: '本部長', permissions: ['employee:read', 'employee:write', 'department:read'], salaryRange: { min: 12000000, max: 20000000 }, isManagement: true, isActive: true },
  { id: 'pos-dept-manager', name: '部長', code: 'DM', level: 7, description: '部長', permissions: ['employee:read', 'employee:write'], salaryRange: { min: 10000000, max: 15000000 }, isManagement: true, isActive: true },
  { id: 'pos-manager', name: '課長', code: 'MGR', level: 6, description: '課長・マネージャー', permissions: ['employee:read'], salaryRange: { min: 8000000, max: 12000000 }, isManagement: true, isActive: true },
  { id: 'pos-leader', name: 'リーダー', code: 'LDR', level: 4, description: 'チームリーダー', permissions: ['employee:read'], salaryRange: { min: 6000000, max: 10000000 }, isManagement: false, isActive: true },
  { id: 'pos-senior', name: 'シニア', code: 'SR', level: 3, description: 'シニアスタッフ', permissions: ['employee:read'], salaryRange: { min: 5000000, max: 8000000 }, isManagement: false, isActive: true },
  { id: 'pos-regular', name: '一般社員', code: 'REG', level: 2, description: '一般社員', permissions: ['employee:read'], salaryRange: { min: 3500000, max: 6000000 }, isManagement: false, isActive: true },
  { id: 'pos-junior', name: 'ジュニア', code: 'JR', level: 1, description: 'ジュニアスタッフ', permissions: ['employee:read'], salaryRange: { min: 2500000, max: 4000000 }, isManagement: false, isActive: true },
];

// スキルデータ
export const skills = [
  // 技術系
  { id: 'skill-js', name: 'JavaScript', category: '技術', description: 'JavaScript プログラミング', level: 'intermediate', color: 'badge-warning', isActive: true },
  { id: 'skill-ts', name: 'TypeScript', category: '技術', description: 'TypeScript プログラミング', level: 'intermediate', color: 'badge-info', isActive: true },
  { id: 'skill-python', name: 'Python', category: '技術', description: 'Python プログラミング', level: 'intermediate', color: 'badge-success', isActive: true },
  { id: 'skill-java', name: 'Java', category: '技術', description: 'Java プログラミング', level: 'intermediate', color: 'badge-error', isActive: true },
  { id: 'skill-csharp', name: 'C#', category: '技術', description: 'C# プログラミング', level: 'intermediate', color: 'badge-secondary', isActive: true },
  { id: 'skill-react', name: 'React', category: '技術', description: 'React フレームワーク', level: 'intermediate', color: 'badge-primary', isActive: true },
  { id: 'skill-vue', name: 'Vue.js', category: '技術', description: 'Vue.js フレームワーク', level: 'intermediate', color: 'badge-accent', isActive: true },
  { id: 'skill-svelte', name: 'Svelte', category: '技術', description: 'Svelte フレームワーク', level: 'advanced', color: 'badge-warning', isActive: true },
  { id: 'skill-nodejs', name: 'Node.js', category: '技術', description: 'Node.js 開発', level: 'intermediate', color: 'badge-success', isActive: true },
  { id: 'skill-sql', name: 'SQL', category: '技術', description: 'データベース設計・操作', level: 'intermediate', color: 'badge-ghost', isActive: true },
  { id: 'skill-aws', name: 'AWS', category: '技術', description: 'Amazon Web Services', level: 'intermediate', color: 'badge-warning', isActive: true },
  { id: 'skill-docker', name: 'Docker', category: '技術', description: 'コンテナ技術', level: 'intermediate', color: 'badge-info', isActive: true },
  { id: 'skill-k8s', name: 'Kubernetes', category: '技術', description: 'コンテナオーケストレーション', level: 'advanced', color: 'badge-primary', isActive: true },
  
  // 言語系
  { id: 'skill-english', name: '英語', category: '言語', description: 'ビジネス英語', level: 'intermediate', color: 'badge-accent', isActive: true },
  { id: 'skill-chinese', name: '中国語', category: '言語', description: '中国語（標準中国語）', level: 'beginner', color: 'badge-secondary', isActive: true },
  { id: 'skill-korean', name: '韓国語', category: '言語', description: '韓国語', level: 'beginner', color: 'badge-info', isActive: true },
  
  // マネジメント系
  { id: 'skill-team-mgmt', name: 'チーム管理', category: 'マネジメント', description: 'チームマネジメント', level: 'intermediate', color: 'badge-warning', isActive: true },
  { id: 'skill-project-mgmt', name: 'プロジェクト管理', category: 'マネジメント', description: 'プロジェクトマネジメント', level: 'intermediate', color: 'badge-info', isActive: true },
  { id: 'skill-agile', name: 'アジャイル開発', category: 'マネジメント', description: 'アジャイル・スクラム', level: 'intermediate', color: 'badge-primary', isActive: true },
  
  // ビジネス系
  { id: 'skill-sales', name: '営業', category: 'ビジネス', description: '営業スキル', level: 'intermediate', color: 'badge-success', isActive: true },
  { id: 'skill-marketing', name: 'マーケティング', category: 'ビジネス', description: 'マーケティング戦略', level: 'intermediate', color: 'badge-accent', isActive: true },
  { id: 'skill-accounting', name: '経理', category: 'ビジネス', description: '経理・会計', level: 'intermediate', color: 'badge-ghost', isActive: true },
  
  // デザイン系
  { id: 'skill-ui-design', name: 'UIデザイン', category: 'デザイン', description: 'ユーザーインターフェースデザイン', level: 'intermediate', color: 'badge-secondary', isActive: true },
  { id: 'skill-ux-design', name: 'UXデザイン', category: 'デザイン', description: 'ユーザーエクスペリエンスデザイン', level: 'intermediate', color: 'badge-primary', isActive: true },
  { id: 'skill-figma', name: 'Figma', category: 'デザイン', description: 'Figmaツール', level: 'intermediate', color: 'badge-error', isActive: true },
];

// 日本人の名前データ
const firstNames = ['太郎', '花子', '一郎', '美咲', '健太', '由美', '翔太', 'さくら', '大輔', '真理', '隆志', '麻衣', '博文', '智子', '雅人', '恵子', '慎一', '裕子', '和也', '絵美'];
const lastNames = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水'];
const firstNamesKana = ['タロウ', 'ハナコ', 'イチロウ', 'ミサキ', 'ケンタ', 'ユミ', 'ショウタ', 'サクラ', 'ダイスケ', 'マリ', 'タカシ', 'マイ', 'ヒロフミ', 'トモコ', 'マサト', 'ケイコ', 'シンイチ', 'ユウコ', 'カズヤ', 'エミ'];
const lastNamesKana = ['タナカ', 'サトウ', 'スズキ', 'タカハシ', 'ワタナベ', 'イトウ', 'ヤマモト', 'ナカムラ', 'コバヤシ', 'カトウ', 'ヨシダ', 'ヤマダ', 'ササキ', 'ヤマグチ', 'マツモト', 'イノウエ', 'キムラ', 'ハヤシ', 'サイトウ', 'シミズ'];

// アバター画像URL生成
function generateAvatarUrl(employeeNumber) {
  // UIアバター（シンプルなアバター生成サービス）
  return `https://ui-avatars.com/api/?name=${employeeNumber}&background=random&color=fff&size=128`;
}

// 入社日生成（過去5年以内）
function generateHireDate() {
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, 0, 1);
  const randomTime = fiveYearsAgo.getTime() + Math.random() * (now.getTime() - fiveYearsAgo.getTime());
  return new Date(randomTime);
}

// 生年月日生成（22歳〜65歳）
function generateBirthDate() {
  const now = new Date();
  const minAge = 22;
  const maxAge = 65;
  const age = minAge + Math.random() * (maxAge - minAge);
  return new Date(now.getFullYear() - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
}

// 社員データ生成
export function generateEmployees() {
  const employees = [];
  
  // 重要な社員（固定データ）
  const keyEmployees = [
    // 経営陣
    {
      id: 'emp-001',
      employeeNumber: 'CEO001',
      firstName: '太郎',
      lastName: '田中',
      firstNameKana: 'タロウ',
      lastNameKana: 'タナカ',
      email: 'tanaka.taro@company.com',
      phoneNumber: '090-1234-5678',
      departmentId: 'dept-executive',
      positionId: 'pos-ceo',
      skills: ['skill-team-mgmt', 'skill-project-mgmt', 'skill-english'],
      hireDate: new Date('2019-04-01'),
      birthDate: new Date('1975-03-15'),
      status: 'active',
      contractType: 'fulltime',
      salary: 25000000,
      workLocation: '本社',
      notes: '代表取締役CEO',
    },
    {
      id: 'emp-002',
      employeeNumber: 'CTO002',
      firstName: '一郎',
      lastName: '佐藤',
      firstNameKana: 'イチロウ',
      lastNameKana: 'サトウ',
      email: 'sato.ichiro@company.com',
      phoneNumber: '090-2345-6789',
      departmentId: 'dept-executive',
      positionId: 'pos-cto',
      skills: ['skill-js', 'skill-python', 'skill-aws', 'skill-team-mgmt', 'skill-agile'],
      hireDate: new Date('2020-01-15'),
      birthDate: new Date('1980-07-22'),
      status: 'active',
      contractType: 'fulltime',
      salary: 18000000,
      workLocation: '本社',
      notes: '技術担当取締役',
    },
    // 各本部長
    {
      id: 'emp-015',
      employeeNumber: 'DIR015',
      firstName: '花子',
      lastName: '高橋',
      firstNameKana: 'ハナコ',
      lastNameKana: 'タカハシ',
      email: 'takahashi.hanako@company.com',
      phoneNumber: '090-1234-0015',
      departmentId: 'dept-sales',
      positionId: 'pos-director',
      skills: ['skill-team-mgmt', 'skill-sales', 'skill-presentation'],
      hireDate: new Date('2020-06-01'),
      birthDate: new Date('1978-09-12'),
      status: 'active',
      contractType: 'fulltime',
      salary: 14000000,
      workLocation: '本社',
      notes: '営業本部長',
    },
    {
      id: 'emp-020',
      employeeNumber: 'DIR020',
      firstName: '次郎',
      lastName: '山田',
      firstNameKana: 'ジロウ',
      lastNameKana: 'ヤマダ',
      email: 'yamada.jiro@company.com',
      phoneNumber: '090-1234-0020',
      departmentId: 'dept-marketing',
      positionId: 'pos-director',
      skills: ['skill-marketing', 'skill-team-mgmt', 'skill-analytics'],
      hireDate: new Date('2020-08-01'),
      birthDate: new Date('1982-01-28'),
      status: 'active',
      contractType: 'fulltime',
      salary: 13000000,
      workLocation: '本社',
      notes: 'マーケティング本部長',
    },
    {
      id: 'emp-025',
      employeeNumber: 'DIR025',
      firstName: '美香',
      lastName: '中村',
      firstNameKana: 'ミカ',
      lastNameKana: 'ナカムラ',
      email: 'nakamura.mika@company.com',
      phoneNumber: '090-1234-0025',
      departmentId: 'dept-hr',
      positionId: 'pos-director',
      skills: ['skill-team-mgmt', 'skill-hr', 'skill-law'],
      hireDate: new Date('2021-01-01'),
      birthDate: new Date('1979-05-15'),
      status: 'active',
      contractType: 'fulltime',
      salary: 12000000,
      workLocation: '本社',
      notes: '人事本部長',
    },
    {
      id: 'emp-030',
      employeeNumber: 'DIR030',
      firstName: '健太',
      lastName: '伊藤',
      firstNameKana: 'ケンタ',
      lastNameKana: 'イトウ',
      email: 'ito.kenta@company.com',
      phoneNumber: '090-1234-0030',
      departmentId: 'dept-finance',
      positionId: 'pos-director',
      skills: ['skill-finance', 'skill-team-mgmt', 'skill-excel'],
      hireDate: new Date('2020-10-01'),
      birthDate: new Date('1981-11-03'),
      status: 'active',
      contractType: 'fulltime',
      salary: 12500000,
      workLocation: '本社',
      notes: '財務本部長',
    },
    // 開発本部の部長たち
    {
      id: 'emp-003',
      employeeNumber: 'FE003',
      firstName: '美咲',
      lastName: '鈴木',
      firstNameKana: 'ミサキ',
      lastNameKana: 'スズキ',
      email: 'suzuki.misaki@company.com',
      phoneNumber: '090-3456-7890',
      departmentId: 'dept-frontend',
      positionId: 'pos-dept-manager',
      skills: ['skill-react', 'skill-ts', 'skill-figma', 'skill-team-mgmt'],
      hireDate: new Date('2020-07-01'),
      birthDate: new Date('1985-11-08'),
      status: 'active',
      contractType: 'fulltime',
      salary: 12000000,
      workLocation: '本社',
      notes: 'フロントエンド開発部長',
    },
    {
      id: 'emp-007',
      employeeNumber: 'BE007',
      firstName: '雄大',
      lastName: '渡辺',
      firstNameKana: 'ユウダイ',
      lastNameKana: 'ワタナベ',
      email: 'watanabe.yudai@company.com',
      phoneNumber: '090-3456-0007',
      departmentId: 'dept-backend',
      positionId: 'pos-dept-manager',
      skills: ['skill-java', 'skill-python', 'skill-sql', 'skill-aws', 'skill-team-mgmt'],
      hireDate: new Date('2020-09-01'),
      birthDate: new Date('1983-04-18'),
      status: 'active',
      contractType: 'fulltime',
      salary: 11500000,
      workLocation: '本社',
      notes: 'バックエンド開発部長',
    },
    {
      id: 'emp-010',
      employeeNumber: 'MOB010',
      firstName: '麻衣',
      lastName: '加藤',
      firstNameKana: 'マイ',
      lastNameKana: 'カトウ',
      email: 'kato.mai@company.com',
      phoneNumber: '090-3456-0010',
      departmentId: 'dept-mobile',
      positionId: 'pos-dept-manager',
      skills: ['skill-swift', 'skill-kotlin', 'skill-react-native', 'skill-team-mgmt'],
      hireDate: new Date('2021-02-01'),
      birthDate: new Date('1986-12-25'),
      status: 'active',
      contractType: 'fulltime',
      salary: 11000000,
      workLocation: '本社',
      notes: 'モバイル開発部長',
    },
    {
      id: 'emp-012',
      employeeNumber: 'QA012',
      firstName: '翔太',
      lastName: '小林',
      firstNameKana: 'ショウタ',
      lastNameKana: 'コバヤシ',
      email: 'kobayashi.shota@company.com',
      phoneNumber: '090-3456-0012',
      departmentId: 'dept-qa',
      positionId: 'pos-dept-manager',
      skills: ['skill-testing', 'skill-automation', 'skill-team-mgmt'],
      hireDate: new Date('2021-05-01'),
      birthDate: new Date('1984-08-14'),
      status: 'active',
      contractType: 'fulltime',
      salary: 10500000,
      workLocation: '本社',
      notes: 'QA部長',
    },
    // チームリーダーたち
    {
      id: 'emp-004',
      employeeNumber: 'UI004',
      firstName: '直樹',
      lastName: '松本',
      firstNameKana: 'ナオキ',
      lastNameKana: 'マツモト',
      email: 'matsumoto.naoki@company.com',
      phoneNumber: '090-3456-0004',
      departmentId: 'dept-ui-team',
      positionId: 'pos-manager',
      skills: ['skill-react', 'skill-figma', 'skill-css', 'skill-team-mgmt'],
      hireDate: new Date('2021-07-01'),
      birthDate: new Date('1987-02-10'),
      status: 'active',
      contractType: 'fulltime',
      salary: 9000000,
      workLocation: '本社',
      notes: 'UIチームリーダー',
    },
    {
      id: 'emp-006',
      employeeNumber: 'UX006',
      firstName: '恵美',
      lastName: '井上',
      firstNameKana: 'エミ',
      lastNameKana: 'イノウエ',
      email: 'inoue.emi@company.com',
      phoneNumber: '090-3456-0006',
      departmentId: 'dept-ux-team',
      positionId: 'pos-manager',
      skills: ['skill-ux-design', 'skill-figma', 'skill-research', 'skill-team-mgmt'],
      hireDate: new Date('2021-08-01'),
      birthDate: new Date('1988-06-22'),
      status: 'active',
      contractType: 'fulltime',
      salary: 8800000,
      workLocation: '本社',
      notes: 'UXチームリーダー',
    },
    // 営業部長たち
    {
      id: 'emp-016',
      employeeNumber: 'SE016',
      firstName: '拓也',
      lastName: '木村',
      firstNameKana: 'タクヤ',
      lastNameKana: 'キムラ',
      email: 'kimura.takuya@company.com',
      phoneNumber: '090-3456-0016',
      departmentId: 'dept-sales-enterprise',
      positionId: 'pos-dept-manager',
      skills: ['skill-sales', 'skill-negotiation', 'skill-team-mgmt'],
      hireDate: new Date('2021-03-01'),
      birthDate: new Date('1985-10-05'),
      status: 'active',
      contractType: 'fulltime',
      salary: 11000000,
      workLocation: '本社',
      notes: '法人営業部長',
    },
    {
      id: 'emp-018',
      employeeNumber: 'SR018',
      firstName: '絵里',
      lastName: '森田',
      firstNameKana: 'エリ',
      lastNameKana: 'モリタ',
      email: 'morita.eri@company.com',
      phoneNumber: '090-3456-0018',
      departmentId: 'dept-sales-retail',
      positionId: 'pos-dept-manager',
      skills: ['skill-sales', 'skill-customer-service', 'skill-team-mgmt'],
      hireDate: new Date('2021-04-01'),
      birthDate: new Date('1987-07-30'),
      status: 'active',
      contractType: 'fulltime',
      salary: 10500000,
      workLocation: '本社',
      notes: '個人営業部長',
    }
  ];
  
  employees.push(...keyEmployees);
  
  // 既存のIDを記録
  const existingIds = new Set(employees.map(emp => emp.id));
  
  // 残りの社員を自動生成
  const totalEmployees = 50;
  const departmentIds = departments.filter(d => d.level >= 2).map(d => d.id); // 実際の作業部署のみ
  const positionIds = ['pos-junior', 'pos-regular', 'pos-senior', 'pos-leader'];
  const contractTypes = ['fulltime', 'parttime', 'contract'];
  const statuses = ['active', 'inactive'];
  
  let generatedCount = 0;
  let idCounter = 50; // keyEmployeesより十分大きな数から開始
  
  while (employees.length < totalEmployees) {
    // ユニークなIDを生成
    let empId;
    do {
      idCounter++;
      empId = `emp-${String(idCounter).padStart(3, '0')}`;
    } while (existingIds.has(empId));
    
    existingIds.add(empId);
    
    const employeeNumber = `EMP${String(idCounter).padStart(3, '0')}`;
    const firstNameIndex = Math.floor(Math.random() * firstNames.length);
    const lastNameIndex = Math.floor(Math.random() * lastNames.length);
    const departmentId = departmentIds[Math.floor(Math.random() * departmentIds.length)];
    const positionId = positionIds[Math.floor(Math.random() * positionIds.length)];
    const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
    const status = Math.random() > 0.1 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)];
    
    // スキルをランダムに2-5個選択
    const numberOfSkills = 2 + Math.floor(Math.random() * 4);
    const selectedSkills = [];
    while (selectedSkills.length < numberOfSkills) {
      const skill = skills[Math.floor(Math.random() * skills.length)];
      if (!selectedSkills.includes(skill.id)) {
        selectedSkills.push(skill.id);
      }
    }
    
    const firstName = firstNames[firstNameIndex];
    const lastName = lastNames[lastNameIndex];
    const firstNameKana = firstNamesKana[firstNameIndex];
    const lastNameKana = lastNamesKana[lastNameIndex];
    
    employees.push({
      id: empId,
      employeeNumber,
      firstName,
      lastName,
      firstNameKana,
      lastNameKana,
      email: `${lastName.toLowerCase()}.${firstName.toLowerCase()}${idCounter}@company.com`,
      phoneNumber: `090-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      departmentId,
      positionId,
      skills: selectedSkills,
      hireDate: generateHireDate(),
      birthDate: generateBirthDate(),
      avatar: generateAvatarUrl(employeeNumber),
      status,
      contractType,
      salary: Math.floor(Math.random() * 3000000) + 2500000, // 250万〜550万
      workLocation: WORK_LOCATIONS[Math.floor(Math.random() * WORK_LOCATIONS.length)],
      emergencyContact: {
        name: `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`,
        relationship: ['配偶者', '父', '母', '兄弟', '姉妹'][Math.floor(Math.random() * 5)],
        phoneNumber: `090-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `emergency${idCounter}@example.com`
      },
      notes: Math.random() > 0.7 ? 'サンプル備考' : '',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    generatedCount++;
  }
  
  // 重複チェック
  const allIds = employees.map(emp => emp.id);
  const uniqueIds = new Set(allIds);
  if (allIds.length !== uniqueIds.size) {
    const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    console.error('社員IDに重複があります!', duplicates);
  }
  
  return employees;
}

// 職歴データ生成
export function generateWorkHistory(employees) {
  const history = [];
  
  employees.forEach(employee => {
    // 全員に入社時の職歴を追加
    history.push({
      id: `work-${employee.id}-initial`,
      employeeId: employee.id,
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      startDate: employee.hireDate,
      endDate: null, // 現職
      reason: '入社',
      notes: '入社時の配属',
      createdAt: new Date()
    });
    
    // 一部の社員には異動履歴を追加
    if (Math.random() > 0.7) {
      const previousDept = departments[Math.floor(Math.random() * departments.length)].id;
      const previousPos = positions[Math.floor(Math.random() * positions.length)].id;
      const moveDate = new Date(employee.hireDate.getTime() + Math.random() * (Date.now() - employee.hireDate.getTime()));
      
      // 前の職歴を終了
      history[history.length - 1].endDate = moveDate;
      
      // 新しい職歴を追加
      history.push({
        id: `work-${employee.id}-move1`,
        employeeId: employee.id,
        departmentId: employee.departmentId,
        positionId: employee.positionId,
        startDate: moveDate,
        endDate: null,
        reason: '人事異動',
        notes: '組織変更に伴う異動',
        createdAt: new Date()
      });
    }
  });
  
  return history;
}

// 社員スキル関連データ生成
export function generateEmployeeSkills(employees) {
  const employeeSkills = [];
  
  employees.forEach(employee => {
    employee.skills.forEach(skillId => {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const isCertified = Math.random() > 0.7;
      
      employeeSkills.push({
        employeeId: employee.id,
        skillId,
        level,
        certifiedDate: isCertified ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) : null,
        expiryDate: isCertified && Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000) : null,
        notes: Math.random() > 0.8 ? 'サンプル備考' : '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  });
  
  return employeeSkills;
}