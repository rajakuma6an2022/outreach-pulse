import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

// schema shape: z.object({ body?, query?, params? })
export const validate =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) return next(result.error);

    const data = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (data.body !== undefined) req.body = data.body;
    // Express 4 la req.query writable, aana safe-ku mutate pannaama property set panrom
    if (data.query !== undefined) Object.assign(req.query, data.query);
    if (data.params !== undefined) Object.assign(req.params, data.params);

    next();
  };