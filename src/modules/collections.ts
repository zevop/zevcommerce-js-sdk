import { ZevClient } from '../client';
import { PaginationMeta } from '../types';

export interface Collection {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    productCount: number;
}

export class CollectionsClient {
    constructor(private client: ZevClient) { }

    /**
     * Fetch all collections.
     */
    public async list() {
        const query = `
      query Collections {
        collections {
          id
          title
          slug
          description
          productCount
        }
      }
    `;

        const response = await this.client.request<{ collections: Collection[] }>(query);
        return response.collections;
    }

    /**
     * Fetch a single collection by slug.
     */
    public async getBySlug(slug: string) {
        const query = `
      query Collection($slug: String!) {
        collection(slug: $slug) {
          id
          title
          slug
          productCount
        }
      }
    `;

        const response = await this.client.request<{ collection: Collection }>(query, { slug });
        return response.collection;
    }
}
