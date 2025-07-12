import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { IApiErrorResponse } from '../types';

// Base validation schemas
const campaignIdSchema = z.string().uuid('Invalid campaign ID format');
const userIdSchema = z.string().uuid('Invalid user ID format');
const evmAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format');
const campaignStatusSchema = z.enum(['pending', 'active', 'completed', 'cancelled']);

// Campaign creation schema
const campaignCreateBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  fan_token_address: evmAddressSchema,
  pool_amount: z.number().positive('Pool amount must be positive'),
  max_participants: z.number().int().positive('Max participants must be positive'),
  first_place_allocation: z.number().min(0, 'First place allocation must be non-negative').max(100, 'First place allocation cannot exceed 100%'),
  second_place_allocation: z.number().min(0, 'Second place allocation must be non-negative').max(100, 'Second place allocation cannot exceed 100%'),
  third_place_allocation: z.number().min(0, 'Third place allocation must be non-negative').max(100, 'Third place allocation cannot exceed 100%'),
  start_date: z.string().datetime('Invalid start date format'),
  end_date: z.string().datetime('Invalid end date format'),
}).refine((data) => {
  const totalAllocation = data.first_place_allocation + data.second_place_allocation + data.third_place_allocation;
  return totalAllocation <= 100;
}, {
  message: 'Total allocation percentages cannot exceed 100%',
  path: ['first_place_allocation'],
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return startDate < endDate;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

// Campaign update schema
const campaignUpdateBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  fan_token_address: evmAddressSchema.optional(),
  pool_amount: z.number().positive('Pool amount must be positive').optional(),
  max_participants: z.number().int().positive('Max participants must be positive').optional(),
  first_place_allocation: z.number().min(0, 'First place allocation must be non-negative').max(100, 'First place allocation cannot exceed 100%').optional(),
  second_place_allocation: z.number().min(0, 'Second place allocation must be non-negative').max(100, 'Second place allocation cannot exceed 100%').optional(),
  third_place_allocation: z.number().min(0, 'Third place allocation must be non-negative').max(100, 'Third place allocation cannot exceed 100%').optional(),
  start_date: z.string().datetime('Invalid start date format').optional(),
  end_date: z.string().datetime('Invalid end date format').optional(),
  status: campaignStatusSchema.optional(),
}).refine((data) => {
  // Check allocation percentages if any are provided
  if (data.first_place_allocation !== undefined || 
      data.second_place_allocation !== undefined || 
      data.third_place_allocation !== undefined) {
    const first = data.first_place_allocation ?? 0;
    const second = data.second_place_allocation ?? 0;
    const third = data.third_place_allocation ?? 0;
    return first + second + third <= 100;
  }
  return true;
}, {
  message: 'Total allocation percentages cannot exceed 100%',
  path: ['first_place_allocation'],
}).refine((data) => {
  // Check dates if both are provided
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return startDate < endDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

// Query parameters schemas - make completely optional
const campaignQueryParamsSchema = z.object({}).catchall(z.any());

const campaignIdParamsSchema = z.object({
  id: campaignIdSchema,
});

const userIdParamsSchema = z.object({
  userId: userIdSchema,
});

// Validation middleware factory
function createValidationMiddleware<T>(schema: z.ZodSchema<T>, target: 'body' | 'params' | 'query') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = target === 'body' ? req.body : 
                   target === 'params' ? req.params : 
                   req.query;
      
      // For query parameters, ensure we have an object to validate
      const dataToValidate = target === 'query' ? (data || {}) : data;
      
      const result = schema.safeParse(dataToValidate);
      
      if (!result.success) {
        console.error('Validation error:', {
          target,
          data: dataToValidate,
          errors: result.error.errors
        });
        
        const error: IApiErrorResponse = {
          status: 'error',
          code: 400,
          message: 'Validation error',
          details: result.error.format(),
        };
        res.status(400).json(error);
        return;
      }
      
      // Replace the original data with validated data
      if (target === 'body') {
        req.body = result.data;
      } else if (target === 'params') {
        req.params = result.data as any;
      } else if (target === 'query') {
        // For query parameters, merge the validated data back
        req.query = { ...req.query, ...result.data } as any;
      }
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      console.error('Request details:', {
        target,
        body: req.body,
        params: req.params,
        query: req.query
      });
      
      const errorResponse: IApiErrorResponse = {
        status: 'error',
        code: 500,
        message: 'Internal validation error',
      };
      res.status(500).json(errorResponse);
    }
  };
}

// Export validation middleware
export const campaignCreateSchema = createValidationMiddleware(
  campaignCreateBodySchema,
  'body'
);

export const campaignUpdateSchema = createValidationMiddleware(
  campaignUpdateBodySchema,
  'body'
);

export const campaignQuerySchema = createValidationMiddleware(
  campaignQueryParamsSchema,
  'query'
);

export const campaignIdParamSchema = createValidationMiddleware(
  campaignIdParamsSchema,
  'params'
);

export const userIdParamSchema = createValidationMiddleware(
  userIdParamsSchema,
  'params'
);

// Export types for use in controllers
export type CampaignCreateRequest = z.infer<typeof campaignCreateBodySchema>;
export type CampaignUpdateRequest = z.infer<typeof campaignUpdateBodySchema>;
export type CampaignQueryParams = z.infer<typeof campaignQueryParamsSchema>;
export type CampaignIdParams = z.infer<typeof campaignIdParamsSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>; 