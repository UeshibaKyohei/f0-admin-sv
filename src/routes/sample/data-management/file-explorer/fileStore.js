import { writable, derived, get } from 'svelte/store';
import { fileApiClient } from './api/fileClient.js';
import { config } from './config.js';

function createFileStore() {
  const { subscribe, set, update } = writable([]);
  
  return {
    subscribe,
    
    // 初期化：APIからファイル一覧を取得
    initialize: async () => {
      try {
        const result = await fileApiClient.listFiles({ path: '/' });
        set(result.items);
      } catch (error) {
        console.error('Failed to initialize file store:', error);
        set([]);
      }
    },
    
    // ファイル一覧を再読み込み
    refresh: async (params = {}) => {
      try {
        const result = await fileApiClient.listFiles(params);
        set(result.items);
        return result;
      } catch (error) {
        console.error('Failed to refresh files:', error);
        throw error;
      }
    },
    
    // フォルダ作成
    createFolder: async (name, parentPath) => {
      try {
        const newFolder = await fileApiClient.createItem({
          name,
          type: 'folder',
          parentPath
        });
        
        // ローカルストアに追加（楽観的更新）
        update(files => [...files, newFolder]);
        return newFolder;
      } catch (error) {
        console.error('Failed to create folder:', error);
        throw error;
      }
    },
    
    // ファイルアップロード
    uploadFile: async (file, parentPath) => {
      try {
        const newFile = await fileApiClient.createItem({
          name: file.name,
          type: 'file',
          parentPath,
          file
        });
        
        // ローカルストアに追加（楽観的更新）
        update(files => [...files, newFile]);
        return newFile;
      } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
      }
    },
    
    // リネーム
    rename: async (fileId, newName) => {
      try {
        const files = get(fileStore);
        const file = files.find(f => f.id === fileId);
        if (!file) {
          throw new Error('File not found');
        }
        
        const parentPath = file.path.substring(0, file.path.lastIndexOf('/'));
        const newPath = parentPath === '' ? `/${newName}` : `${parentPath}/${newName}`;
        
        const updatedFile = await fileApiClient.updateItem(fileId, {
          name: newName,
          path: newPath
        });
        
        // ローカルストアを更新（楽観的更新）
        update(files => {
          return files.map(f => {
            if (f.id === fileId) {
              return { ...f, ...updatedFile };
            }
            // 子要素のパス更新（フォルダの場合）
            if (file.type === 'folder' && f.path.startsWith(file.path + '/')) {
              return {
                ...f,
                path: f.path.replace(file.path, newPath)
              };
            }
            return f;
          });
        });
        
        return updatedFile;
      } catch (error) {
        console.error('Failed to rename:', error);
        throw error;
      }
    },
    
    // 削除
    delete: async (fileIds) => {
      try {
        await fileApiClient.deleteItems(fileIds);
        
        // ローカルストアから削除（楽観的更新）
        update(files => {
          const deletePaths = fileIds.map(id => {
            const file = files.find(f => f.id === id);
            return file ? file.path : null;
          }).filter(Boolean);
          
          return files.filter(file => {
            if (fileIds.includes(file.id)) return false;
            
            // 親フォルダが削除される場合は子要素も削除
            for (const path of deletePaths) {
              if (file.path.startsWith(path + '/')) return false;
            }
            
            return true;
          });
        });
      } catch (error) {
        console.error('Failed to delete:', error);
        throw error;
      }
    },
    
    // ファイル移動
    move: async (fileId, newParentPath) => {
      try {
        const files = get(fileStore);
        const file = files.find(f => f.id === fileId);
        if (!file) {
          throw new Error('File not found');
        }
        
        const newPath = newParentPath === '/' ? `/${file.name}` : `${newParentPath}/${file.name}`;
        
        const updatedFile = await fileApiClient.updateItem(fileId, {
          path: newPath
        });
        
        // ローカルストアを更新（楽観的更新）
        update(files => {
          return files.map(f => {
            if (f.id === fileId) {
              return { ...f, ...updatedFile };
            }
            return f;
          });
        });
        
        return updatedFile;
      } catch (error) {
        console.error('Failed to move:', error);
        throw error;
      }
    },
    
    // スター切り替え
    toggleStar: async (fileId) => {
      try {
        const files = get(fileStore);
        const file = files.find(f => f.id === fileId);
        if (!file) {
          throw new Error('File not found');
        }
        
        const updatedFile = await fileApiClient.updateItem(fileId, {
          starred: !file.starred
        });
        
        // ローカルストアを更新（楽観的更新）
        update(files => {
          return files.map(f => {
            if (f.id === fileId) {
              return { ...f, ...updatedFile };
            }
            return f;
          });
        });
        
        return updatedFile;
      } catch (error) {
        console.error('Failed to toggle star:', error);
        throw error;
      }
    },
    
    // ファイルダウンロード
    downloadFile: async (fileId) => {
      try {
        const files = get(fileStore);
        const file = files.find(f => f.id === fileId);
        if (!file) {
          throw new Error('File not found');
        }
        
        if (file.type === 'folder') {
          // フォルダをZIPとしてダウンロード
          const blob = await fileApiClient.downloadFolderAsZip(fileId);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${file.name}.zip`;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // ファイルダウンロード
          const blob = await fileApiClient.downloadFile(fileId);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Failed to download:', error);
        throw error;
      }
    }
  };
}

export const fileStore = createFileStore();

// フォルダツリー用の派生ストア
export const folderTree = derived(fileStore, $files => {
  const folders = $files.filter(f => f.type === 'folder');
  
  // ルートフォルダ
  const rootFolders = folders.filter(f => {
    const parts = f.path.split('/').filter(Boolean);
    return parts.length === 1;
  });
  
  // 階層構造を構築
  function buildTree(parentPath) {
    return folders
      .filter(f => {
        const parent = f.path.substring(0, f.path.lastIndexOf('/'));
        return parent === parentPath;
      })
      .map(folder => ({
        ...folder,
        children: buildTree(folder.path)
      }));
  }
  
  return rootFolders.map(folder => ({
    ...folder,
    children: buildTree(folder.path)
  }));
});

// ストレージ情報を計算（フォールバック方式）
export const storageInfo = derived(fileStore, ($files) => {
  // フォールバック：ローカルデータから計算
  const totalSize = $files.reduce((sum, file) => sum + (file.size || 0), 0);
  const maxSize = config.storage.maxTotalSize;
  const percentage = Math.round((totalSize / maxSize) * 100);
  
  return {
    used: totalSize,
    total: maxSize,
    percentage,
    usedFormatted: formatFileSize(totalSize),
    totalFormatted: formatFileSize(maxSize)
  };
});

// ヘルパー関数
export function formatFileSize(bytes) {
  if (!bytes) return '-';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function getFileIcon(file) {
  if (file.type === 'folder') {
    return 'folder';
  }
  
  const ext = file.name.split('.').pop().toLowerCase();
  const mimeType = file.mimeType || '';
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.includes('pdf') || ext === 'pdf') {
    return 'pdf';
  }
  if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) {
    return 'word';
  }
  if (mimeType.includes('excel') || ['xls', 'xlsx'].includes(ext)) {
    return 'excel';
  }
  if (mimeType.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) {
    return 'powerpoint';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }
  if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go'].includes(ext)) {
    return 'code';
  }
  if (['txt', 'md', 'log'].includes(ext)) {
    return 'text';
  }
  
  return 'file';
}

