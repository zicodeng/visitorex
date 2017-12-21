// A signal indicating that the promise should break here.
class BreakSignal {}

module.exports = {
    breakSignal: new BreakSignal(),
    convertToID: toBeConverted => {
        if (Array.isArray(toBeConverted)) {
            const list = [];
            toBeConverted.forEach(obj => {
                list.push(convertOneToID(obj));
            });
            return list;
        }
        return convertOneToID(toBeConverted);
    }
};

const convertOneToID = obj => {
    const newObj = obj;
    newObj.id = obj._id;
    delete newObj._id;
    return newObj;
};
