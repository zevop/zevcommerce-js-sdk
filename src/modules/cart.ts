import { ZevClient } from '../client';
import { Cart, CartItemInput } from '../types';

export class CartClient {
    constructor(private client: ZevClient) { }

    /**
     * Fetch an existing cart.
     */
    public async get(cartId: string, cartAccessToken: string) {
        const query = `
      query Cart($cartId: String!, $cartAccessToken: String!) {
        cart(cartId: $cartId, cartAccessToken: $cartAccessToken) {
          id
          accessToken
          currency
          status
          totalItems
          subtotal
          lines {
            variantId
            productTitle
            variantTitle
            quantity
            unitPrice
            lineTotal
            availableQuantity
          }
        }
      }
    `;

        const response = await this.client.request<{ cart: Cart }>(query, { cartId, cartAccessToken });
        return response.cart;
    }

    /**
     * Create a new empty cart.
     */
    public async create(input?: any) {
        const query = `
      mutation CartCreate($input: HeadlessCartCreateInput) {
        cartCreate(input: $input) {
          id
          accessToken
          currency
          status
          totalItems
          subtotal
          lines {
            variantId
            productTitle
            variantTitle
            quantity
            unitPrice
            lineTotal
            availableQuantity
          }
        }
      }
    `;

        const response = await this.client.request<{ cartCreate: Cart }>(query, { input });
        return response.cartCreate;
    }

    /**
     * Add lines to an existing cart.
     */
    public async addLines(cartId: string, cartAccessToken: string, lines: CartItemInput[]) {
        const query = `
      mutation CartLinesAdd($cartId: String!, $cartAccessToken: String!, $lines: [HeadlessCartItemInput!]!) {
        cartLinesAdd(cartId: $cartId, cartAccessToken: $cartAccessToken, lines: $lines) {
          id
          accessToken
          currency
          status
          totalItems
          subtotal
          lines {
            variantId
            productTitle
            variantTitle
            quantity
            unitPrice
            lineTotal
            availableQuantity
          }
        }
      }
    `;

        const response = await this.client.request<{ cartLinesAdd: Cart }>(query, { cartId, cartAccessToken, lines });
        return response.cartLinesAdd;
    }

    /**
     * Update lines in an existing cart.
     */
    public async updateLines(cartId: string, cartAccessToken: string, lines: CartItemInput[]) {
        const query = `
      mutation CartLinesUpdate($cartId: String!, $cartAccessToken: String!, $lines: [HeadlessCartItemInput!]!) {
        cartLinesUpdate(cartId: $cartId, cartAccessToken: $cartAccessToken, lines: $lines) {
          id
          accessToken
          currency
          status
          totalItems
          subtotal
          lines {
            variantId
            productTitle
            variantTitle
            quantity
            unitPrice
            lineTotal
            availableQuantity
          }
        }
      }
    `;

        const response = await this.client.request<{ cartLinesUpdate: Cart }>(query, { cartId, cartAccessToken, lines });
        return response.cartLinesUpdate;
    }
}
