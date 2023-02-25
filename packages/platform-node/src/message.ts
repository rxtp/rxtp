import { Message, HttpStatusCode } from '@rxtp/core';
import { IncomingMessage, ServerResponse } from 'http';

export class NodeMessage implements Message<IncomingMessage, ServerResponse> {
  constructor(
    readonly request: IncomingMessage,
    readonly response: ServerResponse
  ) {}

  respond(
    data?: unknown,
    statusCode?: HttpStatusCode,
    headers?: Record<string, string | string[]>
  ): void {
    if (!this.response.writableEnded) {
      if (statusCode) {
        this.statusCode = statusCode;
      }
      if (headers) {
        this.headers = headers;
      }
      if (data) {
        if (typeof data === 'object') {
          data = JSON.stringify(data);
          this.response.write(data);
        } else {
          this.response.write(data);
        }
      }
      this.response.end();
    }
  }

  get statusCode(): HttpStatusCode {
    return this.response.statusCode as HttpStatusCode;
  }

  set statusCode(statusCode: HttpStatusCode) {
    this.response.statusCode = statusCode;
  }

  get url(): URL {
    return new URL(this.request.url, 'http://localhost');
  }

  get headers(): Record<string, string | string[]> {
    return this.request.headers;
  }

  set headers(headers: Record<string, string | string[]>) {
    for (const [key, value] of Object.entries(headers)) {
      this.response.setHeader(key, value);
    }
  }
}
