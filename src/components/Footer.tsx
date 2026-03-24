import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  Input,
  Button,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { FaBolt, FaEnvelope } from "react-icons/fa";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const toast = useToast();

  const bg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("rgba(34, 197, 94, 0.15)", "rgba(34, 197, 94, 0.25)");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const logoColor = useColorModeValue("#16a34a", "#4ec77f");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Store in localStorage for now — backend integration needed
    const subs = JSON.parse(localStorage.getItem("evlineup_newsletter") || "[]");
    subs.push({ email, date: new Date().toISOString() });
    localStorage.setItem("evlineup_newsletter", JSON.stringify(subs));
    setEmail("");
    toast({
      title: "You're subscribed!",
      description: "We'll keep you updated on EV news and new features.",
      status: "success",
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box
      as="footer"
      bg={bg}
      borderTop={`1px solid ${borderColor}`}
      mt="auto"
    >
      <Container maxW="1200px" py={12} px={{ base: 6, md: 8 }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap={10}
        >
          {/* Brand + newsletter */}
          <VStack align="start" spacing={4} maxW="360px">
            <HStack spacing={2}>
              <Icon as={FaBolt} color={logoColor} boxSize={5} />
              <Text fontSize="xl" fontWeight="700" color={logoColor} letterSpacing="-0.02em">
                EV Lineup
              </Text>
            </HStack>
            <Text fontSize="sm" color={textColor} lineHeight="1.7">
              The most comprehensive electric vehicle database. Compare specs,
              explore manufacturers, and find your next EV.
            </Text>
            <Box as="form" onSubmit={handleSubscribe} w="full">
              <Text fontSize="xs" fontWeight="600" color={headingColor} mb={2} textTransform="uppercase" letterSpacing="0.05em">
                <Icon as={FaEnvelope} mr={1} /> Stay updated
              </Text>
              <HStack>
                <Input
                  placeholder="Your email"
                  size="sm"
                  borderRadius="8px"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  borderColor={borderColor}
                  _focus={{ borderColor: "#16a34a", boxShadow: "0 0 0 1px #16a34a" }}
                />
                <Button
                  type="submit"
                  size="sm"
                  bg="#16a34a"
                  color="white"
                  _hover={{ bg: "#15803d" }}
                  borderRadius="8px"
                  px={6}
                  flexShrink={0}
                >
                  Subscribe
                </Button>
              </HStack>
            </Box>
          </VStack>

          {/* Links */}
          <Flex gap={{ base: 8, md: 16 }} wrap="wrap">
            <VStack align="start" spacing={3}>
              <Text fontSize="xs" fontWeight="700" color={headingColor} textTransform="uppercase" letterSpacing="0.05em">
                Explore
              </Text>
              <Link to="/"><Text fontSize="sm" color={textColor} _hover={{ color: "#16a34a" }} transition="color 0.2s">EV Database</Text></Link>
              <Link to="/people"><Text fontSize="sm" color={textColor} _hover={{ color: "#16a34a" }} transition="color 0.2s">People</Text></Link>
              <Link to="/marketplace"><Text fontSize="sm" color={textColor} _hover={{ color: "#16a34a" }} transition="color 0.2s">Marketplace</Text></Link>
              <Link to="/insights"><Text fontSize="sm" color={textColor} _hover={{ color: "#16a34a" }} transition="color 0.2s">Insights</Text></Link>
            </VStack>
            <VStack align="start" spacing={3}>
              <Text fontSize="xs" fontWeight="700" color={headingColor} textTransform="uppercase" letterSpacing="0.05em">
                Company
              </Text>
              <Link to="/about"><Text fontSize="sm" color={textColor} _hover={{ color: "#16a34a" }} transition="color 0.2s">About</Text></Link>
              <Text fontSize="sm" color={textColor}>Contact: hello@evlineup.com</Text>
            </VStack>
          </Flex>
        </Flex>

        {/* Bottom bar */}
        <Flex
          mt={10}
          pt={6}
          borderTop={`1px solid ${borderColor}`}
          justify="space-between"
          align="center"
          direction={{ base: "column", sm: "row" }}
          gap={3}
        >
          <Text fontSize="xs" color={textColor}>
            &copy; {new Date().getFullYear()} EV Lineup. All rights reserved.
          </Text>
          <Text fontSize="xs" color={textColor}>
            Data is provided for informational purposes only.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
