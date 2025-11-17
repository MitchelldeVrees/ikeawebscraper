interface IkeaProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  storeId: string;
}

interface IkeaApiResponse {
  data: {
    offers: Array<{
      id: string;
      name: string;
      price: {
        numeral: number;
      };
      images?: Array<{
        url: string;
      }>;
    }>;
  };
}

export async function fetchIkeaDeals(storeId: string): Promise<IkeaProduct[]> {
  try {
    // Fetch all pages to get complete product list
    const allProducts: IkeaProduct[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore && page < 10) {
      // Safety limit of 10 pages
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

      if (!data.data?.offers || data.data.offers.length === 0) {
        hasMore = false;
        break;
      }

      const products = data.data.offers.map((offer) => ({
        id: offer.id,
        name: offer.name,
        price: offer.price.numeral,
        imageUrl: offer.images?.[0]?.url,
        storeId,
      }));

      allProducts.push(...products);
      page++;
    }

    console.log(`[v0] Fetched ${allProducts.length} products from IKEA store ${storeId}`);
    return allProducts;
  } catch (error) {
    console.error(`[v0] Error fetching IKEA deals for store ${storeId}:`, error);
    return [];
  }
}

export function matchProductName(searchTerm: string, productName: string): boolean {
  // Normalize both strings for comparison
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const normalizedProduct = productName.toLowerCase().trim();

  // Direct match
  if (normalizedProduct.includes(normalizedSearch)) {
    return true;
  }

  // Check if all words from search term appear in product name
  const searchWords = normalizedSearch.split(/\s+/);
  const allWordsMatch = searchWords.every((word) =>
    normalizedProduct.includes(word)
  );

  return allWordsMatch;
}
