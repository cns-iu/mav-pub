import { Operator, map, lookup } from '@ngx-dino/core';
import { scaleLinear, scaleLog } from 'd3-scale';


export class SizeScale {

  constructor(
    private start: number,
    private end: number,
    private outOfDomainSize: number,
    private quantitativeScaleType: string = 'linear'
  ) { }

  qualitative<T>(items: T[]): Operator<T, number> {
    const sizes: Map<T, number> = new Map();
    const sizeFunction = this.getQualitativeSizeFunction([0, items.length - 1]);
    items.forEach((item, index) => {
      sizes.set(item, sizeFunction(index));
    });
    return lookup<T, number>(sizes, this.outOfDomainSize);
  }
  getQualitativeSizeFunction(domain: number[]): (number) => number {
    const addend = (this.end - this.start) / (domain[1] - domain[0]);

    return (index) =>  this.start + index * addend;
  }

  quantitative(domain: number[]): Operator<number, number> {
    return map<number, number>(this.getQuantitativeSizeFunction(domain));
  }
  getQuantitativeSizeFunction(domain: number[]): (n: number) => number {
    let scaleFunction: (n: number) => number;
    switch (this.quantitativeScaleType) {
      case 'log':
        if (domain[0] === 0) {
          domain[0] = 1e-6;
        }
        scaleFunction = scaleLog<number, number>()
          .domain(domain).range([this.start, this.end]);
        break;
      case 'linear':
      default:
        scaleFunction = scaleLinear<number, number>()
          .domain(domain).range([this.start, this.end]);
        break;
    }

    return (n) => n < domain[0] ? this.outOfDomainSize : scaleFunction(n);
  }
}

