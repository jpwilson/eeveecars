import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  HStack,
  Badge,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaBolt, FaBullseye, FaChartLine, FaEnvelope } from "react-icons/fa";
import NavBar from "../components/NavBar";

const placements = [
  {
    name: "Featured Vehicle",
    where: "Homepage top row",
    what: "Your vehicle in the labelled 'Featured' slot every visitor sees first.",
    price: "$149/mo",
  },
  {
    name: "Model Page Sponsor",
    where: "Any model detail page",
    what: "Labelled placement on the spec page shoppers use to decide — chargers, insurance, financing, dealers.",
    price: "$99/mo",
  },
  {
    name: "Brand Spotlight",
    where: "Manufacturer page",
    what: "Own your brand's page: banner + link to your site or local dealers.",
    price: "$199/mo",
  },
  {
    name: "Newsletter Sponsor",
    where: "EV Radar email digest",
    what: "Sponsor slot in our price-drop & new-release digest.",
    price: "Coming soon",
  },
];

export default function AdvertisePage() {
  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const border = useColorModeValue("rgba(34,197,94,0.2)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");

  const mailto =
    "mailto:jeanpaulwilson@gmail.com?subject=Advertising%20on%20EV%20Lineup&body=Hi%2C%0A%0AI'm%20interested%20in%20advertising%20on%20EV%20Lineup.%0A%0ACompany%3A%0APlacement%20of%20interest%3A%0A%0AThanks!";

  return (
    <Box>
      <NavBar />
      <Container maxW="5xl" py={12}>
        <Stack spacing={4} textAlign="center" mb={12}>
          <Heading as="h1" size="xl">
            Advertise on EV Lineup
          </Heading>
          <Text fontSize="lg" color={subText} maxW="2xl" mx="auto">
            Reach people actively researching their next electric vehicle —
            comparing real specs, ranges, and prices across every EV on the
            market.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={14}>
          {[
            {
              icon: FaBullseye,
              title: "High intent",
              desc: "Visitors are comparing specific models and prices — the research phase right before a purchase decision.",
            },
            {
              icon: FaBolt,
              title: "100% EV audience",
              desc: "No wasted impressions: chargers, insurance, financing, and dealers reach exactly the right people.",
            },
            {
              icon: FaChartLine,
              title: "Founding rates",
              desc: "Early advertisers lock in launch pricing and keep it as traffic grows.",
            },
          ].map((b) => (
            <Box
              key={b.title}
              p={6}
              bg={cardBg}
              backdropFilter="blur(16px)"
              border="1px solid"
              borderColor={border}
              borderRadius="xl"
              textAlign="center"
            >
              <Icon as={b.icon} color="green.500" boxSize={7} mb={3} />
              <Heading size="sm" mb={2}>
                {b.title}
              </Heading>
              <Text fontSize="sm" color={subText}>
                {b.desc}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        <Heading as="h2" size="lg" mb={6}>
          Placements & launch pricing
        </Heading>
        <TableContainer
          bg={cardBg}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={border}
          borderRadius="xl"
          mb={4}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Placement</Th>
                <Th>Where</Th>
                <Th>What you get</Th>
                <Th isNumeric>Launch price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {placements.map((p) => (
                <Tr key={p.name}>
                  <Td fontWeight="600">{p.name}</Td>
                  <Td>{p.where}</Td>
                  <Td whiteSpace="normal" maxW="320px">
                    <Text fontSize="sm">{p.what}</Text>
                  </Td>
                  <Td isNumeric>
                    {p.price === "Coming soon" ? (
                      <Badge colorScheme="gray">Coming soon</Badge>
                    ) : (
                      <Text fontWeight="700" color="green.500">
                        {p.price}
                      </Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Text fontSize="sm" color={subText} mb={12}>
          All sponsored placements are clearly labelled. Sponsorship never
          changes the vehicle data we show. Custom packages, dealer bundles, and
          longer commitments — just ask.
        </Text>

        <Box
          p={10}
          bg={cardBg}
          backdropFilter="blur(16px)"
          border="1px solid"
          borderColor={border}
          borderRadius="xl"
          textAlign="center"
        >
          <Heading size="md" mb={3}>
            Become a founding advertiser
          </Heading>
          <Text color={subText} mb={6} maxW="xl" mx="auto">
            Tell us who you want to reach and we'll set you up within a day.
          </Text>
          <Button
            as="a"
            href={mailto}
            colorScheme="green"
            size="lg"
            borderRadius="full"
            leftIcon={<FaEnvelope />}
          >
            Get in touch
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
