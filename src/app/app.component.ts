import { Component, OnInit, Output, Input, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { data } from './radialData'
import * as realData from './Fail_Pressure_Data.json'
import { Observable } from 'rxjs';

interface ChartData {
  TimeStamp: String;
  Pressure: Number;

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  radialData = realData


  @Input() showValid = false;
  // public rigOptions: Rig[];
  public arr: number[] = [];
  public arr2: number[] = [];
  @Output() change: EventEmitter<void> = new EventEmitter();
  public rigOptions: String[] = [
    'Pontus',
    'Poseidon',
    'Proteus',
    'Thalassa',
    'DS-10',
    'Olympus',
    'BravaStar',
    'Globetrotter 1',
    'Mars',
    'Ursa',
    'Holstein',
    'Perdido',
    'Globetrotter 2',
  ];
  public pressureData = [];
  public p500Data = [];
  public p500MinMax = [];
  public p5000Data = [];
  public pressureDates = [];
  public plist500 = [];
  public plist5000 = [];
  roundedMax: number;
  sub:any
  index = 1
  LPData = []
  modStartDate: any;
  modEndDate: any;
  xDateMin: any;
  xDateMax: any;

  @ViewChild('container') container: ElementRef;

  constructor() {}

  ngOnInit() {
    this.getCementService()
    // const containerDiv = this.container.nativeElement;
    // containerDiv.appendChild(this.createChart());
  

    this.sub = Observable.interval(5)
    .subscribe((val) => {
    
        this.LPData.push(this.plist500[0][this.index])
       
        if(typeof this.plist500[0][this.index].TimeStamp != "undefined"){
          this.index += 1
        } 
        console.log(this.plist500[0][this.index])
      
      console.log('function is counting', this.LPData)
   
      const containerDiv = this.container.nativeElement;
      if (containerDiv.childNodes[0]) {
        console.log('child removed 1')
      containerDiv.removeChild(containerDiv.childNodes[0]);
      }
      if (containerDiv.childNodes[1]) {
        console.log('child removed 2')
        containerDiv.removeChild(containerDiv.childNodes[1]);
        }
      console.log(containerDiv)
      containerDiv.appendChild(this.createChart());
      
      });

  }

  getCementService() {

      this.pressureData = realData;
      console.log(this.pressureData)
      this.p500Data = [];
      this.p5000Data = [];
      this.pressureData.map(d => this.pressureDates.push(new Date(d.TimeStamp.toString())));
      console.log(this.pressureDates)
      this.pressureData.map(d => {
        if (d.Pressure < 500) {
          this.p500Data.push(d);
        }

        let maxNum = this.pressureData.reduce((max, p) => (p.Pressure > max ? p.Pressure : max), this.pressureData[0].Pressure);
        this.roundedMax = Number(Number.parseFloat(maxNum).toPrecision(2));

        if (d.Pressure > this.roundedMax - 1000 && d.Pressure < maxNum) {
          this.p5000Data.push(d);
        }
      });

      let lastDate1 = new Date(this.p500Data[this.p500Data.length - 1].TimeStamp.toString());

      lastDate1.setMinutes(lastDate1.getMinutes() - 5);

      this.p500Data.map(d => {
        if (new Date(d.TimeStamp.toString()) < lastDate1) {
          d.min = d.Pressure;
          d.max = d.Pressure;
        }
        if (new Date(d.TimeStamp.toString()) > lastDate1) {
          d.min = 0;
          d.max = 500;
        }
      });

     

      this.plist500 = [];

      for (let i = 1; i < this.p500Data.length; i++) {
        let dateDifference = Math.abs(
          new Date(this.p500Data[i].TimeStamp.toString()).getMinutes() - new Date(this.p500Data[i - 1].TimeStamp.toString()).getMinutes(),
        );
        if (dateDifference < 2) {
          this.arr.push(this.p500Data[i - 1]);
        } else {
          this.plist500.push(this.arr);
          this.arr = [];
        }
      }
      this.plist500.push(this.arr);
      this.arr = [];
      console.log(this.plist500, 'plist500')
      this.plist5000 = [];

      let startLastDate = new Date("2020-01-13T23:26:10");
      let endLastDate = new Date("2020-01-13T23:31:10");

      this.plist500[0].map(d => {
        if (new Date(d.TimeStamp.toString()) < startLastDate || new Date(d.TimeStamp.toString()) > endLastDate) {
          d.min = d.Pressure;
          d.max = d.Pressure;
        }
        if (new Date(d.TimeStamp.toString()) > startLastDate && new Date(d.TimeStamp.toString()) < endLastDate) {
          d.min = 0;
          d.max = 500;
        }
      });


      // for (let i = 1; i < this.p5000Data.length; i++) {
      //   let dateDifference = Math.abs(
      //     new Date(this.p5000Data[i].TimeStamp.toString()).getMinutes() - new Date(this.p5000Data[i - 1].TimeStamp.toString()).getMinutes(),
      //   );
      //   if (dateDifference < 2) {
      //     this.arr2.push(this.p5000Data[i - 1]);
      //   } else {
      //     this.plist5000.push(this.arr2);
      //     this.arr2 = [];
      //   }
      // }
      this.plist5000.push(this.arr2);
      this.arr2 = [];

      this.xDateMin = new Date(this.pressureDates[0]);
      this.xDateMax = new Date(this.pressureDates[0])
   
      this.xDateMin.setMinutes(this.xDateMin.getMinutes() );
      this.xDateMax.setMinutes(this.xDateMax.getMinutes() + 30);

      // this.xDateMin.setHours(this.xDateMin.getHours() + 5);
      // this.xDateMax.setHours(this.xDateMax.getHours() + 1);

  }


  

  ngOnDestroy() {}

  createChart() {
    const radialDiv = document.createElement('div');
    const radialGraph = d3.select(radialDiv).classed('radial-chart-wrapper', true);

    let x = d3
      .scaleTime()
      .domain([this.xDateMin, this.xDateMax])
      .range([0, 2 * Math.PI]);

    // let x = d3.scaleUtc()
    // .domain([Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1) - 1])
    // .range([0, 2 * Math.PI])

    let width = 1500;
    let margin = 10;
    let innerRadius = width / 5;
    let outerRadius = width / 2 - margin;

    let xAxis = g =>
      g
        .attr('font-family', 'sans-serif')
        .attr('font-size', 12)
        .attr('fill', 'white')
        .call(g =>
          g
            .selectAll('g')
            .data(x.ticks(10))
            .enter()
            .append('g')
            .each((d, i) => (d.id = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })))
            .call(g =>
              g
                .append('path')
                .attr('stroke', '#7EE2FF')
                .attr('stroke-opacity', 0.6)
                .attr(
                  'd',
                  d => `
                M${d3.pointRadial(x(d), innerRadius)}
                L${d3.pointRadial(x(d), outerRadius)}
              `,
                ),
            )
            .call(g =>
              g
                .append('path')
                .attr('id', d => d.id)
                .datum(d => [d, d3.timeDay.offset(d, 1)])
                .attr('fill', 'none')
                .attr(
                  'd',
                  ([a, b]) => `
                  M${d3.pointRadial(x(a), innerRadius - 8)}
                  A${innerRadius / 2.175},${innerRadius / 2.175} 1,1,1 ${d3.pointRadial(x(b), innerRadius / 20)}
              `,
                ),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', 10)
                .append('textPath')
                .attr('startOffset', 5)
                .attr('xlink:href', d => '#' + d.id)
                .text(d => d.id),
            )  
        );

        let xAxis2 = g =>
        g
          .attr('font-family', 'sans-serif')
          .attr('font-size', 12)
          .attr('fill', 'white')
          .call(g =>
            g
              .selectAll('g')
              .data(x.ticks(15))
              .enter()
              .append('g')
              .each((d, i) => (d.id = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })))
              .call(g =>
                g
                  .append('path')
                  .attr('stroke', '#7EE2FF')
                  .attr('stroke-opacity', 0.6)
                  .attr(
                    'd',
                    d => `
                  M${d3.pointRadial(x(d), innerRadius)}
                  L${d3.pointRadial(x(d), outerRadius)}
                `,
                  ),
              )
              .call(g =>
                g
                  .append('path')
                  .attr('id', d => d.id)
                  .datum(d => [d, d3.timeDay.offset(d, 1)])
                  .attr('fill', 'none')
                  .attr(
                    'd',
                    ([a, b]) => `
                    M${d3.pointRadial(x(a), innerRadius - 8)}
                    A${innerRadius / 2.175},${innerRadius / 2.175} 1,1,1 ${d3.pointRadial(x(b), innerRadius / 20)}
                `,
                  ),
              )
              .call(g =>
                g
                  .append('text')
                  .attr('dy', 10)
                  .append('textPath')
                  .attr('startOffset', 5)
                  .attr('xlink:href', d => '#' + d.id)
                  .text(d => d.id),
              )  .call(g =>
                g
                  .append('text')
                  .attr('dy', 8)
                  .attr('dx', -150)
                  .attr('font-size', 70)
                  .attr('fill-opacity', 0.6)
                  .text(this.plist500[0][this.LPData.length - 1].Pressure.toFixed(2) + 'PSI'),
              )
          )

    let yAxis = g =>
      g
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 20)
        .attr('color', 'black')
        .call(g =>
          g
            .selectAll('g')
            .data(y.ticks().reverse())
            .enter()
            .append('g')
            .attr('fill', 'none')
            .call(g =>
              g
                .append('circle')
                .attr('stroke', '#7EE2FF')
                .attr('stroke-opacity', 0.6)
                .attr('r', y),
            )
            .call(g =>
              g
                .append('text')
                .attr('y', d => -y(d))
                .attr('dy', '0.35em')
                .attr('color', 'lightsteelblue')
                .text((x, i) => `${x.toFixed(0)}${i ? '' : 'Low Pressure'}`)
                .clone(true)
                .attr('y', d => -y(d))
                .selectAll(function() {
                  return [this, this.previousSibling];
                })
                .clone(true)
                .attr('y', d => y(d))
                .selectAll(function() { return [this, this.previousSibling]; })
                .attr('fill', 'currentColor')
                .attr('stroke', 'none'),
            ),
        );

    let y2Axis = g =>
      g
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 13)
        .attr('color', 'black')
        .call(g =>
          g
            .selectAll('g')
            .data(y2.ticks().reverse())
            .enter()
            .append('g')
            .attr('fill', 'none')
            .call(g =>
              g
                .append('circle')
                .attr('stroke', '#7EE2FF')
                .attr('stroke-opacity', 0.6)
                .attr('r', y2),
            )
            .call(g =>
              g
                .append('text')
                .attr('y', d => y2(d))
                .attr('dy', '0.35em')
                .attr('color', 'white')
                .text((x, i) => `${x.toFixed(0)}${i ? '' : 'High Pressure'}`)
                .clone(true)
                .attr('y', d => y2(d))
                .selectAll(function() {
                  return [this, this.previousSibling];
                })
                .clone(true)
                .attr('fill', 'currentColor')
                .attr('stroke', 'none'),
            ),
        );

    let y = d3
      .scaleLinear()
      .domain([d3.min(this.p500Data, d => 0), d3.max(this.p500Data, d => 500)])
      .range([innerRadius, outerRadius]);

    let y2 = d3
      .scaleLinear()
      .domain([d3.min(this.p5000Data, d => this.roundedMax - 1000), d3.max(this.pressureData, d => this.roundedMax)])
      .range([innerRadius, outerRadius]);

    let line = d3
      .lineRadial<ChartData>()
      .curve(d3.curveLinear)
      .angle((d: any) => x(new Date(d.TimeStamp.toString()).setHours(new Date(d.TimeStamp.toString()).getHours() + 5)));

    let area = d3
      .areaRadial<ChartData>()
      .curve(d3.curveLinear)
      .angle((d: any) => x(new Date(d.TimeStamp.toString()).setHours(new Date(d.TimeStamp.toString()).getHours() + 5)));

    const svg = radialGraph
      .append('svg')
      .attr('viewBox', '-1025 -790 2100 2500')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

   

    // for (let i = 0; i < this.plist500.length; i++) {
      svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'lightsteelblue')
        .attr('stroke-opacity', 0.88)
        .attr('stroke-width', 3)
        .attr('d', line.radius(d => y(d.Pressure))(this.LPData));
    // }
   
console.log(this.plist500[0])


    svg.append('g').call(yAxis).style('font-size', 30);
    svg.append('g').call(xAxis);
    let endLastDate = new Date("2020-01-13T23:31:10");
    let lastLPDate = new Date(this.LPData[this.LPData.length - 1].TimeStamp)

    if(lastLPDate > endLastDate){
      svg
      .append('path')
      .attr('fill', 'red')
      .attr('fill-opacity', 0.2)
      .attr('d', area.innerRadius((d:any) => y(d.min)).outerRadius((d:any) => y(d.max))(this.plist500[0]));
    }

    svg.append('g').call(xAxis2);

    return radialDiv;
  }
}
