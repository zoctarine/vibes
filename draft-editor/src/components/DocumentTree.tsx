import React from 'react';
import { useDocumentStore } from '../store/documentStore';
import { Document } from '../types/auth';
import { ChevronRight, ChevronDown, Folder, FileText, Lock, Users } from 'lucide-react';

interface TreeNodeProps {
  document: Document;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ document, level }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { documents, setSelectedDocument, deleteDocument } = useDocumentStore();
  const childDocuments = documents.filter(doc => doc.parent_id === document.id);

  const handleSelect = () => {
    setSelectedDocument(document);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(document.id);
    }
  };

  const getPermissionIcon = () => {
    if (document.permissions.length === 0) {
      return <Lock size={16} className="text-muted-foreground" />;
    }
    return <Users size={16} className="text-primary" />;
  };

  return (
    <div>
      <div
        className="flex items-center px-2 py-1 hover:bg-accent/50 cursor-pointer group"
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={handleSelect}
      >
        {childDocuments.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-1"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {document.type === 'folder' ? (
          <Folder size={16} className="mr-2 text-primary" />
        ) : (
          <FileText size={16} className="mr-2" />
        )}
        <span className="flex-1">{document.title}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
          {getPermissionIcon()}
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      {isExpanded && childDocuments.length > 0 && (
        <div>
          {childDocuments.map(child => (
            <TreeNode key={child.id} document={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentTree: React.FC = () => {
  const { documents, loading, error } = useDocumentStore();
  const rootDocuments = documents.filter(doc => !doc.parent_id);

  if (loading) {
    return <div className="p-4">Loading documents...</div>;
  }

  if (error) {
    return <div className="p-4 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-2">
        {rootDocuments.map(document => (
          <TreeNode key={document.id} document={document} level={0} />
        ))}
      </div>
    </div>
  );
};