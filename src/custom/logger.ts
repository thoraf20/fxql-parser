/* eslint-disable prettier/prettier */
import { Injectable, Logger, LogLevel } from '@nestjs/common';

@Injectable()
export class CustomLogger extends Logger {
  log(message: string) {
    // Customize how logs are handled
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string, trace?: string) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: string) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }

  debug(message: string) {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
  }

  verbose(message: string) {
    console.log(`[VERBOSE] ${new Date().toISOString()} - ${message}`);
  }
}
