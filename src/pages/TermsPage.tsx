import { Box, Container, Heading, Text, UnorderedList, ListItem, Link } from "@chakra-ui/react";
import NavBar from "../components/NavBar";

export default function TermsPage() {
  return (
    <Box>
      <NavBar />
      <Container maxW="3xl" py={10}>
        <Heading as="h1" size="lg" mb={2}>
          Terms of Use
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={8}>
          Effective date: July 10, 2026
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Using EV Lineup
        </Heading>
        <Text mb={4}>
          EV Lineup (evlineup.org) provides electric vehicle information for
          research and comparison. By using the site you agree to these terms.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Vehicle data
        </Heading>
        <UnorderedList spacing={2} mb={4}>
          <ListItem>
            Specifications, prices, and availability are researched from
            manufacturer and public sources and are provided <b>as-is, without
            warranty</b>. Manufacturers change specs and prices frequently.
          </ListItem>
          <ListItem>
            Prices shown are indicative MSRPs and exclude taxes, fees,
            incentives, and dealer-specific pricing.
          </ListItem>
          <ListItem>
            Always confirm details with the manufacturer or a dealer before
            making a purchase decision.
          </ListItem>
        </UnorderedList>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Sponsored content & affiliate links
        </Heading>
        <Text mb={4}>
          Sponsored placements are always labelled as such. Some outbound links
          may be affiliate links, meaning EV Lineup may earn a commission if you
          make a purchase — at no additional cost to you. Sponsorship never
          changes the underlying vehicle data we display.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Accounts
        </Heading>
        <Text mb={4}>
          You're responsible for activity on your account. We may suspend
          accounts used for scraping, abuse, or attempts to disrupt the service.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Marketplace listings
        </Heading>
        <Text mb={4}>
          Vehicle listings in the Marketplace are created by dealers or sellers,
          who are solely responsible for their accuracy. EV Lineup is not a
          party to any transaction between buyers and sellers.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Liability
        </Heading>
        <Text mb={4}>
          To the maximum extent permitted by law, EV Lineup is not liable for
          decisions made based on information on this site.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={3}>
          Contact
        </Heading>
        <Text mb={4}>
          Questions about these terms:{" "}
          <Link href="mailto:jeanpaulwilson@gmail.com" color="green.500">
            jeanpaulwilson@gmail.com
          </Link>
        </Text>
      </Container>
    </Box>
  );
}
