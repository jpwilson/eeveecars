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
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  Show,
  Hide,
} from "@chakra-ui/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  FaCar,
  FaUsers,
  FaStore,
  FaNewspaper,
  FaBolt,
  FaBars,
} from "react-icons/fa";
import { useRef } from "react";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Hero image - the futuristic EV with digital pattern
const HERO_IMAGE = "/pub_assets/hero-ev.png";

// Slightly darker green-tinted theme
const colors = {
  bg: "#e0ebe0",
  bgGradient: "linear-gradient(180deg, #e8f0e8 0%, #dce8dc 30%, #d0e0d0 70%, #dce8dc 100%)",
  card: "rgba(255, 255, 255, 0.6)",
  cardHover: "rgba(255, 255, 255, 0.85)",
  border: "rgba(34, 197, 94, 0.2)",
  borderHover: "rgba(34, 197, 94, 0.5)",
  text: "#1a2e1a",
  textSecondary: "rgba(26, 46, 26, 0.65)",
  accent: "#16a34a",
  accentGlow: "rgba(22, 163, 74, 0.25)",
};

// Glassmorphism with green tint
const glassStyle = {
  background: colors.card,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${colors.border}`,
  borderRadius: "24px",
  position: "relative" as const,
  overflow: "hidden" as const,
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

// Dramatic hover with glass shine effect
const cardHover = {
  scale: 1.05,
  y: -12,
  transition: { duration: 0.3, ease: "easeOut" },
};

const statHover = {
  scale: 1.08,
  y: -8,
  transition: { duration: 0.2, ease: "easeOut" },
};

// Nav links
const navLinks = [
  { label: "Database", to: "/", icon: FaCar },
  { label: "People", to: "/people", icon: FaUsers },
  { label: "Marketplace", to: "/", icon: FaStore },
  { label: "Insights", to: "/", icon: FaNewspaper },
];

function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={100}
      bg="rgba(232, 240, 232, 0.9)"
      backdropFilter="blur(20px)"
      borderBottom={`1px solid ${colors.border}`}
    >
      <Container maxW="7xl">
        <Flex justify="space-between" align="center" py={4}>
          <ChakraLink
            as={RouterLink}
            to="/about"
            _hover={{ textDecoration: "none" }}
          >
            <HStack spacing={2}>
              <Icon as={FaBolt} color={colors.accent} boxSize={6} />
              <Text
                fontSize="xl"
                fontWeight="700"
                color={colors.text}
                letterSpacing="-0.02em"
              >
                EV Lineup
              </Text>
            </HStack>
          </ChakraLink>

          {/* Desktop Nav */}
          <Show above="md">
            <HStack spacing={8}>
              {navLinks.map((link) => (
                <ChakraLink
                  key={link.label}
                  as={RouterLink}
                  to={link.to}
                  color={colors.textSecondary}
                  fontWeight="500"
                  fontSize="sm"
                  _hover={{ color: colors.accent }}
                  transition="color 0.2s"
                >
                  {link.label}
                </ChakraLink>
              ))}
            </HStack>
          </Show>

          {/* Mobile Hamburger */}
          <Hide above="md">
            <IconButton
              aria-label="Open menu"
              icon={<FaBars />}
              variant="ghost"
              color={colors.text}
              onClick={onOpen}
              _hover={{ bg: colors.card }}
            />
          </Hide>
        </Flex>
      </Container>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay bg="rgba(0,0,0,0.6)" />
        <DrawerContent bg="#e8f0e8" borderLeft={`1px solid ${colors.border}`}>
          <DrawerCloseButton color={colors.text} />
          <DrawerBody pt={16}>
            <VStack spacing={6} align="stretch">
              {navLinks.map((link) => (
                <ChakraLink
                  key={link.label}
                  as={RouterLink}
                  to={link.to}
                  onClick={onClose}
                  _hover={{ textDecoration: "none" }}
                >
                  <HStack
                    p={4}
                    borderRadius="12px"
                    _hover={{ bg: colors.card }}
                    transition="background 0.2s"
                  >
                    <Icon as={link.icon} color={colors.accent} boxSize={5} />
                    <Text color={colors.text} fontWeight="500" fontSize="lg">
                      {link.label}
                    </Text>
                  </HStack>
                </ChakraLink>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
}

function FeatureCard({ icon, title, description, linkText, linkTo }: FeatureCardProps) {
  return (
    <ChakraLink as={RouterLink} to={linkTo} _hover={{ textDecoration: "none" }}>
      <MotionBox
        sx={glassStyle}
        p={8}
        height="100%"
        cursor="pointer"
        variants={fadeInUp}
        whileHover={cardHover}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)",
          transition: "left 0.5s ease",
        }}
        _hover={{
          borderColor: colors.borderHover,
          bg: colors.cardHover,
          boxShadow: `0 20px 60px ${colors.accentGlow}`,
          _before: { left: "100%" },
        }}
      >
        <VStack align="start" spacing={5} height="100%">
          <Box p={4} borderRadius="16px" bg={colors.accentGlow}>
            <Icon as={icon} boxSize={7} color={colors.accent} />
          </Box>
          <Heading size="lg" color={colors.text} fontWeight="600" letterSpacing="-0.02em">
            {title}
          </Heading>
          <Text color={colors.textSecondary} fontSize="md" lineHeight="1.7" flex="1">
            {description}
          </Text>
          <HStack color={colors.accent} fontWeight="600" spacing={2}>
            <Text>{linkText}</Text>
            <MotionBox
              as="span"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              →
            </MotionBox>
          </HStack>
        </VStack>
      </MotionBox>
    </ChakraLink>
  );
}

interface StatCardProps {
  value: string;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  return (
    <MotionBox
      sx={glassStyle}
      p={6}
      textAlign="center"
      variants={fadeInUp}
      whileHover={statHover}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.15), transparent)",
        transition: "left 0.4s ease",
      }}
      _hover={{
        borderColor: colors.borderHover,
        bg: colors.cardHover,
        boxShadow: `0 15px 40px ${colors.accentGlow}`,
        _before: { left: "100%" },
      }}
      cursor="pointer"
    >
      <Text
        fontSize={{ base: "3xl", md: "5xl" }}
        fontWeight="800"
        color={colors.accent}
        letterSpacing="-0.02em"
      >
        {value}
      </Text>
      <Text color={colors.textSecondary} fontSize="sm" fontWeight="500" mt={1}>
        {label}
      </Text>
    </MotionBox>
  );
}

function AboutPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.15, 0.2, 0.1, 0.05]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.08, 1.15]);

  return (
    <Box
      ref={containerRef}
      minHeight="100vh"
      bg={colors.bgGradient}
      position="relative"
      overflow="hidden"
      fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    >
      <NavBar />

      {/* Hero Background Image */}
      <MotionBox
        position="fixed"
        top="50%"
        left="50%"
        width="140%"
        height="140%"
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale, x: "-50%", translateY: "-50%" }}
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
          filter="saturate(0.8) brightness(0.6)"
        />
      </MotionBox>

      {/* Gradient Overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(180deg, rgba(232,240,232,0.6) 0%, rgba(220,232,220,0.75) 40%, rgba(224,235,224,0.9) 100%)"
        pointerEvents="none"
        zIndex={1}
      />

      <Container maxW="6xl" pt={32} pb={20} position="relative" zIndex={2}>
        {/* Hero Section */}
        <Flex direction="column" align="center" textAlign="center" mb={20}>
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
              letterSpacing="0.2em"
              mb={4}
            >
              The Electric Vehicle Platform
            </Text>
          </MotionBox>

          <MotionHeading
            as="h1"
            fontSize={{ base: "48px", md: "80px", lg: "100px" }}
            fontWeight="800"
            color={colors.text}
            letterSpacing="-0.04em"
            lineHeight="0.95"
            mb={6}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            EV Lineup
          </MotionHeading>

          <MotionText
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
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

        {/* Stats */}
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
          mb={20}
        >
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <StatCard value="400+" label="Electric Vehicles" />
            <StatCard value="30+" label="Manufacturers" />
            <StatCard value="50+" label="Specs Tracked" />
            <StatCard value="100+" label="Industry Leaders" />
          </SimpleGrid>
        </MotionBox>

        {/* Feature Cards */}
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
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
              description="Meet the visionaries driving the EV revolution. CEOs, founders, engineers, and journalists shaping the future."
              linkText="Meet the Leaders"
              linkTo="/people"
            />
            <FeatureCard
              icon={FaStore}
              title="Marketplace"
              description="Buy, sell, and discover electric vehicles. Connect with verified dealers and private sellers near you."
              linkText="View Listings"
              linkTo="/"
            />
            <FeatureCard
              icon={FaNewspaper}
              title="Insights"
              description="Stay informed with EV news, in-depth comparisons, buying guides, and industry analysis from our team."
              linkText="Read Articles"
              linkTo="/"
            />
          </SimpleGrid>
        </MotionBox>

        {/* Our Story */}
        <MotionBox
          sx={glassStyle}
          p={{ base: 8, md: 12 }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
          mb={16}
        >
          <VStack spacing={6} align="start">
            <HStack spacing={3}>
              <Icon as={FaBolt} color={colors.accent} boxSize={6} />
              <Heading size="lg" color={colors.text} fontWeight="600" letterSpacing="-0.02em">
                Our Story
              </Heading>
            </HStack>
            <Text color={colors.textSecondary} fontSize="lg" lineHeight="1.8">
              We started EV Lineup because we were frustrated. Every time we wanted to research an
              electric vehicle, we had to visit ten different websites, compare conflicting specs,
              and piece together information from scattered sources.
            </Text>
            <Text color={colors.textSecondary} fontSize="lg" lineHeight="1.8">
              So we built what we wished existed: a single, comprehensive platform where you can
              research any EV, compare specs side-by-side, and make informed decisions. No
              dealership pressure, no hidden agendas—just the data you need.
            </Text>
            <Text color="rgba(255,255,255,0.5)" fontSize="md" fontStyle="italic">
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
              transform: "translateY(-3px) scale(1.02)",
              boxShadow: `0 15px 50px ${colors.accentGlow}`,
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
