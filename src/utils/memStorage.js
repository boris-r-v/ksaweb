/**
 * memStorage - localStorage-like object for storing data in memory (not persistent)
 */
export default {
    create: function () {
        const storage = {

        }
        return {
            getItem: function (key) {
                return storage[key]
            },
            setItem: function (key, value) {
                storage[key] = value;
            },
            removeItem: function (key) {
                delete storage[key];
            }
        }
    }
}