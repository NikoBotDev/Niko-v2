export default class WheelOfFortune {
  protected readonly result: number;

  protected values?: number[];

  constructor() {
    this.result = Math.floor(Math.random() * 8);
  }

  get multipliers() {
    const shuffled = WheelOfFortune.shuffle([
      1.4,
      1.5,
      0.2,
      0.1,
      0.3,
      0.5,
      1.2,
      1.7,
    ]);
    this.values = shuffled;
    return shuffled;
  }

  get emojis() {
    return ['⬆', '↖', '⬅', '↙', '⬇', '↘', '➡', '↗'];
  }

  get emoji() {
    return this.emojis[this.result];
  }

  get multiplier() {
    return this.values![this.result];
  }

  static shuffle(array: number[]) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
