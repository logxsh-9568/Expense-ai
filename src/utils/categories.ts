import { Category } from '../types';

export interface CategoryMeta {
  id: Category;
  name: string;
  emoji: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  chartColor: string;
  keywords: string[];
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  Food: {
    id: 'Food',
    name: 'Food & Dining',
    emoji: '',
    iconName: 'Utensils',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    chartColor: '#F59E0B',
    keywords: [
      'food', 'lunch', 'dinner', 'breakfast', 'tea', 'coffee', 'chai', 'snack', 'snacks',
      'pizza', 'burger', 'sandwich', 'swiggy', 'zomato', 'restaurant', 'cafe', 'groceries',
      'grocery', 'milk', 'vegetables', 'fruits', 'veggies', 'meal', 'meals', 'eat', 'bread',
      'chicken', 'biryani', 'curry', 'dosa', 'idli', 'juice', 'dessert', 'ice cream'
    ]
  },
  Transport: {
    id: 'Transport',
    name: 'Transport',
    emoji: '',
    iconName: 'Bus',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    chartColor: '#3B82F6',
    keywords: [
      'transport', 'bus', 'train', 'metro', 'cab', 'taxi', 'uber', 'ola', 'auto',
      'rickshaw', 'petrol', 'diesel', 'fuel', 'toll', 'parking', 'gas', 'fare', 'ticket',
      'commute', 'bike', 'scooter'
    ]
  },
  Shopping: {
    id: 'Shopping',
    name: 'Shopping',
    emoji: '️',
    iconName: 'ShoppingBag',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    chartColor: '#8B5CF6',
    keywords: [
      'shopping', 'clothes', 'dress', 'shirt', 'pants', 'shoes', 'amazon', 'flipkart',
      'myntra', 'mall', 'electronics', 'gadget', 't-shirt', 'watch', 'bag', 'online order',
      'purshase', 'bought'
    ]
  },
  Entertainment: {
    id: 'Entertainment',
    name: 'Entertainment',
    emoji: '',
    iconName: 'Film',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    chartColor: '#F43F5E',
    keywords: [
      'entertainment', 'movie', 'cinema', 'theatre', 'netflix', 'prime', 'spotify',
      'hotstar', 'game', 'gaming', 'concert', 'pub', 'club', 'party', 'outing', 'show'
    ]
  },
  Bills: {
    id: 'Bills',
    name: 'Bills & Utilities',
    emoji: '',
    iconName: 'Zap',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-800',
    chartColor: '#EAB308',
    keywords: [
      'bill', 'bills', 'electricity', 'current', 'power', 'water', 'gas', 'wifi',
      'internet', 'broadband', 'recharge', 'mobile', 'rent', 'maintenance', 'subscription'
    ]
  },
  Education: {
    id: 'Education',
    name: 'Education',
    emoji: '',
    iconName: 'GraduationCap',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    chartColor: '#10B981',
    keywords: [
      'education', 'college', 'school', 'university', 'fee', 'fees', 'tuition', 'book',
      'books', 'course', 'exam', 'stationery', 'notebook', 'classes', 'coaching'
    ]
  },
  Healthcare: {
    id: 'Healthcare',
    name: 'Healthcare',
    emoji: '',
    iconName: 'Activity',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700',
    chartColor: '#14B8A6',
    keywords: [
      'health', 'healthcare', 'doctor', 'hospital', 'clinic', 'medicine', 'pharmacy',
      'tablets', 'medical', 'dental', 'test', 'blood test', 'checkup', 'drugs', 'syrup'
    ]
  },
  Travel: {
    id: 'Travel',
    name: 'Travel',
    emoji: '️',
    iconName: 'Plane',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    chartColor: '#0EA5E9',
    keywords: [
      'travel', 'flight', 'airplane', 'hotel', 'resort', 'airbnb', 'trip', 'vacation',
      'tour', 'stay', 'luggage', 'booking'
    ]
  },
  Others: {
    id: 'Others',
    name: 'Others',
    emoji: '',
    iconName: 'Package',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    chartColor: '#64748B',
    keywords: ['other', 'others', 'miscellaneous', 'misc', 'random', 'gift', 'donation']
  }
};

export const CATEGORY_LIST: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Education',
  'Healthcare',
  'Travel',
  'Others'
];
