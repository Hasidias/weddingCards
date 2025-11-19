import { CardPromotion } from "./card.promotion.model";
import { CardVariance } from "./card.variance.model";

export  interface Card {
    id: number;
    paperTypes: string [];
    name: string;
    imgURL: string;
    price: number;
    description: string;
    category: string;
    variances: CardVariance[];
    subImages: string[];
    promotions?: CardPromotion[];
}