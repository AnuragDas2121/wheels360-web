import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const { toast } = useToast();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errorImages, setErrorImages] = useState<string[]>([]);

  useEffect(() => {
    // Reset error images when images prop changes
    setErrorImages([]);
  }, [images]);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    if (images.includes(newImageUrl)) {
      toast({
        title: "Error",
        description: "This image URL is already added",
        variant: "destructive",
      });
      return;
    }

    if (images.length >= maxImages) {
      toast({
        title: "Error",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    // Set loading state for this image
    setLoading(prev => ({ ...prev, [newImageUrl]: true }));

    // Verify if the URL is a valid image
    const img = new Image();
    img.onload = () => {
      onChange([...images, newImageUrl]);
      setNewImageUrl("");
      setLoading(prev => ({ ...prev, [newImageUrl]: false }));
    };
    img.onerror = () => {
      toast({
        title: "Error",
        description: "Invalid image URL or image could not be loaded",
        variant: "destructive",
      });
      setLoading(prev => ({ ...prev, [newImageUrl]: false }));
    };
    img.src = newImageUrl;
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleImageError = (url: string) => {
    if (!errorImages.includes(url)) {
      setErrorImages(prev => [...prev, url]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="https://example.com/car-image.jpg"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
        </div>
        <Button 
          type="button" 
          onClick={handleAddImage}
          disabled={loading[newImageUrl] || !newImageUrl || images.length >= maxImages}
          className="whitespace-nowrap"
          variant="outline"
        >
          {loading[newImageUrl] ? (
            <>Loading...</>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" /> Add Image
            </>
          )}
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed rounded-md p-8 text-center bg-neutral-50">
          <ImageIcon className="h-10 w-10 mx-auto text-neutral-light mb-3" />
          <p className="text-neutral-medium">No images added yet</p>
          <p className="text-sm text-neutral-light mt-1">
            Add image URLs to showcase your vehicle
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-[4/3] relative">
                {errorImages.includes(url) ? (
                  <div className="flex flex-col items-center justify-center h-full bg-neutral-50 p-4">
                    <AlertCircle className="h-8 w-8 text-error mb-2" />
                    <p className="text-sm text-neutral-medium text-center">Failed to load image</p>
                    <p className="text-xs text-neutral-light mt-1 break-all">{url.substring(0, 30)}...</p>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Car image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(url)}
                  />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleRemoveImage(index)}
                    className="scale-90 hover:scale-100 transition-transform"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-neutral-medium">
        {images.length} of {maxImages} images added
      </p>
    </div>
  );
}