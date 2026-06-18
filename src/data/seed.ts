import type { AtlasData } from "@/types/atlas";

export const seedData: AtlasData = {
  countries: [
    {
      id: "brazil",
      iso2: "BR",
      name: "Brazil",
      description:
        "The world's largest coffee producer, known for chocolatey, nutty profiles and dependable sweetness across diverse regions.",
      links: ["https://en.wikipedia.org/wiki/Coffee_production_in_Brazil"],
    },
    {
      id: "colombia",
      iso2: "CO",
      name: "Colombia",
      description:
        "High-elevation coffees with bright acidity and floral sweetness, shaped by microclimates and meticulous processing.",
      links: ["https://en.wikipedia.org/wiki/Coffee_production_in_Colombia"],
    },
    {
      id: "ethiopia",
      iso2: "ET",
      name: "Ethiopia",
      description:
        "Coffee's birthplace, famous for heirloom varieties and expressive florals ranging from tea-like to intensely fruity naturals.",
      links: ["https://en.wikipedia.org/wiki/Coffee_production_in_Ethiopia"],
    },
  ],
  beans: [
    {
      id: "br-bourbon",
      countryId: "brazil",
      name: "Yellow Bourbon",
      description: "A natural mutation of Typica known for its yellow cherries and high sweetness.",
      processes: ["Natural", "Pulped Natural"],
      tastingNotes: ["Chocolate", "Caramel", "Hazelnut", "Brown sugar"],
      seasonality: "May–Sep",
      notes: "Often a roaster workhorse: sweet, low-acid, and forgiving.",
      locations: [
        { name: "Cerrado Mineiro", lat: -18.9186, lng: -48.2772 },
        { name: "Mogiana", lat: -22.3833, lng: -46.9500 }
      ],
      links: [],
    },
    {
      id: "co-geisha",
      countryId: "colombia",
      name: "Geisha",
      description: "An exclusive variety known for its tea-like body and intense floral aromatics.",
      processes: ["Washed", "Honey"],
      tastingNotes: ["Jasmine", "Bergamot", "Peach", "Honey"],
      seasonality: "Oct–Dec",
      notes: "Known for bright acidity and elegant aromatics.",
      locations: [
        { name: "Huila", lat: 2.5359, lng: -75.5277 },
        { name: "Nariño", lat: 1.2136, lng: -77.2811 }
      ],
      links: [],
    },
    {
      id: "et-heirloom",
      countryId: "ethiopia",
      name: "Ethiopian Heirloom",
      description: "A mix of indigenous varieties that give Ethiopian coffee its distinct wild flavors.",
      processes: ["Washed", "Natural"],
      tastingNotes: ["Blueberry", "Black Tea", "Lemon", "Jasmine"],
      seasonality: "Nov–Feb",
      notes: "Washed lots lean tea-like and floral; naturals intensify fruit.",
      locations: [
        { name: "Yirgacheffe", lat: 6.1627, lng: 38.2058 },
        { name: "Sidama", lat: 6.6430, lng: 38.3100 }
      ],
      links: [],
    },
  ],
};