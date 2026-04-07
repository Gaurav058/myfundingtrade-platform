import { SetMetadata } from '@nestjs/common';
import { GEO_CHECK_KEY } from '../guards/geo-restriction.guard';

/**
 * Mark a controller or route handler as geo-restricted.
 * Requests from blocked countries will receive a 403 response.
 */
export const GeoRestricted = () => SetMetadata(GEO_CHECK_KEY, true);
