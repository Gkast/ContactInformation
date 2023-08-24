import {MyHttpListener} from "./my-http";

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
}

class RouteNotFoundError extends Error {
    constructor(method: string, path: string) {
        super(`Route not found for method: ${method} and path: ${path}`);
        this.name = 'RouteNotFoundError';
    }
}

export class MyRouter {
    private readonly routes: Map<string, MyHttpListener>;

    constructor() {
        this.routes = new Map<string, MyHttpListener>();
    }

    private generateKey(method: HttpMethod, path: string): string {
        const dynamicPath = path.replace('*', '{wildcard}');
        return `${method.toLowerCase().trim()}:${dynamicPath.toLowerCase().trim()}`;
    }

    add(method: HttpMethod, path: string, handler: MyHttpListener): void {
        if (!Object.values(HttpMethod).includes(method)) {
            throw new Error(`Invalid HTTP method: ${method}`);
        }

        if (!path || typeof path !== 'string') {
            throw new Error(`Invalid path: ${path}`);
        }

        const key = this.generateKey(method, path);

        if (this.routes.has(key)) {
            throw new Error(`Route already exists for method: ${method} and path: ${path}`);
        }

        this.routes.set(key, handler);
    }

    find(method: HttpMethod, path: string): MyHttpListener {
        const key = this.generateKey(method, path);

        if (this.routes.has(key)) {
            return this.routes.get(key);
        }

        for (const [storedKey, value] of this.routes) {
            const [storedMethod, storedPath] = storedKey.split(':');

            if (
                storedMethod === method.toLowerCase().trim() &&
                storedPath.includes('{wildcard}') &&
                path.toLowerCase().startsWith(storedPath.replace('{wildcard}', ''))
            ) {
                return value;
            }
        }

        throw new RouteNotFoundError(method, path);
    }
}
