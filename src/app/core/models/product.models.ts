export interface Product {
  id: number;
  name: string;
  type: string;
  category: string;
  price: number;
  image: string;
  selected?: boolean;
  isDeleted?: boolean;
  lastUpdated: string;
}
