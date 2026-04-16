export interface City {
  name: string;
  lat: number;
  lng: number;
  province: string;
}

export const CITIES: City[] = [
  { name: "Kigali", lat: -1.9441, lng: 30.0619, province: "Kigali City" },
  { name: "Butare (Huye)", lat: -2.5967, lng: 29.7333, province: "Southern Province" },
  { name: "Muhanga (Gitarama)", lat: -2.0747, lng: 29.7567, province: "Southern Province" },
  { name: "Musanze (Ruhengeri)", lat: -1.4983, lng: 29.6333, province: "Northern Province" },
  { name: "Gicumbi (Byumba)", lat: -1.61, lng: 30.05, province: "Northern Province" },
  { name: "Rubavu (Gisenyi)", lat: -1.684, lng: 29.262, province: "Western Province" },
  { name: "Rusizi (Cyangugu)", lat: -2.484, lng: 28.9, province: "Western Province" },
  { name: "Karongi (Kibuye)", lat: -2.158, lng: 29.351, province: "Western Province" },
  { name: "Ngoma (Kibungo)", lat: -2.167, lng: 30.5, province: "Eastern Province" },
  { name: "Nyagatare", lat: -1.298, lng: 30.325, province: "Eastern Province" },
  { name: "Rwamagana", lat: -1.948, lng: 30.434, province: "Eastern Province" },
  { name: "Kayonza", lat: -1.933, lng: 30.567, province: "Eastern Province" }
];

export const CATEGORIES = [
  "Food",
  "Health",
  "Beauty",
  "Shopping",
  "Finance",
  "Services",
  "Education",
  "Hotel"
];

export const PLANS = [
  { id: 'free', name: 'Free', price: '0 RWF', features: ['Basic listing', '1 photo', 'Appears in search results'] },
  { id: 'standard', name: 'Standard', price: '15,000/month', features: ['Up to 10 photos', 'Higher in search', 'Verified badge', 'Priority support'] },
  { id: 'featured', name: 'Featured', price: '45,000/month', features: ['Everything in Standard', 'Top of search results', 'Homepage spotlight', 'Social media feature'] }
];
