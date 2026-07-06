export interface CardPromotion {
    type: string;
    name: string;
    description: string;
    multipleConditions: boolean;
    conditions: { [key: string]: any }[];
    multiProperty: boolean;
    propertyToDiscount: string[];
}