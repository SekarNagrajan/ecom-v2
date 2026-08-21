import z from 'zod';

export const otpSchema = z
  .string()
  .min(6, 'Please enter the 6-digit code')
  .regex(/^[0-9]{6}$/, 'Please enter a valid 6-digit code');
