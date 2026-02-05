import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRef, useState, ChangeEvent } from "react";
import { BsSearch, BsX } from "react-icons/bs";

interface Props {
  onSearch: (searchText: string) => void;
}

const SearchInput = ({ onSearch }: Props) => {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorder = useColorModeValue("gray.200", "gray.600");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onSearch(event.target.value);
  };

  const handleClearSearch = () => {
    setValue("");
    onSearch("");
    ref.current?.focus();
  };

  return (
    <InputGroup size="sm">
      <InputLeftElement pointerEvents="none" children={<BsSearch />} />
      <Input
        ref={ref}
        value={value}
        borderRadius="10px"
        placeholder="Search EV makes, models and submodels"
        bg={inputBg}
        border="1px solid"
        borderColor={inputBorder}
        _hover={{ borderColor: "green.300" }}
        _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #16a34a" }}
        _placeholder={{ color: placeholderColor }}
        onChange={handleInputChange}
      />
      {value && (
        <InputRightElement>
          <IconButton
            aria-label="Clear search"
            icon={<BsX />}
            size="xs"
            variant="ghost"
            onClick={handleClearSearch}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

export default SearchInput;
