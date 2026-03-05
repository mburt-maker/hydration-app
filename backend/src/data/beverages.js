export const beverageCategories = {
  water: {
    name: 'Water',
    color: '#A8E6CF',
    subtypes: ['Still', 'Sparkling', 'Flavored Sparkling'],
    sizes: [8, 12, 16.9, 20, 24, 32]
  },
  coffee: {
    name: 'Coffee',
    color: '#DEB887',
    subtypes: ['Brewed', 'Espresso', 'Americano', 'Latte', 'Cappuccino', 'Cold Brew', 'Iced Coffee'],
    sizes: [1, 8, 12, 16, 20]
  },
  tea: {
    name: 'Tea',
    color: '#98D8AA',
    subtypes: ['Hot', 'Iced', 'Green', 'Matcha Latte'],
    sizes: [8, 12, 16, 20]
  },
  soda: {
    name: 'Soda',
    color: '#FFB4B4',
    subtypes: ['Regular Cola', 'Diet Cola', 'Lemon-Lime', 'Root Beer'],
    sizes: [12, 16, 20, 24, 32]
  },
  energy: {
    name: 'Energy Drink',
    color: '#B4D4FF',
    subtypes: ['Standard', 'Sugar-Free'],
    sizes: [8, 12, 16]
  },
  milk: {
    name: 'Milk',
    color: '#FFF5E4',
    subtypes: ['Whole', '2%', 'Skim', 'Almond', 'Oat', 'Soy'],
    sizes: [8, 12, 16]
  },
  juice: {
    name: 'Juice',
    color: '#FFCF96',
    subtypes: ['Orange', 'Apple', 'Cranberry', 'Green/Vegetable'],
    sizes: [4, 8, 12, 16]
  }
};

export const getBeverageList = () => {
  return Object.entries(beverageCategories).map(([key, value]) => ({
    id: key,
    ...value
  }));
};
