import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { BsSearch, BsX } from "react-icons/bs";

interface Props {
  onSearch: (searchText: string) => void;
}

const SearchInput = ({ onSearch }: Props) => {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  const handleInputChange = (event) => {
    setValue(event.target.value);
    onSearch(event.target.value); // This triggers the search in the parent component
  };

  const handleClearSearch = () => {
    setValue("");
    onSearch("");
    ref.current?.focus();
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none" children={<BsSearch />} />
      <Input
        ref={ref}
        value={value}
        borderRadius={20}
        placeholder="Search EV makes, models and submodels"
        variant="filled"
        onChange={handleInputChange}
      />
      {value && (
        <InputRightElement>
          <IconButton
            aria-label="Clear search"
            icon={<BsX />}
            size="sm"
            onClick={handleClearSearch}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

export default SearchInput;

// const SearchInput = ({ onSearch }: Props) => {
//   const ref = useRef<HTMLInputElement>(null);

//   const handleInputChange = (event) => {
//     const currentText = event.target.value;
//     onSearch(currentText); // Assuming onSearch updates the search state in your parent component
//   };

//   return (
//     <form
//       onSubmit={(event) => {
//         event.preventDefault();
//         if (ref.current) onSearch(ref.current.value);
//       }}
//     >
//       <InputGroup>
//         <InputLeftElement children={<BsSearch />} />
//         <Input
//           ref={ref}
//           borderRadius={20}
//           placeholder="Search EV makes, models and submodels"
//           variant="filled"
//           onChange={handleInputChange} // Add this line
//         />
//       </InputGroup>
//     </form>
//   );
// };

// export default SearchInput;
