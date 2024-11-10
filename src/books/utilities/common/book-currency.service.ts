import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { config } from 'dotenv';
config();
@Injectable()
export class CurrencyService {
  constructor(private readonly httpService: HttpService) {}

  async convertToBolivianos(amount: number, from: string): Promise<number> {
    if (!process.env.URL_KEY_CURRENCY || !process.env.API_KEY_CURRENCY) {
      throw new BadRequestException('Currency API URL or API Key is missing');
    }
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(process.env.URL_KEY_CURRENCY, {
            params: {
              access_key: process.env.API_KEY_CURRENCY,
              from,
              to: 'BOB',
              amount,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error('Error fetching conversion rate:', error.message);
              throw new BadRequestException('Error fetching conversion rate');
            }),
          ),
      );
      const conversionRate = response.data.result;
      return parseFloat(conversionRate.toFixed(2));
    } catch (error) {
      console.error('Error processing conversion rate:', error.message);
      throw new BadRequestException('Error processing conversion rate');
    }
  }
}
