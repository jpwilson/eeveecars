import { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Link,
  Text,
  keyframes,
  useColorModeValue,
} from "@chakra-ui/react";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
}

const RSS_FEEDS = [
  "https://news.google.com/rss/search?q=electric+vehicles&hl=en-US&gl=US&ceid=US:en",
  "https://electrek.co/feed/",
];

const CACHE_KEY = "evlineup_news_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

async function fetchFeed(feedUrl: string): Promise<NewsItem[]> {
  try {
    const encoded = encodeURIComponent(feedUrl);
    const resp = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encoded}`
    );
    const data = await resp.json();
    if (data.status === "ok" && data.items) {
      return data.items.map((item: { title: string; link: string; pubDate: string }) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
      }));
    }
  } catch {
    // silently fail for individual feeds
  }
  return [];
}

function dedupeByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const NewsTicker = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  const tickerBg = useColorModeValue(
    "rgba(22, 163, 74, 0.04)",
    "rgba(22, 163, 74, 0.08)"
  );
  const borderColor = useColorModeValue(
    "rgba(22, 163, 74, 0.1)",
    "rgba(22, 163, 74, 0.2)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");
  const linkColor = useColorModeValue("gray.700", "gray.200");
  const dotColor = useColorModeValue("green.300", "green.600");

  useEffect(() => {
    const loadNews = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { items, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setNews(items);
          return;
        }
      }

      // Fetch all feeds in parallel
      const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
      const merged = results.flat();

      // Sort by date, dedupe, take top 15
      merged.sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      const items = dedupeByTitle(merged).slice(0, 15);

      setNews(items);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ items, timestamp: Date.now() })
      );
    };

    loadNews();
  }, []);

  if (news.length === 0) return null;

  // Double the items for seamless infinite scroll
  const tickerItems = [...news, ...news];

  return (
    <Box
      bg={tickerBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      overflow="hidden"
      whiteSpace="nowrap"
      py={1.5}
      position="relative"
    >
      <HStack
        spacing={0}
        display="inline-flex"
        animation={`${scroll} ${news.length * 16}s linear infinite`}
        _hover={{ animationPlayState: "paused" }}
      >
        {tickerItems.map((item, i) => (
          <HStack key={`${item.title}-${i}`} spacing={2} px={4} flexShrink={0}>
            {i > 0 && (
              <Box
                boxSize="4px"
                borderRadius="full"
                bg={dotColor}
                flexShrink={0}
              />
            )}
            <Link
              href={item.link}
              isExternal
              _hover={{ textDecoration: "underline", color: "#16a34a" }}
              transition="color 0.2s"
            >
              <Text fontSize="xs" color={linkColor} fontWeight="400">
                {item.title}
              </Text>
            </Link>
          </HStack>
        ))}
      </HStack>
    </Box>
  );
};

export default NewsTicker;
