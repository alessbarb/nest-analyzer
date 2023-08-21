# NestJS Dependency Analyzer

The "NestJS Dependency Analyzer" is a tool designed to analyze NestJS projects and generate a visual representation of the dependencies between modules, services, controllers, and other components within the project.

## Features

- Dependency analysis between modules, services, and controllers.
- Generation of visual charts in DOT format.
- Analysis of imports and method dependencies.
- Identification and visualization of WebSocket Gateways.
- Visual representation of routes and decorators.

## Usage

1. Clone this repository.
2. Install dependencies with `npm install`.
3. Run the analyzer on your NestJS project using:

```bash
nest-analyzer --path src
```

4. The output will be a graph in DOT format which you can visualize using tools like Graphviz.

## Requirements

- Node.js
- A NestJS project to analyze.

## Contributions

Contributions are welcome. If you encounter any issues or have a feature you'd like to add, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT license.
