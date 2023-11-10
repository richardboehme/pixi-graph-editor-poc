import * as PIXI from 'pixi.js';
const pointSize = 8;
const init_y = 400;
const lineStyle = { width: 3, color: 0xec660c, alpha: 1 };

let currentDragPoint = null;
let lastDragPoint = null;

const pointGraphics = [];


const initGraph = (root, points) => {
  for(let i = 0; i < points.length; i += 1) {
    points[i].y = init_y - points[i].y;
  }

  const app = new PIXI.Application({
      background: '#f5f5f5',
      resizeTo: root,
      antialias: true,
  });
  app.stage.eventMode = 'static';

  const onDragEnd = () => {
    if(currentDragPoint) {
      lastDragPoint = currentDragPoint;
      currentDragPoint = null;
      app.stage.off('pointermove', onDragMove);
      updateOutput();
    }
  }

  const updateStatus = (currentPoint) => {
    const statusElement = document.getElementById("status");
    statusElement.textContent = `Currently focused point: ${currentPoint.x} | ${init_y - currentPoint.y}`;
  }

  const updateOutput = () => {
    const element = document.getElementById("output");
    const convertedPoints = points.map(({x, y}) => ({ x, y: init_y - y }));
    element.value = JSON.stringify(convertedPoints);
  }

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

      updateStatus(currentPoint);
    }
  }

  const renderPoint = (x, y, i, line) => {
    const point = new PIXI.Graphics();
    point.moveTo(x - pointSize / 2, y - pointSize / 2)
    point.beginFill(0xec660c);
    point.drawRect(x - pointSize / 2, y - pointSize / 2, pointSize, pointSize);
    point.cursor = 'pointer';

    point.eventMode = 'static';
    point.zIndex = 10;

    app.stage.addChild(point);

    const pointGraphic = { point, incoming: line, outgoing: undefined, index: i }
    pointGraphics.splice(i, 0, pointGraphic)
    point.on('pointerdown', () => {
      if(lastDragPoint) {
        const { point: formerPoint } = lastDragPoint;
        formerPoint.tint = 0xFFFFFF;
      }

      currentDragPoint = pointGraphic;
      point.tint = 0xBC5109;
      updateStatus({ x, y });
      app.stage.on('pointermove', onDragMove)
    })
  }

  const drawLine = (graphics, i, source_x, source_y, dest_x, dest_y) => {
    graphics.lineStyle(lineStyle);
    graphics.moveTo(source_x, source_y);
    graphics.lineTo(dest_x, dest_y);
    graphics.zIndex = 0;
    graphics.eventMode = "static";
    // PIXI does not support hit testing on lines which is really not so nice
    graphics.hitArea = {
      contains: (x, y) => {
        const points = graphics.geometry.points
        const od = []
        const even = []

        for (let index = 0; index * 2 < points.length; index++) {
          const x = points[index * 2]
          const y = points[index * 2 + 1]
          const z = points[index * 2 + 2]
          if (index % 2 === 0) {
            od.push({ x, y, z })
          } else {
            even.push({ x, y, z })
          }
        }
        return new PIXI.Polygon([...od, ...even.reverse()]).contains(x, y)
      }
    }

    graphics.on("click", (event) => {
      // add point
      const global = event.global;
      const newPoint = { ...global };
      points.splice(i, 0, newPoint);

      const previousPoint = points[i - 1];
      graphics.clear();
      graphics.lineStyle(lineStyle);
      graphics.moveTo(previousPoint.x, previousPoint.y);
      graphics.lineTo(newPoint.x, newPoint.y);

      renderPoint(newPoint.x, newPoint.y, i, graphics);

      for(let j = i + 1; j < pointGraphics.length; j++) {
        pointGraphics[j].index += 1;
      }

      const nextPoint = points[i + 1];
      const newLine = new PIXI.Graphics();
      drawLine(newLine, i + 1, newPoint.x, newPoint.y, nextPoint.x, nextPoint.y);
      app.stage.addChild(newLine);

      const newPointGraphics = pointGraphics[i];
      newPointGraphics.outgoing = newLine;

      const nextPointGraphics = pointGraphics[i + 1];
      if(nextPointGraphics) {
        nextPointGraphics.incoming = newLine;
      }
    });

    updateOutput();

    return graphics;
  }

  app.stage.sortableChildren = true;
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)

  let prev_x = 0;
  let prev_y = init_y;
  for(let i = 0; i < points.length; i += 1) {
    const { x, y } = points[i];
    const line = new PIXI.Graphics();
    drawLine(line, i, prev_x, prev_y, x, y);

    prev_x = x;
    prev_y = y;
    app.stage.addChild(line);

    renderPoint(x, y, i, line);

    const lastPoint = pointGraphics[i - 1];
    if(lastPoint) {
      lastPoint.outgoing = line;
    }
  }

  root.appendChild(app.view);
  return app;
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const data = JSON.parse(input.value);
  let currentGraph = initGraph(document.getElementById("app"), data)

  document.getElementById("update").addEventListener("click", () => {
    const data = JSON.parse(input.value);
    currentGraph.destroy(true);
    currentGraph = initGraph(document.getElementById("app"), data)
  })
})