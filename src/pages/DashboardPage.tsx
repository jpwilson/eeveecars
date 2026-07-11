import { useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Badge,
  Button,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaHeart, FaCar, FaStickyNote, FaBalanceScale } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const upcoming = [
  {
    icon: FaHeart,
    title: "Favorites",
    desc: "Save EVs you're interested in and track their price changes.",
  },
  {
    icon: FaCar,
    title: "My Garage",
    desc: "Add the EV you own — mileage, battery health, ownership notes.",
  },
  {
    icon: FaStickyNote,
    title: "Notes",
    desc: "Private research notes on any model while you shop.",
  },
  {
    icon: FaBalanceScale,
    title: "Saved Comparisons",
    desc: "Keep your side-by-side comparisons to revisit anytime.",
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const borderColor = useColorModeValue("rgba(34,197,94,0.2)", "rgba(34,197,94,0.3)");
  const subText = useColorModeValue("gray.600", "gray.400");

  // Auth-gated page: bounce logged-out visitors home
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/", { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) return null;

  return (
    <Container maxW="5xl" py={10}>
      <HStack spacing={4} mb={8}>
        <Avatar
          size="lg"
          name={user.displayName || user.email}
          src={user.avatarUrl}
          bg="green.500"
          color="white"
        />
        <Box>
          <Heading size="lg">
            Welcome{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
          </Heading>
          <Text color={subText}>{user.email}</Text>
        </Box>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={10}>
        {upcoming.map((item) => (
          <Box
            key={item.title}
            p={6}
            bg={cardBg}
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
          >
            <HStack mb={2} spacing={3}>
              <Icon as={item.icon} color="green.500" boxSize={5} />
              <Heading size="sm">{item.title}</Heading>
              <Badge colorScheme="green" variant="subtle">
                Coming soon
              </Badge>
            </HStack>
            <Text fontSize="sm" color={subText}>
              {item.desc}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <VStack spacing={3}>
        <Text color={subText}>In the meantime, keep exploring:</Text>
        <HStack spacing={4}>
          <Button as={RouterLink} to="/" colorScheme="green" borderRadius="full">
            Browse all EVs
          </Button>
          <Button
            as={RouterLink}
            to="/marketplace"
            variant="outline"
            colorScheme="green"
            borderRadius="full"
          >
            Marketplace
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
