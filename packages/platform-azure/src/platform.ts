import {
  ErrorHandler,
  Finalizer,
  Platform,
  PLATFORM_ID,
  PlatformID,
  Providers,
  Redirector,
  Route,
} from "@rxtp/core";
import { Message } from "./message.js";
import { AzureRedirector } from "./redirector.js";
import { AzureErrorHandler } from "./error.js";
import { AzureFinalizer } from "./finalizer.js";

const PLATFORM_AZURE_ID: PlatformID = "azure";

const PLATFORM_AZURE_PROVIDERS: Providers = [
  { provide: Redirector, useClass: AzureRedirector },
  { provide: Finalizer, useClass: AzureFinalizer },
  { provide: ErrorHandler, useClass: AzureErrorHandler },
  { provide: PLATFORM_ID, useValue: PLATFORM_AZURE_ID },
];

export function createAzureHandler(routes: Route[], providers: Providers = []) {
  const platformAzure = Platform.createPlatform([
    ...PLATFORM_AZURE_PROVIDERS,
    ...providers,
  ]);

  // keep a subscription alive for side-effects
  platformAzure.message$.subscribe();

  // Azure Functions handler: (context) => void|Promise<void>
  return (context: any) => {
    const azureMessage = Message.createAzureMessage(context);
    platformAzure.message.next(azureMessage);
  };
}
