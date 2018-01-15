'use strict';

const mongodb = require('mongodb');
const Trie = require('./../../indexes/trie');

class VisitorStore {
    constructor(db, colName) {
        this.collection = db.collection(colName);
    }

    // Creates a new visitor in MongoDB.
    insert(visitor) {
        visitor._id = new mongodb.ObjectID();
        return this.collection.insertOne(visitor).then(() => visitor);
    }

    // Retrieves one visitor from MongoDB for a given visitor ID.
    get(id) {
        id = new mongodb.ObjectID(id);
        return this.collection.findOne({ _id: id });
    }

    // Retrieves one visitor from MongoDB for a given visitor ID and office ID.
    getOneByOfficeID(visitorID, officeID) {
        visitorID = new mongodb.ObjectID(visitorID);
        return this.collection.findOne({ _id: visitorID, officeID: officeID });
    }

    // Retrieves all visitors from MongoDB for a given office ID.
    getAllByOfficeID(officeID) {
        return this.collection
            .find({ officeID: officeID })
            .sort({ date: -1, timeIn: -1 })
            .toArray();
    }

    // For a given office ID, retrieves all visitors between two dates (inclusive).
    getBetweenDates(officeID, startDate, endDate) {
        return this.collection
            .find({
                officeID: officeID,
                date: { $gte: startDate, $lte: endDate }
            })
            .sort({
                date: -1,
                timeIn: -1
            })
            .toArray();
    }

    // Retrieves all visitors from MongoDB.
    getAll() {
        return this.collection.find({}).toArray();
    }

    // Updates a visitor for a given visitor ID.
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

    // Deletes a visitor for a given visitor ID.
    delete(id) {
        id = new mongodb.ObjectID(id);
        return this.collection.deleteOne({ _id: id });
    }

    // Deletes all visitors for a given office ID.
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
            const visitor = await this.getOneByOfficeID(visitorID, officeID);
            if (visitor) {
                results.push(visitor);
            }
        }
        return results;
    }
}

module.exports = VisitorStore;
