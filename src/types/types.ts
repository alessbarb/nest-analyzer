interface NodeInfo {
  name: string;
  type: 'module' | 'controller' | 'service' | 'gateway' | 'other';
  dependencies: string[]; // Direct dependencies from constructor or method parameters
  imports?: string[]; // For Modules: imported modules
  providers?: string[]; // For Modules: provided services or providers
  injectedDependencies?: {
    // Using @Inject decorator
    property: string;
    dependency: string;
  }[];
  interceptors?: string[]; // Using @UseInterceptors decorator
  guards?: string[]; // Using @UseGuards decorator
  routes?: RouteInfo[]; // Route decorators like @Get, @Post, etc.
  websockets?: MessageInfo[]; // WebSocket related info
  isGateway?: boolean; // True if class has @WebSocketGateway decorator
  models: string[]; // Model dependencies
  classDecorators?: string[]; // Added this line for class decorators
  // ... any other relevant fields can be added here
}

interface RouteInfo {
  type:
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH';
  path: string;
}

interface MessageInfo {
  event: string;
  handler: string;
}

type RouteDecoratorType =
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'PATCH';

const decoratorToTypeMap: {[key: string]: RouteDecoratorType} = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Delete: 'DELETE',
  Connect: 'CONNECT',
  Options: 'OPTIONS',
  Trace: 'TRACE',
  Patch: 'PATCH',
};

export {NodeInfo, RouteInfo, MessageInfo, decoratorToTypeMap};
