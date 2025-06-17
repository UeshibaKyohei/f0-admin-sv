// 社員管理システム用ローカルストレージAPI

const STORAGE_KEYS = {
  EMPLOYEES: 'hr_employees',
  DEPARTMENTS: 'hr_departments',
  POSITIONS: 'hr_positions',
  SKILLS: 'hr_skills',
  EMPLOYEE_SKILLS: 'hr_employee_skills',
  WORK_HISTORY: 'hr_work_history'
};

// データの保存
export function saveToLocalStorage(key, data) {
  try {
    // ブラウザ環境チェック
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    // 日付オブジェクトをシリアライズ
    const serializedData = JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

// データの読み込み
export function loadFromLocalStorage(key) {
  try {
    // ブラウザ環境チェック
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    // 日付オブジェクトをデシリアライズ
    return JSON.parse(data, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

// 社員データの保存と読み込み
export const employeeStorage = {
  save: (employees) => saveToLocalStorage(STORAGE_KEYS.EMPLOYEES, employees),
  load: () => loadFromLocalStorage(STORAGE_KEYS.EMPLOYEES) || [],
  
  // 単一社員の保存
  saveOne: (employee) => {
    const employees = employeeStorage.load();
    const index = employees.findIndex(e => e.id === employee.id);
    
    if (index !== -1) {
      employees[index] = { ...employee, updatedAt: new Date() };
    } else {
      employees.push({ ...employee, createdAt: new Date(), updatedAt: new Date() });
    }
    
    return employeeStorage.save(employees);
  },
  
  // 単一社員の削除
  deleteOne: (employeeId) => {
    const employees = employeeStorage.load();
    const filtered = employees.filter(e => e.id !== employeeId);
    return employeeStorage.save(filtered);
  },
  
  // 複数社員の削除
  deleteMany: (employeeIds) => {
    const employees = employeeStorage.load();
    const filtered = employees.filter(e => !employeeIds.includes(e.id));
    return employeeStorage.save(filtered);
  },
  
  // ID で単一社員取得
  getById: (employeeId) => {
    const employees = employeeStorage.load();
    return employees.find(e => e.id === employeeId) || null;
  }
};

// 部署データの保存と読み込み
export const departmentStorage = {
  save: (departments) => saveToLocalStorage(STORAGE_KEYS.DEPARTMENTS, departments),
  load: () => loadFromLocalStorage(STORAGE_KEYS.DEPARTMENTS) || [],
  
  saveOne: (department) => {
    const departments = departmentStorage.load();
    const index = departments.findIndex(d => d.id === department.id);
    
    if (index !== -1) {
      departments[index] = { ...department, updatedAt: new Date() };
    } else {
      departments.push({ ...department, createdAt: new Date(), updatedAt: new Date() });
    }
    
    return departmentStorage.save(departments);
  },
  
  deleteOne: (departmentId) => {
    const departments = departmentStorage.load();
    const filtered = departments.filter(d => d.id !== departmentId);
    return departmentStorage.save(filtered);
  },
  
  getById: (departmentId) => {
    const departments = departmentStorage.load();
    return departments.find(d => d.id === departmentId) || null;
  },
  
  // 子部署を取得
  getChildren: (parentId) => {
    const departments = departmentStorage.load();
    return departments.filter(d => d.parentId === parentId);
  },
  
  // 階層パスで部署を取得
  getByPath: (path) => {
    const departments = departmentStorage.load();
    return departments.find(d => d.path === path) || null;
  }
};

// 役職データの保存と読み込み
export const positionStorage = {
  save: (positions) => saveToLocalStorage(STORAGE_KEYS.POSITIONS, positions),
  load: () => loadFromLocalStorage(STORAGE_KEYS.POSITIONS) || [],
  
  saveOne: (position) => {
    const positions = positionStorage.load();
    const index = positions.findIndex(p => p.id === position.id);
    
    if (index !== -1) {
      positions[index] = { ...position, updatedAt: new Date() };
    } else {
      positions.push({ ...position, createdAt: new Date(), updatedAt: new Date() });
    }
    
    return positionStorage.save(positions);
  },
  
  deleteOne: (positionId) => {
    const positions = positionStorage.load();
    const filtered = positions.filter(p => p.id !== positionId);
    return positionStorage.save(filtered);
  },
  
  getById: (positionId) => {
    const positions = positionStorage.load();
    return positions.find(p => p.id === positionId) || null;
  }
};

// スキルデータの保存と読み込み
export const skillStorage = {
  save: (skills) => saveToLocalStorage(STORAGE_KEYS.SKILLS, skills),
  load: () => loadFromLocalStorage(STORAGE_KEYS.SKILLS) || [],
  
  saveOne: (skill) => {
    const skills = skillStorage.load();
    const index = skills.findIndex(s => s.id === skill.id);
    
    if (index !== -1) {
      skills[index] = { ...skill, updatedAt: new Date() };
    } else {
      skills.push({ ...skill, createdAt: new Date(), updatedAt: new Date() });
    }
    
    return skillStorage.save(skills);
  },
  
  deleteOne: (skillId) => {
    const skills = skillStorage.load();
    const filtered = skills.filter(s => s.id !== skillId);
    return skillStorage.save(filtered);
  },
  
  getById: (skillId) => {
    const skills = skillStorage.load();
    return skills.find(s => s.id === skillId) || null;
  },
  
  // カテゴリー別スキル取得
  getByCategory: (category) => {
    const skills = skillStorage.load();
    return skills.filter(s => s.category === category);
  }
};

// 社員スキル関連データの保存と読み込み
export const employeeSkillStorage = {
  save: (employeeSkills) => saveToLocalStorage(STORAGE_KEYS.EMPLOYEE_SKILLS, employeeSkills),
  load: () => loadFromLocalStorage(STORAGE_KEYS.EMPLOYEE_SKILLS) || [],
  
  // 社員のスキルを更新
  updateEmployeeSkills: (employeeId, skills) => {
    const allEmployeeSkills = employeeSkillStorage.load();
    
    // 既存のスキルを削除
    const filtered = allEmployeeSkills.filter(es => es.employeeId !== employeeId);
    
    // 新しいスキルを追加
    const newSkills = skills.map(skill => ({
      employeeId,
      skillId: skill.skillId,
      level: skill.level,
      certifiedDate: skill.certifiedDate || null,
      expiryDate: skill.expiryDate || null,
      notes: skill.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const updated = [...filtered, ...newSkills];
    return employeeSkillStorage.save(updated);
  },
  
  // 特定社員のスキルを取得
  getByEmployeeId: (employeeId) => {
    const employeeSkills = employeeSkillStorage.load();
    return employeeSkills.filter(es => es.employeeId === employeeId);
  },
  
  // 特定スキルを持つ社員を取得
  getBySkillId: (skillId) => {
    const employeeSkills = employeeSkillStorage.load();
    return employeeSkills.filter(es => es.skillId === skillId);
  },
  
  // 社員のスキルレベルを取得
  getSkillLevel: (employeeId, skillId) => {
    const employeeSkills = employeeSkillStorage.load();
    const skill = employeeSkills.find(es => es.employeeId === employeeId && es.skillId === skillId);
    return skill ? skill.level : null;
  }
};

// 職歴データの保存と読み込み
export const workHistoryStorage = {
  save: (workHistory) => saveToLocalStorage(STORAGE_KEYS.WORK_HISTORY, workHistory),
  load: () => loadFromLocalStorage(STORAGE_KEYS.WORK_HISTORY) || [],
  
  addEntry: (employeeId, departmentId, positionId, startDate, reason = '') => {
    const history = workHistoryStorage.load();
    
    // 現在の職歴を終了
    const currentEntries = history.filter(h => h.employeeId === employeeId && !h.endDate);
    currentEntries.forEach(entry => {
      entry.endDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // 前日で終了
    });
    
    // 新しい職歴を追加
    const newEntry = {
      id: `work-${employeeId}-${Date.now()}`,
      employeeId,
      departmentId,
      positionId,
      startDate,
      endDate: null,
      reason,
      notes: '',
      createdAt: new Date()
    };
    
    history.push(newEntry);
    workHistoryStorage.save(history);
    return newEntry;
  },
  
  // 特定社員の職歴を取得
  getByEmployeeId: (employeeId) => {
    const history = workHistoryStorage.load();
    return history
      .filter(h => h.employeeId === employeeId)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  },
  
  // 現在の職歴を取得
  getCurrentByEmployeeId: (employeeId) => {
    const history = workHistoryStorage.load();
    return history.find(h => h.employeeId === employeeId && !h.endDate) || null;
  },
  
  // 部署の職歴を取得
  getByDepartmentId: (departmentId) => {
    const history = workHistoryStorage.load();
    return history.filter(h => h.departmentId === departmentId);
  }
};

// データの強制クリア
export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('データクリアに失敗:', error);
    return false;
  }
}

// 初期データのセットアップ
export function initializeData(departments, positions, skills, employees, employeeSkills, workHistory) {
  // データが存在しない場合のみ初期化
  if (!departmentStorage.load().length) {
    departmentStorage.save(departments);
  }
  if (!positionStorage.load().length) {
    positionStorage.save(positions);
  }
  if (!skillStorage.load().length) {
    skillStorage.save(skills);
  }
  if (!employeeStorage.load().length) {
    employeeStorage.save(employees);
  }
  if (!employeeSkillStorage.load().length) {
    employeeSkillStorage.save(employeeSkills);
  }
  if (!workHistoryStorage.load().length) {
    workHistoryStorage.save(workHistory);
  }
}

// 強制的にデータを再生成
export function forceInitializeData(departments, positions, skills, employees, employeeSkills, workHistory) {
  try {
    departmentStorage.save(departments);
    positionStorage.save(positions);
    skillStorage.save(skills);
    employeeStorage.save(employees);
    employeeSkillStorage.save(employeeSkills);
    workHistoryStorage.save(workHistory);
    return true;
  } catch (error) {
    console.error('データ再生成に失敗:', error);
    return false;
  }
}

// データのリセット
export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// 統計データの計算
export function calculateStatistics() {
  const employees = employeeStorage.load();
  const departments = departmentStorage.load();
  const positions = positionStorage.load();
  const employeeSkills = employeeSkillStorage.load();
  
  if (!employees.length) return null;
  
  const activeEmployees = employees.filter(e => e.status === 'active');
  const currentYear = new Date().getFullYear();
  
  // 年齢計算
  const ages = employees
    .filter(e => e.birthDate)
    .map(e => currentYear - new Date(e.birthDate).getFullYear());
  
  // 勤続年数計算
  const tenures = employees
    .map(e => currentYear - new Date(e.hireDate).getFullYear());
  
  // 部署別カウント
  const departmentCounts = {};
  departments.forEach(dept => {
    departmentCounts[dept.id] = employees.filter(e => e.departmentId === dept.id).length;
  });
  
  // 役職別カウント
  const positionCounts = {};
  positions.forEach(pos => {
    positionCounts[pos.id] = employees.filter(e => e.positionId === pos.id).length;
  });
  
  // 雇用形態別カウント
  const contractTypeCounts = {};
  ['fulltime', 'parttime', 'contract', 'intern'].forEach(type => {
    contractTypeCounts[type] = employees.filter(e => e.contractType === type).length;
  });
  
  // スキル別カウント（ユニークな社員数）
  const skillCounts = {};
  employeeSkills.forEach(es => {
    if (!skillCounts[es.skillId]) {
      skillCounts[es.skillId] = 0;
    }
    skillCounts[es.skillId]++;
  });
  
  // 離職率計算（今年退職した人 / 年初の総員数）
  const retiredThisYear = employees.filter(e => 
    e.status === 'retired' && 
    e.updatedAt && 
    new Date(e.updatedAt).getFullYear() === currentYear
  ).length;
  const turnoverRate = employees.length > 0 ? (retiredThisYear / employees.length) * 100 : 0;
  
  return {
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    averageAge: ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0,
    averageTenure: tenures.length > 0 ? Math.round(tenures.reduce((sum, tenure) => sum + tenure, 0) / tenures.length * 10) / 10 : 0,
    departmentCounts,
    positionCounts,
    contractTypeCounts,
    skillCounts,
    turnoverRate: Math.round(turnoverRate * 10) / 10
  };
}