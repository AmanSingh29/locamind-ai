import type { Request, Response, NextFunction, RequestHandler } from "express";

export type AsyncRequestHandler<
  Req extends Request = Request,
  Res extends Response = Response,
> = (req: Req, res: Res, next: NextFunction) => Promise<unknown>;

/**
 * Higher-order function that catches rejections in asynchronous route controllers
 * and passes them to Express next() error middleware.
 */
export const asyncHandler = <
  Req extends Request = Request,
  Res extends Response = Response,
>(
  fn: AsyncRequestHandler<Req, Res>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as Req, res as Res, next)).catch(next);
  };
};
