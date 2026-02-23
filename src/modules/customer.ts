import { ZevClient } from '../client';
import { PaginationMeta } from '../types';

export interface CustomerProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
}

export interface CustomerAddress {
    id: string;
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    country: string;
    isDefault: boolean;
}

export class CustomerClient {
    constructor(private client: ZevClient) { }

    public async getProfile() {
        const query = `
      query Me {
        customerMe {
          id
          email
          firstName
          lastName
          phone
        }
      }
    `;
        const response = await this.client.request<{ customerMe: CustomerProfile }>(query);
        return response.customerMe;
    }

    public async updateProfile(firstName?: string, lastName?: string, phone?: string) {
        const query = `
      mutation UpdateProfile($firstName: String, $lastName: String, $phone: String) {
        customerUpdateProfile(firstName: $firstName, lastName: $lastName, phone: $phone) {
          id
          email
          firstName
          lastName
          phone
        }
      }
    `;
        const response = await this.client.request<{ customerUpdateProfile: CustomerProfile }>(query, { firstName, lastName, phone });
        return response.customerUpdateProfile;
    }

    public async getOrders(params?: { page?: number; limit?: number }) {
        const query = `
      query CustomerOrders($page: Int, $limit: Int) {
        customerOrders(page: $page, limit: $limit) {
          data {
            id
            orderNumber
            totalAmount
            status
            paymentStatus
            createdAt
            items {
              id
              quantity
              price
              productTitle
              variantTitle
            }
          }
          total
          page
          limit
          totalPages
        }
      }
    `;
        const response = await this.client.request<{ customerOrders: { data: any[]; total: number; page: number; limit: number; totalPages: number } }>(query, params);
        return response.customerOrders;
    }

    public async getAddresses() {
        const query = `
      query CustomerAddresses {
        customerAddresses {
          id
          firstName
          lastName
          address1
          city
          country
          isDefault
        }
      }
    `;
        const response = await this.client.request<{ customerAddresses: CustomerAddress[] }>(query);
        return response.customerAddresses;
    }

    public async addAddress(input: any) {
        const query = `
      mutation AddAddress($input: HeadlessCustomerAddressInput!) {
        customerAddAddress(input: $input) {
          id
          address1
          city
          country
          isDefault
        }
      }
    `;
        const response = await this.client.request<{ customerAddAddress: CustomerAddress }>(query, { input });
        return response.customerAddAddress;
    }

    public async updateAddress(addressId: string, input: any) {
        const query = `
      mutation UpdateAddress($addressId: String!, $input: HeadlessCustomerAddressUpdateInput!) {
        customerUpdateAddress(addressId: $addressId, input: $input) {
          id
          address1
          city
          country
          isDefault
        }
      }
    `;
        const response = await this.client.request<{ customerUpdateAddress: CustomerAddress }>(query, { addressId, input });
        return response.customerUpdateAddress;
    }

    public async deleteAddress(addressId: string) {
        const query = `
      mutation DeleteAddress($addressId: String!) {
        customerDeleteAddress(addressId: $addressId) {
          success
          message
        }
      }
    `;
        const response = await this.client.request<{ customerDeleteAddress: { success: boolean; message: string } }>(query, { addressId });
        return response.customerDeleteAddress;
    }

    public async changePassword(input: any) {
        const query = `
      mutation ChangePassword($input: HeadlessCustomerChangePasswordInput!) {
        customerChangePassword(input: $input) {
          success
          message
        }
      }
    `;
        const response = await this.client.request<{ customerChangePassword: { success: boolean; message: string } }>(query, { input });
        return response.customerChangePassword;
    }
}
