import { BillData } from '@/types';

export const VALID_FILE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const MOCK_BILL_DATA: BillData = {
  items: [
    { id: 'item-1', name: 'Super Burrito w/ Grilled Chicken', price: 18.00 },
    { id: 'item-2', name: 'Super Burrito w/ Grilled Chicken', price: 18.00 },
    { id: 'item-3', name: 'Mexican Omelette Country Potatoes Toasted SourDough', price: 17.00 },
    { id: 'item-4', name: 'Platanos Fritos w/ Lechera', price: 10.00 },
    { id: 'item-5', name: 'Veggie Omelette Country Potatoes', price: 15.00 },
    { id: 'item-6', name: 'Toasted Sub Pancake', price: 3.00 },
    { id: 'item-7', name: 'Waffles', price: 14.00 },
  ],
  subtotal: 95.00,
  tax: 8.91,
  tip: 0.00,
  total: 103.91,
};

export const MOCK_PEOPLE = [
  { id: 'person-1', name: 'Aman' },
  { id: 'person-2', name: 'Simran' },
  { id: 'person-3', name: 'Karan' },
  { id: 'person-4', name: 'Dad' },
];
