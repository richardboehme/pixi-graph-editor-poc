import * as PIXI from 'pixi.js';
const pointSize = 8;
const init_y = 400;
const lineStyle = { width: 3, color: 0xec660c, alpha: 1 };

const initGraph = (root, points) => {
  const pointGraphics = [];

  for(let i = 0; i < points.length; i += 1) {
    points[i].y = init_y - points[i].y;
  }

  const app = new PIXI.Application({
      background: '#f5f5f5',
      resizeTo: root,
      antialias: true,
  });
  app.stage.eventMode = 'static';

  let currentDragPoint = null;

  const onDragMove = (event) => {
    if(currentDragPoint) {
      const { point, incoming, outgoing, index } = currentDragPoint
      point.x += event.movement.x
      point.y += event.movement.y

      const currentPoint = points[index];
      currentPoint.x += event.movement.x;
      currentPoint.y += event.movement.y;

      const previousPointLocation = points[index - 1] || { x: 0, y: 0 };
      incoming.clear();
      incoming.lineStyle(lineStyle);
      incoming.moveTo(previousPointLocation.x, previousPointLocation.y);
      incoming.lineTo(currentPoint.x, currentPoint.y);

      const nextPointLocation = points[index + 1];
      if(nextPointLocation) {
        outgoing.clear();
        outgoing.lineStyle(lineStyle);
        outgoing.moveTo(currentPoint.x, currentPoint.y);
        outgoing.lineTo(nextPointLocation.x, nextPointLocation.y);
      }

      //currentDragPoint.parent.toLocal(event.global, null, currentDragPoint.position)
    }
  }

  const onDragEnd = () => {
    if(currentDragPoint) {
      currentDragPoint = null;
      app.stage.off('pointermove', onDragMove);
    }
  }

  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)

  let prev_x = 0;
  let prev_y = init_y;
  for(let i = 0; i < points.length; i += 1) {
    const { x, y } = points[i];
    const line = new PIXI.Graphics();
    line.lineStyle(lineStyle);
    line.moveTo(prev_x, prev_y);
    line.lineTo(x, y);
    prev_x = x;
    prev_y = y;
    app.stage.addChild(line);

    const point = new PIXI.Graphics();
    point.moveTo(x - pointSize / 2, y - pointSize / 2)
    point.beginFill(0xec660c);
    point.drawRect(x - pointSize / 2, y - pointSize / 2, pointSize, pointSize);
    point.cursor = 'pointer';

    point.eventMode = 'static';

    app.stage.addChild(point);

    const lastPoint = pointGraphics[i - 1];
    if(lastPoint) {
      lastPoint.outgoing = line;
    }

    const pointGraphic = { point, incoming: line, outgoing: undefined, index: i }
    pointGraphics.push(pointGraphic)
    point.on('pointerdown', () => {
      currentDragPoint = pointGraphic;
      app.stage.on('pointermove', onDragMove)
    })
  }

  console.log(pointGraphics);
  root.appendChild(app.view);
}

document.addEventListener("DOMContentLoaded", () => {
  initGraph(document.getElementById("app"), [
    { x: 100, y: 0 },
    { x: 100, y: 200 },
    { x: 150, y: 200 },
    { x: 150, y: 50 },
    { x: 180, y: 80 },
    { x: 200, y: 150 },
    { x: 230, y: 0 },
  ])
})