import { ChangeDetectorRef, Component, ComponentRef, ElementRef, inject, Injector, runInInjectionContext, ViewChild, ViewContainerRef } from '@angular/core';
import { Card } from '../models/card.model';
import { CommonModule } from '@angular/common';
import { WeddingCardOrder } from '../models/orderModel/weddingCardOrder.model';
import { FormsModule } from '@angular/forms';
import { PromotionModal } from '../modals/promotion-modal/promotion-modal';

@Component({
  selector: 'app-individual-wedding-card',
  imports: [CommonModule, FormsModule ],
  templateUrl: './individual-wedding-card.html',
  styleUrl: './individual-wedding-card.scss'
})
export class IndividualWeddingCard {
cardData!:Card;
previewImage: string = '';
images: string []= [];
order: WeddingCardOrder = new WeddingCardOrder();
selectedVarianceIndex: number = -1;
selecteOptions: { paperType: string; color: string } = {paperType: '', color: ''};
price: number = 0;
giftBox:boolean = false;
standardGiftBoxSelected: boolean = true;
selectedGiftBoxDesignIndex: number = 0;
selectedGiftBoxMPricingIndex: number = 0;
TotalAfterPromotions: number = 0;
promotions : {promotionType:String, priceAfterPromotion:number, promotionValue:number, discount: number}[] = [];
customizedBoxDimenstions: {width: number; height: number; length: number;} | any= {}
eligiblePromotion: {type:String, discount: number} = {type: '', discount: 0};
giftBoxTotal: number = 0;
@ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
@ViewChild('promoModal', { read: ViewContainerRef }) modalVcr!: ViewContainerRef;

constructor() { 
  this.cardData = (typeof history !== 'undefined' && history.state.cardData)? history.state.cardData : null;
  let storedCardData = typeof localStorage !== 'undefined' ? localStorage.getItem('cardData'): null;
  if (typeof history == 'undefined') {
    this.cardData = storedCardData ? JSON.parse(storedCardData) : null;
    console.log(this.cardData)
  } 
  if (typeof history !== 'undefined') {
    localStorage.setItem('cardData', JSON.stringify(this.cardData));
    console.log('saved to local storage card data')
  }
  // runInInjectionContext(this.injector, () => {  
  //   return new Promise<void>((resolve) => {
  //     if ( typeof this.cardData['subImages']) {
  //       this.images = this.cardData.subImages ? this.cardData.subImages : [] ;
  //     }
  //     console.log(this.images)
  //     this.cdr.detectChanges();
  //     resolve();
  //   });
  // });
  console.log(storedCardData)
  if (this.cardData) {
    let allImages = this.cardData.subImages.map(img => {
      return img
    })
    allImages.unshift(this.cardData.imgURL);
    this.previewImage = allImages[0];
    this.images = allImages;
    let initialThum = document.querySelector('#_thum1');
    initialThum?.classList.add('activeImg')
    this.selecteOptions.paperType = this.cardData.paperTypes[0];
  }
  
}

ngOnInit() {
  
}

scroll(direction: string) {
  const thumbnails = document.getElementById('thumbnails');
  if (thumbnails) {
    if (direction === 'down') {
       this.scrollContainer.nativeElement.scrollBy({
        top: 200,
        behavior: 'smooth'
    });
    } else {
      this.scrollContainer.nativeElement.scrollBy({
        top: -200,
        behavior: 'smooth'
    });
    }
  }
}

changePreviewImage(img: string, id:number, skip: boolean = false) {
  this.previewImage = img;
  var currentImg = document.querySelector('.thumbnail.activeImg');
  if (currentImg) currentImg!.classList.remove('activeImg');
  if (skip) return;
  let elementId = `_thum${id}`
  var newPreviewThumbnail = document.getElementById(elementId);
  newPreviewThumbnail!.classList.add('activeImg');
}

updateVarianceIndex(index: number) {
  this.selectedVarianceIndex = index;
  this.changePreviewImage(this.cardData.variances[index].imageURL, index, true);
}

updatePrice() {
  if (this.selecteOptions.paperType !== '' && this.selecteOptions.color !== '') {
    let paperType = this.selecteOptions.paperType;
    let color = this.selecteOptions.color;
    let index = this.cardData.variances.findIndex((variance)  => {
     return variance.color === color;
    } );
    if (index !== -1) {
      var unitPrice = this.cardData.variances[index].variancePrice[paperType];
      this.price = unitPrice * (this.order.weddingCardQuantity ? this.order.weddingCardQuantity : 1);
      if (this.order.giftBoxQuantity > 0) {
        if (!this.standardGiftBoxSelected) return
        let boxUnitPrice = this.cardData.variances[index].giftBoxM[this.selectedGiftBoxDesignIndex].pricing[this.selectedGiftBoxMPricingIndex].price;
        console.log(boxUnitPrice)
        this.price += boxUnitPrice * this.order.giftBoxQuantity;
        this.giftBoxTotal = boxUnitPrice * this.order.giftBoxQuantity;
      }
    }
    this.CalculatePriceAfterDiscount();
  } else return;
}

updatePaperType(paperType: string) {
  this.selecteOptions.paperType = paperType;
  this.updatePrice();
}

updateColor(color: string) {
  this.selecteOptions.color = color;
  this.updatePrice();
}

updateGiftBoxRequirement(addBox: boolean) {
  this.giftBox = addBox;
}

updateGBSelection(standardSelected: boolean) {
  this.standardGiftBoxSelected = standardSelected;
  this.updatePrice();
}

updateGiftBoxIndex(index: number) {
  this.selectedGiftBoxDesignIndex = index;
}

updateGiftBoxMIndex(index: number) {
  this.selectedGiftBoxMPricingIndex = index;
}

async CalculatePriceAfterDiscount() {
  this.promotions = [];
  let promoVariances = this.cardData.promotions?.map(promo =>{return promo.type});
  console.log('promoVariances :', promoVariances);
  for (let [index,promo] of this.cardData.promotions!.entries()) {
    new Promise<void>((resolve) => {
      if (promo.type === 'quantity_based') {
      let ranges: string[] = promo.conditions.map(item =>  { return item['range']});
      let rangesWithMinMax = ranges.map((r) => {
        const [min, max] = r.split(":").map(Number);
        return { min, max: max === 0 ? Infinity : max };
      })
      const range = this.findInRange(this.order.weddingCardQuantity, rangesWithMinMax);
      if (range) {
        let condition = promo.conditions.find(item => item['range'] === range);
        if (condition) {
          let discountPercent = condition['discount'];
          let discountValue = (this.price * discountPercent) / 100;
          let newPrice = this.price - discountValue;
          let promotionArrayIndex = this.promotions.findIndex(promo => promo.promotionType === 'quantity_based');
          if (promotionArrayIndex !== -1) {
            this.promotions[promotionArrayIndex] = {promotionType: 'quantity_based', priceAfterPromotion: newPrice, promotionValue: discountValue, discount: discountPercent};
          } else {
          this.promotions.push({promotionType: 'quantity_based', priceAfterPromotion: newPrice, promotionValue: discountValue, discount: discountPercent});
          }
        }
      }
    }
    // } else {
    //       let promotionArrayIndex = this.promotions.findIndex(promo =>  {return promo.promotionType === 'quantity_based'});
    //       console.log(promotionArrayIndex)
    //       if (promotionArrayIndex !== -1) {
    //         this.promotions.splice(promotionArrayIndex, 1);
    //       }
    // }
    // value_based promotions can be added here similarly
    if (promo.type === 'value_based') {
      let ranges: string[] = promo.conditions.map(item =>  { return item['range']});
      let rangesWithMinMax = ranges.map((r) => {
        const [min, max] = r.split(":").map(Number);
        return { min, max: max === 0 ? Infinity : max };
      })
      const range = this.findInRange(this.price, rangesWithMinMax);
      if (range) {
        let condition = promo.conditions.find(item => item['range'] === range);
        if (condition) {
          let discountPercent = condition['discount'];
          let discountValue = (this.price * discountPercent) / 100;
          let newPrice = this.price - discountValue;
          let promotionArrayIndex = this.promotions.findIndex(promo => promo.promotionType === 'value_based');
          if (promotionArrayIndex !== -1) {
            this.promotions[promotionArrayIndex] = {promotionType: 'value_based', priceAfterPromotion: newPrice, promotionValue: discountValue, discount: discountPercent};
          } else {
          this.promotions.push({promotionType: 'value_based', priceAfterPromotion: newPrice, promotionValue: discountValue, discount: discountPercent});
          }
        }
        // } else {
        //   let promotionArrayIndex = this.promotions.findIndex(promo =>{return promo.promotionType === 'value_based'});
        //   if (promotionArrayIndex !== -1) {
        //     this.promotions.splice(promotionArrayIndex, 1);
        //   }
        // }
    }}
    if (index === this.cardData.promotions!.length -1) {
      let promotionValues = this.promotions.map(promo => {return promo.priceAfterPromotion});
      this.TotalAfterPromotions = promotionValues.length > 0 ? Math.min(...promotionValues) : 0;
      let eligiblePromotionIndex = this.promotions.findIndex(promo => promo.priceAfterPromotion === this.TotalAfterPromotions);
      this.eligiblePromotion.type = eligiblePromotionIndex !== -1 ? this.promotions[eligiblePromotionIndex].promotionType : '';
      this.eligiblePromotion.discount = eligiblePromotionIndex !== -1 ? this.promotions[eligiblePromotionIndex].discount : 0;
      resolve();
    }
    });
  }
}

findInRange (quantity:number, ranges:{min:number,max: number}[]) {
  for (let r of ranges) {
    if (quantity >= r.min && quantity <= r.max) {
      if (r.max === Infinity) {
        return `${r.min}:`;
      }
      return `${r.min}:${r.max}`;
    }
  }
  return null;
}

showPromotionsModal() {
  const containerRef = this.modalVcr.createComponent(PromotionModal);
  if (this.cardData.promotions) {
      containerRef.instance.promotions = this.cardData.promotions
  }
  containerRef.instance.closeModal.subscribe(() => {
    containerRef.destroy();
  })
}

orderNow() {
  this.order.price = this.price;
  this.order.priceAfterPromotion = this.TotalAfterPromotions
  this.order.color = this.selecteOptions.color
  this.order.paper = this.selecteOptions.paperType
  this.cardData.variances.map(property => {
    if (property.color == this.selecteOptions.color) {
      this.order.colorHexcode = property.colorHexcode
    }
  });
  if (this.giftBox) {
    this.order.giftBox.designName = this.cardData.variances[this.selectedVarianceIndex].giftBoxM[this.selectedGiftBoxDesignIndex].designName;
    this.order.giftBox.paperType = this.cardData.variances[this.selectedVarianceIndex].giftBoxM[this.selectedGiftBoxDesignIndex].pricing[this.selectedGiftBoxMPricingIndex].paperType;
    this.order.giftBox.price = this.cardData.variances[this.selectedVarianceIndex].giftBoxM[this.selectedGiftBoxDesignIndex].pricing[this.selectedGiftBoxMPricingIndex].price;
    this.order.giftBox.quantity = this.order.giftBoxQuantity;
  };

  if (this.giftBox && this.standardGiftBoxSelected) {
    this.order.giftBox.size = {
      width: this.cardData.variances[this.selectedVarianceIndex].giftBoxM[this.selectedGiftBoxDesignIndex].size.width,
      height: this.cardData.variances[this.selectedVarianceIndex].giftBoxM[this.selectedGiftBoxDesignIndex].size.height,
      length: this.cardData.variances[this.selectedVarianceIndex].giftBoxM[this.selectedGiftBoxDesignIndex].size.length,
    }
    this.order.giftBox.totalForBoxes = this.giftBoxTotal;
  }

  if (this.giftBox && !this.standardGiftBoxSelected) {
    this.order.giftBox.size = {
      width: this.customizedBoxDimenstions.width,
      height: this.customizedBoxDimenstions.height,
      length: this.customizedBoxDimenstions.length,
    }
  };
  this.order.isGiftBoxInculed = this.giftBox


  console.log(this.order)
}
}