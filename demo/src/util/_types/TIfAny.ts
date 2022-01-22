// https://stackoverflow.com/a/55541672/8521718
export type TIfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
