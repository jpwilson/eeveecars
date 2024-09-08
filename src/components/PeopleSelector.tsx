import { Button, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate, useSearchParams } from "react-router-dom";

interface PeopleSelectorProps {
  onCategoryChange: (category: string) => void;
}

const PeopleSelector: React.FC<PeopleSelectorProps> = ({
  onCategoryChange,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleCategorySelect = (category: string | null) => {
    if (category) {
      navigate(`/people?category=${category.toLowerCase()}`);
      onCategoryChange(category.toLowerCase());
    } else {
      navigate("/people");
    }
  };

  const currentCategory = searchParams.get("category");

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        {currentCategory
          ? `${
              currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
            }s`
          : "All People"}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleCategorySelect(null)}>
          All People
        </MenuItem>
        <MenuItem onClick={() => handleCategorySelect("CEO")}>CEOs</MenuItem>
        <MenuItem onClick={() => handleCategorySelect("Founder")}>
          Founders
        </MenuItem>
        <MenuItem onClick={() => handleCategorySelect("Journalist")}>
          Journalists
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default PeopleSelector;
