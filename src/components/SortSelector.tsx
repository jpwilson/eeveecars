import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
} from "@chakra-ui/react";

import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";

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
  const sortOptions: SortOptionItem[] = [
    {
      label: "Price (lowest first) ↑",
      value: { field: "current_price", direction: "asc" },
    },
    {
      label: "Price (highest first) ↓",
      value: { field: "current_price", direction: "desc" },
    },
    {
      label: "Range (worst first) ↑",
      value: { field: "epa_range", direction: "asc" },
    },
    {
      label: "Range (best first) ↓",
      value: { field: "epa_range", direction: "desc" },
    },
    {
      label: "0-60 (fastest first) ↑",
      value: { field: "acceleration_0_60", direction: "asc" },
    },
    {
      label: "0-60 (slowest first) ↓",
      value: { field: "acceleration_0_60", direction: "desc" },
    },
    {
      label: "Top Speed (fastest first) ↑",
      value: { field: "top_speed", direction: "desc" },
    },
    {
      label: "Top Speed (slowest first) ↓",
      value: { field: "top_speed", direction: "asc" },
    },
    {
      label: "Rating (worst first) ↑",
      value: { field: "average_rating", direction: "asc" },
    },
    {
      label: "Rating (best first) ↓",
      value: { field: "average_rating", direction: "desc" },
    },
  ];

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        Order by
      </MenuButton>
      <MenuList>
        {sortOptions.map((option) => (
          <MenuItem
            key={option.label}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default SortSelector;
