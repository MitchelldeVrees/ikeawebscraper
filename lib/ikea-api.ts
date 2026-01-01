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
  offerId?: number;
  offerNumber?: string;
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
            offerId: offer?.id,
            offerNumber: offer?.offerNumber,
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

const IKEA_PRODUCT_BASE_URL = "https://www.ikea.com/nl/nl/products";

const buildProductUrls = (normalized: string): string[] => {
  const suffix = normalized.slice(5);
  if (!suffix) {
    return [];
  }

  return [
    `${IKEA_PRODUCT_BASE_URL}/${suffix}/s${normalized}.json`,
    `${IKEA_PRODUCT_BASE_URL}/${suffix}/${normalized}.json`,
  ];
};

const buildIkeaHeaders = (userAgent?: string) => ({
  Accept: "application/json",
  "User-Agent": userAgent ?? "Mozilla/5.0 (compatible; IkeaWatchBot/1.0)",
  Referer: "https://www.ikea.com/",
  "X-Client-id": "4863e7d2-1428-4324-890b-ae5dede24fc6",
});

async function fetchProductJson(
  normalized: string,
  userAgent?: string
): Promise<any | null> {
  const urls = buildProductUrls(normalized);
  if (urls.length === 0) {
    return null;
  }

  const headers = buildIkeaHeaders(userAgent);

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        return (await response.json().catch(() => null)) ?? null;
      }

      if (response.status !== 404) {
        return null;
      }
    } catch (error) {
      console.error("[v0] fetchProductJson error:", error);
      return null;
    }
  }

  return null;
}

export async function verifyArticleExists(
  articleNumber: string,
  userAgent?: string
): Promise<boolean> {
  const normalized = articleNumber.replace(/\D/g, "");
  if (normalized.length !== 8) {
    return false;
  }

  const product = await fetchProductJson(normalized, userAgent);
  return Boolean(product);
}

export interface ProductPreview {
  imageUrl?: string;
  name?: string;
  price?: string;
  priceExclTax?: string;
  typeName?: string;
  pipUrl?: string;
}

export async function fetchProductPreview(
  articleNumber: string,
  userAgent?: string
): Promise<ProductPreview | null> {
  const normalized = articleNumber.replace(/\D/g, "");
  if (normalized.length !== 8) {
    return null;
  }

  const product = await fetchProductJson(normalized, userAgent);
  if (!product) {
    return null;
  }

  const contextualImage = product?.mainImage?.url;
  const mainImage = product?.mainImage;
  const fallbackImage =
    contextualImage?.url ??
    mainImage?.url ??
    product?.media?.[0]?.url ??
    product?.heroImage ??
    product?.primaryImage?.url;
  const imageAlt =
    contextualImage?.alt ?? mainImage?.alt ?? product?.name ?? undefined;

  return {
    imageUrl: fallbackImage,
    name: product?.name ?? undefined,
    price: product?.price ?? undefined,
    priceExclTax: product?.priceExclTax ?? undefined,
    typeName: product?.typeName ?? undefined,
    pipUrl: product?.pipUrl ?? undefined,
  };
}
