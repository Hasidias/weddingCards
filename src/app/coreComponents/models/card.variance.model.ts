import { cardGiftBox } from "./cardGiftbox.model";

export interface CardVariance {
    color: string;
    colorHexcode: string;
    variancePrice: { [paperType: string]: number };
    imageURL: string;
    imageURL_GB: string;
    giftBoxM: cardGiftBox[];
    standardGiftBoxPrice: number;
    sku: string;
}