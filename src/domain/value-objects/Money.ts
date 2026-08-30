export class Money {
  public readonly amount: number;
  public readonly currency: string;

  private constructor(amount: number, currency: string = 'USD') {
    if (isNaN(amount)) {
      throw new Error('Money amount must be a valid number');
    }
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency.toUpperCase().trim();
  }

  public static create(amount: number, currency: string = 'USD'): Money {
    return new Money(amount, currency);
  }

  public format(): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EGP: 'EGP ',
      SAR: 'SAR ',
      AED: 'AED ',
      EUR: '€',
    };
    const symbol = symbols[this.currency] || `${this.currency} `;
    return `${symbol}${this.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add amounts with different currencies: ${this.currency} vs ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  public multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}
