import {TIfAny} from "../_types/TIfAny";
import {IErrorData, IVerifier} from "./_types/IVerifier";

/**
 * Makes the given verifier's value optional
 * @param verifier The verifier whose value to be made optional
 * @param config The configuration for the optional value
 * @returns The new verifier
 */
export const Opt =
    <T, K = undefined>(
        verifier: IVerifier<T>,
        {
            def = undefined as any,
            fb: fallback,
        }: {
            /** An optional defualt value */
            def?: K;
            /** A value to fallback to if there's an error in the actual value */
            fb?: K;
        } = {}
    ): IVerifier<T | TIfAny<K, undefined, K>> =>
    val => {
        if (val === undefined) return {result: def == undefined ? fallback : def} as any;
        const res = verifier(val);
        if ("error" in res && fallback != undefined) return {result: fallback};
        return res;
    };

/**
 * Creates a new enum verifier
 * @param opts The options of the num
 * @returns The created verifier
 */
export const VEnum =
    <V>(opts: readonly V[]): IVerifier<V> =>
    val =>
        opts.includes(val as any)
            ? ({result: val} as any)
            : {
                  errors: [
                      {
                          message: `'${JSON.stringify(val)}' is not one of ${opts.join(
                              ", "
                          )}`,
                      },
                  ],
              };

/**
 * Creates a new boolean verifier
 * @param config The configuration of the verifier
 * @returns THe created verifier
 */
export const VBool = (): IVerifier<boolean> => val =>
    typeof val == "boolean"
        ? {result: val}
        : {errors: [{message: `'${JSON.stringify(val)}' is not a valid boolean`}]};

/**
 * Creates a new string verifier
 * @param config The configuration of the verifier
 * @returns The created verifier
 */
export const VNumber =
    ({
        min,
        max,
        multiple,
        verify,
    }: {
        min?: number;
        max?: number;
        multiple?: number;
        verify?: (val: number) => string | null;
    } = {}): IVerifier<number> =>
    val => {
        if (typeof val != "number")
            return {
                errors: [{message: `'${JSON.stringify(val)}' is not a valid number`}],
            };
        if (min != undefined && val < min)
            return {
                errors: [{message: `Should be greater than or equal to ${min}`}],
            };
        if (max != undefined && val > max)
            return {
                errors: [{message: `Should be less than or equal to ${max}`}],
            };
        if (multiple != undefined && val % multiple != 0)
            return {errors: [{message: `Should be a multiple of ${multiple}`}]};
        if (verify) {
            const response = verify(val);
            if (response) return {errors: [{message: response}]};
        }
        return {result: val};
    };

/**
 * Creates a new string verifier
 * @param config The configuration of the verifier
 * @returns The created verifier
 */
export const VString =
    ({
        minLength,
        maxLength,
        verify,
    }: {
        minLength?: number;
        maxLength?: number;
        verify?: (val: string) => string | null;
    } = {}): IVerifier<string> =>
    val => {
        if (typeof val != "string")
            return {
                errors: [{message: `'${JSON.stringify(val)}' is not a valid number`}],
            };
        if (minLength != undefined && val.length < minLength)
            return {
                errors: [{message: `Should have at least ${minLength} characters`}],
            };
        if (maxLength != undefined && val.length > maxLength)
            return {
                errors: [{message: `Should have at most ${maxLength} characters`}],
            };
        if (verify) {
            const response = verify(val);
            if (response) return {errors: [{message: response}]};
        }
        return {result: val};
    };

/**
 * Creates a new object verifier
 * @param verifiers The verifiers for each of the properties
 * @param config The configuration for the verifier
 * @returns The new verifier
 */
export const VObject =
    <V extends Record<string, IVerifier<any>>>(
        verifiers: V,
        {
            allowMore,
        }: {
            /** Whether to allow unspecified properties */
            allowMore?: boolean;
        } = {}
    ): IVerifier<{[K in keyof V]: V[K] extends IVerifier<infer T> ? T : never}> =>
    val => {
        if (val == null || typeof val != "object")
            return {
                errors: [{message: `'${JSON.stringify(val)}' is not a valid object`}],
            };

        const errors: IErrorData[] = [];
        const out: Record<string, any> = {};
        for (let key in verifiers) {
            const verifier = verifiers[key];
            const res = verifier((val as any)[key]);
            if ("result" in res) {
                out[key] = res.result;
            } else {
                errors.push(
                    ...res.errors.map(({message, path}) => ({
                        message,
                        path: path && path.length > 0 ? key + "." + path : key,
                    }))
                );
            }
        }

        for (let key in val) {
            if (!(key in verifiers)) {
                if (allowMore) {
                    out[key] = (val as any)[key];
                } else {
                    errors.push({message: `Property '${key}' is not allowed`, path: key});
                }
            }
        }

        if (errors.length > 0) return {errors};
        return {result: out} as any;
    };

/**
 * Creates a new array verifier
 * @param verifier The verifier to applyto values of the array
 * @param config The configuration for the verifier
 * @returns The new verifier
 */
export const VArray =
    <V>(
        verifier: IVerifier<V>,
        {minLength, maxLength}: {minLength?: number; maxLength?: number} = {}
    ): IVerifier<V[]> =>
    val => {
        if (!val || !(val instanceof Array))
            return {
                errors: [{message: `'${JSON.stringify(val)}' is not a valid array`}],
            };

        const errors: IErrorData[] = [];
        const out: V[] = [];

        if (minLength != undefined && val.length < minLength)
            errors.push({message: `Should have at least ${minLength} items`});
        if (maxLength != undefined && val.length > maxLength)
            errors.push({message: `Should have at most ${maxLength} items`});

        for (let i = 0; i < val.length; i++) {
            const res = verifier(val[i]);
            if ("result" in res) {
                out.push(res.result);
            } else {
                errors.push(
                    ...res.errors.map(({message, path}) => ({
                        message,
                        path: path && path.length > 0 ? i + "." + path : i + "",
                    }))
                );
            }
        }

        if (errors.length > 0) return {errors};
        return {result: out} as any;
    };
