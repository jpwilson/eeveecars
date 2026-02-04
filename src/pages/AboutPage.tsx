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
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  FaCar,
  FaUsers,
  FaStore,
  FaNewspaper,
  FaBolt,
  FaGlobe,
  FaChartLine,
} from "react-icons/fa";
import { ReactNode } from "react";

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Glass card style
const glassStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "24px",
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.3, ease: "easeOut" },
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
  gradient: string;
  isExternal?: boolean;
}

function FeatureCard({
  icon,
  title,
  description,
  linkText,
  linkTo,
  gradient,
  isExternal = false,
}: FeatureCardProps) {
  const CardContent = (
    <MotionBox
      {...glassStyle}
      p={8}
      height="100%"
      cursor="pointer"
      position="relative"
      overflow="hidden"
      whileHover={cardHover}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: gradient,
        borderRadius: "24px 24px 0 0",
      }}
    >
      <VStack align="start" spacing={4} height="100%">
        <Box
          p={3}
          borderRadius="16px"
          background={`linear-gradient(135deg, ${gradient.split(",")[0].replace("linear-gradient(135deg, ", "")}22, transparent)`}
        >
          <Icon as={icon} boxSize={8} color="green.400" />
        </Box>
        <Heading size="lg" color="white" fontWeight="600">
          {title}
        </Heading>
        <Text color="gray.400" fontSize="md" lineHeight="tall" flex="1">
          {description}
        </Text>
        <HStack color="green.400" fontWeight="500" spacing={2}>
          <Text>{linkText}</Text>
          <Text>→</Text>
        </HStack>
      </VStack>
    </MotionBox>
  );

  if (isExternal) {
    return (
      <ChakraLink href={linkTo} isExternal _hover={{ textDecoration: "none" }}>
        {CardContent}
      </ChakraLink>
    );
  }

  return (
    <ChakraLink as={RouterLink} to={linkTo} _hover={{ textDecoration: "none" }}>
      {CardContent}
    </ChakraLink>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <MotionBox {...glassStyle} p={6} variants={itemVariants}>
      <HStack spacing={4}>
        <Icon as={icon} boxSize={6} color="green.400" />
        <Stat>
          <StatNumber color="white" fontSize="2xl" fontWeight="bold">
            {value}
          </StatNumber>
          <StatLabel color="gray.400" fontSize="sm">
            {label}
          </StatLabel>
        </Stat>
      </HStack>
    </MotionBox>
  );
}

function AboutPage() {
  return (
    <Box
      minHeight="100vh"
      bg="linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Subtle gradient orbs for visual interest */}
      <Box
        position="absolute"
        top="-20%"
        left="-10%"
        width="50%"
        height="50%"
        background="radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)"
        filter="blur(60px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-20%"
        right="-10%"
        width="50%"
        height="50%"
        background="radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)"
        filter="blur(60px)"
        pointerEvents="none"
      />

      <Container maxW="7xl" py={20} position="relative">
        <MotionFlex
          direction="column"
          align="center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <MotionBox textAlign="center" mb={16} variants={itemVariants}>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
              fontWeight="700"
              color="white"
              mb={6}
              letterSpacing="-0.02em"
            >
              EV Lineup
            </Heading>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              color="gray.400"
              maxW="3xl"
              mx="auto"
              lineHeight="tall"
            >
              The Electric Vehicle Intelligence Platform.
              <br />
              Research. Compare. Decide.
            </Text>
          </MotionBox>

          {/* Stats Row */}
          <MotionBox
            width="100%"
            mb={16}
            variants={itemVariants}
          >
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <StatCard label="Electric Vehicles" value="400+" icon={FaCar} />
              <StatCard label="Manufacturers" value="30+" icon={FaGlobe} />
              <StatCard label="Specs Tracked" value="50+" icon={FaChartLine} />
              <StatCard label="Industry Leaders" value="100+" icon={FaUsers} />
            </SimpleGrid>
          </MotionBox>

          {/* Four Main Feature Cards */}
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={6}
            width="100%"
            mb={20}
          >
            <MotionBox variants={itemVariants}>
              <FeatureCard
                icon={FaCar}
                title="EV Database"
                description="The most comprehensive electric vehicle database on Earth. Every spec, every model, every variant. From the Tesla Model 3 to the Rimac Nevera, we've got it all."
                linkText="Explore Database"
                linkTo="/"
                gradient="linear-gradient(135deg, #22c55e, #16a34a)"
              />
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <FeatureCard
                icon={FaUsers}
                title="Industry People"
                description="Meet the visionaries driving the EV revolution. CEOs, founders, engineers, and journalists shaping the future of transportation."
                linkText="Meet the Leaders"
                linkTo="/people"
                gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
              />
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <FeatureCard
                icon={FaStore}
                title="EV Marketplace"
                description="Buy, sell, and discover electric vehicles. Connect with verified dealers and private sellers in your area. Coming soon."
                linkText="View Listings"
                linkTo="/"
                gradient="linear-gradient(135deg, #a855f7, #9333ea)"
              />
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <FeatureCard
                icon={FaNewspaper}
                title="Insights & News"
                description="Stay informed with the latest EV news, in-depth comparisons, buying guides, and industry analysis from our team of experts."
                linkText="Read Articles"
                linkTo="/"
                gradient="linear-gradient(135deg, #f97316, #ea580c)"
              />
            </MotionBox>
          </SimpleGrid>

          {/* Our Story Section */}
          <MotionBox
            {...glassStyle}
            p={{ base: 8, md: 12 }}
            width="100%"
            variants={itemVariants}
          >
            <VStack spacing={6} align="start">
              <HStack spacing={3}>
                <Icon as={FaBolt} color="green.400" boxSize={6} />
                <Heading size="lg" color="white">
                  Our Story
                </Heading>
              </HStack>
              <Text color="gray.300" fontSize="lg" lineHeight="tall">
                We started EV Lineup because we were frustrated. Every time we
                wanted to research an electric vehicle, we had to visit ten
                different websites, compare conflicting specs, and piece
                together information from scattered sources.
              </Text>
              <Text color="gray.300" fontSize="lg" lineHeight="tall">
                So we built what we wished existed: a single, comprehensive
                platform where you can research any EV, compare specs
                side-by-side, and make informed decisions. No dealership
                pressure, no hidden agendas—just the data you need to find your
                perfect electric vehicle.
              </Text>
              <Text color="gray.400" fontSize="md" fontStyle="italic">
                Founded in 2024 by EV enthusiasts, for EV enthusiasts.
              </Text>
            </VStack>
          </MotionBox>

          {/* CTA */}
          <MotionBox mt={16} textAlign="center" variants={itemVariants}>
            <ChakraLink
              as={RouterLink}
              to="/"
              px={8}
              py={4}
              bg="green.500"
              color="white"
              fontWeight="600"
              fontSize="lg"
              borderRadius="full"
              _hover={{
                bg: "green.400",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 40px rgba(34, 197, 94, 0.3)",
              }}
              transition="all 0.3s ease"
              display="inline-block"
            >
              Start Exploring EVs →
            </ChakraLink>
          </MotionBox>
        </MotionFlex>
      </Container>
    </Box>
  );
}

export default AboutPage;
