import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
} from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";

const SortSelector = ({ onSortChange }) => {
  const sortOptions = [
    { label: "Price", value: "current_price" },
    { label: "Range", value: "epa_range" },
    { label: "0-60", value: "acceleration_0_60" },
    { label: "Top Speed", value: "top_speed" },
    { label: "Rating", value: "average_rating" },
  ];

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        Order by
      </MenuButton>
      <MenuList>
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              console.log("is this firing?");
              onSortChange(option.value);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default SortSelector;
