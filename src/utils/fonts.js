import { Ubuntu, Berkshire_Swash } from 'next/font/google';

export const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-ubuntu',
});

export const berkshireSwash = Berkshire_Swash({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-berkshire-swash',
});
