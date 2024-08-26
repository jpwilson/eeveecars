import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";

interface Props {
  onCategoryChange: (category: string) => void;
}

const PeopleSelector = ({ onCategoryChange }: Props) => {
  const categories = ["Founders", "CEOs", "Key People", "Journalists"];

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        People
      </MenuButton>
      <MenuList>
        {categories.map((category) => (
          <MenuItem key={category} onClick={() => onCategoryChange(category)}>
            {category}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PeopleSelector;
