import { Component, OnInit } from '@angular/core';
import objetivo from 'src/app/models/funcionObjetivo.interface';
import restriccion from 'src/app/models/restriccion.interface';
import { SimplexService } from 'src/app/services/simplex.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  z:objetivo={
    constante1:undefined,
    operador:'+',
    constante2:undefined
  }
  r1:restriccion={
    constante1:undefined,
    operador:'+',
    constante2:undefined,
    desigualdad:'>=',
    limite:undefined
  }
  r2:restriccion={
    constante1:undefined,
    operador:'+',
    constante2:undefined,
    desigualdad:'>=',
    limite:undefined
  }

  operadores=['+','-']
  operadores_desigualdad=['>=','<=']
  
  constructor() { }
  
  ngOnInit(): void {
  }
  log(){
    new SimplexService().resolveSimplex(this.z,this.r1,this.r2)    
  }
}


