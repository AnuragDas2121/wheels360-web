import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Car } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Trash, Save, Upload, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface CarImageEditorProps {
  car: Car;
  onComplete?: () => void;
}

export default function CarImageEditor({ car, onComplete }: CarImageEditorProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>(car.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation to update car images
  const updateImagesMutation = useMutation({
    mutationFn: async (images: string[]) => {
      return apiRequest("PATCH", `/api/cars/${car.id}/images`, { images });
    },
    onSuccess: () => {
      toast({
        title: "Images Updated",
        description: "The car images have been updated successfully.",
      });
      // Invalidate queries that contain this car's data
      queryClient.invalidateQueries({ queryKey: [`/api/cars/${car.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cars/featured"] });
      if (onComplete) onComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car images.",
        variant: "destructive",
      });
    },
  });

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...imageUrls];
    updatedImages.splice(index, 1);
    setImageUrls(updatedImages);
  };

  const handleSaveImages = () => {
    updateImagesMutation.mutate(imageUrls);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64 for preview and storage
        const reader = new FileReader();
        
        // Create a promise to wait for the FileReader to complete
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
        });
        
        reader.readAsDataURL(file);
        
        // Wait for the FileReader to complete and get the base64 string
        const base64String = await base64Promise;
        
        // Add the base64 image to our list
        setImageUrls(prev => [...prev, base64String]);
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Images Added",
        description: `Successfully added ${files.length} image${files.length > 1 ? 's' : ''} from your device.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process one or more images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Update Car Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative border rounded-md overflow-hidden">
                <img 
                  src={url} 
                  alt={`Car image ${index + 1}`} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `/placeholder-car-${(index % 5) + 1}.svg`;
                  }}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveImage(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">Add by URL</TabsTrigger>
              <TabsTrigger value="upload">Upload from Device</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="mt-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddImage} type="button">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="mt-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                
                <div 
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto text-primary mb-3" />
                  <p className="font-medium mb-1">Click to upload</p>
                  <p className="text-sm text-neutral-medium mb-2">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                  {isUploading ? (
                    <div className="mt-2 text-sm text-primary">
                      Processing images...
                    </div>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Select Photos
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          <Button 
            onClick={handleSaveImages} 
            className="w-full" 
            disabled={updateImagesMutation.isPending || isUploading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Images
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}