import { Message, HttpStatusCode } from '@rxtp/core';
import { IncomingMessage, ServerResponse } from 'http';

export class HttpRequestNode
  implements Message<IncomingMessage, ServerResponse>
{
  constructor(
    readonly request: IncomingMessage,
    readonly response: ServerResponse
  ) {}

  respond(
    data: unknown | undefined,
    statusCode: HttpStatusCode | undefined
  ): void {
    if (statusCode) {
      this.response.statusCode = statusCode;
    }
    if (data) {
      this.response.write(data);
    }
    this.response.end();
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
}
