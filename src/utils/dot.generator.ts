/** @format */

import {NodeInfo} from '../types/types';
import {cleanDotOutput, determineShape} from './helper.functions';

function generateDotRepresentation(nodes: NodeInfo[]): string {
  let dotRepresentation = 'digraph G {\n';

  for (const node of nodes) {
    // Representar el nodo
    dotRepresentation += `"${node.name}" [shape=${determineShape(
      node.type
    )}];\n`;

    // Representar dependencias
    for (const dep of node.dependencies) {
      dotRepresentation += `"${node.name.trim()}" -> "${dep.trim()}";\n`;
    }

    // Representar dependencias de Model
    for (const model of node.models) {
      dotRepresentation += `"${node.name.trim()}" -> "${model.trim()}";\n`;
    }
    // ... Puedes continuar con rutas, mensajes, etc., si quieres representarlos de alguna manera especial en el gráfico.
  }

  dotRepresentation += '}';
  const cleanedOutput = cleanDotOutput(dotRepresentation);

  return cleanedOutput;
}

export {generateDotRepresentation};
