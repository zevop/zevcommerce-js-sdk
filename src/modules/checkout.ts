import { ZevClient } from '../client';
import { Order, HeadlessCheckoutInput } from '../types';

export interface CheckoutVerification {
    success: boolean;
    orderId: string;
    message: string;
}

export class CheckoutClient {
    constructor(private client: ZevClient) { }

    /**
     * Finalize an existing cart into an order.
     */
    public async cartCheckout(input: { cartId: string; cartAccessToken: string; email: string; shippingAddress?: any; billingAddress?: any; paymentMethodId?: string; channel?: string }) {
        const query = `
      mutation CartCheckout($input: HeadlessCartCheckoutInput!) {
        cartCheckout(input: $input) {
          orderId
          orderNumber
          totalAmount
          currency
          status
          paymentStatus
          paymentProvider
          paymentPublicKey
          orderAccessToken
        }
      }
    `;

        const response = await this.client.request<{ cartCheckout: any }>(query, { input });
        return response.cartCheckout;
    }

    /**
     * Create a direct checkout order bypassing the cart.
     */
    public async create(input: HeadlessCheckoutInput) {
        const query = `
      mutation CheckoutCreate($input: HeadlessCheckoutInput!) {
        checkoutCreate(input: $input) {
          orderId
          orderNumber
          totalAmount
          currency
          status
          paymentStatus
          paymentProvider
          paymentPublicKey
          orderAccessToken
        }
      }
    `;

        const response = await this.client.request<{ checkoutCreate: any }>(query, { input });
        return response.checkoutCreate;
    }

    /**
     * Verify an external payment provider transaction.
     */
    public async verifyPayment(orderId: string, orderAccessToken: string, reference: string) {
        const query = `
      mutation CheckoutVerify($orderId: String!, $orderAccessToken: String!, $reference: String!) {
        checkoutVerifyPayment(orderId: $orderId, orderAccessToken: $orderAccessToken, reference: $reference) {
          success
          orderId
          message
        }
      }
    `;

        const response = await this.client.request<{ checkoutVerifyPayment: CheckoutVerification }>(query, { orderId, orderAccessToken, reference });
        return response.checkoutVerifyPayment;
    }

    /**
     * Fetch an order securely via its ID and access token.
     */
    public async getOrder(id: string, orderAccessToken: string) {
        const query = `
      query Order($id: String!, $orderAccessToken: String!) {
        order(id: $id, orderAccessToken: $orderAccessToken) {
          id
          orderNumber
          totalAmount
          paymentStatus
          status
        }
      }
    `;

        const response = await this.client.request<{ order: Order }>(query, { id, orderAccessToken });
        return response.order;
    }
}
