import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";

import { BsChevronDown } from "react-icons/bs";

import { SortOption } from "../types/types";

interface SortOptionItem {
  label: string;
  value: SortOption;
}

interface SortSelectorProps {
  onSortChange: (option: SortOption) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({ onSortChange }) => {
  const btnBg = useColorModeValue("white", "gray.700");
  const btnBorder = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  const sortOptions: SortOptionItem[] = [
    {
      label: "Price (lowest first)",
      value: { field: "current_price", direction: "asc" },
    },
    {
      label: "Price (highest first)",
      value: { field: "current_price", direction: "desc" },
    },
    {
      label: "Range (shortest first)",
      value: { field: "epa_range", direction: "asc" },
    },
    {
      label: "Range (longest first)",
      value: { field: "epa_range", direction: "desc" },
    },
    {
      label: "0-60 (fastest first)",
      value: { field: "acceleration_0_60", direction: "asc" },
    },
    {
      label: "0-60 (slowest first)",
      value: { field: "acceleration_0_60", direction: "desc" },
    },
    {
      label: "Top Speed (fastest first)",
      value: { field: "top_speed", direction: "desc" },
    },
    {
      label: "Top Speed (slowest first)",
      value: { field: "top_speed", direction: "asc" },
    },
    {
      label: "Rating (highest first)",
      value: { field: "average_rating", direction: "desc" },
    },
    {
      label: "Rating (lowest first)",
      value: { field: "average_rating", direction: "asc" },
    },
  ];

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<BsChevronDown />}
        size="sm"
        bg={btnBg}
        color={textColor}
        border="1px solid"
        borderColor={btnBorder}
        borderRadius="10px"
        fontWeight="500"
        _hover={{ borderColor: "green.300", bg: hoverBg }}
        _active={{ borderColor: "green.400" }}
      >
        Order by
      </MenuButton>
      <MenuList borderRadius="12px" boxShadow="lg" border="1px solid" borderColor={btnBorder}>
        {sortOptions.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => onSortChange(option.value)}
            fontSize="sm"
            _hover={{ bg: "green.50", color: "green.700" }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default SortSelector;
