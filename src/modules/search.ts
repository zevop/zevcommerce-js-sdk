import { ZevClient } from '../client';

export interface SearchResults {
    products: { id: string; title: string; slug: string }[];
    collections: { id: string; title: string; slug: string; productCount: number }[];
    pages: { id: string; title: string; slug: string }[];
    articles: { id: string; title: string; slug: string }[];
}

export class SearchClient {
    constructor(private client: ZevClient) { }

    public async query(term: string, limit?: number) {
        const query = `
      query Search($term: String!, $limit: Int) {
        search(term: $term, limit: $limit) {
          products {
            id
            title
            slug
          }
          collections {
            id
            title
            slug
            productCount
          }
          pages {
            id
            title
            slug
          }
          articles {
            id
            title
            slug
          }
        }
      }
    `;

        const response = await this.client.request<{ search: SearchResults }>(query, { term, limit });
        return response.search;
    }
}
