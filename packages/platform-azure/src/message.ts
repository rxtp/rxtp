import {
  Message as CoreMessage,
  HttpStatusCode,
  Params,
  HttpMethod,
} from "@rxtp/core";

export class Message implements CoreMessage<any, any> {
  private _params: Params = {};
  private _body: unknown;

  constructor(readonly context: any) {}

  static createAzureMessage(context: any): Message {
    return new Message(context);
  }

  get request(): any {
    return this.context.req;
  }

  get response(): any {
    return this.context.res ?? (this.context as any).response ?? {};
  }

  get statusCode(): HttpStatusCode {
    return (this.context.res?.status ??
      this.context.res?.statusCode) as HttpStatusCode;
  }

  set statusCode(statusCode: HttpStatusCode) {
    if (this.context.res) this.context.res.status = statusCode;
    if (this.context.res) this.context.res.statusCode = statusCode;
  }

  get url(): URL {
    const rawUrl = this.request?.url || this.request?.originalUrl || "/";
    return new URL(rawUrl, "http://localhost");
  }

  get headers(): Record<string, string | string[]> {
    return this.request?.headers ?? {};
  }

  set headers(headers: Record<string, string | string[]>) {
    if (!this.context.res) return;
    for (const [key, value] of Object.entries(headers)) {
      this.context.res.headers = this.context.res.headers || {};
      this.context.res.headers[key] = value as any;
    }
  }

  get method(): HttpMethod {
    return (this.request?.method as HttpMethod) ?? HttpMethod.Get;
  }

  set method(method: HttpMethod) {
    if (this.request) this.request.method = method;
  }

  get params(): Params {
    return this._params;
  }

  set params(params: Params) {
    this._params = params;
  }

  get body(): unknown {
    return this._body ?? this.request?.body ?? this.request?.rawBody;
  }

  set body(body: unknown) {
    this._body = body;
  }

  respond(
    data?: unknown,
    statusCode?: HttpStatusCode,
    headers?: Record<string, string | string[]>,
  ): void {
    const res = this.context.res || (this.context as any).response || {};
    if (statusCode) this.statusCode = statusCode;
    if (headers) this.headers = headers;

    if (data === undefined) {
      // if Azure, ensure response exists
      if (this.context.res)
        this.context.res.body = this.context.res.body ?? undefined;
      return;
    }

    if (typeof data === "string") {
      if (this.context.res) {
        this.context.res.headers = this.context.res.headers || {};
        this.context.res.headers["Content-Type"] = "text/plain";
        this.context.res.body = data;
      }
      return;
    }

    if (typeof data === "object") {
      if (this.context.res) {
        this.context.res.headers = this.context.res.headers || {};
        this.context.res.headers["Content-Type"] = "application/json";
        this.context.res.body = JSON.stringify(data);
      }
      return;
    }

    if (
      data instanceof Uint8Array ||
      (typeof Buffer !== "undefined" && data instanceof Buffer)
    ) {
      if (this.context.res) {
        this.context.res.isRaw = true;
        this.context.res.body = data;
      }
      return;
    }
  }
}
