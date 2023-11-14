# Proof of Concept: Pixi Graph Editor

This little demo web app implements a simple line graph editor using [PixiJS](https://pixijs.com/).

The application renders a list of points into a graph. The user can modify the coordinates of the points either by directly manipulating the x and y coordinates of the points in an input field or by dragging the point in the diagram.

Clicking on a line creates a new point that can be manipulated.

## Installation

Install NodeJS and npm. Afterwards, run

```
$ npm install && npm run dev
```

You should be able to visit the page at https://localhost:5173/pixi-graph-editor-poc. Maybe a different port has to be used. Have a look at the console output.
