import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Tag } from 'lucide-react';
import { supabase } from '../supabase/supabase';
import { Document } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import DocumentItem from '../components/documents/DocumentItem';
import Alert from '../components/ui/Alert';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            projects(id, name)
          `)
          .order('updated_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        setDocuments(data);
        
        // Extract all unique tags
        const tags = Array.from(
          new Set(data.flatMap(doc => doc.tags || []))
        ).sort();
        setAllTags(tags);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentDocuments();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          projects(id, name)
        `)
        .order('updated_at', { ascending: false });
      
      // Apply search filter if query exists
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      // Apply tag filters if selected
      if (selectedTags.length > 0) {
        for (const tag of selectedTags) {
          query = query.contains('tags', [tag]);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setDocuments(data);
    } catch (err) {
      console.error('Error searching documents:', err);
      setError('Failed to search documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedTags]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Recent Documents</h1>
      </div>
      
      {error && (
        <Alert
          variant="error"
          isDismissable
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:flex-1">
          <div className="relative">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        {allTags.length > 0 && (
          <div className="md:flex-1">
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'primary' : 'default'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : documents.length > 0 ? (
        <div className="flex flex-col space-y-4">
          {documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              className="relative"
              document={doc}
              onClick={() => 
                navigate(`/projects/${doc.project_id}/documents/${doc.id}`)
              }
            />
          ))}
        </div>
      ) : (
        <Card>
          <div className="py-12 px-4 text-center">
            <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Tag className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || selectedTags.length > 0
                ? 'Try adjusting your search or filter criteria'
                : 'Create a document in one of your projects to get started'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentsPage;