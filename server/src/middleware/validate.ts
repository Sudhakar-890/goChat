import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Generic Zod validation middleware.
 * Validates request body, query, and/or params against provided schemas.
 */
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError || (error as any).name === 'ZodError') {
        res.status(400).json({
          error: 'Validation Error',
          details: (error as any).errors?.map((e: any) => ({
            field: e.path?.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
