import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// Generic Zod-based request validator. Validates body/query/params together
// and replaces req properties with the parsed (and coerced/typed) values.
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.params = parsed.params;
    // NOTE: req.query is a getter-only in newer Express typings; merge instead of reassigning.
    if (parsed.query) Object.assign(req.query, parsed.query);
    next();
  };
}
