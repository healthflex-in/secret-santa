import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadProps {
  onUpload: (names: string[]) => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const names: string[] = [];

      lines.forEach((line) => {
        // Handle both single column and multi-column CSV
        const cells = line.split(',');
        cells.forEach((cell) => {
          const name = cell.trim().replace(/^["']|["']$/g, ''); // Remove quotes
          if (name && name.length > 0) {
            names.push(name);
          }
        });
      });

      // Remove duplicates and filter empty strings
      const uniqueNames = [...new Set(names)].filter(Boolean);

      if (uniqueNames.length < 3) {
        toast({
          title: "Not Enough Names",
          description: "Please upload a CSV with at least 3 participants.",
          variant: "destructive",
        });
        return;
      }

      onUpload(uniqueNames);
      toast({
        title: "CSV Uploaded!",
        description: `Successfully loaded ${uniqueNames.length} participants.`,
      });
    };

    reader.onerror = () => {
      toast({
        title: "Error Reading File",
        description: "Could not read the CSV file. Please try again.",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
    
    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        id="csv-upload"
      />
      <Button
        variant="outline"
        className="w-full border-dashed border-2 border-christmas-green/40 hover:border-christmas-green hover:bg-christmas-green/10 h-20"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-sm">Upload CSV File</span>
        </div>
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Upload a CSV file with participant names (one name per cell or line)
      </p>
    </div>
  );
};

export default CSVUpload;
