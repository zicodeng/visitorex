'use strict';

const mongodb = require('mongodb');

class OfficeStore {
    constructor(db, colName) {
        this.colName = db.collection(colName);
    }

    // insert() creates a new office in MongoDB.
    insert(office) {
        office._id = new mongodb.ObjectID();
        return this.collection.insertOne(office).then(() => office);
    }

    // get() retrieves one office from MongoDB for a given office ID.
    get(id) {
        return this.collection.findOne({ _id: id });
    }

    // getAll() retrieves all offices from MongoDB.
    getAll() {
        return this.collection.find({}).toArray();
    }

    // update() updates a office for a given office ID.
    // It returns the updated office.
    update(id, updates) {
        let updateDoc = {
            $set: updates
        };
        return this.collection
            .findOneAndUpdate({ _id: id }, updateDoc, { returnOriginal: false })
            .then(result => {
                return result.value;
            });
    }

    // delete() deletes a office for a given office ID.
    delete(id) {
        return this.collection.deleteOne({ _id: id });
    }
}

module.exports = OfficeStore;
