/** @format */

import {Project} from 'ts-morph';
import * as Analyzer from './analyzers/analyzers';
import {generateDotRepresentation} from './utils/dot.generator';
import {NodeInfo} from './types/types';
import * as fs from 'fs/promises';
import path = require('path');

async function analyzeNestProject(filePath: string) {
  const project = new Project();

  const files = await getAllTsFiles(filePath);
  for (const file of files) {
    project.addSourceFileAtPath(file);
  }

  const nodes: NodeInfo[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    const classes = sourceFile.getClasses();

    for (const cls of classes) {
      const imports = Analyzer.analyzeImports(sourceFile);
      const methodDependencies = Analyzer.analyzeMethodDependencies(cls);
      const moduleInfo = Analyzer.analyzeModuleDecorators(cls);
      const classDecorators = Analyzer.analyzeClassDecorators(cls);
      const dependencies = Analyzer.analyzeClassDependencies(cls);
      const injectInfo = Analyzer.analyzeInjectDecorator(cls);
      const interceptorsAndGuards = Analyzer.analyzeInterceptorsAndGuards(cls);
      const routes = Analyzer.analyzeRouteDecorators(cls);
      const websockets = Analyzer.analyzeWebSockets(cls);
      const modelDependencies = Analyzer.analyzeModelDependency(cls) || [];

      const filteredDependencies = dependencies.filter(
        dep => !dep.includes('node_modules')
      );

      nodes.push({
        name: cls.getName()!,
        type: Analyzer.determineType(cls),
        dependencies: [
          ...filteredDependencies,
          ...imports,
          ...methodDependencies,
        ],
        imports: moduleInfo.imports,
        providers: moduleInfo.providers,
        injectedDependencies: injectInfo,
        interceptors: interceptorsAndGuards.interceptors,
        guards: interceptorsAndGuards.guards,
        routes: routes,
        websockets: websockets.messages,
        isGateway: websockets.isGateway,
        models: modelDependencies,
        classDecorators: classDecorators, // Added this line
        // ... You can continue expanding this based on what NodeInfo contains and what you want to capture.
      });
    }
  }

  return generateDotRepresentation(nodes);
}

async function getAllTsFiles(dir: string): Promise<string[]> {
  let files: string[] = [];
  const entries = await fs.readdir(dir, {withFileTypes: true});

  const promises: Promise<void>[] = entries.map(async entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(await getAllTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  });

  // Wait for all promises to resolve
  await Promise.all(promises);

  return files;
}

export {analyzeNestProject};
