import { Box, Container, Heading, Text, UnorderedList, ListItem, Link } from "@chakra-ui/react";
import NavBar from "../components/NavBar";

export default function PrivacyPage() {
  return (
    <Box>
      <NavBar />
      <Container maxW="3xl" py={10}>
        <Heading as="h1" size="lg" mb={2}>
          Privacy Policy
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={8}>
          Effective date: July 10, 2026
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Who we are
        </Heading>
        <Text mb={4}>
          EV Lineup (evlineup.org) is an electric vehicle database and comparison
          site. This policy explains what data we collect and how we use it.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          What we collect
        </Heading>
        <UnorderedList spacing={2} mb={4}>
          <ListItem>
            <b>Usage analytics.</b> We use Google Analytics and Vercel Analytics
            to understand how the site is used (pages visited, device type,
            approximate location). These set cookies or use similar technologies.
          </ListItem>
          <ListItem>
            <b>Account data.</b> If you create an account, we store your email
            address, display name, and avatar via our authentication provider
            (Supabase), plus content you save (favorites, notes, garage entries).
          </ListItem>
          <ListItem>
            <b>Newsletter.</b> If you subscribe, we store your email address to
            send you EV news and price updates. Every email includes an
            unsubscribe link.
          </ListItem>
          <ListItem>
            <b>Forms.</b> If you request a quote or contact a dealer through the
            site, the details you enter are shared with that dealer or partner to
            fulfil your request.
          </ListItem>
        </UnorderedList>

        <Heading as="h2" size="md" mt={8} mb={3}>
          What we don't do
        </Heading>
        <Text mb={4}>
          We do not sell your personal information. We share it only with the
          service providers that run the site (Google Analytics, Vercel,
          Supabase) or when you explicitly ask us to (e.g., a dealer quote
          request).
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Advertising
        </Heading>
        <Text mb={4}>
          Sponsored placements on EV Lineup are always labelled. If we introduce
          third-party ad networks, their cookie usage will be disclosed here and
          in a consent banner where required.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Your rights
        </Heading>
        <Text mb={4}>
          You can request a copy or deletion of your data at any time by emailing{" "}
          <Link href="mailto:jeanpaulwilson@gmail.com" color="green.500">
            jeanpaulwilson@gmail.com
          </Link>
          . If you have an account, deleting it removes your saved content.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Changes
        </Heading>
        <Text mb={4}>
          We'll update this page when our practices change and adjust the
          effective date above.
        </Text>
      </Container>
    </Box>
  );
}
