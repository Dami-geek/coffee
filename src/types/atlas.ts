export type BeanLocation = {
  name: string;
  lat: number;
  lng: number;
};

export type BeanType = {
  id: string;
  countryId: string;
  name: string;
  description?: string;
  processes: string[];
  tastingNotes: string[];
  seasonality?: string;
  notes?: string;
  locations: BeanLocation[];
  links: string[];
};

export type Country = {
  id: string;
  iso2: string;
  name: string;
  description: string;
  links: string[];
};

export type AtlasData = {
  countries: Country[];
  beans: BeanType[];
};

