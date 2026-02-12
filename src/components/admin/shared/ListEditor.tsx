import { useState } from "react";
import {
  HStack,
  IconButton,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface Props {
  value: string[] | null | undefined;
  onChange: (val: string[]) => void;
  placeholder?: string;
}

export default function ListEditor({ value, onChange, placeholder = "Add item" }: Props) {
  const list = value ?? [];
  const [newItem, setNewItem] = useState("");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const add = () => {
    if (!newItem.trim()) return;
    onChange([...list, newItem.trim()]);
    setNewItem("");
  };

  const remove = (idx: number) => {
    onChange(list.filter((_, i) => i !== idx));
  };

  return (
    <>
      <Wrap spacing={1} mb={2}>
        {list.map((item, i) => (
          <WrapItem key={i}>
            <Tag size="sm" borderRadius="full" colorScheme="green" variant="subtle">
              <TagLabel>{item}</TagLabel>
              <TagCloseButton onClick={() => remove(i)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
      <HStack spacing={2}>
        <Input
          size="sm"
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          borderColor={borderColor}
        />
        <IconButton
          aria-label="Add"
          icon={<FaPlus />}
          size="xs"
          colorScheme="green"
          variant="ghost"
          onClick={add}
        />
      </HStack>
    </>
  );
}
