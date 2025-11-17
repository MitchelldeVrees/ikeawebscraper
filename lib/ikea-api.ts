interface IkeaApiMedia {
  url: string;
  type: string;
}

interface IkeaApiOffer {
  id?: number;
  offerNumber?: string;
  description?: string;
  price?: number;
}

interface IkeaApiContent {
  articleNumbers?: string[];
  storeId?: string;
  title?: string;
  description?: string;
  heroImage?: string;
  media?: IkeaApiMedia[];
  originalPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  offers?: IkeaApiOffer[];
}

interface IkeaApiResponse {
  content?: IkeaApiContent[];
  totalPages?: number;
}

export interface IkeaProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  storeId: string;
  articleNumbers: string[];
  originalPrice?: number;
}

export async function fetchIkeaDeals(storeId: string): Promise<IkeaProduct[]> {
  try {
    // Fetch all pages to get complete product list
    const allProducts: IkeaProduct[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore && page < 20) {
      // Safety limit of 20 pages
      const url = `https://web-api.ikea.com/circular/circular-asis/offers/grouped/search?languageCode=nl&size=100&storeIds=${storeId}&page=${page}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[v0] IKEA API error for store ${storeId}, page ${page}:`, response.status);
        break;
      }

      const data: IkeaApiResponse = await response.json();

      const content = data.content ?? [];

      if (content.length === 0) {
        hasMore = false;
        break;
      }

      for (const entry of content) {
        const offers = entry.offers && entry.offers.length > 0 ? entry.offers : [undefined];

        offers.forEach((offer, index) => {
          const articleNumbers = entry.articleNumbers ?? [];
          const productId =
            offer?.offerNumber ??
            (offer?.id
              ? offer.id.toString()
              : articleNumbers[0]
              ? `${articleNumbers[0]}-${index}`
              : `${entry.storeId ?? storeId}-${page}-${index}`);

          allProducts.push({
            id: productId,
            name: entry.title || offer?.description || "Onbekend product",
            price:
              offer?.price ??
              entry.minPrice ??
              entry.maxPrice ??
              entry.originalPrice ??
              0,
            imageUrl: entry.heroImage || entry.media?.[0]?.url,
            storeId: entry.storeId || storeId,
            articleNumbers,
            originalPrice:
              entry.originalPrice ??
              entry.maxPrice ??
              entry.minPrice ??
              offer?.price ??
              undefined,
          });
        });
      }

      page++;

      if (typeof data.totalPages === "number" && page >= data.totalPages) {
        hasMore = false;
      }
    }

    console.log(`[v0] Fetched ${allProducts.length} products from IKEA store ${storeId}`);
    return allProducts;
  } catch (error) {
    console.error(`[v0] Error fetching IKEA deals for store ${storeId}:`, error);
    return [];
  }
}

export function matchArticleNumber(
  searchNumber: string,
  articleNumbers: string[] = []
): boolean {
  const normalizedSearch = searchNumber.replace(/\D/g, "").toLowerCase();

  if (!normalizedSearch) {
    return false;
  }

  return articleNumbers.some((number) => {
    const normalizedNumber = number.replace(/\D/g, "").toLowerCase();
    return normalizedNumber === normalizedSearch;
  });
}

export function matchLegacyProductName(searchTerm: string, productName: string): boolean {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const normalizedProduct = productName.toLowerCase().trim();

  if (!normalizedSearch) {
    return false;
  }

  if (normalizedProduct.includes(normalizedSearch)) {
    return true;
  }

  const searchWords = normalizedSearch.split(/\s+/);
  return searchWords.every((word) => normalizedProduct.includes(word));
}

export async function verifyArticleExists(
  articleNumber: string,
  userAgent?: string
): Promise<boolean> {
  const normalized = articleNumber.replace(/\D/g, "");
  if (normalized.length !== 8) {
    return false;
  }

  const url = `https://web-api.ikea.com/nl/nl/rotera/data/exists/${normalized}/`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json;version=2",
        "User-Agent": userAgent ?? "Mozilla/5.0 (compatible; IkeaWatchBot/1.0)",
        Referer: "https://www.ikea.com/",
        "X-Client-id": "4863e7d2-1428-4324-890b-ae5dede24fc6",
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json().catch(() => null)) as
      | { exists?: boolean }
      | null;

    return Boolean(data?.exists);
  } catch (error) {
    console.error("[v0] verifyArticleExists error:", error);
    return false;
  }
}
