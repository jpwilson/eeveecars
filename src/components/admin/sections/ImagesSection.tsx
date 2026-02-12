import { useState, useRef } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Image,
  SimpleGrid,
  Text,
  IconButton,
  HStack,
  Button,
  useColorModeValue,
  useToast,
  Progress,
} from "@chakra-ui/react";
import { FaTrash, FaPlus, FaUpload } from "react-icons/fa";
import { supabase, STORAGE_BUCKET, getPublicUrl } from "../../../services/supabase-client";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function ImagesSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const images: string[] = car.images ?? [];

  const generateFilename = (file: File, suffix?: string): string => {
    const makeName = (car.make_name ?? "unknown").toLowerCase().replace(/\s+/g, "-");
    const model = (car.model ?? "unknown").toLowerCase().replace(/\s+/g, "-");
    const ext = file.name.split(".").pop() || "png";
    const tag = suffix ? `_${suffix}` : "";
    const timestamp = Date.now();
    return `${makeName}/${model}/${makeName}_${model}${tag}_${timestamp}.${ext}`;
  };

  const uploadFile = async (file: File, suffix?: string): Promise<string | null> => {
    const path = generateFilename(file, suffix);
    setIsUploading(true);
    setUploadProgress(30);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true });

    setUploadProgress(80);

    if (error) {
      toast({ title: "Upload failed", description: error.message, status: "error", duration: 5000 });
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }

    const publicUrl = getPublicUrl(path);
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);

    toast({ title: "Uploaded", description: file.name, status: "success", duration: 2000 });
    return publicUrl;
  };

  const handlePrimaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file, "primary");
    if (url) onChange("image_url", url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i], `gallery_${images.length + i}`);
      if (url) {
        images.push(url);
        onChange("images", [...images]);
      }
    }
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    onChange("images", [...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeImage = (idx: number) => {
    onChange("images", images.filter((_, i) => i !== idx));
  };

  return (
    <>
      {isUploading && <Progress value={uploadProgress} size="xs" colorScheme="green" mb={3} borderRadius="full" />}

      {/* Primary Image */}
      <FormControl mb={4}>
        <FormLabel fontSize="xs">Primary Image</FormLabel>
        <HStack spacing={2} mb={2}>
          <Input
            size="sm"
            value={car.image_url ?? ""}
            onChange={(e) => onChange("image_url", e.target.value || null)}
            borderColor={borderColor}
            placeholder="URL or upload below"
            flex={1}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={handlePrimaryUpload}
          />
          <Button
            size="sm"
            leftIcon={<FaUpload />}
            colorScheme="green"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
          >
            Upload
          </Button>
        </HStack>
        {car.image_url && (
          <Image
            src={car.image_url}
            alt="Primary"
            maxH="120px"
            objectFit="contain"
            borderRadius="8px"
            border="1px solid"
            borderColor={borderColor}
          />
        )}
      </FormControl>

      {/* Gallery */}
      <Text fontSize="xs" fontWeight="600" mb={2}>
        Image Gallery ({images.length})
      </Text>

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mb={3}>
        {images.map((url, i) => (
          <Box key={i} position="relative">
            <Image
              src={url}
              alt={`Image ${i + 1}`}
              h="80px"
              w="100%"
              objectFit="cover"
              borderRadius="8px"
              border="1px solid"
              borderColor={borderColor}
            />
            <IconButton
              aria-label="Remove image"
              icon={<FaTrash />}
              size="xs"
              colorScheme="red"
              position="absolute"
              top={1}
              right={1}
              onClick={() => removeImage(i)}
            />
          </Box>
        ))}
      </SimpleGrid>

      {/* Upload gallery images */}
      <HStack spacing={2} mb={2}>
        <input
          type="file"
          ref={galleryFileInputRef}
          accept="image/png,image/jpeg,image/webp"
          multiple
          style={{ display: "none" }}
          onChange={handleGalleryUpload}
        />
        <Button
          size="sm"
          leftIcon={<FaUpload />}
          colorScheme="green"
          variant="outline"
          onClick={() => galleryFileInputRef.current?.click()}
          isLoading={isUploading}
          w="100%"
        >
          Upload Images
        </Button>
      </HStack>

      {/* Or add by URL */}
      <HStack spacing={2}>
        <Input
          size="sm"
          placeholder="Or add image by URL..."
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addImageUrl()}
          borderColor={borderColor}
        />
        <IconButton
          aria-label="Add image"
          icon={<FaPlus />}
          size="xs"
          colorScheme="green"
          variant="ghost"
          onClick={addImageUrl}
        />
      </HStack>
    </>
  );
}
