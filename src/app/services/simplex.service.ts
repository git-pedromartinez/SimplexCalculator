import { Injectable } from '@angular/core';
import Fraction from 'fraction.js';
import * as _ from 'underscore';
import objetivo from '../models/funcionObjetivo.interface';
import restriccion from '../models/restriccion.interface';
import simplexStep from '../models/simplexStep.interface';
import varBasic from '../models/varBasic.interface';

@Injectable({
  providedIn: 'root',
})
export class SimplexService {
  constructor() {}

  private typeHolgura(varHolgura: string) {
    return varHolgura === '>=' ? -1 : 1;
  }

  private getMatrix(
    z: objetivo,
    r1: restriccion,
    r2: restriccion
  ): Array<Array<Fraction>> {
    //[limite,z,x1,x2,s1,s2]
    let zC = [
      new Fraction(0),
      new Fraction(1),
      new Fraction(z.constante1).mul(-1),
      new Fraction(z.constante2).mul(-1),
      new Fraction(0),
      new Fraction(0),
    ];
    let r1C = [
      new Fraction(r1.limite),
      new Fraction(0),
      new Fraction(r1.constante1),
      new Fraction(r1.constante2),
      new Fraction(this.typeHolgura(r1.desigualdad)),
      new Fraction(0),
    ];
    let r2C = [
      new Fraction(r2.limite),
      new Fraction(0),
      new Fraction(r2.constante1),
      new Fraction(r2.constante2),
      new Fraction(0),
      new Fraction(this.typeHolgura(r2.desigualdad)),
    ];
    let matrix = [zC, r1C, r2C];
    return matrix;
  }

  resolveSimplex(
    z: objetivo,
    r1: restriccion,
    r2: restriccion
  ): Array<simplexStep> {
    let matrix = this.getMatrix(z, r1, r2);

    let varIn = ['resultado', 'z', 'x1', 'x2', 's2', 's2'];
    let varOut = ['z', 's1', 's2'];
    let varInOut = ['z', 's1', 's2'];

    let stepsSimplex: Array<simplexStep> = [];
    stepsSimplex.push({
      varIn: null,
      varOut: null,
      matrix: JSON.parse(JSON.stringify(matrix)),
      varInOut:JSON.parse(JSON.stringify(varInOut))
    });
    for (let index = 1; index <= 2; index++) {
      let varBasics: Array<varBasic> = [];
      for (let index = 1; index <= 2; index++) {
        varBasics.push({
          namVar: `x${index}`,
          valueVar: matrix[varOut.indexOf(`z`)][varIn.indexOf(`x${index}`)],
        });
      }
      let vars: Array<varBasic> = _.filter(
        varBasics,
        (varBasic) => !new Fraction(0).equals(varBasic.valueVar)
      );
      if (vars.length > 0) {
        let maxVarBasic: varBasic = <varBasic>_.min(vars, (v) => v.valueVar);//el mas negativo

        let tempResults: Array<varBasic> = [];
        for (let index = 1; index <= 2; index++) {
          tempResults.push({
            namVar: `s${index}`,
            valueVar: matrix[varOut.indexOf(`s${index}`)][
              varIn.indexOf(`resultado`)
            ].div(
              matrix[varOut.indexOf(`s${index}`)][
                varIn.indexOf(maxVarBasic.namVar)
              ]
            ),
          });
        }
        vars = _.filter(
          tempResults,
          (varBasic) => varBasic.valueVar>=new Fraction(0)
        );
        let minTempBasicResult: varBasic = <varBasic>(
          _.min(vars, (v) => v.valueVar)
        );

        varInOut[varInOut.indexOf(minTempBasicResult.namVar)]=maxVarBasic.namVar

        let celda: Fraction =
          matrix[varOut.indexOf(minTempBasicResult.namVar)][
            varIn.indexOf(maxVarBasic.namVar)
          ];
        let fraccion: Fraction = new Fraction(1).div(celda);

        for (
          let index = 0;
          index < matrix[varOut.indexOf(minTempBasicResult.namVar)].length;
          index++
        ) {
          let element =
            matrix[varOut.indexOf(minTempBasicResult.namVar)][index];
          matrix[varOut.indexOf(minTempBasicResult.namVar)][
            index
          ] = element.mul(fraccion);
        }
        let vecX: Array<Fraction> = [];
        for (let index = 0; index < matrix.length; index++) {
          vecX.push(
            new Fraction(0).sub(matrix[index][varIn.indexOf(maxVarBasic.namVar)])
          );
        }
        for (let i = 0; i < matrix.length; i++) {
          for (let j = 0; j < matrix[i].length; j++) {
            if (!(i === varOut.indexOf(minTempBasicResult.namVar))) {
              matrix[i][j] = matrix[i][j].add(matrix[varOut.indexOf(minTempBasicResult.namVar)][j].mul(vecX[i]));
            }
          }
        }
        stepsSimplex.push({
          varIn: maxVarBasic.namVar,
          varOut: minTempBasicResult.namVar,
          matrix: JSON.parse(JSON.stringify(matrix)),
          varInOut:JSON.parse(JSON.stringify(varInOut))
        });
        
      }
    }
    return stepsSimplex;
  }
}
