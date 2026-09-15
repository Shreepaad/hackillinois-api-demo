import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export const validate = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body });
    
    if (!result.success) {
      // doesn't match Zod schema, something is wrong
      res.status(400).json({
        errors: result.error.issues.map((i) => ({
          field: i.path.slice(1).join('.'), // remove the body to access the field value
          message: i.message,
        })),
      });
      return;
    }
    
    // runs a Zod schema against { body } and replaces req.body with the parsed output
    // the trim/lowercase transforms are applied and unknown fields are removed
    req.body = (result.data as { body: unknown }).body;
    next();
  };
