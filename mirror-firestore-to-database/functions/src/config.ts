

/**
 * Config
 *
 * Configurations for the extension project.
 */
export class Config {
    // Debug mode. Set to false to disable logging.
    static debug = true;

    // Default cloud functions server region if not specified in the environment.
    static region = "asia-southeast1";

    static collection: string = process.env.COLLECTION || 'tmp';
    static fields: string = process.env.FIELDS || 'name,name_lower_case,age,gender';
    static databasePath: string = process.env.DATABASE_PATH || 'tmp-mirrored';


    static json(): Record<string, any> {
        return {
            collection: this.collection,
            fields: this.fields,
            databasePath: this.databasePath,
        };
    }


    /**
     * Leave log messages in the console if debug is true.
     * @param {string} message message to log
     * @param {any} optionalParams optional parameters to log
     */
    static log(message: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...optionalParams: any[]) {
        if (Config.debug) {
            console.log(message, ...optionalParams);
        }
    }


}

