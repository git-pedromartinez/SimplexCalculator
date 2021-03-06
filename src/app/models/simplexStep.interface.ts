import Fraction from 'fraction.js';

export default interface simplexStep {
  varIn: string | number;
  varOut: string | number;
  matrix: Array<Array<Fraction>>;
  varInOut:Array<string>;
}
