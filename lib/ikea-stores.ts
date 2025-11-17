export interface IkeaStore {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export const IKEA_STORES: Record<string, IkeaStore> = {
  "415": {
    name: "Amersfoort",
    address: "Euroweg 101, 3825 HA Amersfoort, Netherlands",
    lat: 52.1901,
    lng: 5.4171,
  },
  "088": {
    name: "Amsterdam",
    address: "Hullenbergweg 2, 1101 BL Amsterdam-Zuidoost, Netherlands",
    lat: 52.3007,
    lng: 4.9475,
  },
  "274": {
    name: "Barendrecht",
    address: "Kolding 1, 2993 LD Barendrecht, Netherlands",
    lat: 51.8703,
    lng: 4.5208,
  },
  "378": {
    name: "Haarlem",
    address: "Laan van Decima 1, 2031 CX Haarlem, Netherlands",
    lat: 52.3896,
    lng: 4.6515,
  },
  "403": {
    name: "Breda",
    address: "Sijltsstraat 1, 4814 DC Breda, Netherlands",
    lat: 51.5963,
    lng: 4.7364,
  },
  "151": {
    name: "Delft",
    address: "Olof Palmestraat 1, 2616 LN Delft, Netherlands",
    lat: 52.0083,
    lng: 4.3675,
  },
  "272": {
    name: "Duiven",
    address: "Nieuwgraaf 320, 6921 RJ Duiven, Netherlands",
    lat: 51.9579,
    lng: 6.0144,
  },
  "087": {
    name: "Eindhoven",
    address: "Ekkersrijt 4089, 5692 DB Son, Netherlands",
    lat: 51.4951,
    lng: 5.4623,
  },
  "404": {
    name: "Groningen",
    address: "Sontweg 9, 9723 AT Groningen, Netherlands",
    lat: 53.2175,
    lng: 6.5922,
  },
  "089": {
    name: "Heerlen",
    address: "In de Cramer 142, 6412 PM Heerlen, Netherlands",
    lat: 50.9005,
    lng: 5.9373,
  },
  "312": {
    name: "Hengelo",
    address: "Hasseler Es 2, 7559 DD Hengelo, Netherlands",
    lat: 52.2824,
    lng: 6.7958,
  },
  "270": {
    name: "Utrecht",
    address: "Winthontlaan 2, 3526 KV Utrecht, Netherlands",
    lat: 52.0827,
    lng: 5.1004,
  },
  "391": {
    name: "Zwolle",
    address: "Grote Voort 2, 8041 AM Zwolle, Netherlands",
    lat: 52.5238,
    lng: 6.1141,
  },
};

export type IkeaStoreId = keyof typeof IKEA_STORES;

export const IKEA_STORE_LIST = Object.entries(IKEA_STORES).map(
  ([id, store]) => ({
    id,
    name: store.name,
  })
);

