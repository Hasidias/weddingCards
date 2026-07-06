export interface cardGiftBox {
    size: {
        width: number;
        height: number;
        length: number;
    };
    designName: string;
    designImageURL: string;
    pricing: [{ paperType: string; price: number }];
}