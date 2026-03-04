export interface User {
  user_id: number;
  username: string;
  email: string;
  role: string;
}

export interface Cow {
  cow_id: number;
  tag_number: string;
  breed: string;
  sex: string;
  date_of_birth: string | Date; 
  status: string;
  image_url?: string; 
  location_id?: number;
  farm_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HealthRecord {
  health_id: number;
  cow_id: number;
  tag_number?: string;
  diagnosis?: string;
  treatment: string;
  last_visit: string | Date;
  follow_up_date?: string | Date;
  reason: string;
  vet_username?: string;
  vet_assistant_username?: string;
  weight?: number;
  notes?: string;
}

export interface BreedingRecord {
  breeding_id: number;
  cow_id: number;
  tag_number?: string;
  service_date: string | Date;
  breeding_method?: string;
  outcome?: string;
}

export interface Location {
  location_id: number;
  farm_name: string;
  address_line?: string;
  town: string;
  county: string;
  postcode: string;
  last_inspection_date?: string | Date;
}
