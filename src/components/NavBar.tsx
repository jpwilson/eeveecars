import {
  Flex,
  Box,
  Text,
  HStack,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Show,
  Hide,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import ColorModeSwitch from "./ColorModeSwitch";
import { Link } from "react-router-dom";
import SearchInput from "./SearchInput";
import { FaBolt, FaCar, FaUsers, FaStore, FaNewspaper } from "react-icons/fa";

const navLinks: { label: string; mobileLabel?: string; to: string; icon: React.ElementType }[] = [
  { label: "Home", mobileLabel: "Database", to: "/", icon: FaCar },
  { label: "People", to: "/people", icon: FaUsers },
  { label: "Marketplace", to: "/marketplace", icon: FaStore },
  { label: "Insights", to: "/insights", icon: FaNewspaper },
  { label: "About", to: "/about", icon: FaBolt },
];

interface Props {
  onSearch?: (searchText: string) => void;
}

const NavBar = ({ onSearch }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navBg = useColorModeValue("rgba(240, 244, 248, 0.85)", "rgba(26, 32, 44, 0.85)");
  const borderColor = useColorModeValue("rgba(34, 197, 94, 0.15)", "rgba(34, 197, 94, 0.3)");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const navLinkColor = useColorModeValue("rgba(26, 34, 48, 0.65)", "gray.400");
  const logoColor = useColorModeValue("#16a34a", "#4ec77f");
  const hoverColor = "#16a34a";
  const drawerBg = useColorModeValue("white", "gray.800");

  return (
    <Box
      bg={navBg}
      backdropFilter="blur(20px)"
      borderBottom={`1px solid ${borderColor}`}
      position="sticky"
      top={0}
      zIndex={100}
    >
      <Flex
        justifyContent="space-between"
        padding={{ base: "10px 16px", md: "12px 24px" }}
        align="center"
        maxW="1600px"
        mx="auto"
      >
        <Flex align="center" flexShrink={0}>
          <Link to="/">
            <HStack spacing={2}>
              <Icon as={FaBolt} color={logoColor} boxSize={5} />
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="700"
                color={logoColor}
                letterSpacing="-0.02em"
              >
                EV Lineup
              </Text>
            </HStack>
          </Link>
        </Flex>

        {onSearch && (
          <Box flex="1" mx={{ base: 3, md: 6 }} maxW="600px">
            <SearchInput onSearch={onSearch} />
          </Box>
        )}

        {/* Desktop nav links */}
        <Show above="md">
          <HStack spacing={{ md: 5, lg: 8 }} flexShrink={0}>
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to}>
                <Text
                  fontWeight="500"
                  fontSize="sm"
                  color={navLinkColor}
                  whiteSpace="nowrap"
                  _hover={{ color: hoverColor }}
                  transition="color 0.2s"
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </HStack>
        </Show>

        {/* Hamburger menu - mobile only, right side */}
        <Hide above="md">
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon boxSize={5} />}
            variant="ghost"
            color={textColor}
            onClick={onOpen}
            ml={2}
            _hover={{ bg: useColorModeValue("blackAlpha.50", "whiteAlpha.100") }}
          />
        </Hide>

        {/* Mobile menu drawer - slides from right */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay bg="blackAlpha.300" />
          <DrawerContent bg={drawerBg} borderLeft={`1px solid ${borderColor}`}>
            <DrawerCloseButton color={textColor} />
            <DrawerBody pt={16}>
              <VStack spacing={2} align="stretch">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.to} onClick={onClose}>
                    <HStack
                      px={4}
                      py={3}
                      borderRadius="12px"
                      _hover={{ bg: useColorModeValue("gray.100", "whiteAlpha.100") }}
                      transition="background 0.2s"
                      spacing={3}
                    >
                      <Icon as={link.icon} color={logoColor} boxSize={5} />
                      <Text fontWeight="500" color={textColor} fontSize="lg">
                        {link.mobileLabel || link.label}
                      </Text>
                    </HStack>
                  </Link>
                ))}
              </VStack>

              {/* Dark mode toggle at the bottom of drawer */}
              <Box
                position="absolute"
                bottom={8}
                left={0}
                right={0}
                px={6}
              >
                <Box
                  p={4}
                  borderRadius="12px"
                  bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                >
                  <ColorModeSwitch />
                </Box>
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
};

export default NavBar;
