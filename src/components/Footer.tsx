import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link as ChakraLink,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaBolt } from "react-icons/fa";
import NewsletterSignup from "./NewsletterSignup";

const linkColumns: {
  heading: string;
  links: { label: string; to?: string; href?: string }[];
}[] = [
  {
    heading: "Explore",
    links: [
      { label: "All EVs", to: "/" },
      { label: "Marketplace", to: "/marketplace" },
      { label: "EV News", to: "/news" },
      { label: "Industry People", to: "/people" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Advertise", to: "/advertise" },
      { label: "Contact", href: "mailto:jeanpaulwilson@gmail.com" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Use", to: "/terms" },
    ],
  },
];

export default function Footer() {
  const bg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(26,32,44,0.7)");
  const border = useColorModeValue("rgba(34,197,94,0.15)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      as="footer"
      mt={16}
      bg={bg}
      backdropFilter="blur(16px)"
      borderTop="1px solid"
      borderColor={border}
    >
      <Container maxW="7xl" py={10}>
        <Box
          mb={10}
          pb={8}
          borderBottom="1px solid"
          borderColor={border}
          display="flex"
          justifyContent="center"
        >
          <NewsletterSignup />
        </Box>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack spacing={3}>
            <HStack>
              <Icon as={FaBolt} color="green.500" boxSize={5} />
              <Text fontWeight="700" fontSize="lg">
                EV Lineup
              </Text>
            </HStack>
            <Text fontSize="sm" color={subText} maxW="260px">
              Every electric vehicle on the market — specs, range, price, and
              charging, compared side by side.
            </Text>
          </Stack>

          {linkColumns.map((col) => (
            <Stack key={col.heading} spacing={2}>
              <Text fontWeight="600" fontSize="sm" textTransform="uppercase" letterSpacing="wide">
                {col.heading}
              </Text>
              {col.links.map((l) =>
                l.to ? (
                  <ChakraLink
                    key={l.label}
                    as={RouterLink}
                    to={l.to}
                    fontSize="sm"
                    color={subText}
                    _hover={{ color: "green.500" }}
                  >
                    {l.label}
                  </ChakraLink>
                ) : (
                  <ChakraLink
                    key={l.label}
                    href={l.href}
                    fontSize="sm"
                    color={subText}
                    _hover={{ color: "green.500" }}
                  >
                    {l.label}
                  </ChakraLink>
                )
              )}
            </Stack>
          ))}
        </SimpleGrid>

        <Text fontSize="xs" color={subText} mt={10} textAlign="center">
          © {new Date().getFullYear()} EV Lineup · evlineup.org — the electric
          vehicle database and comparison site. Vehicle data is researched from
          manufacturer and public sources; always confirm specs and pricing with
          the manufacturer or dealer.
        </Text>
      </Container>
    </Box>
  );
}
