import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Input,
  Text,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Icon,
} from "@chakra-ui/react";
import { FaGoogle, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    signInWithGoogle,
    signInWithTwitter,
    signInWithLinkedIn,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    resetPassword,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const bgColor = useColorModeValue("rgba(255,255,255,0.85)", "rgba(26,32,44,0.9)");
  const borderColor = useColorModeValue("rgba(34,197,94,0.3)", "rgba(34,197,94,0.4)");

  const handleClose = () => {
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setName("");
    setShowForgotPassword(false);
    onClose();
  };

  const handleSignIn = async () => {
    setError("");
    setIsLoading(true);
    const result = await signInWithEmail(email, password);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      handleClose();
    }
  };

  const handleSignUp = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    setIsLoading(true);
    const result = await signUpWithEmail(email, password, name);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.needsVerification) {
      setSuccess("Check your email to verify your account!");
    }
  };

  const handleMagicLink = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    const result = await signInWithMagicLink(email);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Check your email for a sign-in link!");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    const result = await resetPassword(email);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Check your email for a password reset link!");
    }
  };

  const socialButtonStyle = {
    w: "full",
    size: "lg",
    variant: "outline",
    borderColor: borderColor,
    _hover: { bg: useColorModeValue("green.50", "whiteAlpha.100") },
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg={bgColor}
        backdropFilter="blur(20px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        mx={4}
      >
        <ModalHeader
          textAlign="center"
          color={useColorModeValue("gray.800", "white")}
          pb={2}
        >
          Welcome to EV Lineup
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          {error && (
            <Alert status="error" borderRadius="md" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          {success && (
            <Alert status="success" borderRadius="md" mb={4}>
              <AlertIcon />
              {success}
            </Alert>
          )}

          {/* Social login buttons */}
          <VStack spacing={3} mb={4}>
            <Button
              {...socialButtonStyle}
              leftIcon={<Icon as={FaGoogle} />}
              onClick={signInWithGoogle}
            >
              Continue with Google
            </Button>
            <Button
              {...socialButtonStyle}
              leftIcon={<Icon as={FaXTwitter} />}
              onClick={signInWithTwitter}
            >
              Continue with X
            </Button>
            <Button
              {...socialButtonStyle}
              leftIcon={<Icon as={FaLinkedin} color="linkedin.500" />}
              onClick={signInWithLinkedIn}
            >
              Continue with LinkedIn
            </Button>
          </VStack>

          <HStack my={4}>
            <Divider />
            <Text
              fontSize="sm"
              color={useColorModeValue("gray.500", "gray.400")}
              whiteSpace="nowrap"
            >
              or with email
            </Text>
            <Divider />
          </HStack>

          {showForgotPassword ? (
            <VStack spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </FormControl>
              <Button
                w="full"
                colorScheme="green"
                onClick={handleForgotPassword}
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to sign in
              </Button>
            </VStack>
          ) : (
            <Tabs variant="soft-rounded" colorScheme="green" size="sm">
              <TabList mb={3} justifyContent="center">
                <Tab>Sign In</Tab>
                <Tab>Sign Up</Tab>
                <Tab>
                  <Icon as={MdEmail} mr={1} />
                  Magic Link
                </Tab>
              </TabList>

              <TabPanels>
                {/* Sign In */}
                <TabPanel px={0}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      />
                    </FormControl>
                    <Button
                      w="full"
                      colorScheme="green"
                      onClick={handleSignIn}
                      isLoading={isLoading}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      color="green.500"
                      onClick={() => {
                        setError("");
                        setShowForgotPassword(true);
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </VStack>
                </TabPanel>

                {/* Sign Up */}
                <TabPanel px={0}>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Name</FormLabel>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Password</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                      />
                    </FormControl>
                    <Button
                      w="full"
                      colorScheme="green"
                      onClick={handleSignUp}
                      isLoading={isLoading}
                    >
                      Create Account
                    </Button>
                  </VStack>
                </TabPanel>

                {/* Magic Link */}
                <TabPanel px={0}>
                  <VStack spacing={3}>
                    <Text
                      fontSize="sm"
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
                      We'll send a sign-in link to your email — no password
                      needed.
                    </Text>
                    <FormControl>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleMagicLink()
                        }
                      />
                    </FormControl>
                    <Button
                      w="full"
                      colorScheme="green"
                      onClick={handleMagicLink}
                      isLoading={isLoading}
                    >
                      Send Magic Link
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
