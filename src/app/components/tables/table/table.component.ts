import { Component, Input, OnInit } from '@angular/core';
import Fraction from 'fraction.js';
import simplexStep from 'src/app/models/simplexStep.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() simplexStep:simplexStep
  @Input() index:number

  constructor() { }

  ngOnInit(): void {
  }

  castToString(n:Fraction){
    return new Fraction(n).toFraction()
  }

}
