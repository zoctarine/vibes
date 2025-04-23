import React, { useState, useRef, useEffect } from 'react';
import { TreeItem } from '../types';
import { useTreeContext } from '../context/TreeContext';
import { ChevronRight, ChevronDown, Book, FileText, Trash2, Plus, GripVertical, SwitchCamera, Eye, EyeOff } from 'lucide-react';

interface TreeNodeProps {
  item: TreeItem;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ item, level }) => {
  const { selectItem, deleteItem, updateItem, moveItem, addItem, newItemId, clearNewItemId, toggleVisibility } = useTreeContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragOver, setIsDragOver] = useState<'before' | 'after' | 'inside' | null>(null);
  const [editValue, setEditValue] = useState(item.title);
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRoot = level === 0;
  const isPreview = item.type === 'preview';

  useEffect(() => {
    if (newItemId === item.id) {
      setIsEditing(true);
      setEditValue(item.title);
    }
  }, [newItemId, item.id, item.title]);

  useEffect(() => {
    setEditValue(item.title);
  }, [item.title]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    if (!isPreview) {
      selectItem(item);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRoot && !isPreview) {
      const message = item.type === 'chapter' 
        ? `Are you sure you want to delete this chapter and all its scenes?`
        : `Are you sure you want to delete this scene?`;
      
      if (window.confirm(message)) {
        deleteItem(item.id);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreview) {
      setIsEditing(true);
      setEditValue(item.title);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateItem({ ...item, title: editValue });
      setIsEditing(false);
      if (newItemId === item.id) {
        clearNewItemId();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(item.title);
      setIsEditing(false);
      if (newItemId === item.id) {
        deleteItem(item.id);
        clearNewItemId();
      }
    }
  };

  const handleTitleBlur = () => {
    if (editValue !== item.title) {
      const shouldSave = window.confirm('Do you want to save the changes?');
      if (shouldSave) {
        updateItem({ ...item, title: editValue });
      } else {
        setEditValue(item.title);
      }
    }
    setIsEditing(false);
    if (newItemId === item.id) {
      clearNewItemId();
    }
  };

  const handleTypeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRoot && !isPreview) {
      const newType = item.type === 'chapter' ? 'scene' : 'chapter';
      const updatedItem = { ...item, type: newType };
      updateItem(updatedItem);
    }
  };

  const handleAddChild = (type: 'chapter' | 'scene') => (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(type, item.id);
    setIsExpanded(true);
  };

  const handleVisibilityToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreview) {
      toggleVisibility(item.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isRoot && !isPreview) {
      e.stopPropagation();
      setIsDragOver(null);
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';
    } else {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setIsDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isRoot && !isPreview) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!nodeRef.current) return;
      
      const rect = nodeRef.current.getBoundingClientRect();
      const mouseY = e.clientY;
      const threshold = 5;
      
      const relativeY = mouseY - rect.top;
      
      if (relativeY < threshold) {
        setIsDragOver('before');
      } else if (relativeY > rect.height - threshold) {
        setIsDragOver('after');
      } else {
        setIsDragOver('inside');
      }
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isRoot && !isPreview) {
      e.preventDefault();
      e.stopPropagation();
      
      const draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId && isDragOver) {
        moveItem(draggedId, item.id, isDragOver);
      }
      
      setIsDragOver(null);
    }
  };

  const getDragOverClass = () => {
    if (!isDragOver) return '';
    switch (isDragOver) {
      case 'before':
        return 'border-t-2 border-primary';
      case 'after':
        return 'border-b-2 border-primary';
      case 'inside':
        return 'bg-accent/50';
      default:
        return '';
    }
  };

  const ItemIcon = item.type === 'chapter' ? Book : FileText;

  return (
    <div className="select-none">
      <div
        ref={nodeRef}
        className={`group flex items-center px-2 py-1 hover:bg-accent/50 cursor-pointer ${getDragOverClass()} ${isRoot ? 'bg-muted/50' : ''} ${!item.isVisible && !isPreview ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={!isRoot && !isPreview}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button onClick={handleToggle} className="mr-1 shrink-0">
          {item.children.length > 0 ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : <span className="w-4" />}
        </button>
        
        {!isRoot && !isPreview && <GripVertical size={16} className="mr-2 shrink-0 cursor-move text-muted-foreground" />}
        <ItemIcon size={16} className={`mr-2 shrink-0 ${!item.isVisible && !isPreview ? 'text-muted-foreground' : ''}`} />
        
        {isEditing && !isPreview ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            onBlur={handleTitleBlur}
            className="flex-1 min-w-0 bg-background border rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        ) : (
          <div className="flex-1 min-w-0 flex items-center">
            <span 
              onDoubleClick={handleDoubleClick}
              className="truncate"
            >
              {item.title}
            </span>
          </div>
        )}
        
        <div className={`flex items-center gap-1 shrink-0 ml-2 transition-all duration-200 ${
          isHovered ? 'opacity-100 w-[120px]' : 'opacity-0 w-0 overflow-hidden'
        }`}>
          {!isPreview && !isRoot && (
            <>
              <button
                onClick={handleVisibilityToggle}
                className="p-1 hover:bg-background rounded shrink-0"
                title={item.isVisible ? "Hide from preview" : "Show in preview"}
              >
                {item.isVisible ? (
                  <Eye size={16} className="text-primary" />
                ) : (
                  <EyeOff size={16} className="text-muted-foreground" />
                )}
              </button>
              <button
                onClick={handleAddChild('chapter')}
                className="p-1 hover:bg-background rounded relative shrink-0"
                title="Add chapter"
              >
                <Book size={16} />
                <Plus size={12} className="absolute -right-1 -bottom-1" />
              </button>
              <button
                onClick={handleAddChild('scene')}
                className="p-1 hover:bg-background rounded relative shrink-0"
                title="Add scene"
              >
                <FileText size={16} />
                <Plus size={12} className="absolute -right-1 -bottom-1" />
              </button>
              <button
                onClick={handleTypeToggle}
                className="p-1 hover:bg-background rounded shrink-0"
                title={`Convert to ${item.type === 'chapter' ? 'scene' : 'chapter'}`}
              >
                <SwitchCamera size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded shrink-0"
                title={item.type === 'chapter' ? "Delete chapter and all scenes" : "Delete scene"}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {!isPreview && isRoot && (
            <>
              <button
                onClick={handleAddChild('chapter')}
                className="p-1 hover:bg-background rounded relative shrink-0"
                title="Add chapter"
              >
                <Book size={16} />
                <Plus size={12} className="absolute -right-1 -bottom-1" />
              </button>
              <button
                onClick={handleAddChild('scene')}
                className="p-1 hover:bg-background rounded relative shrink-0"
                title="Add scene"
              >
                <FileText size={16} />
                <Plus size={12} className="absolute -right-1 -bottom-1" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {isExpanded && item.children.length > 0 && (
        <div>
          {item.children.map(child => (
            <TreeNode key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView: React.FC = () => {
  const { items } = useTreeContext();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2">
        {items.map(item => (
          <TreeNode key={item.id} item={item} level={0} />
        ))}
      </div>
    </div>
  );
};