import * as React from "react";
import { Map } from 'immutable';

import { Region } from '../Immutable';

interface Coordinate {
  x: number,
  y: number
}

interface Mouse extends Coordinate {
  down: boolean
}

interface props {
  regions: Map<string, Region>
  onPick: (x: number, y: number, region?: string) => void
}

export class MapPicker extends React.Component<props, {}> {

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mouse: Mouse;
  offset: Coordinate;
  regions: {[key: string]: string} = {};

  componentDidMount() {
    this.canvas = document.getElementById('canvas_map_picker') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.mouse = {
      down: false,
      x: 0,
      y: 0
    }
    // center ourselves on 1000,1000
    // offset is our offset from the OpenSim origin 0,0, in pixels
    this.offset = {
      x: -1000 * 50 + this.canvas.width/2 - 25,
      y: 1000 * 50 + this.canvas.height/2 - 25
    }

    this.canvas.onmousedown = this.onMouseDown.bind(this);
    this.canvas.onmouseup = this.onMouseUp.bind(this);
    this.canvas.onscroll = this.onMouseScroll.bind(this);
    this.canvas.onmousemove = this.onMouseMove.bind(this);

    this.redraw();
  }

  redraw() {

    // calculate offsets for grid
    let offYMod = this.offset.y % 50;
    let offXMod = this.offset.x % 50;
    let width = this.canvas.width + 50 * 2;
    let height = this.canvas.height + 50 * 2;
    let tileScalar = 50;

    // blank out background
    this.ctx.fillStyle = 'rgb(230,230,230)';
    this.ctx.fillRect(0, 0, width, height);

    // draw grid
    this.ctx.strokeStyle = "#777";
    for (var x = offXMod - tileScalar; x < width; x += tileScalar) {
      if(x < 0) continue;
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
      //this.canvas.drawLine({ strokeStyle: "#777", strokeWidth: 1, x1: x, y1: 0, x2: x, y2: height });
    }
    for (var y = offYMod - tileScalar; y < height; y += tileScalar) {
      if(y < 0) continue;
      this.ctx.beginPath()
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
      //this.canvas.drawLine({ strokeStyle: "#777", strokeWidth: 1, x1: 0, y1: y, x2: width, y2: y });
    }

    // draw coordinate
    //draw region coordinates and names
    this.ctx.font = "10px Arial";
    this.ctx.fillStyle = "#000";
    for (let x = offXMod - tileScalar; x < width; x += tileScalar) {
      for (let y = offYMod - tileScalar; y < height; y += tileScalar) {
        var coords = this.pixelToTile(x, y);
        if(coords.x < 0 || coords.y < 0) continue;
        var coordstring = coords.x + ", " + coords.y;
        this.ctx.fillText(coordstring, x, y+50);
        if(coordstring in this.regions){
          this.ctx.fillText(this.regions[coordstring], x, y+25);
        }
      }
    }
  }

  pixelToTile(x: number, y: number): Coordinate {
    return {
      'x': Math.floor((x - this.offset.x) / 50),
      'y': -Math.floor((y - this.offset.y) / 50)
    };
  }

  getMouseCoords(e: MouseEvent): Coordinate {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  onMouseDown(e: MouseEvent) {
    this.mouse.down = true;
    let pos = this.getMouseCoords(e);
    this.mouse.x = pos.x;
    this.mouse.y = pos.y;
  }

  onMouseUp(e: MouseEvent) {
    this.mouse.down = false;
    let pos = this.getMouseCoords(e);
    let coords = this.pixelToTile(pos.x, pos.y);
    var coordstring = coords.x + ", " + coords.y;
    if(coordstring in this.regions){
      this.props.onPick(coords.x, coords.y, this.regions[coordstring]);
    } else {
      this.props.onPick(coords.x, coords.y);
    }
    this.redraw();
  }

  onMouseMove(e: MouseEvent) {
    if (this.mouse.down) {
      let pos = this.getMouseCoords(e);
      let dx = pos.x - this.mouse.x;
      let dy = pos.y - this.mouse.y;
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
      this.offset.x += dx;
      this.offset.y += dy;
      this.redraw();
    }
  }

  onMouseScroll(e: UIEvent) {
    // no zoom for now
  }

  // REACT COMPONENTS

  constructor(props: props){
    super(props);

    let regions: {[key: string]: string} = {};
    props.regions.toArray().map((r: Region) => {
      regions[r.x + ', ' + r.y] = r.name;
    })
    this.regions = regions;
  }

  render() {
    return (
      <canvas width="800" height="440" id="canvas_map_picker"></canvas>
    )
  }
}