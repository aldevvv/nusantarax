'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Eye, 
  Trash2,
  Clock,
  Hash,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  imageSize?: string;
  fileSize?: number;
  fileName: string;
  prompt: string;
  seed?: string;
  generationTime?: number;
  order: number;
  createdAt: string;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  title: string;
  type?: 'template' | 'custom' | 'history';
  onDelete?: (imageId: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  title, 
  type = 'template',
  onDelete 
}) => {
  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleView = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleDelete = (imageId: string) => {
    if (onDelete) {
      onDelete(imageId);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatGenerationTime = (ms?: number) => {
    if (!ms) return 'Unknown';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <Card className="bg-black border border-[#72c306]/30 shadow-lg shadow-[#72c306]/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <ImageIcon className="h-5 w-5" />
          <span>{title}</span>
          <Badge className="bg-[#72c306]/20 text-[#72c306]">
            {images.length} {images.length === 1 ? 'image' : 'images'}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Click on any image to view, download, or manage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div 
              key={image.id}
              className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-[#72c306]/50 transition-all duration-200"
            >
              {/* Image */}
              <div className="aspect-square relative">
                <img
                  src={image.imageUrl}
                  alt={`Generated image ${image.order}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0MxIDUuOSAxOS4xIDUgMTguMSA1SDE2TDE0IDMuNUgxMEM4LjkgMy41IDggNC40IDggNS41VjdIMTIiIGZpbGw9IiM2YjcyODAiLz4KPC9zdmc+'; // Placeholder icon
                  }}
                />
                
                {/* Order Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/80 text-white text-xs">
                    #{image.order}
                  </Badge>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleView(image.imageUrl)}
                      className="bg-black/80 hover:bg-black text-white border border-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(image.imageUrl, image.fileName)}
                      className="bg-black/80 hover:bg-black text-white border border-white/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        className="bg-red-600/80 hover:bg-red-600 text-white border border-red-400/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Metadata */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Hash className="h-3 w-3" />
                    <span>{image.seed}</span>
                  </div>
                  {image.generationTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatGenerationTime(image.generationTime)}</span>
                    </div>
                  )}
                </div>
                
                {image.fileSize && (
                  <div className="text-xs text-gray-500">
                    Size: {formatFileSize(image.fileSize)} • {image.imageSize || '1024x1024'}
                  </div>
                )}
                
                {/* Truncated Prompt */}
                <div className="text-xs text-gray-400 line-clamp-2" title={image.prompt}>
                  {image.prompt}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {images.length > 1 && (
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                images.forEach(image => 
                  handleDownload(image.imageUrl, image.fileName)
                );
              }}
              className="border-[#72c306]/30 text-[#72c306] hover:bg-[#72c306]/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGallery;