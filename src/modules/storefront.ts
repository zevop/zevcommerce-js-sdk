import { ZevClient } from '../client';

export interface StorefrontConfig {
    id: string;
    name: string;
    handle: string;
    currency: string;
    seoTitle: string | null;
    seoDescription: string | null;
    storeLogo: string | null;
    passwordEnabled: boolean;
    accountConfigJson: any;
    socialLinksJson: any;
}

export interface PaymentMethod {
    provider: string;
    publicKey: string | null;
    paymentMethodsJson: any;
    additionalDetails: string | null;
    paymentInstructions: string | null;
}

export interface ShippingRate {
    id: string;
    name: string;
    price: number;
    estimatedDays: number | null;
    zoneName?: string;
}

export interface ShippingZone {
    id: string;
    name: string;
    isDefault: boolean;
    locationsJson: any;
    rates: ShippingRate[];
}

export interface Menu {
    id: string;
    title: string;
    handle: string;
    itemsJson: any;
    isDefault: boolean;
}

export class StorefrontClient {
    constructor(private client: ZevClient) { }

    public async getConfig() {
        const query = `
      query StorefrontConfig {
        storefrontConfig {
          id
          name
          handle
          currency
          seoTitle
          seoDescription
          storeLogo
          passwordEnabled
          accountConfigJson
          socialLinksJson
        }
      }
    `;
        const response = await this.client.request<{ storefrontConfig: StorefrontConfig }>(query);
        return response.storefrontConfig;
    }

    public async getPaymentMethods() {
        const query = `
      query PaymentMethods {
        paymentMethods {
          provider
          publicKey
          paymentMethodsJson
          additionalDetails
          paymentInstructions
        }
      }
    `;
        const response = await this.client.request<{ paymentMethods: PaymentMethod[] }>(query);
        return response.paymentMethods;
    }

    public async getShippingZones() {
        const query = `
      query ShippingZones {
        shippingZones {
          id
          name
          isDefault
          locationsJson
          rates {
            id
            name
            price
            estimatedDays
          }
        }
      }
    `;
        const response = await this.client.request<{ shippingZones: ShippingZone[] }>(query);
        return response.shippingZones;
    }

    public async getShippingRates(country: string, state: string, city: string, total: number) {
        const query = `
      query ShippingRates($country: String!, $state: String!, $city: String!, $total: Float!) {
        shippingRates(country: $country, state: $state, city: $city, total: $total) {
          id
          name
          price
          zoneName
        }
      }
    `;
        const response = await this.client.request<{ shippingRates: ShippingRate[] }>(query, { country, state, city, total });
        return response.shippingRates;
    }

    public async getCities(countryCode: string, stateCode: string) {
        const query = `
      query Cities($countryCode: String!, $stateCode: String!) {
        cities(countryCode: $countryCode, stateCode: $stateCode)
      }
    `;
        const response = await this.client.request<{ cities: string[] }>(query, { countryCode, stateCode });
        return response.cities;
    }

    public async getMenu(handle?: string) {
        const query = `
      query GetMenu($handle: String) {
        menu(handle: $handle) {
          id
          title
          handle
          itemsJson
          isDefault
        }
      }
    `;
        const response = await this.client.request<{ menu: Menu }>(query, { handle });
        return response.menu;
    }
}
