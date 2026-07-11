import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Link,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaChargingStation, FaPlug, FaHome } from "react-icons/fa";
import { track } from "../utils/analytics";

/**
 * Affiliate module — renders NOTHING until an Amazon Associates tag is set,
 * so no dead monetization UI ships before the account exists.
 * Owner action: create an Amazon Associates account, put the tag here.
 */
const AMAZON_TAG = ""; // e.g. "evlineup-20"

const PRODUCTS = [
  {
    icon: FaChargingStation,
    title: "Level 2 home charger",
    desc: "Charge overnight at 6–10x wall-outlet speed.",
    query: "level 2 ev charger 240v",
  },
  {
    icon: FaPlug,
    title: "Portable EV charger",
    desc: "A glovebox backup for any outlet on a road trip.",
    query: "portable ev charger level 1 2",
  },
  {
    icon: FaHome,
    title: "NEMA 14-50 install kit",
    desc: "The outlet most home chargers plug into.",
    query: "nema 14-50 outlet ev",
  },
];

export default function AffiliateBlock() {
  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const border = useColorModeValue("rgba(34,197,94,0.2)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");

  if (!AMAZON_TAG) return null;

  return (
    <Box mt={6}>
      <Heading size="md" mb={1}>
        Charging essentials
      </Heading>
      <Text fontSize="xs" color={subText} mb={4}>
        Affiliate links — EV Lineup may earn a commission, at no cost to you.
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {PRODUCTS.map((p) => (
          <Link
            key={p.title}
            href={`https://www.amazon.com/s?k=${encodeURIComponent(p.query)}&tag=${AMAZON_TAG}`}
            isExternal
            rel="sponsored nofollow noopener"
            _hover={{ textDecoration: "none" }}
            onClick={() => track("affiliate_click", { product: p.title })}
          >
            <Box
              p={5}
              bg={cardBg}
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor={border}
              borderRadius="xl"
              _hover={{ borderColor: "green.400", transform: "translateY(-2px)" }}
              transition="all 0.2s"
              h="full"
            >
              <Icon as={p.icon} color="green.500" boxSize={6} mb={2} />
              <Text fontWeight="600" fontSize="sm" mb={1}>
                {p.title}
              </Text>
              <Text fontSize="xs" color={subText}>
                {p.desc}
              </Text>
            </Box>
          </Link>
        ))}
      </SimpleGrid>
    </Box>
  );
}
