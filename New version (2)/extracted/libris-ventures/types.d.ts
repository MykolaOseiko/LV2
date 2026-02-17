declare module "javascript-opentimestamps" {
    const OpenTimestamps: {
        DetachedTimestampFile: {
            fromHash(op: any, hash: number[]): any;
        };
        Ops: {
            OpSHA256: new () => any;
        };
        stamp(detached: any): Promise<void>;
        verify(detached: any, original: any): Promise<any>;
        upgrade(detached: any): Promise<boolean>;
    };
    export default OpenTimestamps;
}
