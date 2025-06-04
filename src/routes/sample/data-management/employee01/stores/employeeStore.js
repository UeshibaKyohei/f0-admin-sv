// 社員管理システム データストア

import { writable, derived } from 'svelte/store';
import { employeeStorage, departmentStorage, positionStorage, skillStorage, employeeSkillStorage, workHistoryStorage, initializeData, forceInitializeData, calculateStatistics } from '../api/localStorage.js';
import { generateEmployees, generateWorkHistory, generateEmployeeSkills, departments, positions, skills } from '../api/mockData.js';
import { CONFIG } from '../config.js';

// 基本データストア
export const employees = writable([]);
export const departmentList = writable([]);
export const positionList = writable([]);
export const skillList = writable([]);
export const employeeSkills = writable([]);
export const workHistory = writable([]);

// 読み込み状態管理
export const isLoading = writable(false);
export const error = writable(null);

// フィルター状態
export const filters = writable({
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
});

// 派生ストア: 部署をマップ形式で取得
export const departmentMap = derived(departmentList, ($departments) => {
  const map = new Map();
  $departments.forEach(dept => {
    map.set(dept.id, dept);
  });
  return map;
});

// 派生ストア: 役職をマップ形式で取得
export const positionMap = derived(positionList, ($positions) => {
  const map = new Map();
  $positions.forEach(pos => {
    map.set(pos.id, pos);
  });
  return map;
});

// 派生ストア: スキルをマップ形式で取得
export const skillMap = derived(skillList, ($skills) => {
  const map = new Map();
  $skills.forEach(skill => {
    map.set(skill.id, skill);
  });
  return map;
});

// 派生ストア: 社員スキルマップ（社員ID → スキル配列）
export const employeeSkillMap = derived(
  [employeeSkills, skillMap],
  ([$employeeSkills, $skillMap]) => {
    const map = new Map();
    $employeeSkills.forEach(es => {
      if (!map.has(es.employeeId)) {
        map.set(es.employeeId, []);
      }
      const skill = $skillMap.get(es.skillId);
      if (skill) {
        map.get(es.employeeId).push({
          ...es,
          skill
        });
      }
    });
    return map;
  }
);

// 派生ストア: フィルタリング済み社員リスト
export const filteredEmployees = derived(
  [employees, filters, departmentMap, positionMap, skillMap, employeeSkillMap],
  ([$employees, $filters, $departmentMap, $positionMap, $skillMap, $employeeSkillMap]) => {
    let filtered = [...$employees];

    // テキスト検索
    if ($filters.search?.trim()) {
      const searchTerm = $filters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm) ||
        emp.firstNameKana.toLowerCase().includes(searchTerm) ||
        emp.lastNameKana.toLowerCase().includes(searchTerm) ||
        emp.employeeNumber.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm)
      );
    }

    // 部署フィルター
    if ($filters.departmentId) {
      filtered = filtered.filter(emp => emp.departmentId === $filters.departmentId);
    }

    // 役職フィルター
    if ($filters.positionId) {
      filtered = filtered.filter(emp => emp.positionId === $filters.positionId);
    }

    // スキルフィルター
    if ($filters.skills?.length > 0) {
      filtered = filtered.filter(emp => {
        const empSkills = $employeeSkillMap.get(emp.id) || [];
        return $filters.skills.some(skillId => 
          empSkills.some(es => es.skillId === skillId)
        );
      });
    }

    // 雇用形態フィルター
    if ($filters.contractType?.length > 0) {
      filtered = filtered.filter(emp => $filters.contractType.includes(emp.contractType));
    }

    // 在籍状況フィルター
    if ($filters.status?.length > 0) {
      filtered = filtered.filter(emp => $filters.status.includes(emp.status));
    }

    // 入社年範囲フィルター
    if ($filters.hireYearRange?.start !== null || $filters.hireYearRange?.end !== null) {
      filtered = filtered.filter(emp => {
        const hireYear = new Date(emp.hireDate).getFullYear();
        const { start, end } = $filters.hireYearRange;
        return (start === null || hireYear >= start) && (end === null || hireYear <= end);
      });
    }

    // 年齢範囲フィルター
    if ($filters.ageRange?.min !== null || $filters.ageRange?.max !== null) {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(emp => {
        if (!emp.birthDate) return false;
        const age = currentYear - new Date(emp.birthDate).getFullYear();
        const { min, max } = $filters.ageRange;
        return (min === null || age >= min) && (max === null || age <= max);
      });
    }

    // 勤務地フィルター
    if ($filters.workLocation) {
      filtered = filtered.filter(emp => emp.workLocation === $filters.workLocation);
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch ($filters.sortBy) {
        case 'name':
          aValue = `${a.lastName} ${a.firstName}`;
          bValue = `${b.lastName} ${b.firstName}`;
          break;
        case 'employeeNumber':
          aValue = a.employeeNumber;
          bValue = b.employeeNumber;
          break;
        case 'hireDate':
          aValue = new Date(a.hireDate);
          bValue = new Date(b.hireDate);
          break;
        case 'department':
          const deptA = $departmentMap.get(a.departmentId);
          const deptB = $departmentMap.get(b.departmentId);
          aValue = deptA?.name || '';
          bValue = deptB?.name || '';
          break;
        case 'position':
          const posA = $positionMap.get(a.positionId);
          const posB = $positionMap.get(b.positionId);
          aValue = posA?.level || 0;
          bValue = posB?.level || 0;
          break;
        default:
          aValue = a.employeeNumber;
          bValue = b.employeeNumber;
      }

      if (aValue < bValue) return $filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return $filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }
);

// 派生ストア: 統計データ
export const statistics = derived(
  [employees, departmentList, positionList, employeeSkills],
  ([$employees, $departments, $positions, $employeeSkills]) => {
    return calculateStatistics();
  }
);

// 派生ストア: 部署別社員カウント
export const departmentEmployeeCounts = derived(
  [employees, departmentMap],
  ([$employees, $departmentMap]) => {
    const counts = new Map();
    
    // すべての部署を0で初期化
    $departmentMap.forEach((dept, id) => {
      counts.set(id, 0);
    });
    
    // 実際のカウントを計算
    $employees.forEach(emp => {
      if (emp.status === 'active') {
        const current = counts.get(emp.departmentId) || 0;
        counts.set(emp.departmentId, current + 1);
      }
    });
    
    return counts;
  }
);

// 派生ストア: 階層構造を持つ部署ツリー
export const departmentTree = derived(departmentList, ($departments) => {
  const tree = [];
  const departmentMap = new Map();
  
  // 部署をマップに格納
  $departments.forEach(dept => {
    departmentMap.set(dept.id, {
      ...dept,
      children: []
    });
  });
  
  // 階層構造を構築
  $departments.forEach(dept => {
    const deptNode = departmentMap.get(dept.id);
    if (dept.parentId) {
      const parent = departmentMap.get(dept.parentId);
      if (parent) {
        parent.children.push(deptNode);
      }
    } else {
      tree.push(deptNode);
    }
  });
  
  // ソート（レベル、sortOrder、名前順）
  const sortDepartments = (depts) => {
    depts.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });
    depts.forEach(dept => {
      if (dept.children.length > 0) {
        sortDepartments(dept.children);
      }
    });
  };
  
  sortDepartments(tree);
  return tree;
});

// 初期化関数
export async function initializeEmployeeData() {
  isLoading.set(true);
  error.set(null);
  
  // タイムアウトを設定
  const timeoutId = setTimeout(() => {
    error.set('データ初期化がタイムアウトしました。ページを更新してやり直してください。');
    isLoading.set(false);
  }, 15000); // 15秒でタイムアウト
  
  try {
    // モックモードの場合、初期データを生成して保存
    if (CONFIG.IS_MOCK_MODE) {
      // 古いデータが重複の原因の可能性があるため、強制クリア
      const { clearAllData } = await import('../api/localStorage.js');
      clearAllData();
      
      const generatedEmployees = generateEmployees();
      const generatedWorkHistory = generateWorkHistory(generatedEmployees);
      const generatedEmployeeSkills = generateEmployeeSkills(generatedEmployees);
      
      // 強制初期化を使用
      const { forceInitializeData } = await import('../api/localStorage.js');
      const success = forceInitializeData(
        departments,
        positions,
        skills,
        generatedEmployees,
        generatedEmployeeSkills,
        generatedWorkHistory
      );
      
      if (!success) {
        throw new Error('データの強制初期化に失敗');
      }
    }
    
    // データをロード
    await loadAllData();
    
    clearTimeout(timeoutId);
    
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Failed to initialize employee data:', err);
    error.set('データの初期化に失敗しました: ' + err.message);
    throw err;
  } finally {
    isLoading.set(false);
  }
}

// 強制リセット機能
export async function forceResetEmployeeData() {
  isLoading.set(true);
  error.set(null);
  
  // タイムアウトを設定
  const timeoutId = setTimeout(() => {
    error.set('データリセットがタイムアウトしました。ページを更新してやり直してください。');
    isLoading.set(false);
  }, 10000); // 10秒でタイムアウト
  
  try {
    // 新しいデータを生成
    const generatedEmployees = generateEmployees();
    const generatedWorkHistory = generateWorkHistory(generatedEmployees);
    const generatedEmployeeSkills = generateEmployeeSkills(generatedEmployees);
    
    // 強制的にデータを保存
    const success = forceInitializeData(
      departments,
      positions,
      skills,
      generatedEmployees,
      generatedEmployeeSkills,
      generatedWorkHistory
    );
    
    if (!success) {
      throw new Error('データの強制保存に失敗');
    }
    
    // データをロード
    await loadAllData();
    
    clearTimeout(timeoutId);
    
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Failed to force reset employee data:', err);
    error.set('データのリセットに失敗しました: ' + err.message);
    throw err;
  } finally {
    isLoading.set(false);
  }
}

// 全データロード
export async function loadAllData() {
  try {
    // 基本マスターデータの読み込み
    const depts = departmentStorage.load();
    const pos = positionStorage.load();
    const skls = skillStorage.load();
    
    departmentList.set(depts);
    positionList.set(pos);
    skillList.set(skls);
    
    // 社員関連データの読み込み
    const emps = employeeStorage.load();
    const empSkls = employeeSkillStorage.load();
    const history = workHistoryStorage.load();
    
    // 社員データの重複チェック
    const empIds = emps.map(emp => emp.id);
    const uniqueEmpIds = new Set(empIds);
    if (empIds.length !== uniqueEmpIds.size) {
      const duplicates = empIds.filter((id, index) => empIds.indexOf(id) !== index);
      throw new Error('社員データに重複があります: ' + duplicates.join(', '));
    }
    
    employees.set(emps);
    employeeSkills.set(empSkls);
    workHistory.set(history);
    
  } catch (err) {
    console.error('Failed to load data:', err);
    error.set('データの読み込みに失敗しました: ' + err.message);
    throw err;
  }
}

// 社員CRUD操作
export async function createEmployee(employeeData) {
  isLoading.set(true);
  error.set(null);
  
  try {
    const newEmployee = {
      id: `emp-${Date.now()}`,
      ...employeeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // スキル情報を一時的に保存（社員作成後に追加）
    const skills = employeeData.skills || [];
    delete newEmployee.skills;
    
    const success = employeeStorage.saveOne(newEmployee);
    if (success) {
      // 職歴を自動追加
      workHistoryStorage.addEntry(
        newEmployee.id,
        newEmployee.departmentId,
        newEmployee.positionId,
        newEmployee.hireDate,
        '入社'
      );
      
      // スキル情報を追加
      if (skills.length > 0) {
        await updateEmployeeSkills(newEmployee.id, skills);
      }
      
      await loadAllData();
      return newEmployee;
    } else {
      throw new Error('保存に失敗しました');
    }
  } catch (err) {
    console.error('Failed to create employee:', err);
    error.set('社員の作成に失敗しました');
    return null;
  } finally {
    isLoading.set(false);
  }
}

export async function updateEmployee(employeeData) {
  isLoading.set(true);
  error.set(null);
  
  try {
    const employeeId = employeeData.id;
    const existingEmployee = employeeStorage.getById(employeeId);
    if (!existingEmployee) {
      throw new Error('対象の社員が見つかりません');
    }
    
    const updatedEmployee = {
      ...existingEmployee,
      ...employeeData,
      updatedAt: new Date()
    };
    
    // 部署または役職が変更された場合、職歴を追加
    if (existingEmployee.departmentId !== updatedEmployee.departmentId || 
        existingEmployee.positionId !== updatedEmployee.positionId) {
      workHistoryStorage.addEntry(
        employeeId,
        updatedEmployee.departmentId,
        updatedEmployee.positionId,
        new Date(),
        '人事異動'
      );
    }
    
    // スキル情報の更新
    if (employeeData.skills) {
      await updateEmployeeSkills(employeeId, employeeData.skills);
    }
    
    const success = employeeStorage.saveOne(updatedEmployee);
    if (success) {
      await loadAllData();
      return updatedEmployee;
    } else {
      throw new Error('保存に失敗しました');
    }
  } catch (err) {
    console.error('Failed to update employee:', err);
    error.set('社員情報の更新に失敗しました');
    return null;
  } finally {
    isLoading.set(false);
  }
}

export async function deleteEmployee(employeeId) {
  isLoading.set(true);
  error.set(null);
  
  try {
    const success = employeeStorage.deleteOne(employeeId);
    if (success) {
      await loadAllData();
      return true;
    } else {
      throw new Error('削除に失敗しました');
    }
  } catch (err) {
    console.error('Failed to delete employee:', err);
    error.set('社員の削除に失敗しました');
    return false;
  } finally {
    isLoading.set(false);
  }
}

export async function deleteMultipleEmployees(employeeIds) {
  isLoading.set(true);
  error.set(null);
  
  try {
    const success = employeeStorage.deleteMany(employeeIds);
    if (success) {
      await loadAllData();
      return true;
    } else {
      throw new Error('一括削除に失敗しました');
    }
  } catch (err) {
    console.error('Failed to delete employees:', err);
    error.set('社員の一括削除に失敗しました');
    return false;
  } finally {
    isLoading.set(false);
  }
}

// 社員スキル管理
export async function updateEmployeeSkills(employeeId, skills) {
  isLoading.set(true);
  error.set(null);
  
  try {
    const success = employeeSkillStorage.updateEmployeeSkills(employeeId, skills);
    if (success) {
      await loadAllData();
      return true;
    } else {
      throw new Error('スキル情報の保存に失敗しました');
    }
  } catch (err) {
    console.error('Failed to update employee skills:', err);
    error.set('スキル情報の更新に失敗しました');
    return false;
  } finally {
    isLoading.set(false);
  }
}

// フィルター操作
export function updateFilter(key, value) {
  filters.update(current => ({
    ...current,
    [key]: value
  }));
}

export function resetFilters() {
  filters.set({
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
  });
}

// ユーティリティ関数
export function getEmployeeById(employeeId) {
  return employeeStorage.getById(employeeId);
}

export function getEmployeesByDepartment(departmentId) {
  const allEmployees = employeeStorage.load();
  return allEmployees.filter(emp => emp.departmentId === departmentId);
}

export function getEmployeesBySkill(skillId) {
  const skillRelations = employeeSkillStorage.getBySkillId(skillId);
  const employeeIds = skillRelations.map(rel => rel.employeeId);
  const allEmployees = employeeStorage.load();
  return allEmployees.filter(emp => employeeIds.includes(emp.id));
}