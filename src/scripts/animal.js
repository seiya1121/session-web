const Animals = [
  'dog', 'cat', 'lion',
];

const getAnimalName = () => {
  const max = Animals.length;
  const min = 0;
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  return Animals[n];
};

export { Animals, getAnimalName };
