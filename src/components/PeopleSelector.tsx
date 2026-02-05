import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
} from "@chakra-ui/react";
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

  const btnBg = useColorModeValue("white", "gray.700");
  const btnBorder = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("gray.50", "gray.600");

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
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
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
        {currentCategory
          ? `${
              currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
            }s`
          : "All People"}
      </MenuButton>
      <MenuList borderRadius="12px" boxShadow="lg" border="1px solid" borderColor={btnBorder}>
        <MenuItem
          onClick={() => handleCategorySelect(null)}
          fontSize="sm"
          _hover={{ bg: "green.50", color: "green.700" }}
        >
          All People
        </MenuItem>
        <MenuItem
          onClick={() => handleCategorySelect("CEO")}
          fontSize="sm"
          _hover={{ bg: "green.50", color: "green.700" }}
        >
          CEOs
        </MenuItem>
        <MenuItem
          onClick={() => handleCategorySelect("Founder")}
          fontSize="sm"
          _hover={{ bg: "green.50", color: "green.700" }}
        >
          Founders
        </MenuItem>
        <MenuItem
          onClick={() => handleCategorySelect("Journalist")}
          fontSize="sm"
          _hover={{ bg: "green.50", color: "green.700" }}
        >
          Journalists
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default PeopleSelector;
