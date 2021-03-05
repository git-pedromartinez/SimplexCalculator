import { Injectable } from '@angular/core';
import Fraction from 'fraction.js';
import * as _ from 'underscore';
import objetivo from '../models/funcionObjetivo.interface';
import restriccion from '../models/restriccion.interface';

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

  resolveSimplex(z: objetivo, r1: restriccion, r2: restriccion) {
    let matrix = this.getMatrix(z, r1, r2);
    let varIn = ['resultado', 'z', 'x1', 'x2', 's2', 's2'];
    let varOut = ['z', 's1', 's2'];
    let varBasics: Array<varBasic> = [];
    for (let index = 1; index <= 2; index++) {
      varBasics.push({
        namVar: `x${index}`,
        valueVar: matrix[varOut.indexOf(`z`)][varIn.indexOf(`x${index}`)],
      });
    }
    var stepsSimplex: Array<simplexStep> = [];
    for (let index = 0; index < varBasics.length; index++) {
      const element = varBasics[index];
      let vars: Array<varBasic> = _.filter(
        varBasics,
        (varBasic) => !new Fraction(0).equals(varBasic.valueVar)
      );
      let maxVarBasic: varBasic = <varBasic>_.max(vars, (v) => v.valueVar);

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
        (varBasic) => !new Fraction(0).equals(varBasic.valueVar)
      );
      let minTempBasicResult: varBasic = <varBasic>(
        _.min(vars, (v) => v.valueVar)
      );
      stepsSimplex.push({
        varIn: maxVarBasic.namVar,
        varOut: minTempBasicResult.namVar,
        matrix: JSON.parse(JSON.stringify(matrix)),
      });
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
        let element = matrix[varOut.indexOf(minTempBasicResult.namVar)][index];
        matrix[varOut.indexOf(minTempBasicResult.namVar)][index] = element.div(
          fraccion
        );
      }
      // let varNoBasics: Array<varBasic>;
      // for (let index = 1; index <= 2; index++) {
      //   varNoBasics.push({
      //     namVar: `s${index}`,
      //     valueVar: matrix[varIn.indexOf(`s${index}`)][1],
      //   });
      // }
      // let varsHolgura:Array<varBasic>=_.filter(
      //   varNoBasics,
      //   (varNoBasic) => !new Fraction(0).equals(varNoBasic.valueVar)
      // )
      // for (let index = 0; index < varsHolgura.length; index++) {
      //   const element = varsHolgura[index];
      //   element.valueVar=matrix[varIn.indexOf(`s${index+1}`)][0].div(element.valueVar)
      // }
    }
  }
}

interface varBasic {
  namVar: string;
  valueVar: Fraction;
}

interface simplexStep {
  varIn: string | number;
  varOut: string | number;
  matrix: Array<Array<Fraction>>;
}
