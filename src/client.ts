import { ProductsClient } from './modules/products';
import { CartClient } from './modules/cart';
import { CollectionsClient } from './modules/collections';
import { StorefrontClient } from './modules/storefront';
import { ContentClient } from './modules/content';
import { SearchClient } from './modules/search';
import { CheckoutClient } from './modules/checkout';
import { AuthClient } from './modules/auth';
import { CustomerClient } from './modules/customer';
import { AnalyticsClient } from './modules/analytics';

export interface ZevClientOptions {
    /**
     * The GraphQL endpoint URL.
     * Example: https://api-headless.zevcommerce.com/graphql/v1
     */
    endpoint: string;

    /**
     * The public key for storefront access. Required unless privateKey is provided.
     */
    publicKey?: string;

    /**
     * The private key for server-side access.
     */
    privateKey?: string;

    /**
     * Optional custom origin for browser-like requests if the framework doesn't automatically send it.
     */
    origin?: string;

    /**
     * The customer token to use for authenticated requests (e.g. fetching customer profile or orders).
     */
    customerToken?: string;
}

export class ZevClient {
    private options: ZevClientOptions;

    public products: ProductsClient;
    public collections: CollectionsClient;
    public cart: CartClient;
    public storefront: StorefrontClient;
    public content: ContentClient;
    public search: SearchClient;
    public checkout: CheckoutClient;
    public auth: AuthClient;
    public customer: CustomerClient;
    public analytics: AnalyticsClient;

    constructor(options: ZevClientOptions) {
        if (!options.endpoint) {
            throw new Error('ZevCommerce SDK Error: endpoint is required');
        }
        if (!options.publicKey && !options.privateKey) {
            throw new Error('ZevCommerce SDK Error: publicKey or privateKey is required');
        }
        this.options = options;

        this.products = new ProductsClient(this);
        this.collections = new CollectionsClient(this);
        this.cart = new CartClient(this);
        this.storefront = new StorefrontClient(this);
        this.content = new ContentClient(this);
        this.search = new SearchClient(this);
        this.checkout = new CheckoutClient(this);
        this.auth = new AuthClient(this);
        this.customer = new CustomerClient(this);
        this.analytics = new AnalyticsClient(this);
    }

    /**
     * Updates the client configuration options at runtime.
     */
    public updateOptions(options: Partial<ZevClientOptions>) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Returns the configured GraphQL endpoint URL.
     */
    public getEndpoint(): string {
        return this.options.endpoint;
    }

    /**
     * Returns the configured public key, if any.
     */
    public getPublicKey(): string | undefined {
        return this.options.publicKey;
    }

    /**
     * Generic request method to execute GraphQL queries natively using fetch.
     */
    public async request<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (this.options.publicKey) {
            headers['x-headless-public-key'] = this.options.publicKey;
            // Also attach as Bearer for broader compatibility if needed, though custom header is preferred.
        } else if (this.options.privateKey) {
            headers['x-headless-private-key'] = this.options.privateKey;
        }

        if (this.options.customerToken) {
            headers['x-customer-access-token'] = this.options.customerToken;
        }

        if (this.options.origin) {
            headers['Origin'] = this.options.origin;
        }

        try {
            const response = await fetch(this.options.endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query, variables }),
            });

            const responseBody = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    `ZevCommerce SDK Error: Network Error ${response.status} ${response.statusText}`,
                    { cause: responseBody }
                );
            }

            if (responseBody?.errors) {
                const message = responseBody.errors.map((e: any) => e.message).join(', ');
                throw new Error(`ZevCommerce SDK Error: GraphQL Error: ${message}`, { cause: responseBody.errors });
            }

            return responseBody.data as T;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('ZevCommerce SDK Error: An unknown error occurred during the request', { cause: error });
        }
    }
}
