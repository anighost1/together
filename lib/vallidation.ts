import { ZodObject } from 'zod';

const validation = <T extends ZodObject<any>>(data: any, schema: T): T['_output'] => {
    const result = schema.safeParse(data);

    if (result.success) {
        return result.data as T['_output'];
    } else {
        const errorMessages = result.error.errors.map((err) => {
            return `${err.path.join('.')}: ${err.message}`;
        });
        throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
};

export default validation