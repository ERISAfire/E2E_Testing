import 'module-alias/register';
import { fileURLToPath } from 'url';

const baseDir = fileURLToPath(new URL('.', import.meta.url));

declare module '@config/*' {
  export * from '../config/*';
}

declare module '@core/*' {
  export * from '../core/*';
}

declare module '@api/*' {
  export * from '../api/*';
}

declare module '@ui/*' {
  export * from '../ui/*';
}

declare module '@factories/*' {
  export * from '../factories/*';
}
