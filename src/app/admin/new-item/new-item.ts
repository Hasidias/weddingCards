import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuillModule } from 'ngx-quill';
import { Storage, ref, getDownloadURL, uploadString } from '@angular/fire/storage';
import { finalize } from 'rxjs';
import { AdminService } from '../services/admin-service';

@Component({
  selector: 'app-new-item',
  imports: [ReactiveFormsModule, DragDropModule, QuillModule],
  templateUrl: './new-item.html',
  styleUrl: './new-item.scss',
})
export class NewItem implements OnInit{
  private fb = inject(FormBuilder)
  private cdr = inject(ChangeDetectorRef)
  objectKeys = Object.keys;
  private storage = inject(Storage);
  private adminService = inject(AdminService);
  isLoadign: boolean = false;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  valueBasedAdded:boolean = false;
  quantityBasedAdded:boolean = false;

  variance = this.createVarianceGroup();
  valueBased = this.createPromotionGroup();
  quantityBased = this.createPromotionGroup();

  listingForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    category: ['', [Validators.required]],
    id: ['', [Validators.required]],
    attributes: this.fb.nonNullable.array<string>([]),
    paperTypes: this.fb.nonNullable.array<string>([]),
    availability: true,
    description: ['', [Validators.required]],
    mainImages: this.fb.nonNullable.array<FormGroup>([]),
    imgURL: ['', [Validators.required]],
    subImages: this.fb.nonNullable.array<string>([]),

    variances: this.fb.array<FormGroup>([]),
    promotions: this.fb.nonNullable.array<FormGroup>([]),
  });

  ngOnInit(): void {
    this.paperTypes.valueChanges.subscribe(value => {
      this.syncPaperTypesToPricing(value);
      this.syncGBPaperTypesToPricingFor(value);
    })
    this.valueBased.patchValue({
      multiProperty: false,
      mutipleCondition: true,
      propertyToDiscount: ['price'],
      type: 'value_based',
    });

    this.quantityBased.patchValue({
      multiProperty: false,
      mutipleCondition: true,
      propertyToDiscount: ['quantity'],
      type: 'quantity_based',
    })
    this.addAttribute();
    this.addVariance();
    this.addGiftBoxM(0);
    // this.addPricing(0,0);
    // this.addPromotion();
    // this.addCondition(0);
    // this.addCondition(1);
    this.addPaperType();
    
  }

  get variances(): FormArray {
  return this.listingForm.get('variances') as FormArray;
  }
  get paperTypes(): FormArray {
    return this.listingForm.get('paperTypes') as FormArray;
  }

  get promotions(): FormArray {
    return this.listingForm.get('promotions') as FormArray;
  }

  get images(): FormArray {
    return this.listingForm.get('mainImages') as FormArray;
  }

  giftBoxMAt(varianceIndex: number): FormArray {
    return this.variances.at(varianceIndex).get('giftBoxM') as FormArray;
  }

   pricing(i: number, j:number): FormArray {
    const giftBoxM = this.variances.at(i).get('giftBoxM') as FormArray;
    const giftBoxGroup = giftBoxM.at(j) as FormGroup;
    return giftBoxGroup.get('pricing') as FormArray;
  }

  private syncPaperTypesToPricing(types: [string] | null = null) {
    this.variances.controls.forEach(varianceGroup => {
      const variancePriceGroup = varianceGroup.get('variancePrice') as FormGroup;
      const varianceQuantityGroup = varianceGroup.get('varianceQuantity') as FormGroup;
      if (!variancePriceGroup || !varianceQuantityGroup) return;

      // Add missing controls
      types?.forEach(type => {
          if (!variancePriceGroup.contains(type)) {
            variancePriceGroup.addControl(
              type,
              this.fb.nonNullable.control<string>('', Validators.required)
            );
          };
          if (!varianceQuantityGroup.contains(type)) {
            varianceQuantityGroup.addControl(
              type,
              this.fb.nonNullable.control<string>('', Validators.required)
            );
          }
      })

      Object.keys(variancePriceGroup.controls).forEach(key => {
        if (!types?.includes(key)) {
          variancePriceGroup.removeControl(key);
        }
      })
      Object.keys(varianceQuantityGroup.controls).forEach(key => {
        if (!types?.includes(key)) {
          varianceQuantityGroup.removeControl(key);
        }
      })
    })
  }

  private syncGBPaperTypesToPricingFor(types: [string] | null = null) {
    this.variances.controls.forEach((variance, varianceIndex) => {
      const giftBoxM = variance.get('giftBoxM') as FormArray;
      giftBoxM.controls.forEach((_, gbIndex) => {
        this.syncPricingForGB(varianceIndex, gbIndex, types);
      })
    })
  }

  private syncPricingForGB(variancIndex: number, gbIndex: number, types: [string] | null = null) { 
    const giftBox = this.giftBoxMAt(variancIndex).at(gbIndex) as FormGroup;
    const pricingArray = giftBox.get('pricing') as FormArray;

    // Add missing pricing controls 

    const existingPaperTypes = pricingArray.controls.map(pricingGroup => pricingGroup.get('paperType')?.value);
    types?.forEach(type => {
      if (!existingPaperTypes.includes(type)) {
        pricingArray.push(
          this.fb.nonNullable.group({
            paperType: type,
            price: ['', Validators.required],
            quantity: ['', Validators.required],
          })
        );
      }});

      existingPaperTypes.forEach((paperType, index) => {
        if (!types?.includes(paperType)) {
          pricingArray.removeAt(index);
        }
      })

   }

  variancePrice(vari: number): FormGroup {
    return this.variances.at(vari).get('variancePrice') as FormGroup;
  }

  varianceQuantity(vari:number): FormGroup {
    return this.variances.at(vari).get('varianceQuantity') as FormGroup;
  }

  attributes = this.listingForm.get('attributes') as FormArray<FormControl<string>>;;
  
  createVarianceGroup() {
    return this.fb.nonNullable.group({
      color: ['', [Validators.required]],
      colorHexcode: ['', [Validators.required]],
      imageURL: this.fb.control<{
        fileName: string;
        dataUrl: string;
      } | null>(null),
      imageURL_GB: this.fb.control<{
      fileName: string;
      dataUrl: string;
    } | null>(null),
      price: ['', [Validators.required]],
      paper: ['', [Validators.required]],
      variancePrice: this.fb.nonNullable.group({}),
      varianceQuantity: this.fb.nonNullable.group({}),
      giftBoxM: this.fb.nonNullable.array<FormGroup>([])
    })
  } 

  createGiftBoxMGroup() {
    return this.fb.nonNullable.group({
      designImageURL: ['', [Validators.required]],
      designName: ['', [Validators.required]],
      pricing: this.fb.nonNullable.array<FormGroup>([]),
      size: this.fb.nonNullable.group({
        height: ['', [Validators.required]],
        length: ['', [Validators.required]],
        width: ['', [Validators.required]],
      }),
    })
  }

  createGiftBoxPricingGroup() {
    return this.fb.nonNullable.group({
      paperType: ['', [Validators.required]],
      price: ['', [Validators.required]],
    })
  }

  addGiftBoxM(varianceIndex: number) {
    const variance = this.variances.at(varianceIndex);
    const giftBoxM = variance?.get('giftBoxM') as FormArray;
    giftBoxM?.push(this.createGiftBoxMGroup());
    if (giftBoxM.length > 1 || varianceIndex > 0) {
      let arrayLenth = giftBoxM.length;
      this.addPricing(varianceIndex,arrayLenth - 1)
    }
  }

  addVariance() {
     const varianceGroup = this.createVarianceGroup();
     varianceGroup.patchValue(this.variance.value);
     this.listingForm.controls.variances.push(varianceGroup);
     const arrayLenth = this.listingForm.controls.variances.length;
     if (arrayLenth > 1) {
      this.addGiftBoxM(arrayLenth - 1)
     }
     this.variance.reset();
     this.syncPaperTypesToPricing(this.paperTypes.value as [string]);
     this.cdr.detectChanges();
  }

  removeVariance(index: number) {
    this.variances.removeAt(index);
    this.cdr.detectChanges();
  }

  addAttribute() {
     this.attributes.push(this.fb.nonNullable.control(''));
     this.cdr.detectChanges()
  }

  removeAttribute(index:number) {
    console.log(index)
    this.attributes.removeAt(index);
    this.cdr.detectChanges();
  }

  createPricingGroup () {
    return this.fb.nonNullable.group({
      paperType: ['', [Validators.required]],
      price: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
    })
  }

  addPricing(varianceIndex: number, gbIndex: number) {
    const variance = this.variances.at(varianceIndex);
    const giftBoxM = variance?.get('giftBoxM') as FormArray;
    const pricingArray = giftBoxM.at(gbIndex).get('pricing') as FormArray;
    pricingArray.push(this.createPricingGroup());
    this.cdr.detectChanges();
  }

  createPromotionGroup() {
    return this.fb.nonNullable.group({
      multiProperty: this.fb.nonNullable.control<boolean>(
          false
        ),
      mutipleCondition: this.fb.nonNullable.control<boolean>(
          false
        ),
      propertyToDiscount: this.fb.nonNullable.array<string>([]),
      type: ['', [Validators.required]],
      conditions: this.fb.nonNullable.array<FormGroup>([]),
      above: this.fb.nonNullable.group({
        discount: this.fb.nonNullable.control<number | null>(
          null, Validators.required
        ),
        finalLimit: this.fb.nonNullable.control<number | null>(
          null, Validators.required
        ),
      }),
    })
  }

  addPromotion() {
    const promotionGroup = this.createPromotionGroup();
    const quantityBasedPromotionGroup = this.createPromotionGroup();
    quantityBasedPromotionGroup.patchValue(this.quantityBased.value)
    promotionGroup.patchValue(this.valueBased?.value);
    this.promotions.push(promotionGroup);
    this.promotions.push(quantityBasedPromotionGroup)
  }

  createConditionGroup() {
    return this.fb.nonNullable.group({
      discount: this.fb.nonNullable.control<number | null>(
      null,
      Validators.required
    ),
      lowerLimit: this.fb.nonNullable.control<number | null>(
      null,
      Validators.required
    ),
      upperLimit: this.fb.nonNullable.control<number | null>(
      null,
      Validators.required
    ),
    })
  }

  addCondition(promotionIndex: number) {
    const promotion = this.promotions.at(promotionIndex);
    const conditions = promotion.get('conditions') as FormArray;
    conditions.push(this.createConditionGroup());
  }

  conditionsAt(promotionIndex: number): FormArray {
    const promotion = this.promotions.at(promotionIndex);
    return promotion.get('conditions') as FormArray;
  }

  removecondition(promotionIndex: number, conditionIndex: number) {
    const promotion = this.promotions.at(promotionIndex);
    const conditions = promotion.get('conditions') as FormArray;
    conditions.removeAt(conditionIndex);
  }

  removePricing(varianceIndex: number, gbIndex: number, pricingIndex: number) {
    const variance = this.variances.at(varianceIndex);
    const giftBoxM = variance?.get('giftBoxM') as FormArray;
    const pricingArray = giftBoxM.at(gbIndex).get('pricing') as FormArray;
    pricingArray.removeAt(pricingIndex);
  }

  launchMainSelection() {
    document.getElementById('mainImages')?.click();
  }

  onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();

    reader.onload = () => {
      this.images.push(
        this.createImage(file, reader.result as string)
      );
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(file);
  });
}

  createImage(file: File, dataUrl: string): FormGroup {
    return this.fb.nonNullable.group({
      fileName: file.name,
      dataUrl: dataUrl
    });
  }

  drop(event: CdkDragDrop<any>) {
  moveItemInArray(
    this.images.controls,
    event.previousIndex,
    event.currentIndex
  );

  // IMPORTANT: update FormArray value
  this.images.updateValueAndValidity();
  this.cdr.detectChanges();
}

removeImage(index: number) {
  this.images.removeAt(index);
  this.cdr.detectChanges(); 
}

varianceImageSelected(event: Event, varianceIndex: number, isGB: boolean) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const variance = this.variances.at(varianceIndex) as FormGroup;;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    variance.get(isGB ? 'imageURL_GB':'imageURL')?.setValue({
      fileName: file.name,
      dataUrl: e.target?.result as string
    });
    this.cdr.detectChanges();
  }
}

launchImageURLSelection(varianceIndex: number) {
  let id = `imageURL${varianceIndex}`;
  document.getElementById(id)?.click();
}

launchImageURLGBSelection(varianceIndex: number) {
  let id = `imageURL_GB${varianceIndex}`;
  document.getElementById(id)?.click();
}

removeImageURL(varianceIndex: number) {
  const variance = this.variances.at(varianceIndex) as FormGroup;
  variance.get('imageURL')?.setValue(null);
  this.cdr.detectChanges();
}

removeImageURLGB(varianceIndex: number) {
  const variance = this.variances.at(varianceIndex) as FormGroup;
  variance.get('imageURL_GB')?.setValue(null);
  this.cdr.detectChanges();
}

launchGBDesignSelection(varianceIndex: number, gbIndex: number) {
  let id = `gbDesign_${varianceIndex}_${gbIndex}`;
  document.getElementById(id)?.click();
}

gbDesignSelected(event:any, varianceIndex: number, gbIndex: number) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const giftBoxM = this.giftBoxMAt(varianceIndex);
  const gb = giftBoxM.at(gbIndex) as FormGroup;
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    gb.get('designImageURL')?.setValue({
      fileName: file.name,
      dataUrl: e.target?.result as string
    });
    this.cdr.detectChanges();
  }
}

removeGBDesignImg(varianceIndex: number, gbIndex: number) {
  const giftBoxM = this.giftBoxMAt(varianceIndex);
  const gbGroup = giftBoxM.at(gbIndex) as FormGroup;
  gbGroup.get('designImageURL')?.setValue('');
  this.cdr.detectChanges();
}

addPaperType() {
  this.paperTypes.push(this.fb.nonNullable.control(''));
  this.cdr.detectChanges();
}

removePaperType(index:number) {
  this.paperTypes.removeAt(index);
  this.cdr.detectChanges();
}

togglePromotion(type: 'value_based' | 'quantity_based') {
  const promotionArray = this.promotions
  if (type == 'value_based' && this.valueBasedAdded) {
    return;
  }
  if (type == 'quantity_based' && this.quantityBasedAdded) {
    return;
  }
  if (type === 'value_based') {
    const valueBasedGroup = this.createPromotionGroup();
    valueBasedGroup.patchValue(this.valueBased.value);
    promotionArray.push(valueBasedGroup);
    this.valueBasedAdded = true;
    this.addCondition(promotionArray.length - 1);
  } else if (type === 'quantity_based') {
    const quantityBasedGroup = this.createPromotionGroup();
    quantityBasedGroup.patchValue(this.quantityBased.value);
    promotionArray.push(quantityBasedGroup);
    this.quantityBasedAdded = true;
    this.addCondition(promotionArray.length - 1);
  }
}

removePromotion(index: number) {
  let promotion = this.promotions.at(index);
  if (promotion.get('type')?.value === 'value_based') {
    this.valueBasedAdded = false;
  }
  if (promotion.get('type')?.value === 'quantity_based') {
    this.quantityBasedAdded = false;
  }
  this.promotions.removeAt(index);
  this.cdr.detectChanges();
}

async saveProduct() {
  await this.uploadMainImages();
  await this.uploadVarianceImages();
  const productData = this.finalizeProduct();
  await this.adminService.saveProduct(productData).then(() => {
    
  });
  console.log('Final Product Data:', productData);
}

async uploadMainImages() {
  const images = this.listingForm.get('mainImages') as FormArray;

  for (let i = 0; i < images.length; i++) {
    const group = images.at(i) as FormGroup;
    const dataUrl = group.get('dataUrl')?.value;
    const fileName = group.get('fileName')?.value;
    const mainImage = this.listingForm.get('imgURL') as FormControl<string>;
    const subImagesArray = this.listingForm.get('subImages') as FormArray;
    if (dataUrl) {
      const path = `products/${Date.now()}_${i}_${fileName}.png`;
      const url = await this.uploadSingleImage({dataUrl, path});

      if (i === 0) {
        mainImage.setValue(url);
      } else {
        subImagesArray.push(this.fb.nonNullable.control(url));
      }
    }
    console.log(mainImage.value, subImagesArray.value);
  }
}

async uploadSingleImage(fileData: {dataUrl: string, path: string}) {
  const storageRef = ref(this.storage, fileData.path);
    await uploadString(storageRef, fileData.dataUrl, 'data_url');
    return await getDownloadURL(storageRef);
}

async uploadVarianceImages() {
  const variances = this.listingForm.get('variances') as FormArray;

  for (let i = 0; i < variances.length; i++) {
    const varianceGroup = variances.at(i) as FormGroup;
    const imageURL = varianceGroup.get('imageURL')?.value;
    const imageURL_GB = varianceGroup.get('imageURL_GB')?.value;
    const giftBoxM = varianceGroup.get('giftBoxM') as FormArray;
    if (imageURL) {
      const path = `products/variances/${Date.now()}_${i}_${imageURL.fileName}.png`;
      const url = await this.uploadSingleImage({dataUrl: imageURL.dataUrl, path});
      varianceGroup.get('imageURL')?.setValue(url);
    }
    if (imageURL_GB) {
      const path = `products/variances/giftboxes/${Date.now()}_${i}_${imageURL_GB.fileName}.png`;
      const url = await this.uploadSingleImage({dataUrl: imageURL_GB.dataUrl, path});
      varianceGroup.get('imageURL_GB')?.setValue(url);
    }

    for (let j = 0; j < giftBoxM.length; j++) {
      const gbGroup = giftBoxM.at(j) as FormGroup;
      const designImageURL = gbGroup.get('designImageURL')?.value;
      if (designImageURL) {
        const path = `products/giftBoxes/${Date.now()}_${i}_${j}_${designImageURL.fileName}.png`;
        const url = await this.uploadSingleImage({dataUrl: designImageURL.dataUrl, path});
        gbGroup.get('designImageURL')?.setValue(url);
      }
    }
  }

  }

finalizeProduct() {
  const { mainImages, promotions, ...rest } =
    this.listingForm.getRawValue();

  const finalizedPromotions = promotions?.map((promotion: any) => {
    const ranges = promotion.conditions.map((condition: any) => ({
      discount: condition.discount,
      range: `${condition.lowerLimit}:${condition.upperLimit}`
    }));

    if (promotion.above) {
      ranges.push({
        discount: promotion.above.discount,
        range: `${promotion.above.finalLimit}:`
      });
    }

    return {
      ...promotion,
      conditions: ranges
    };
  });

  return {
    ...rest,
    promotions: finalizedPromotions
  };
}

}
