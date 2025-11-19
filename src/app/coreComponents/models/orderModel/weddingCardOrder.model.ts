import { cardGiftBox } from "../cardGiftbox.model";

export class WeddingCardOrder {
    id: string= '';
    name: string='';
    imgURL: string='';
    price: number= 0;
    description: string='';
    category: string='';
    color: string='';
    paper: string='';
    colorHexcode: string='';
    varianceName: string='';
    weddingCardQuantity: number= 1;
    giftBoxQuantity: number= 0;
    priceAfterPromotion: number = 0;
    isGiftBoxInculed: boolean = false;
    giftBox : { size: {width: number, height: number, length: number}, designName: string, designImageURL: string, paperType: string,  price: number, quantity: number, totalForBoxes: number} = {
        size: {
            width: 0,
            height: 0,
            length: 0, 
        }, 
        designName: '',
        designImageURL: '',
        paperType: '',
        price: 0,
        quantity: 0,
        totalForBoxes: 0
    };
}