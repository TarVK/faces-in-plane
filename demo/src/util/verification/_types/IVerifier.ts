/**
 * Verifies whether the given input is of the correct type, and if so returns that type, otherwise returns null
 */
export type IVerifier<T> = (input: unknown) => {result: T} | {errors: IErrorData[]};

export type IErrorData = {
    message: string;
    path?: string;
};
