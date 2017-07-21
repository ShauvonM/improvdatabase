interface MongoObject {
    _id: string;
}

export class Util {

    /**
     * Returns the index of the object in the array, whether the array is an array of strings or an array of objects
     * @param array array of items to search in, either strings or objects with _id property
     * @param object item to search for, either a string or an object with _id property
     */
    static indexOfId (array: string[]|MongoObject[], object: string|MongoObject): number {
        let index = -1,
            term = (<MongoObject> object)._id ? (<MongoObject> object)._id : object;
        
        if (!array.length) {
            return index;
        } else if ((<MongoObject>array[0])._id) {
            (<MongoObject[]>array).some((o, i) => {
                if (o._id == term) {
                    index = i;
                    return true;
                }
            });
        } else {
            (<string[]>array).some((o, i) => {
                if (o == term) {
                    index = i;
                    return true;
                }
            });
        }
        return index;
    }

}