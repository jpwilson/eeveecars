import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Link as ChakraLink,
  Flex,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  FaCar,
  FaUsers,
  FaStore,
  FaNewspaper,
  FaBolt,
} from "react-icons/fa";
import { useRef } from "react";

// Motion components
const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Hero image - place your EV image at public/pub_assets/hero-ev.png
const HERO_IMAGE = "/pub_assets/hero-ev.png";

// Apple-style light colors
const colors = {
  bg: "#F5F5F7",
  bgGradient: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 50%, #E8E8ED 100%)",
  text: "#1D1D1F",
  textSecondary: "#86868B",
  accent: "#00C853",
  accentGlow: "rgba(0, 200, 83, 0.15)",
};

// Glassmorphism style
const glassStyle = {
  background: "rgba(255, 255, 255, 0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "24px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const cardHover = {
  y: -8,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
  transition: { duration: 0.3, ease: "easeOut" },
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
  delay?: number;
}

function FeatureCard({
  icon,
  title,
  description,
  linkText,
  linkTo,
}: FeatureCardProps) {
  return (
    <ChakraLink as={RouterLink} to={linkTo} _hover={{ textDecoration: "none" }}>
      <MotionBox
        sx={glassStyle}
        p={8}
        height="100%"
        cursor="pointer"
        variants={fadeInUp}
        whileHover={cardHover}
      >
        <VStack align="start" spacing={5} height="100%">
          <Box
            p={4}
            borderRadius="16px"
            bg={colors.accentGlow}
          >
            <Icon as={icon} boxSize={7} color={colors.accent} />
          </Box>
          <Heading
            size="lg"
            color={colors.text}
            fontWeight="600"
            letterSpacing="-0.02em"
          >
            {title}
          </Heading>
          <Text
            color={colors.textSecondary}
            fontSize="md"
            lineHeight="1.7"
            flex="1"
          >
            {description}
          </Text>
          <HStack color={colors.accent} fontWeight="600" spacing={2}>
            <Text>{linkText}</Text>
            <Text fontSize="lg">→</Text>
          </HStack>
        </VStack>
      </MotionBox>
    </ChakraLink>
  );
}

function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax and pulse effect for hero image
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    [0.08, 0.12, 0.06, 0.02]
  );
  const heroScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.05, 1.1]
  );

  return (
    <Box
      ref={containerRef}
      minHeight="100vh"
      bg={colors.bgGradient}
      position="relative"
      overflow="hidden"
      fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    >
      {/* Hero Background Image with Parallax & Pulse */}
      <MotionBox
        position="fixed"
        top="50%"
        left="50%"
        width="120%"
        height="120%"
        style={{
          y: heroY,
          opacity: heroOpacity,
          scale: heroScale,
          x: "-50%",
          translateY: "-50%",
        }}
        pointerEvents="none"
        zIndex={0}
      >
        <Box
          as="img"
          src={HERO_IMAGE}
          alt=""
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center"
          filter="grayscale(30%)"
        />
      </MotionBox>

      {/* Gradient Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(180deg, rgba(245,245,247,0.9) 0%, rgba(245,245,247,0.95) 50%, rgba(245,245,247,1) 100%)"
        pointerEvents="none"
        zIndex={1}
      />

      <Container maxW="6xl" py={24} position="relative" zIndex={2}>
        {/* Hero Section */}
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          mb={20}
          pt={10}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Text
              color={colors.accent}
              fontWeight="600"
              fontSize="sm"
              textTransform="uppercase"
              letterSpacing="0.15em"
              mb={4}
            >
              The Electric Vehicle Platform
            </Text>
          </MotionBox>

          <MotionHeading
            as="h1"
            fontSize={{ base: "48px", md: "72px", lg: "88px" }}
            fontWeight="700"
            color={colors.text}
            letterSpacing="-0.03em"
            lineHeight="1"
            mb={6}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            EV Lineup
          </MotionHeading>

          <MotionText
            fontSize={{ base: "xl", md: "2xl" }}
            color={colors.textSecondary}
            maxW="2xl"
            lineHeight="1.6"
            fontWeight="400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Research. Compare. Decide.
            <br />
            The most comprehensive electric vehicle database on Earth.
          </MotionText>
        </Flex>

        {/* Stats Row */}
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          mb={20}
        >
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {[
              { value: "400+", label: "Electric Vehicles" },
              { value: "30+", label: "Manufacturers" },
              { value: "50+", label: "Specs Tracked" },
              { value: "100+", label: "Industry Leaders" },
            ].map((stat, i) => (
              <MotionBox
                key={i}
                sx={glassStyle}
                p={6}
                textAlign="center"
                variants={fadeInUp}
              >
                <Text
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="700"
                  color={colors.text}
                  letterSpacing="-0.02em"
                >
                  {stat.value}
                </Text>
                <Text
                  color={colors.textSecondary}
                  fontSize="sm"
                  fontWeight="500"
                >
                  {stat.label}
                </Text>
              </MotionBox>
            ))}
          </SimpleGrid>
        </MotionBox>

        {/* Feature Cards */}
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          mb={24}
        >
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FeatureCard
              icon={FaCar}
              title="EV Database"
              description="Every spec, every model, every variant. From the Tesla Model 3 to the Rimac Nevera. The most comprehensive EV database ever built."
              linkText="Explore Database"
              linkTo="/"
            />
            <FeatureCard
              icon={FaUsers}
              title="Industry People"
              description="Meet the visionaries driving the EV revolution. CEOs, founders, engineers, and journalists shaping the future of transportation."
              linkText="Meet the Leaders"
              linkTo="/people"
            />
            <FeatureCard
              icon={FaStore}
              title="Marketplace"
              description="Buy, sell, and discover electric vehicles. Connect with verified dealers and private sellers. Find your perfect EV."
              linkText="View Listings"
              linkTo="/"
            />
            <FeatureCard
              icon={FaNewspaper}
              title="Insights"
              description="Stay informed with the latest EV news, in-depth comparisons, buying guides, and industry analysis from our team."
              linkText="Read Articles"
              linkTo="/"
            />
          </SimpleGrid>
        </MotionBox>

        {/* Our Story Section */}
        <MotionBox
          sx={glassStyle}
          p={{ base: 8, md: 12 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          mb={16}
        >
          <VStack spacing={6} align="start">
            <HStack spacing={3}>
              <Icon as={FaBolt} color={colors.accent} boxSize={5} />
              <Heading
                size="lg"
                color={colors.text}
                fontWeight="600"
                letterSpacing="-0.02em"
              >
                Our Story
              </Heading>
            </HStack>
            <Text
              color={colors.textSecondary}
              fontSize="lg"
              lineHeight="1.8"
            >
              We started EV Lineup because we were frustrated. Every time we
              wanted to research an electric vehicle, we had to visit ten
              different websites, compare conflicting specs, and piece
              together information from scattered sources.
            </Text>
            <Text
              color={colors.textSecondary}
              fontSize="lg"
              lineHeight="1.8"
            >
              So we built what we wished existed: a single, comprehensive
              platform where you can research any EV, compare specs
              side-by-side, and make informed decisions. No dealership
              pressure, no hidden agendas—just the data you need.
            </Text>
            <Text
              color={colors.textSecondary}
              fontSize="md"
              fontStyle="italic"
            >
              Founded in 2024 by EV enthusiasts, for EV enthusiasts.
            </Text>
          </VStack>
        </MotionBox>

        {/* CTA */}
        <MotionBox
          textAlign="center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <ChakraLink
            as={RouterLink}
            to="/"
            display="inline-block"
            px={10}
            py={4}
            bg={colors.accent}
            color="white"
            fontWeight="600"
            fontSize="lg"
            borderRadius="full"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: `0 12px 40px ${colors.accentGlow}`,
            }}
            transition="all 0.3s ease"
          >
            Start Exploring →
          </ChakraLink>
        </MotionBox>
      </Container>
    </Box>
  );
}

export default AboutPage;
