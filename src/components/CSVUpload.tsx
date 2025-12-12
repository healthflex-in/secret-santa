import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadProps {
  onUpload: (names: string[]) => void;
  onUploadWithEmails?: (data: { name: string; email: string }[]) => void;
}

// Helper function to parse CSV line (handles quoted values)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload, onUploadWithEmails }) => {
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
      const lines = text.split(/\r?\n/).filter(line => line.trim()); // Remove empty lines
      
      if (lines.length < 2) {
        toast({
          title: "Invalid CSV",
          description: "CSV file must have a header row and at least one data row.",
          variant: "destructive",
        });
        return;
      }

      // Parse header row
      const header = parseCSVLine(lines[0]).map(cell => cell.replace(/^["']|["']$/g, '').toLowerCase());
      const nameIndex = header.findIndex(h => h === 'name' || h === 'names');
      const emailIndex = header.findIndex(h => h === 'email' || h === 'emails' || h === 'email id' || h === 'emailid');

      // Check if we have both name and email columns
      if (nameIndex !== -1 && emailIndex !== -1 && onUploadWithEmails) {
        // Parse CSV with names and emails
        const data: { name: string; email: string }[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]).map(cell => cell.replace(/^["']|["']$/g, '').trim());
          const name = cells[nameIndex]?.trim();
          const email = cells[emailIndex]?.trim();
          
          if (name && email && email.includes('@')) {
            data.push({ name, email: email.toLowerCase() });
          }
        }

        if (data.length < 2) {
          toast({
            title: "Not Enough Data",
            description: "Please upload a CSV with at least 2 participants with valid names and emails.",
            variant: "destructive",
          });
          return;
        }

        onUploadWithEmails(data);
        toast({
          title: "CSV Uploaded!",
          description: `Successfully loaded ${data.length} participants with emails.`,
        });
      } else {
        // Fallback to old behavior - just names
        const names: string[] = [];

        lines.slice(1).forEach((line) => {
          // Handle both single column and multi-column CSV
          const cells = line.split(',');
          cells.forEach((cell) => {
            const name = cell.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (name && name.length > 0 && !name.toLowerCase().includes('@')) {
              names.push(name);
            }
          });
        });

        // Remove duplicates and filter empty strings
        const uniqueNames = [...new Set(names)].filter(Boolean);

        if (uniqueNames.length < 2) {
          toast({
            title: "Not Enough Names",
            description: "Please upload a CSV with at least 2 participants.",
            variant: "destructive",
          });
          return;
        }

        onUpload(uniqueNames);
        toast({
          title: "CSV Uploaded!",
          description: `Successfully loaded ${uniqueNames.length} participants.`,
        });
      }
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
        Upload a CSV file with participant names and emails (columns: NAMES, Email)
      </p>
    </div>
  );
};

export default CSVUpload;
