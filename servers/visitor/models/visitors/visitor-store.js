'use strict';

const mongodb = require('mongodb');
const Trie = require('./../../indexes/trie');

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

    // Retrieves one visitor from MongoDB for a given visitor ID and office ID.
    getByOfficeID(visitorID, officeID) {
        visitorID = new mongodb.ObjectID(visitorID);
        return this.collection.findOne({ _id: visitorID, officeID: officeID });
    }

    // getAllByOfficeID retrieves all visitors from MongoDB for a given office ID.
    getAllByOfficeID(officeID) {
        console.log(officeID);
        return this.collection.find({ officeID: officeID }).toArray();
    }

    // getAll retrieves all visitors from MongoDB.
    getAll() {
        return this.collection.find({}).toArray();
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

    // Insert all existing visitors into the Trie on server start-up.
    async index() {
        const visitorTrie = new Trie();
        const visitors = await this.getAll();
        visitors.forEach(visitor => {
            visitorTrie.insert(visitor.firstName, visitor._id);
            visitorTrie.insert(visitor.lastName, visitor._id);
            visitorTrie.insert(visitor.company, visitor._id);
            visitorTrie.insert(visitor.toSee, visitor._id);
            visitorTrie.insert(visitor.date, visitor._id);
        });
        return visitorTrie;
    }

    // Given a list of visitor IDs, convert them to visitor objects for a given office ID.
    async convertToVisitors(visitorIDs, officeID) {
        const results = [];
        for (let visitorID of visitorIDs) {
            const visitor = await this.getByOfficeID(visitorID, officeID);
            if (visitor) {
                results.push(visitor);
            }
        }
        return results;
    }
}

module.exports = VisitorStore;
