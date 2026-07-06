import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DropDown } from '../../../../drop-down';

 class phoneNumber {
  placeholder: string='Enter phone number';
  length: number= 10;
}

@Component({
  selector: 'app-address',
  imports: [FormsModule, DropDown ],
  templateUrl: './address.html',
  styleUrl: './address.scss'
})
export class Address {
  address: any = {};
  districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya"
];

  @Output() saveAddress =new EventEmitter<any>
  @Output() close = new EventEmitter<void>()
  phoneNumbers: phoneNumber[] = [];

  constructor() { 
    let phone1 = new phoneNumber();
    this.phoneNumbers.push(phone1);
  }

  submitAddress(form:NgForm) {
    if (form.invalid || this.address.district === undefined || null) {
      return;
    }
    this.saveAddress.emit(this.address);
  }

  closeModal() {
    this.close.emit();
  }

  selectDistrict(district:string) {
    this.address.district = district;
  }
}
