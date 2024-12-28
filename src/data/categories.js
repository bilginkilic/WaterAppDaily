import { Icons } from '../assets/icons';

export const categories = {
  Dishwashing: {
    id: 'dishwashing',
    title: 'Dishwashing',
    icon: Icons.dishwashing,
    color: '#4FC3F7',
    description: 'Optimize your dishwashing habits',
  },
  Shower: {
    id: 'shower',
    title: 'Shower & Bath',
    icon: Icons.shower,
    color: '#81C784',
    description: 'Improve shower water efficiency',
  },
  Laundry: {
    id: 'laundry',
    title: 'Laundry',
    icon: Icons.laundry,
    color: '#7986CB',
    description: 'Optimize laundry water usage',
  },
  Plumbing: {
    id: 'plumbing',
    title: 'Plumbing',
    icon: Icons.plumbing,
    color: '#FFB74D',
    description: 'Maintain efficient plumbing',
  },
  DailyActivities: {
    id: 'daily',
    title: 'Daily Activities',
    icon: Icons.daily,
    color: '#BA68C8',
    description: 'Improve daily water habits',
  },
  CarWashing: {
    id: 'car',
    title: 'Car Washing',
    icon: Icons.car,
    color: '#4DB6AC',
    description: 'Efficient vehicle cleaning',
  }
};

// Kategori ID'lerini kolay erişim için dışa aktaralım
export const categoryIds = {
  DISHWASHING: 'dishwashing',
  SHOWER: 'shower',
  LAUNDRY: 'laundry',
  PLUMBING: 'plumbing',
  DAILY: 'daily',
  CAR: 'car'
}; 