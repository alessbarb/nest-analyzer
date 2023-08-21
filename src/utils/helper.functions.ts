/** @format */

import {ClassDeclaration} from 'ts-morph';

function determineType(
  cls: ClassDeclaration
): 'module' | 'controller' | 'service' | 'gateway' | 'other' {
  if (cls.getDecorator('Module')) return 'module';
  if (cls.getDecorator('Controller')) return 'controller';
  if (cls.getDecorator('Injectable')) return 'service';
  if (cls.getDecorator('WebSocketGateway')) return 'gateway';
  return 'other';
}

function determineShape(type: string): string {
  switch (type) {
    case 'module':
      return 'box';
    case 'controller':
      return 'ellipse';
    case 'service':
      return 'diamond';
    case 'gateway':
      return 'hexagon';
    default:
      return 'parallelogram';
  }
}

function cleanDotOutput(dotOutput: string): string {
  // Remove module path and keep only the class or function name
  dotOutput = dotOutput.replace(/.*\.(.*)/g, '$1');

  // Remove generic types
  dotOutput = dotOutput.replace(/Model<.*>/g, 'Model');

  // Ensure node names and relationships are correctly encapsulated with quotes
  const lines = dotOutput.split('\n');
  const cleanedLines = [];
  for (const line of lines) {
    if (line.includes('->')) {
      const parts = line.split('->');
      // Ensure that both parts are encapsulated with quotes and remove unwanted characters
      const cleanedLine = `"${parts[0]
        .trim()
        .replace(/"+/g, '')}" -> "${parts[1]
        .trim()
        .replace(/"+/g, '')
        .replace(';', '')}";`;
      cleanedLines.push(cleanedLine);
    } else if (
      line.includes('[shape=') ||
      line.startsWith('digraph G {') ||
      line === '}'
    ) {
      cleanedLines.push(line.replace(/"+/g, '"'));
    }
  }

  return cleanedLines.join('\n');
}

export {determineType, determineShape, cleanDotOutput};
