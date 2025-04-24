import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TreeItem, TreeContextType } from '../types';
import { useProjectStore } from '../store/projectStore';
import { supabase } from '../lib/supabase';

const TreeContext = createContext<TreeContextType | null>(null);

export const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTreeContext must be used within a TreeProvider');
  }
  return context;
};

export const TreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedProject } = useProjectStore();
  const [items, setItems] = useState<TreeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TreeItem | null>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch documents when selected project changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedProject) return;

      setLoading(true);
      try {
        const { data: documents, error } = await supabase
          .from('documents')
          .select('*')
          .eq('project_id', selectedProject.id);

        if (error) throw error;

        let rootDoc = documents.find(doc => !doc.parent_id);
        
        // If no root document exists, create one
        if (!rootDoc) {
          const { data: { session }, error: authError } = await supabase.auth.getSession();
          if (authError || !session?.user?.id) {
            throw new Error('Authentication error: User not authenticated');
          }

          const newRootDoc = {
            title: 'Draft',
            content: '',
            type: 'folder',
            parent_id: null,
            project_id: selectedProject.id,
            owner_id: session.user.id,
          };

          const { data: createdRoot, error: createError } = await supabase
            .from('documents')
            .insert(newRootDoc)
            .select()
            .single();

          if (createError) throw createError;
          rootDoc = createdRoot;
          documents.push(rootDoc); // Add the new root to documents array for tree building
        }

        const tree: TreeItem[] = [];

        const buildTree = (doc: any): TreeItem => {
          const children = documents.filter(d => d.parent_id === doc.id);
          const sortedChildren = children.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          const mappedChildren = sortedChildren.map(child => buildTree(child));

          return {
            id: doc.id,
            title: doc.title,
            content: doc.content || '',
            type: doc.type === 'folder' ? 'chapter' : 'scene',
            parentId: doc.parent_id,
            orderIndex: 0,
            isVisible: true,
            children: mappedChildren,
          };
        };

        tree.push(buildTree(rootDoc));
        setItems(tree);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedProject]);

  const addItem = useCallback(async (type: 'chapter' | 'scene', parentId: string | null) => {
    if (!selectedProject) return;

    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user?.id) {
      console.error('Authentication error: User not authenticated');
      return;
    }

    try {
      const newItem = {
        title: type === 'chapter' ? 'New Chapter' : 'New Scene',
        content: '',
        type: type === 'chapter' ? 'folder' : 'document',
        parent_id: parentId,
        project_id: selectedProject.id,
        owner_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      const treeItem: TreeItem = {
        id: data.id,
        title: data.title,
        content: data.content || '',
        type: type,
        parentId: data.parent_id,
        orderIndex: 0,
        isVisible: true,
        children: [],
      };

      setNewItemId(treeItem.id);

      setItems(prev => {
        if (!parentId) {
          return [...prev, treeItem];
        }

        const updateChildren = (items: TreeItem[]): TreeItem[] => {
          return items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                children: [...item.children, treeItem],
              };
            }
            if (item.children.length > 0) {
              return {
                ...item,
                children: updateChildren(item.children),
              };
            }
            return item;
          });
        };

        return updateChildren(prev);
      });
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }, [selectedProject]);

  const updateItem = useCallback(async (updatedItem: TreeItem) => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: updatedItem.title,
          content: updatedItem.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedItem.id);

      if (error) throw error;

      setItems(prev => {
        const updateItemInTree = (items: TreeItem[]): TreeItem[] => {
          return items.map(item => {
            if (item.id === updatedItem.id) {
              return {
                ...updatedItem,
                children: item.children,
              };
            }
            if (item.children.length > 0) {
              return {
                ...item,
                children: updateItemInTree(item.children),
              };
            }
            return item;
          });
        };

        return updateItemInTree(prev);
      });

      if (selectedItem?.id === updatedItem.id) {
        setSelectedItem(updatedItem);
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }, [selectedProject, selectedItem]);

  const toggleVisibility = useCallback((id: string) => {
    setItems(prev => {
      const updateVisibility = (items: TreeItem[]): TreeItem[] => {
        return items.map(item => {
          if (item.id === id) {
            return {
              ...item,
              isVisible: !item.isVisible,
            };
          }
          if (item.children.length > 0) {
            return {
              ...item,
              children: updateVisibility(item.children),
            };
          }
          return item;
        });
      };

      return updateVisibility(prev);
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => {
        const deleteItemFromTree = (items: TreeItem[]): TreeItem[] => {
          return items.filter(item => {
            if (item.id === id) {
              return false;
            }
            if (item.children.length > 0) {
              item.children = deleteItemFromTree(item.children);
            }
            return true;
          });
        };

        return deleteItemFromTree(prev);
      });
      
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }, [selectedProject, selectedItem]);

  const moveItem = useCallback(async (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => {
    if (!selectedProject) return;

    try {
      // First find the dragged item and its new parent
      const draggedItem = findItemWithChildren(items, dragId);
      if (!draggedItem) return;

      let newParentId: string | null = null;
      
      if (position === 'inside') {
        // If dropping inside, the drop target is the new parent
        newParentId = dropId;
      } else {
        // If dropping before or after, find the parent of the drop target
        const dropTarget = findItemWithChildren(items, dropId);
        if (dropTarget) {
          newParentId = dropTarget.parentId;
        }
      }

      // Update the database first
      const { error } = await supabase
        .from('documents')
        .update({ parent_id: newParentId })
        .eq('id', dragId);

      if (error) throw error;

      // If database update successful, update the UI
      setItems(prev => {
        const treeWithoutDraggedItem = removeItemFromTree(prev, dragId);
        return insertIntoTree(treeWithoutDraggedItem, dropId, draggedItem, position);
      });
    } catch (error) {
      console.error('Error moving document:', error);
    }
  }, [selectedProject, items]);

  const findItemWithChildren = (items: TreeItem[], id: string): TreeItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return JSON.parse(JSON.stringify(item));
      }
      if (item.children.length > 0) {
        const found = findItemWithChildren(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeItemFromTree = (items: TreeItem[], id: string): TreeItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return null;
      }
      if (item.children.length > 0) {
        const newChildren = removeItemFromTree(item.children, id).filter(Boolean) as TreeItem[];
        return {
          ...item,
          children: newChildren,
        };
      }
      return item;
    }).filter(Boolean) as TreeItem[];
  };

  const insertIntoTree = (
    items: TreeItem[],
    targetId: string,
    itemToInsert: TreeItem,
    position: 'before' | 'after' | 'inside'
  ): TreeItem[] => {
    let result: TreeItem[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.id === targetId) {
        if (position === 'inside') {
          // Add as child
          result.push({
            ...item,
            children: [...item.children, { ...itemToInsert, parentId: item.id }],
          });
        } else if (position === 'before') {
          // Add before this item
          result.push({ ...itemToInsert, parentId: item.parentId });
          result.push(item);
        } else { // after
          // Add after this item
          result.push(item);
          result.push({ ...itemToInsert, parentId: item.parentId });
        }
      } else if (item.children.length > 0) {
        // Check children recursively
        const newChildren = insertIntoTree(item.children, targetId, itemToInsert, position);
        result.push({
          ...item,
          children: newChildren,
        });
      } else {
        // Regular item, no children
        result.push(item);
      }
    }
    
    return result;
  };

  const selectItem = useCallback((item: TreeItem | null) => {
    setSelectedItem(item);
  }, []);

  const clearNewItemId = useCallback(() => {
    setNewItemId(null);
  }, []);

  const compilePreview = useCallback(() => {
    const compileNode = (node: TreeItem, level: number = 1): string => {
      if (node.type === 'preview' || !node.isVisible) return '';
      
      let content = '';
      
      if (node.type === 'chapter') {
        const heading = '#'.repeat(level);
        content += `${heading} ${node.title}\n\n`;
      }
      
      content += `${node.content}\n\n`;
      
      if (node.children.length > 0) {
        content += node.children
          .filter(child => child.isVisible)
          .map(child => {
            if (child.type === 'scene') {
              return `${child.content}\n\n${child.children
                .filter(subChild => subChild.isVisible)
                .map(subChild => subChild.content)
                .join('\n\n')}`;
            }
            return compileNode(child, level + 1);
          })
          .join('\n');
      }
      
      return content;
    };

    const rootNode = items[0];
    if (!rootNode) return '';

    return compileNode(rootNode);
  }, [items]);

  const value = {
    items,
    selectedItem,
    newItemId,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    selectItem,
    clearNewItemId,
    compilePreview,
    toggleVisibility,
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
};