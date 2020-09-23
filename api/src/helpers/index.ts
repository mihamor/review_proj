import fetch from 'node-fetch';

import config from '../config';

export const requestServiceAccountWatch  = (accountId: string) => (
  fetch(`${config.serviceUrl}/watch-account`, {
    method: 'POST',
    headers: {
      ...(config.reviewsSecret ? { 'reviews-secret': config.reviewsSecret } : {}),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountId }),
  })
);
