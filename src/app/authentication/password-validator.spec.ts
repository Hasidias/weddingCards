import { PasswordValidator } from './password-validator';

describe('PasswordValidator', () => {
  it('should create an instance', () => {
    const directive = new PasswordValidator();
    expect(directive).toBeTruthy();
  });
});
