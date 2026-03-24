import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaBolt, FaHome, FaCar } from "react-icons/fa";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

function NotFoundPage() {
  const bgColor = useColorModeValue("#f0f4f8", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <NavBar />
      <Container maxW="lg" flex="1" display="flex" alignItems="center" justifyContent="center" py={20}>
        <VStack spacing={6} textAlign="center">
          <Icon as={FaBolt} boxSize={16} color="#16a34a" opacity={0.3} />
          <Heading fontSize={{ base: "5xl", md: "7xl" }} fontWeight="800" color={textColor} letterSpacing="-0.04em">
            404
          </Heading>
          <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="600" color={textColor}>
            Page not found
          </Heading>
          <Text fontSize="md" color={subTextColor} maxW="md">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </Text>
          <VStack spacing={3} pt={4}>
            <Link to="/">
              <Button
                leftIcon={<FaCar />}
                bg="#16a34a"
                color="white"
                _hover={{ bg: "#15803d" }}
                size="lg"
                borderRadius="12px"
              >
                Explore EVs
              </Button>
            </Link>
            <Link to="/about">
              <Button
                leftIcon={<FaHome />}
                variant="outline"
                borderColor="#16a34a"
                color="#16a34a"
                _hover={{ bg: "rgba(22, 163, 74, 0.05)" }}
                size="md"
                borderRadius="12px"
              >
                About EV Lineup
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}

export default NotFoundPage;
