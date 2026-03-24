import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

function InsightsPage() {
  const bgColor = useColorModeValue("#f0f4f8", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const heroBgOpacity = useColorModeValue(0.04, 0.06);

  return (
    <Box minH="100vh" bg={bgColor} position="relative" overflow="hidden" display="flex" flexDirection="column">
      <Box
        position="fixed"
        top="50%"
        left="50%"
        width="120%"
        height="120%"
        transform="translate(-50%, -50%)"
        pointerEvents="none"
        zIndex={0}
        opacity={heroBgOpacity}
      >
        <Image
          src="/pub_assets/hero-ev.png"
          alt="Electric vehicle background"
          width="100%"
          height="100%"
          objectFit="contain"
          objectPosition="center"
          loading="lazy"
        />
      </Box>

      <SEO
        title="Insights"
        description="EV news, in-depth comparisons, buying guides, and industry analysis. Coming soon to EV Lineup."
        url="/insights"
      />
      <Box position="relative" zIndex={1} flex="1">
        <NavBar />
        <Container maxW="6xl" pt={32} pb={20}>
          <VStack spacing={6} textAlign="center">
            <Heading
              as="h1"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="800"
              color={textColor}
              letterSpacing="-0.02em"
            >
              Insights
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color={subTextColor}
              maxW="lg"
            >
              Coming soon. EV news, comparisons, buying guides, and industry analysis.
            </Text>
            <Text
              color="#16a34a"
              fontWeight="600"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.15em"
            >
              Stay tuned
            </Text>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

export default InsightsPage;
