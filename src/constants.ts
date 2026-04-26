export interface City {
  name: string;
  lat: number;
  lng: number;
  province: string;
}

export const DISTRICTS: City[] = [
  // Kigali City
  { name: "Nyarugenge", lat: -1.95, lng: 30.05, province: "Kigali City" },
  { name: "Gasabo", lat: -1.90, lng: 30.1, province: "Kigali City" },
  { name: "Kicukiro", lat: -2.0, lng: 30.1, province: "Kigali City" },
  // Northern Province
  { name: "Musanze", lat: -1.5, lng: 29.63, province: "Northern Province" },
  { name: "Gicumbi", lat: -1.6, lng: 30.05, province: "Northern Province" },
  { name: "Burera", lat: -1.4, lng: 29.8, province: "Northern Province" },
  { name: "Gakenke", lat: -1.7, lng: 29.78, province: "Northern Province" },
  { name: "Rulindo", lat: -1.7, lng: 30.0, province: "Northern Province" },
  // Southern Province
  { name: "Huye", lat: -2.6, lng: 29.73, province: "Southern Province" },
  { name: "Muhanga", lat: -2.07, lng: 29.75, province: "Southern Province" },
  { name: "Nyanza", lat: -2.35, lng: 29.75, province: "Southern Province" },
  { name: "Gisagara", lat: -2.62, lng: 29.85, province: "Southern Province" },
  { name: "Nyamagabe", lat: -2.48, lng: 29.47, province: "Southern Province" },
  { name: "Nyaruguru", lat: -2.72, lng: 29.52, province: "Southern Province" },
  { name: "Kamonyi", lat: -1.98, lng: 29.9, province: "Southern Province" },
  { name: "Ruhango", lat: -2.2, lng: 29.78, province: "Southern Province" },
  // Eastern Province
  { name: "Rwamagana", lat: -1.95, lng: 30.43, province: "Eastern Province" },
  { name: "Nyagatare", lat: -1.3, lng: 30.33, province: "Eastern Province" },
  { name: "Kayonza", lat: -1.93, lng: 30.57, province: "Eastern Province" },
  { name: "Gatsibo", lat: -1.6, lng: 30.45, province: "Eastern Province" },
  { name: "Kirehe", lat: -2.27, lng: 30.65, province: "Eastern Province" },
  { name: "Ngoma", lat: -2.17, lng: 30.5, province: "Eastern Province" },
  { name: "Bugesera", lat: -2.15, lng: 30.2, province: "Eastern Province" },
  // Western Province
  { name: "Rubavu", lat: -1.68, lng: 29.26, province: "Western Province" },
  { name: "Rusizi", lat: -2.48, lng: 28.9, province: "Western Province" },
  { name: "Karongi", lat: -2.16, lng: 29.35, province: "Western Province" },
  { name: "Nyamasheke", lat: -2.36, lng: 29.14, province: "Western Province" },
  { name: "Rutsiro", lat: -1.9, lng: 29.3, province: "Western Province" },
  { name: "Nyabihu", lat: -1.6, lng: 29.5, province: "Western Province" },
  { name: "Ngororero", lat: -1.88, lng: 29.62, province: "Western Province" }
].sort((a, b) => a.name.localeCompare(b.name));

export const CITIES: City[] = DISTRICTS; // Replace CITIES with DISTRICTS as requested

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

export const AD_PRICES = {
  ribbon: '15,000 RWF',
  popup: '25,000 RWF',
  redirect: '35,000 RWF',
  card: '25,000 RWF'
};
