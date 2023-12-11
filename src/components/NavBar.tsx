import { Flex, Box, Heading, Text, Image, Input } from "@chakra-ui/react";
import logo from "../assets/logo_s.png";
import ColorModeSwitch from "./ColorModeSwitch";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";

interface Props {
  onSearch: (searchText: string) => void;
}

const NavBar = ({ onSearch }: Props) => {
  return (
    <Flex justifyContent="space-between" padding="14px" align="center">
      <Flex align="center" minW="200px">
        {" "}
        <Link to="/">
          {/* <Image src={logo} boxSize="60px" borderRadius={8} /> */}
          <Heading color={"lightgreen"} ml={3}>
            EV Lineup
          </Heading>
          <Text
            color={"gray.450"}
            ml={2}
            mt={1}
            mb={3}
            fontSize="sm"
            w="full"
            textAlign="center"
          >
            Electric Car Database
          </Text>
        </Link>
      </Flex>
      <Box flex="1" mx={3}>
        {" "}
        {/* Search bar will grow to fill available space */}
        {/* <Input borderRadius={20} placeholder="Search EVs..." variant="filled" /> */}
        <SearchInput onSearch={onSearch} />
      </Box>
      <ColorModeSwitch />
    </Flex>
  );
};

export default NavBar;
