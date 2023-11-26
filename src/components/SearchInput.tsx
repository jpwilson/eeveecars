import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useRef } from "react";
import { BsSearch } from "react-icons/bs";

interface Props {
  onSearch: (searchText: string) => void;
}

const SearchInput = ({ onSearch }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleInputChange = (event) => {
    const currentText = event.target.value;
    onSearch(currentText); // Assuming onSearch updates the search state in your parent component
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (ref.current) onSearch(ref.current.value);
      }}
    >
      <InputGroup>
        <InputLeftElement children={<BsSearch />} />
        <Input
          ref={ref}
          borderRadius={20}
          placeholder="Search EV makes, models and submodels"
          variant="filled"
          onChange={handleInputChange} // Add this line
        />
      </InputGroup>
    </form>
  );
};

export default SearchInput;
