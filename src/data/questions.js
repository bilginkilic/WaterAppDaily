import { categoryIds } from './categories';

const questions = [
  {
    id: 1,
    category: categoryIds.DISHWASHING,
    text: 'Do you use a dishwasher to wash your dishes?',
    options: [
      { text: 'Yes', valueSaving: 111, valueTotal: 15, task: 'Well done, you\'ve saved time & 15 litres of water', category: categoryIds.DISHWASHING, type: 'Achievement' },
      { text: 'No', valueSaving: 0, valueTotal: 126, task: 'Pre-rinsing dishes wastes 1,232 litres of water a year', category: categoryIds.DISHWASHING, type: 'Task' }
    ],
    trainingText: 'Hand washing dishes can use up to 5 times more water compared to using a dishwasher.',
    content: {
      message: 'Switch to a dishwasher and save both water and time!',
      image: 'dishwasher.jpg',
      video: 'https://www.youtube.com/watch?v=PUCk6mMAZNA',
      additionalInfo: 'Studies suggest that using a dishwasher uses 73% less water than washing dishes by hand'
    }
  },
  {
    id: 2,
    category: categoryIds.DISHWASHING,
    text: 'Do you pre-rinse your dishes before stacking them in the dishwasher?',
    options: [
      { text: 'Yes', valueSaving: 0, valueTotal: 36, task: 'Do you need to rinse? Act accordingly!', category: categoryIds.DISHWASHING, type: 'Task' },
      { text: 'No', valueSaving: 21, valueTotal: 15, task: 'Well done for saving water!', category: categoryIds.DISHWASHING, type: 'Achievement' }
    ],
    trainingText: 'Pre-rinsing dishes may not always be necessary and can lead to a lot of water wastage.',
    content: {
      message: 'Modern dishwashers are designed to handle tough food residues',
      image: 'pre-rinse.jpg',
      video: 'https://www.youtube.com/watch?v=5si55pHkDIk',
      additionalInfo: 'Modern dishwashers do not need plates and dishes to be rinsed'
    }
  },
  {
    id: 3,
    category: categoryIds.DISHWASHING,
    text: 'Do you run your dishwasher on a full or half load cycle?',
    options: [
      { text: 'Full', valueSaving: 11, valueTotal: 22, task: 'Your making a positive change by fully loading your dishwasher - Well done!', category: categoryIds.DISHWASHING, type: 'Achievement' },
      { text: 'Half full', valueSaving: 0, valueTotal: 22, task: 'Did you know, a fully loaded dishwasher will save you 11 liters. Please take necessary action!', category: categoryIds.DISHWASHING, type: 'Task' }
    ],
    trainingText: 'Maximizing the load of your dishwasher before running can lead to significant water savings over time.',
    content: {
      message: 'Make every drop count! Wait for a full load',
      image: 'full-load.jpg',
      video: 'https://www.youtube.com/watch?v=DX8jpet6Q_k',
      additionalInfo: 'A half-loaded dishwasher uses nearly the same amount of water as a full load'
    }
  },
  {
    id: 4,
    category: categoryIds.PLUMBING,
    text: 'Are the taps in your home fitted with flow regulators ("aerators")?',
    options: [
      { text: 'Yes', valueSaving: 44, valueTotal: 76, task: 'That\'s great - your saving over 8 litres of water a minute', category: categoryIds.PLUMBING, type: 'Achievement' },
      { text: 'No', valueSaving: 0, valueTotal: 120, task: 'Did you know, aerators can use less than 800ml of water. Please take necessary action and save money.', category: categoryIds.PLUMBING, type: 'Task' }
    ],
    trainingText: 'Regular taps can use up to twice as much water as their low-flow counterparts.',
    content: {
      message: 'Every drop counts! Switch to low-flow taps',
      image: 'aerator.jpg',
      video: 'https://www.youtube.com/watch?v=fFQiIU_zJ5U',
      additionalInfo: 'Upgrading to low-flow taps is a cost-effective way to conserve water'
    }
  },
  {
    id: 5,
    category: categoryIds.SHOWER,
    text: 'How long does it take you to take shower?',
    options: [
      { text: 'Under 5 mins', valueSaving: 160, valueTotal: 70, task: '5 minutes shower is the target and it is a hard challenge, congratulations!', category: categoryIds.SHOWER, type: 'Achievement' },
      { text: '5 - 10 mins', valueSaving: 80, valueTotal: 150, task: 'Decreasing your shower duration makes a significant difference, take the necessary action!', category: categoryIds.SHOWER, type: 'Task' },
      { text: '11 - 15 mins', valueSaving: -20, valueTotal: 250, task: 'Decreasing your shower duration makes a significant difference, take the necessary action!', category: categoryIds.SHOWER, type: 'Task' },
      { text: 'Over 15 mins', valueSaving: -220, valueTotal: 450, task: 'Decreasing your shower duration makes a significant difference, take the necessary action!', category: categoryIds.SHOWER, type: 'Task' },
      { text: 'Use a bucket', valueSaving: 210, valueTotal: 20, task: 'Bucket usage is the target and it is a hard challenge, congratulations!', category: categoryIds.SHOWER, type: 'Achievement' }
    ],
    trainingText: 'Every additional minute in the shower uses up to 5 gallons of water.',
    content: {
      message: 'Time to reflect! Can you cut down a few minutes?',
      image: 'shower-timer.jpg',
      video: 'https://www.youtube.com/watch?v=v-TwsMtvw7w',
      additionalInfo: 'By reducing your shower time, you save water and energy'
    }
  },
  {
    id: 6,
    category: categoryIds.LAUNDRY,
    text: 'Do you run your laundry on a full load or half full load?',
    options: [
      { text: 'Full', valueSaving: 90, valueTotal: 180, task: 'By full loading your laundry you save 90 liters water, congratulations!', category: categoryIds.LAUNDRY, type: 'Achievement' },
      { text: 'Half full', valueSaving: 0, valueTotal: 180, task: '90 liters more with full loaded laundries, take the necessary action!', category: categoryIds.LAUNDRY, type: 'Task' }
    ],
    trainingText: 'Washing half loads frequently can lead to more water usage over time.',
    content: {
      message: 'Plan ahead! Combine your laundry to make full loads',
      image: 'laundry.jpg',
      video: 'https://www.youtube.com/watch?v=An-TW6tZd0o',
      additionalInfo: 'Running your machine with full loads extends its life'
    }
  },
  {
    id: 7,
    category: categoryIds.DAILY,
    text: 'Do you turn off the water while you brush your teeth?',
    options: [
      { text: 'Yes', valueSaving: 2, valueTotal: 2, task: 'You saved 10 liters for your each brush, congratulations!', category: categoryIds.DAILY, type: 'Achievement' },
      { text: 'No', valueSaving: 0, valueTotal: 4, task: 'Turn off the water and save 10 liters more for your each brush, take the necessary action!', category: categoryIds.DAILY, type: 'Task' }
    ],
    trainingText: 'Turning off the water while brushing can save significant amounts over time.',
    content: {
      message: 'Save 12 litres by turning off the tap while brushing',
      image: 'brushing.jpg',
      video: 'https://www.youtube.com/watch?v=gtcZbN0Z08c',
      additionalInfo: 'Small changes in daily habits can lead to big savings'
    }
  },
  {
    id: 8,
    category: categoryIds.PLUMBING,
    text: 'Are you aware of any leaking pipes?',
    options: [
      { text: 'Yes', valueSaving: 0, valueTotal: 32, task: '32 liters more with only one leaky faucet, take the necessary action!', category: categoryIds.PLUMBING, type: 'Task' },
      { text: 'No', valueSaving: 32, valueTotal: 0, task: 'Good job on maintaining your plumbing! It is great but please be aware as leaks are unpredicatable.', category: categoryIds.PLUMBING, type: 'Achievement' }
    ],
    trainingText: 'Maintaining your plumbing system ensures no wastage and saves money.',
    content: {
      message: 'Regular checks keep your plumbing in top shape',
      image: 'leaking-pipe.jpg',
      video: 'https://www.youtube.com/watch?v=Rl6YOGCoZvU',
      additionalInfo: 'Leaks can waste a lot of water and increase bills'
    }
  },
  {
    id: 9,
    text: 'Do you own a vehicle?',
    options: [
      { text: 'No', valueSaving: 0, valueTotal: 0, task: null, category: 'vehicle', type: null },
      { text: 'Yes', valueSaving: 0, valueTotal: 0, task: null, category: 'vehicle', type: null }
    ],
    trainingText: 'Vehicle ownership affects water usage through washing habits.',
    content: {
      message: 'Consider eco-friendly car washing methods',
      image: 'car-wash.jpg',
      video: 'https://www.youtube.com/watch?v=RoQRdHF2qgI',
      additionalInfo: 'Vehicle maintenance can impact water consumption'
    }
  },
  {
    id: 10,
    category: categoryIds.CAR,
    text: 'Do you manually wash your car or do you use pressure washer system?',
    options: [
      { text: 'Yourself', valueSaving: 0, valueTotal: 200, task: '120 liters more with each car wash, take the necessary action!', category: categoryIds.CAR, type: 'Task' },
      { text: 'A professional car cleaning service', valueSaving: 120, valueTotal: 80, task: 'Washing your car by pressure washer systems you saved 120 liters water, congratulations!', category: categoryIds.CAR, type: 'Achievement' }
    ],
    trainingText: 'Professional car washes typically use less water than manual washing.',
    content: {
      message: 'Save water while keeping your car clean',
      image: 'pressure-wash.jpg',
      video: 'https://www.youtube.com/watch?v=RoQRdHF2qgI',
      additionalInfo: 'Use water-efficient methods for vehicle cleaning'
    }
  }
];

export default questions; 