import {
  Flex,
  Box,
  Heading,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Divider,
  Show,
  Hide,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import ColorModeSwitch from "./ColorModeSwitch";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";

interface Props {
  onSearch: (searchText: string) => void;
}

const NavBar = ({ onSearch }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex justifyContent="space-between" padding={{ base: "10px", md: "14px" }} align="center">
      {/* Hamburger menu - mobile only */}
      <Hide above="md">
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon boxSize={6} />}
          variant="ghost"
          onClick={onOpen}
          mr={2}
        />
      </Hide>

      <Flex align="center" minW={{ base: "auto", md: "200px" }}>
        <Link to="/">
          <Heading color={"lightgreen"} ml={{ base: 0, md: 3 }} fontSize={{ base: "xl", md: "2xl" }}>
            EV Lineup
          </Heading>
          <Hide below="sm">
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
          </Hide>
        </Link>
      </Flex>

      <Box flex="1" mx={{ base: 2, md: 3 }}>
        <SearchInput onSearch={onSearch} />
      </Box>

      {/* Color mode switch - desktop only */}
      <Show above="md">
        <ColorModeSwitch />
      </Show>

      {/* Mobile menu drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Heading size="md" color="lightgreen">Menu</Heading>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              <Box>
                <Text fontWeight="bold" mb={2} color="gray.500">Settings</Text>
                <ColorModeSwitch />
              </Box>
              <Divider />
              <Box>
                <Text fontWeight="bold" mb={2} color="gray.500">Navigation</Text>
                <VStack align="stretch" spacing={2}>
                  <Link to="/" onClick={onClose}>
                    <Text _hover={{ color: "lightgreen" }}>Home</Text>
                  </Link>
                  <Link to="/about" onClick={onClose}>
                    <Text _hover={{ color: "lightgreen" }}>About</Text>
                  </Link>
                  <Link to="/people" onClick={onClose}>
                    <Text _hover={{ color: "lightgreen" }}>People</Text>
                  </Link>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default NavBar;
