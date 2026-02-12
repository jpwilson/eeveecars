import { useState } from "react";
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
  useColorModeValue,
} from "@chakra-ui/react";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Props {
  car: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

export default function ImagesSection({ car, onChange }: Props) {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [newImageUrl, setNewImageUrl] = useState("");

  const images: string[] = car.images ?? [];

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    onChange("images", [...images, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const removeImage = (idx: number) => {
    onChange("images", images.filter((_, i) => i !== idx));
  };

  return (
    <>
      <FormControl mb={4}>
        <FormLabel fontSize="xs">Primary Image URL</FormLabel>
        <Input
          size="sm"
          value={car.image_url ?? ""}
          onChange={(e) => onChange("image_url", e.target.value || null)}
          borderColor={borderColor}
          placeholder="https://..."
        />
        {car.image_url && (
          <Image
            src={car.image_url}
            alt="Primary"
            maxH="120px"
            mt={2}
            objectFit="contain"
            borderRadius="8px"
            border="1px solid"
            borderColor={borderColor}
          />
        )}
      </FormControl>

      <Text fontSize="xs" fontWeight="600" mb={2}>
        Image Gallery ({images.length})
      </Text>
      <Text fontSize="xs" color="gray.500" mb={3}>
        File uploads will be available after Supabase Storage migration. For now, enter image URLs directly.
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

      <HStack spacing={2}>
        <Input
          size="sm"
          placeholder="Add image URL..."
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addImage()}
          borderColor={borderColor}
        />
        <IconButton
          aria-label="Add image"
          icon={<FaPlus />}
          size="xs"
          colorScheme="green"
          variant="ghost"
          onClick={addImage}
        />
      </HStack>
    </>
  );
}
