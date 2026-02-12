import { useState } from "react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface Props {
  value: Record<string, string | number> | null | undefined;
  onChange: (val: Record<string, string | number>) => void;
  valueType?: "string" | "number";
  keyLabel?: string;
  valueLabel?: string;
}

export default function DictEditor({
  value,
  onChange,
  valueType = "string",
  keyLabel = "Key",
  valueLabel = "Value",
}: Props) {
  const dict = value ?? {};
  const entries = Object.entries(dict);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const addEntry = () => {
    if (!newKey.trim()) return;
    const parsed = valueType === "number" ? parseFloat(newVal) || 0 : newVal;
    onChange({ ...dict, [newKey.trim()]: parsed });
    setNewKey("");
    setNewVal("");
  };

  const removeEntry = (key: string) => {
    const next = { ...dict };
    delete next[key];
    onChange(next);
  };

  const updateValue = (key: string, val: string) => {
    const parsed = valueType === "number" ? parseFloat(val) || 0 : val;
    onChange({ ...dict, [key]: parsed });
  };

  return (
    <VStack align="stretch" spacing={1}>
      {entries.map(([k, v]) => (
        <HStack key={k} spacing={2}>
          <Text fontSize="xs" fontWeight="500" minW="100px" noOfLines={1}>
            {k}
          </Text>
          <Input
            size="sm"
            value={String(v)}
            type={valueType === "number" ? "number" : "text"}
            onChange={(e) => updateValue(k, e.target.value)}
            borderColor={borderColor}
          />
          <IconButton
            aria-label="Remove"
            icon={<FaTrash />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={() => removeEntry(k)}
          />
        </HStack>
      ))}
      <HStack spacing={2} pt={1}>
        <Input
          size="sm"
          placeholder={keyLabel}
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          borderColor={borderColor}
        />
        <Input
          size="sm"
          placeholder={valueLabel}
          value={newVal}
          type={valueType === "number" ? "number" : "text"}
          onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEntry()}
          borderColor={borderColor}
        />
        <IconButton
          aria-label="Add"
          icon={<FaPlus />}
          size="xs"
          colorScheme="green"
          variant="ghost"
          onClick={addEntry}
        />
      </HStack>
    </VStack>
  );
}
