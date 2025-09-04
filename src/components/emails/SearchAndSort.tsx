import { Search, SortDesc, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSortClick: () => void;
  onFilterClick: () => void;
}

export function SearchAndSort({
  searchQuery,
  onSearchChange,
  onSortClick,
  onFilterClick,
}: SearchAndSortProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Email Management
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search an Email"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSortClick}
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-smooth"
          >
            <SortDesc className="h-4 w-4" />
            Sort by Date
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-smooth"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
}