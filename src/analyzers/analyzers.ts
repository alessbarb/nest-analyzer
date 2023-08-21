/** @format */

import {
  ClassDeclaration,
  ObjectLiteralExpression,
  ArrayLiteralExpression,
  PropertyAssignment,
  Expression,
  SourceFile,
  PropertyAccessExpression,
  SyntaxKind,
} from 'ts-morph';
import {RouteInfo, decoratorToTypeMap} from '../types/types';

function analyzeModuleDecorators(cls: ClassDeclaration) {
  const decorator = cls.getDecorator('Module');
  if (!decorator) return {imports: [], providers: []};

  const argument = decorator.getArguments()[0];
  if (!argument || !ObjectLiteralExpression.isObjectLiteralExpression(argument))
    return {imports: [], providers: []};

  let imports: string[] = [];
  let providers: string[] = [];

  const objLiteral = argument as ObjectLiteralExpression;

  const importsProperty = objLiteral.getProperty(
    'imports'
  ) as PropertyAssignment;
  if (
    importsProperty &&
    importsProperty.getInitializer() &&
    ArrayLiteralExpression.isArrayLiteralExpression(
      importsProperty.getInitializer()
    )
  ) {
    imports = (importsProperty.getInitializer() as ArrayLiteralExpression)
      .getElements()
      .map((e: Expression) => e.getText());
  }

  const providersProperty = objLiteral.getProperty(
    'providers'
  ) as PropertyAssignment;
  if (
    providersProperty &&
    providersProperty.getInitializer() &&
    ArrayLiteralExpression.isArrayLiteralExpression(
      providersProperty.getInitializer()
    )
  ) {
    providers = (providersProperty.getInitializer() as ArrayLiteralExpression)
      .getElements()
      .map((e: Expression) => e.getText());
  }

  return {imports, providers};
}

function analyzeClassDecorators(cls: ClassDeclaration) {
  const decorators = cls.getDecorators();
  const classDecorators: string[] = [];
  for (const decorator of decorators) {
    classDecorators.push(decorator.getName());
  }
  return classDecorators;
}

function analyzeClassDependencies(cls: ClassDeclaration) {
  const constructor = cls.getConstructors()[0];
  const dependencies: string[] = [];

  if (constructor) {
    for (const param of constructor.getParameters()) {
      const type = param.getType().getText();
      if (
        type &&
        !['string', 'number', 'boolean', 'Date', 'Array', 'Object'].includes(
          type
        )
      ) {
        dependencies.push(type);
      }
    }
  }

  return dependencies;
}

function analyzeInjectDecorator(cls: ClassDeclaration) {
  const properties = cls.getProperties();
  const injectedDependencies: {property: string; dependency: string}[] = [];
  for (const prop of properties) {
    const injectDecorator = prop.getDecorator('Inject');
    if (injectDecorator) {
      injectedDependencies.push({
        property: prop.getName(),
        dependency: injectDecorator
          .getArguments()
          .map(arg => arg.getText())
          .join(', '),
      });
    }
  }
  return injectedDependencies;
}

function analyzeInterceptorsAndGuards(cls: ClassDeclaration) {
  const decorators = cls.getDecorators();
  const interceptors = [];
  const guards = [];
  for (const decorator of decorators) {
    if (decorator.getName() === 'UseInterceptors') {
      interceptors.push(...decorator.getArguments().map(arg => arg.getText()));
    }
    if (decorator.getName() === 'UseGuards') {
      guards.push(...decorator.getArguments().map(arg => arg.getText()));
    }
  }
  return {interceptors, guards};
}

function analyzeRouteDecorators(cls: ClassDeclaration) {
  const methods = cls.getMethods();
  const routes: RouteInfo[] = [];
  for (const method of methods) {
    const decorators = method.getDecorators();
    for (const decorator of decorators) {
      const name = decorator.getName();
      const type = decoratorToTypeMap[name];
      if (type) {
        routes.push({
          type: type,
          path: decorator
            .getArguments()
            .map(arg => arg.getText())
            .join(', '),
        });
      }
    }
  }
  return routes;
}

function analyzeWebSockets(cls: ClassDeclaration) {
  const gatewayDecorator = cls.getDecorator('WebSocketGateway');
  const methods = cls.getMethods();
  const messages: {handler: string; event: string}[] = [];
  for (const method of methods) {
    const messageDecorator = method.getDecorator('SubscribeMessage');
    if (messageDecorator) {
      messages.push({
        handler: method.getName(),
        event: messageDecorator
          .getArguments()
          .map(arg => arg.getText())
          .join(', '),
      });
    }
  }
  return {isGateway: !!gatewayDecorator, messages};
}

function determineType(
  cls: ClassDeclaration
): 'module' | 'controller' | 'service' | 'gateway' | 'other' {
  const decorators = cls.getDecorators().map(decorator => decorator.getName());

  if (decorators.includes('Module')) {
    return 'module';
  } else if (decorators.includes('Controller')) {
    return 'controller';
  } else if (decorators.includes('Injectable')) {
    return 'service';
  } else if (decorators.includes('WebSocketGateway')) {
    return 'gateway';
  } else {
    return 'other';
  }
}

function analyzeModelDependency(cls: ClassDeclaration) {
  const decorators = cls.getDecorators();
  const models: string[] = [];
  for (const decorator of decorators) {
    if (decorator.getName() === 'Model') {
      models.push(...decorator.getArguments().map(arg => arg.getText()));
    }
  }
  return models;
}

function analyzeImports(sourceFile: SourceFile): string[] {
  const imports: string[] = [];
  const importDeclarations = sourceFile.getImportDeclarations();
  for (const importDeclaration of importDeclarations) {
    const namedImports = importDeclaration.getNamedImports();
    imports.push(...namedImports.map(ni => ni.getName()));
  }
  return imports;
}

function analyzeMethodDependencies(cls: ClassDeclaration): string[] {
  const dependencies: string[] = [];
  const callExpressions = cls.getDescendantsOfKind(SyntaxKind.CallExpression);
  for (const callExpression of callExpressions) {
    const expression = callExpression.getExpression();
    if (PropertyAccessExpression.isPropertyAccessExpression(expression)) {
      const name = expression.getName();
      dependencies.push(name);
    }
  }
  return dependencies;
}

export {
  determineType,
  analyzeClassDecorators,
  analyzeClassDependencies,
  analyzeInjectDecorator,
  analyzeInterceptorsAndGuards,
  analyzeModuleDecorators,
  analyzeRouteDecorators,
  analyzeWebSockets,
  analyzeModelDependency,
  analyzeImports,
  analyzeMethodDependencies,
};
