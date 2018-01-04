'use strict';

const mongodb = require('mongodb');

class OfficeStore {
    constructor(db, colName) {
        this.collection = db.collection(colName);
    }

    // insert() creates a new office in MongoDB.
    insert(office) {
        office._id = new mongodb.ObjectID();
        return this.collection.insertOne(office).then(() => office);
    }

    // get() retrieves one office from MongoDB for a given office ID.
    get(id) {
        id = new mongodb.ObjectID(id);
        return this.collection.findOne({ _id: id });
    }

    getByName(name) {
        return this.collection.findOne({ name: name });
    }

    // getAll() retrieves all offices from MongoDB.
    getAll() {
        return this.collection.find({}).toArray();
    }

    // update() updates a office for a given office ID.
    // It returns the updated office.
    update(id, updates) {
        id = new mongodb.ObjectID(id);
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
        id = new mongodb.ObjectID(id);
        return this.collection.deleteOne({ _id: id });
    }
}

module.exports = OfficeStore;
