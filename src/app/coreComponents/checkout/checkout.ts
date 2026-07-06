
import { ChangeDetectorRef, Component, Inject, inject, ViewChild, ViewContainerRef, PLATFORM_ID, ElementRef } from '@angular/core';
import { WeddingCardOrder } from '../models/orderModel/weddingCardOrder.model';
import { Address } from './modals/address/address';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage'
import { Db } from '../services/db';
import { or } from '@angular/fire/firestore';
import { stat } from 'fs';


@Component({
  selector: 'app-checkout',
  imports: [FormsModule, CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})

export class Checkout {
  storage = inject(Storage);
  orders: WeddingCardOrder[] = [];
  totalAmount: number = 0;
  totalPromotionDiscount: number = 0;
  address:any = {};
  selectedPaymentMethod: string = 'bank_deposit';
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('addressModal', { read: ViewContainerRef }) modalVcr!:ViewContainerRef;
  file: any;
  previewImg: string = '';
  selectedBank: string = 'commercial'
  fileType: string = '';
  isBrowser: boolean = false;
  pdfSrc: any = '';
  pdfPreview: SafeUrl | null = null;
  cashOnDeliveryTranferRate: number = 0.5;
  @ViewChild('pdfCanvas') pdfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('thumbContainer') containerRef!: ElementRef<HTMLDivElement>;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private sanitizer: DomSanitizer, private dbService: Db) {
    
    this.orders = (typeof history !== 'undefined' && history.state.orders)? history.state.orders : null;
    let storedCardData = typeof localStorage !== 'undefined' ? localStorage.getItem('orders'): null;
    if (typeof history == 'undefined') {
      this.orders = storedCardData ? JSON.parse(storedCardData) : null;
      console.log(this.orders)
    } 
    if (typeof history !== 'undefined') {
      localStorage.setItem('orders', JSON.stringify(this.orders));
      console.log('saved to local storage card data')
    }
    console.log(this.orders)
    if (this.orders && this.orders.length > 0) {
      this.orders.forEach(order => {
        if (order.priceAfterPromotion > 0) {
          this.totalAmount += order.priceAfterPromotion;
        } else {
          this.totalAmount += order.price
        }
      });
    }
   }

   launchModel(mode:boolean) {
    const modalRef = this.modalVcr.createComponent(Address);
    if (mode) {
      modalRef.instance.address = this.address;
    }
    modalRef.instance.saveAddress.subscribe((addr:any) => {
      this.address = addr;
      this.cdr.detectChanges();
      console.log(this.address);
      modalRef.destroy();
    });
    modalRef.instance.close.subscribe(() => {
      modalRef.destroy();
    });
  }

  async updateSelection(event: any) {
    // console.log(event);
    // this.previewImg = '';
    // this.pdfSrc = '';
    if (!isPlatformBrowser(this.platformId)) return;
     const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const filetype = input.files[0].type;
      if (filetype.startsWith('image/')) {
        this.fileType = 'image'
      }
      if (filetype.startsWith('application/pdf')) {
        this.fileType = 'pdf'
      }
      if (this.fileType == 'image') {
        this.file = input.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(input.files[0]);
        fileReader.onload = (e: any) => {
          this.previewImg = e.target.result;
          this.cdr.detectChanges();
        }
      }
      if (this.fileType == 'pdf') {
          this.file = event.target.files[0];

          const file = event.target.files?.[0];
        if (!file) return;

        const arrayBuffer = await file.arrayBuffer();
        const { GlobalWorkerOptions, getDocument } = await import('pdfjs-dist');

        GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

        const pdf = await getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // const container = this.containerRef.nativeElement;

        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // const scale = container.clientWidth / viewport.width;
        // const scaledViewport = page.getViewport({ scale });

         canvas.width = viewport.width;   // will fill container
         canvas.height = viewport.height;

        await page.render({
            canvasContext: ctx,
            viewport,
            canvas
          }).promise.finally(() => {
            let dataUrl = canvas.toDataURL('image/png');
            this.pdfPreview = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
            this.cdr.detectChanges();
          });
        }
      } else {
        this.previewImg = '';
        this.file = null;
      }
  }

  selectBank(bank:string) {
    this.selectedBank = bank;
  }

  resetImg() {
    this.previewImg = '';
    this.pdfSrc = '';
    this.fileType = '';
  }

  launchSelection() {
    document.getElementById('bankProof')?.click();
  }

  async placeOrder() {
    if (this.address.first_name == undefined || (this.selectedPaymentMethod == 'cod' && this.file == undefined || null) || (this.selectedPaymentMethod == 'bank_deposit' && this.file == undefined || null)) {
      return;
    }
    let payment:any = {
      paymentMethod: this.selectedPaymentMethod
    }
    if (this.selectedPaymentMethod == 'bank_deposit' || this.selectedPaymentMethod == 'cod') {
      let uploadUrl = await this.getURL();
      payment.paymentProof = uploadUrl;
    }
    const delivery = {
      shippingLabel: {
        ...this.address
      },
      state: 'dispatching',
      trackingNumber: 0,
      shippedeDate: '',
      deliveryDate: '',
    }
    let _customer;
    let clearedItems = this.orders.map(order => {
      let {customer, ...rest} = order;
      _customer = customer;
      return {...rest};
    });
    let finalizedOrder = {
      items: [...clearedItems],
      payment,
      delivery,
      orderDate: new Date().getTime(),
      totalAmount: this.totalAmount,
      totalPromotionDiscount: this.totalPromotionDiscount,
      customer: _customer,
      orderId: `GI${new Date().getTime()}`,
      status: 'verifying',
      orderType: 'regular'
    }
    this.dbService.placeOrder(finalizedOrder).then(res => {
      console.log(res)
    })
  }

  async getURL() {
    const file: File = this.file;
    if (!file) return;

    // Path in Firebase Storage
    const filePath = `payment_proofs/${Date.now()}_${file.name}`;
    const fileRef = ref(this.storage, filePath);

    // Upload file
    const result = await uploadBytes(fileRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(result.ref);
    return downloadURL;
  }
}