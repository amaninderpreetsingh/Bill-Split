import { Upload, X, ImageIcon, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  selectedFile: File | null;
  imagePreview: string | null;
  isDragging: boolean;
  isAnalyzing: boolean;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemove: () => void;
  onAnalyze: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ReceiptUploader({
  selectedFile,
  imagePreview,
  isDragging,
  isAnalyzing,
  onFileInput,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onAnalyze,
  fileInputRef,
}: Props) {
  return (
    <Card
      className={`p-4 md:p-8 shadow-medium border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : imagePreview
          ? 'border-primary/40'
          : 'border-primary/20 hover:border-primary/40'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {!imagePreview ? (
        <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6 py-8 md:py-12">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg md:text-xl font-semibold">Upload Your Receipt</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Drag and drop or click to upload your bill
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            onChange={onFileInput}
            className="hidden"
          />

          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-5 w-5" />
            Choose File
          </Button>

          <p className="text-sm text-muted-foreground">
            Supports JPG, PNG, HEIC • Max 20MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedFile?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={imagePreview}
              alt="Receipt preview"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            onClick={onAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Receipt...
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-5 w-5" />
                Analyze Receipt
              </>
            )}
          </Button>
          {isAnalyzing && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              This may take a few moments. AI is extracting items from your receipt...
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
