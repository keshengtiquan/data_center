import { LogService } from 'src/log/log.service';
import { PublicApiService } from '../public-api/public-api.service';

export const taskProviders = [
  {
    provide: 'LogService',
    useClass: LogService,
  },
  {
    provide: 'PublicApiService',
    useClass: PublicApiService,
  }
];
