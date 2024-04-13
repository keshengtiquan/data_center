import { LogService } from 'src/log/log.service';

export const taskProviders = [
  {
    provide: 'LogService',
    useClass: LogService,
  },
];
