import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export interface Privilege {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
}

interface PrivilegeResponse {
  results: Array<Privilege>;
  links?: Array<{ rel: string; uri: string }>;
}

// OpenMRS returns at most 100 results per request, so keep asking for the next page
async function fetchAllPrivileges(): Promise<Array<Privilege>> {
  const all: Array<Privilege> = [];
  let hasMore = true;

  while (hasMore) {
    const url = `${restBaseUrl}/privilege?v=default&limit=100&startIndex=${all.length}`;
    const { data } = await openmrsFetch<PrivilegeResponse>(url);
    all.push(...data.results);
    hasMore = Boolean(data.links?.some((link) => link.rel === 'next')) && data.results.length > 0;
  }

  return all;
}

export function usePrivileges() {
  const { data, error, isLoading, mutate } = useSWR('all-privileges', fetchAllPrivileges);
  return { privileges: data ?? [], error, isLoading, mutate };
}
