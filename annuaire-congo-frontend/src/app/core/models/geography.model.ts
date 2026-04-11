export interface Region {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  regionId: string;
}