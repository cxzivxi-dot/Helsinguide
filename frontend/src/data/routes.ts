
export type RouteDefinition = {
  slug: string;
  title: string;
  category: 'Culture' | 'Nature' | 'Food';
  description: string;
  image: string;
  stopSearches: string[][];
};

export const routes: RouteDefinition[] = [
  {
    slug: 'classic-helsinki',
    title: 'Classic Helsinki',
    category: 'Culture',
    description:
      'Discover Helsinki’s historic centre, iconic architecture, lively market square and modern city spaces.',
    image:
      'https://images.unsplash.com/photo-1533044309907-0fa3413da946?auto=format&fit=crop&w=900&q=80',
    stopSearches: [
      ['Helsinki Cathedral', 'Helsingin tuomiokirkko'],
      ['Senate Square', 'Senaatintori'],
      ['Market Square', 'Kauppatori'],
      ['Esplanadi', 'Esplanadin puisto'],
      ['Oodi', 'Central Library Oodi'],
    ],
  },
  {
    slug: 'seaside-escape',
    title: 'Seaside Escape',
    category: 'Nature',
    description:
      'Enjoy Helsinki’s coastal atmosphere, green parks and views of the Baltic Sea.',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
    stopSearches: [
      ['Kaivopuisto'],
      ['Löyly'],
      ['Hietalahti'],
      ['Market Square', 'Kauppatori'],
    ],
  },
  {
    slug: 'coffee-design',
    title: 'Coffee & Design',
    category: 'Food',
    description:
      'Discover Helsinki’s design culture, creative landmarks and places to take a break.',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=900&q=80',
    stopSearches: [
      ['Design Museum', 'Designmuseo'],
      ['Oodi', 'Central Library Oodi'],
      ['Café Regatta'],
      ['Market Square', 'Kauppatori'],
    ],
  },
];
