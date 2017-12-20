'use strict';

const mongodb = require('mongodb');

class VisitorStore {
    constructor(db, colName) {
        this.collection = db.collection(colName);
    }

    // insert() creates a new visitor in MongoDB.
    insert(visitor) {
        visitor._id = new mongodb.ObjectID();
        return this.collection.insertOne(visitor).then(() => visitor);
    }

    // get() retrieves one visitor from MongoDB for a given visitor ID.
    get(id) {
        id = new mongodb.ObjectID(id);
        return this.collection.findOne({ _id: id });
    }

    // getAll() retrieves all visitors from MongoDB for a given office ID.
    getAll(officeID) {
        officeID = new mongodb.ObjectID(officeID);
        return this.collection.find({ officeID: officeID }).toArray();
    }

    // update() updates a visitor for a given visitor ID.
    // It returns the updated visitor.
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

    // delete() deletes a visitor for a given visitor ID.
    delete(id) {
        id = new mongodb.ObjectID(id);
        return this.collection.deleteOne({ _id: id });
    }

    // deleteAll() deletes all visitors for a given office ID.
    deleteAll(officeID) {
        officeID = new mongodb.ObjectID(officeID);
        return this.collection.deleteMany({ officeID: officeID });
    }
}

module.exports = VisitorStore;
