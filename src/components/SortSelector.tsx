import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
} from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";

const SortSelector = () => {
  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        Order by: Price
      </MenuButton>
      <MenuList>
        <MenuItem>Price</MenuItem>
        <MenuItem>Range</MenuItem>
        <MenuItem>0-60</MenuItem>
        <MenuItem>Top Speed</MenuItem>
        <MenuItem>Rating</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default SortSelector;
