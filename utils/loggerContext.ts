// src/utils/loggerContext.ts
import { threadId } from 'worker_threads';

export interface LogContext {
  workerInfo: string;
  worldId: string;
}

// Map thread IDs to their active test context
// const contextRegistry = new Map<number, LogContext>();

// export const LogRegistry = {
//   register(context: LogContext) {
//     contextRegistry.set(threadId, context);
//   },
//   unregister() {
//     contextRegistry.delete(threadId);
//   },
//   get(): LogContext | undefined {
//     return contextRegistry.get(threadId);
//   },
//   getThreadID(): Number{
//     return threadId;
//   }
// };


let processGlobalContext: LogContext | undefined = undefined;

export const LogRegistry = {
  register(context: LogContext) {
    processGlobalContext = context;
  },
  unregister() {
    processGlobalContext = undefined;
  }
};
export const AppLogger = {
  log(message: string, metadata: Record<string, any> = {}) {
    // const ctx = LogRegistry.get();
    const logPayload = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      worker: processGlobalContext ? processGlobalContext.workerInfo.replace(/[\[\]]/g, '') : 'Single-Threaded',
      worldId: processGlobalContext ? processGlobalContext.worldId : 'Unknown',
      // threadId: LogRegistry.getThreadID(),
      ...metadata
    };
    console.log(JSON.stringify(logPayload));
  }
};