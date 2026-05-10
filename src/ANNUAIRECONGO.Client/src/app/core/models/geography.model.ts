export interface Region {
  id: string;
  name: string;
  cities?: City[];
}

export interface City {
  id: string;
  name: string;
  regionId: string;
}