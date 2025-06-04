/**
 * APIサービス層
 * 
 * このファイルは実際のAPI通信を管理します。
 * モックモードではモックデータを返し、本番モードでは実際のAPIを呼び出します。
 * 
 * 本番実装時の注意点:
 * 1. axiosやfetch APIを使用してHTTP通信を実装
 * 2. エラーハンドリングとリトライロジックの実装
 * 3. 認証トークンの管理（ヘッダーへの付与）
 * 4. レスポンスの型チェックとバリデーション
 */

import { CONFIG } from '../config.js';
import { 
  generateEmployees, 
  generateWorkHistory, 
  generateEmployeeSkills,
  departments,
  positions,
  skills
} from './mockData.js';
import {
  employeeStorage,
  departmentStorage,
  positionStorage,
  skillStorage,
  employeeSkillStorage,
  workHistoryStorage
} from './localStorage.js';

// APIエンドポイント定義
const API_ENDPOINTS = {
  // 社員関連
  EMPLOYEES: '/employees',
  EMPLOYEE_BY_ID: '/employees/:id',
  EMPLOYEE_SKILLS: '/employees/:id/skills',
  EMPLOYEE_HISTORY: '/employees/:id/history',
  
  // 部署関連
  DEPARTMENTS: '/departments',
  DEPARTMENT_BY_ID: '/departments/:id',
  DEPARTMENT_EMPLOYEES: '/departments/:id/employees',
  
  // 役職関連
  POSITIONS: '/positions',
  POSITION_BY_ID: '/positions/:id',
  
  // スキル関連
  SKILLS: '/skills',
  SKILL_BY_ID: '/skills/:id',
  SKILL_EMPLOYEES: '/skills/:id/employees',
  
  // 統計関連
  STATISTICS: '/statistics',
  SKILL_GAPS: '/statistics/skill-gaps',
  DEPARTMENT_STATS: '/statistics/departments'
};

/**
 * HTTPリクエストを実行する基本関数
 * 本番実装では実際のHTTP通信を行う
 */
async function apiRequest(method, endpoint, data = null, params = {}) {
  if (CONFIG.IS_MOCK_MODE) {
    // モックモードではローカルストレージから取得
    return mockApiRequest(method, endpoint, data, params);
  }
  
  // 本番実装例：
  // const url = `${CONFIG.API.BASE_URL}${endpoint}`;
  // const response = await fetch(url, {
  //   method,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${getAuthToken()}`
  //   },
  //   body: data ? JSON.stringify(data) : null
  // });
  // 
  // if (!response.ok) {
  //   throw new ApiError(response.status, await response.text());
  // }
  // 
  // return await response.json();
  
  throw new Error('本番APIは未実装です');
}

/**
 * モックAPIリクエストハンドラー
 */
async function mockApiRequest(method, endpoint, data, params) {
  // 遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // エンドポイントに応じて処理を分岐
  switch (true) {
    // 社員一覧
    case endpoint === API_ENDPOINTS.EMPLOYEES && method === 'GET':
      return {
        data: employeeStorage.load(),
        total: employeeStorage.load().length,
        page: params.page || 1,
        pageSize: params.pageSize || 20
      };
    
    // 社員作成
    case endpoint === API_ENDPOINTS.EMPLOYEES && method === 'POST':
      const newEmployee = {
        id: `emp-${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      employeeStorage.saveOne(newEmployee);
      return { data: newEmployee };
    
    // 社員更新
    case endpoint.includes('/employees/') && method === 'PUT':
      const updateId = endpoint.split('/').pop();
      const existingEmployee = employeeStorage.getById(updateId);
      if (!existingEmployee) {
        throw new Error('社員が見つかりません');
      }
      const updatedEmployee = { ...existingEmployee, ...data, updatedAt: new Date() };
      employeeStorage.saveOne(updatedEmployee);
      return { data: updatedEmployee };
    
    // 社員削除
    case endpoint.includes('/employees/') && method === 'DELETE':
      const deleteId = endpoint.split('/').pop();
      employeeStorage.deleteOne(deleteId);
      return { success: true };
    
    // 部署一覧
    case endpoint === API_ENDPOINTS.DEPARTMENTS && method === 'GET':
      return { data: departmentStorage.load() };
    
    // 役職一覧
    case endpoint === API_ENDPOINTS.POSITIONS && method === 'GET':
      return { data: positionStorage.load() };
    
    // スキル一覧
    case endpoint === API_ENDPOINTS.SKILLS && method === 'GET':
      return { data: skillStorage.load() };
    
    // 社員スキル取得
    case endpoint.includes('/employees/') && endpoint.includes('/skills') && method === 'GET':
      const empId = endpoint.match(/employees\/([^/]+)/)[1];
      return { data: employeeSkillStorage.getByEmployeeId(empId) };
    
    // 社員スキル更新
    case endpoint.includes('/employees/') && endpoint.includes('/skills') && method === 'PUT':
      const empSkillId = endpoint.match(/employees\/([^/]+)/)[1];
      employeeSkillStorage.updateEmployeeSkills(empSkillId, data);
      return { success: true };
    
    default:
      throw new Error(`未実装のAPIエンドポイント: ${method} ${endpoint}`);
  }
}

/**
 * 社員API
 */
export const employeeApi = {
  // 社員一覧取得
  async getAll(params = {}) {
    return await apiRequest('GET', API_ENDPOINTS.EMPLOYEES, null, params);
  },
  
  // 社員詳細取得
  async getById(id) {
    const endpoint = API_ENDPOINTS.EMPLOYEE_BY_ID.replace(':id', id);
    return await apiRequest('GET', endpoint);
  },
  
  // 社員作成
  async create(employeeData) {
    return await apiRequest('POST', API_ENDPOINTS.EMPLOYEES, employeeData);
  },
  
  // 社員更新
  async update(id, employeeData) {
    const endpoint = API_ENDPOINTS.EMPLOYEE_BY_ID.replace(':id', id);
    return await apiRequest('PUT', endpoint, employeeData);
  },
  
  // 社員削除
  async delete(id) {
    const endpoint = API_ENDPOINTS.EMPLOYEE_BY_ID.replace(':id', id);
    return await apiRequest('DELETE', endpoint);
  },
  
  // 社員一括削除
  async deleteMany(ids) {
    // 本番では一括削除APIを使用
    if (CONFIG.IS_MOCK_MODE) {
      employeeStorage.deleteMany(ids);
      return { success: true };
    }
    return await apiRequest('POST', `${API_ENDPOINTS.EMPLOYEES}/bulk-delete`, { ids });
  },
  
  // 社員スキル取得
  async getSkills(employeeId) {
    const endpoint = API_ENDPOINTS.EMPLOYEE_SKILLS.replace(':id', employeeId);
    return await apiRequest('GET', endpoint);
  },
  
  // 社員スキル更新
  async updateSkills(employeeId, skills) {
    const endpoint = API_ENDPOINTS.EMPLOYEE_SKILLS.replace(':id', employeeId);
    return await apiRequest('PUT', endpoint, skills);
  },
  
  // 職歴取得
  async getHistory(employeeId) {
    const endpoint = API_ENDPOINTS.EMPLOYEE_HISTORY.replace(':id', employeeId);
    return await apiRequest('GET', endpoint);
  }
};

/**
 * 部署API
 */
export const departmentApi = {
  // 部署一覧取得
  async getAll() {
    return await apiRequest('GET', API_ENDPOINTS.DEPARTMENTS);
  },
  
  // 部署詳細取得
  async getById(id) {
    const endpoint = API_ENDPOINTS.DEPARTMENT_BY_ID.replace(':id', id);
    return await apiRequest('GET', endpoint);
  },
  
  // 部署作成
  async create(departmentData) {
    return await apiRequest('POST', API_ENDPOINTS.DEPARTMENTS, departmentData);
  },
  
  // 部署更新
  async update(id, departmentData) {
    const endpoint = API_ENDPOINTS.DEPARTMENT_BY_ID.replace(':id', id);
    return await apiRequest('PUT', endpoint, departmentData);
  },
  
  // 部署削除
  async delete(id) {
    const endpoint = API_ENDPOINTS.DEPARTMENT_BY_ID.replace(':id', id);
    return await apiRequest('DELETE', endpoint);
  },
  
  // 部署の社員取得
  async getEmployees(departmentId) {
    const endpoint = API_ENDPOINTS.DEPARTMENT_EMPLOYEES.replace(':id', departmentId);
    return await apiRequest('GET', endpoint);
  }
};

/**
 * 役職API
 */
export const positionApi = {
  // 役職一覧取得
  async getAll() {
    return await apiRequest('GET', API_ENDPOINTS.POSITIONS);
  },
  
  // 役職詳細取得
  async getById(id) {
    const endpoint = API_ENDPOINTS.POSITION_BY_ID.replace(':id', id);
    return await apiRequest('GET', endpoint);
  },
  
  // 役職作成
  async create(positionData) {
    return await apiRequest('POST', API_ENDPOINTS.POSITIONS, positionData);
  },
  
  // 役職更新
  async update(id, positionData) {
    const endpoint = API_ENDPOINTS.POSITION_BY_ID.replace(':id', id);
    return await apiRequest('PUT', endpoint, positionData);
  },
  
  // 役職削除
  async delete(id) {
    const endpoint = API_ENDPOINTS.POSITION_BY_ID.replace(':id', id);
    return await apiRequest('DELETE', endpoint);
  }
};

/**
 * スキルAPI
 */
export const skillApi = {
  // スキル一覧取得
  async getAll() {
    return await apiRequest('GET', API_ENDPOINTS.SKILLS);
  },
  
  // スキル詳細取得
  async getById(id) {
    const endpoint = API_ENDPOINTS.SKILL_BY_ID.replace(':id', id);
    return await apiRequest('GET', endpoint);
  },
  
  // スキル作成
  async create(skillData) {
    return await apiRequest('POST', API_ENDPOINTS.SKILLS, skillData);
  },
  
  // スキル更新
  async update(id, skillData) {
    const endpoint = API_ENDPOINTS.SKILL_BY_ID.replace(':id', id);
    return await apiRequest('PUT', endpoint, skillData);
  },
  
  // スキル削除
  async delete(id) {
    const endpoint = API_ENDPOINTS.SKILL_BY_ID.replace(':id', id);
    return await apiRequest('DELETE', endpoint);
  },
  
  // スキル保有者取得
  async getEmployees(skillId) {
    const endpoint = API_ENDPOINTS.SKILL_EMPLOYEES.replace(':id', skillId);
    return await apiRequest('GET', endpoint);
  }
};

/**
 * 統計API
 */
export const statisticsApi = {
  // 統計情報取得
  async getOverview() {
    return await apiRequest('GET', API_ENDPOINTS.STATISTICS);
  },
  
  // スキルギャップ分析
  async getSkillGaps() {
    return await apiRequest('GET', API_ENDPOINTS.SKILL_GAPS);
  },
  
  // 部署統計
  async getDepartmentStats() {
    return await apiRequest('GET', API_ENDPOINTS.DEPARTMENT_STATS);
  }
};

/**
 * 初期データセットアップ（モック用）
 * 本番環境では使用しない
 */
export async function setupMockData() {
  if (!CONFIG.IS_MOCK_MODE) {
    throw new Error('setupMockDataはモックモードでのみ使用可能です');
  }
  
  const employees = generateEmployees();
  const workHistory = generateWorkHistory(employees);
  const employeeSkills = generateEmployeeSkills(employees);
  
  // データを保存
  departmentStorage.save(departments);
  positionStorage.save(positions);
  skillStorage.save(skills);
  employeeStorage.save(employees);
  employeeSkillStorage.save(employeeSkills);
  workHistoryStorage.save(workHistory);
  
  return {
    employees: employees.length,
    departments: departments.length,
    positions: positions.length,
    skills: skills.length
  };
}

/**
 * モックデータリセット（開発用）
 * 本番環境では使用しない
 */
export async function resetMockData() {
  if (!CONFIG.IS_MOCK_MODE) {
    throw new Error('resetMockDataはモックモードでのみ使用可能です');
  }
  
  // すべてのデータをクリア
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('hr_')) {
      localStorage.removeItem(key);
    }
  });
  
  // 新しいデータを生成
  return await setupMockData();
}