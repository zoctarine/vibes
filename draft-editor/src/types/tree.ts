export interface TreeItem {
  id: string;
  title: string;
  content: string;
  type: 'chapter' | 'scene' | 'preview';
  parentId: string | null;
  orderIndex: number;
  children: TreeItem[];
}

export interface TreeContextType {
  items: TreeItem[];
  selectedItem: TreeItem | null;
  newItemId: string | null;
  addItem: (type: 'chapter' | 'scene', parentId: string | null) => void;
  updateItem: (item: TreeItem) => void;
  deleteItem: (id: string) => void;
  moveItem: (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => void;
  selectItem: (item: TreeItem | null) => void;
  clearNewItemId: () => void;
}