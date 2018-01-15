// @ts-check
'use strict';

const moment = require('moment');
const express = require('express');

const Office = require('./../models/offices/office');
const Visitor = require('./../models/visitors/visitor');

const Utils = require('./utils');
const MQ = require('./message-queue');

const OfficeHandler = (officeStore, visitorStore, visitorTrie) => {
    if (!officeStore || !visitorStore || !visitorTrie) {
        throw new Error(
            'No office store, visitor store, or visitor Trie found'
        );
    }

    const breakSignal = Utils.breakSignal;

    const messageType = {
        newOffice: 'NEW_OFFICE_NOTIFICATION',
        updateOffice: 'UPDATE_OFFICE_NOTIFICATION',
        deleteOffice: 'DELETE_OFFICE_NOTIFICATION',
        newVisitor: 'NEW_VISITOR_NOTIFICATION'
    };

    const router = express.Router();

    // Respond with the list of all offices.
    router.get('/v1/offices', (req, res) => {
        officeStore
            .getAll()
            .then(offices => {
                offices = Utils.convertToID(offices);
                res.json(offices);
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Create a new office.
    router.post('/v1/offices', (req, res) => {
        let name = req.body.name;
        let addr = req.body.addr;
        if (!name || !addr) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No office name or address found in the request body');
            return;
        }

        name = name.trim();
        addr = addr.trim();

        if (!name || !addr) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('Office name or address has length of zero');
            return;
        }

        const userJSON = req.get('X-User');
        const user = JSON.parse(userJSON);

        const office = new Office(name, addr, user);

        officeStore
            .getByName(name)
            .then(existingOffice => {
                if (existingOffice && existingOffice.name === office.name) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send('Office with the same name already exists');
                    throw breakSignal;
                }
                return officeStore.insert(office);
            })
            .then(office => {
                office = Utils.convertToID(office);
                res.json(office);
                const message = {
                    type: messageType.newOffice,
                    payload: office
                };
                MQ.sendToVisitorQueue(req, message);
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Respond with all visitors posted to the specified office.
    router.get('/v1/offices/:officeID', (req, res) => {
        const officeID = req.params.officeID;
        if (!officeID) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No office ID found in request resource path');
            return;
        }
        // Note that we did not convert office ID to bson objectID.
        // It is just a string stored in MongoDB.

        officeStore
            .get(officeID)
            .then(office => {
                if (!office) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send('No such office found');
                    throw breakSignal;
                }
                return visitorStore.getAllByOfficeID(officeID);
            })
            .then(visitors => {
                visitors = Utils.convertToID(visitors);
                res.json(visitors);
            })
            .catch(err => {
                if (err !== breakSignal) {
                    console.log(err);
                }
            });
    });

    // Create a new visitor in this office.
    router.post('/v1/offices/:officeID', (req, res) => {
        const officeID = req.params.officeID;
        if (!officeID) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No office ID found in request resource path');
            return;
        }

        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let company = req.body.company;
        let toSee = req.body.toSee;

        if (!firstName || !lastName || !company || !toSee) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send(
                    'No visitor firstName, lastName, company, or toSee found in the request body'
                );
            return;
        }

        firstName = firstName.trim();
        lastName = lastName.trim();
        company = company.trim();
        toSee = toSee.trim();

        if (!firstName || !lastName || !company || !toSee) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send(
                    'Visitor firstName, lastName, company, or toSee has length of zero'
                );
            return;
        }

        // Automatically assigns current date when a new visitor checks in.
        moment.locale();
        const visitDate = moment().format('l');
        const visitTime = moment().format('LT');

        const visitor = new Visitor(
            officeID,
            firstName,
            lastName,
            company,
            toSee,
            visitDate,
            visitTime
        );

        officeStore
            .get(officeID)
            .then(office => {
                // Make sure this office exists in our database first
                // before insert any visitor.
                if (!office) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send('No such office found');
                    throw breakSignal;
                }
                return visitorStore.insert(visitor);
            })
            .then(newVisitor => {
                visitorTrie.insert(newVisitor.firstName, newVisitor._id);
                visitorTrie.insert(newVisitor.lastName, newVisitor._id);
                visitorTrie.insert(newVisitor.company, newVisitor._id);
                visitorTrie.insert(newVisitor.toSee, newVisitor._id);
                visitorTrie.insert(newVisitor.date, newVisitor._id);

                newVisitor = Utils.convertToID(newVisitor);
                res.json(newVisitor);
                const message = {
                    type: messageType.newVisitor,
                    payload: newVisitor
                };
                MQ.sendToVisitorQueue(req, message);
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Allow office creator to modify this office.
    router.patch('/v1/offices/:officeID', (req, res) => {
        const userJSON = req.get('X-User');
        const user = JSON.parse(userJSON);

        const officeID = req.params.officeID;
        if (!officeID) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No office ID found in request resource path');
            return;
        }

        officeStore
            .get(officeID)
            .then(office => {
                if (!office) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send('No such office found');
                    throw breakSignal;
                }

                // If the current user isn't the creator,
                // respond with the status code 403 (Forbidden).
                if (!office.creator || office.creator.id !== user.id) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(403)
                        .send('Only office creator can modify this office');
                    throw breakSignal;
                }
                return;
            })
            .then(() => {
                let name = req.body.name;
                let addr = req.body.addr;
                if (!name || !addr) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send(
                            'No office name or address found in the request body'
                        );
                    return;
                }

                name = name.trim();
                addr = addr.trim();

                if (!name || !addr) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send('Office name or address has length of zero');
                    return;
                }

                // Update office name and address.
                const updates = {
                    name: name,
                    addr: addr
                };

                return officeStore.update(officeID, updates);
            })
            .then(updatedOffice => {
                updatedOffice = Utils.convertToID(updatedOffice);
                res.json(updatedOffice);
                const message = {
                    type: messageType.updateOffice,
                    payload: updatedOffice
                };
                MQ.sendToVisitorQueue(req, message);
            })
            .catch(err => {
                if (err !== breakSignal) {
                    console.log(err);
                }
            });
    });

    // If the current user created the office, delete it along with all visitors in it.
    // If the current user isn't the creator, respond with the status code 403 (Forbidden).
    router.delete('/v1/offices/:officeID', (req, res) => {
        const userJSON = req.get('X-User');
        const user = JSON.parse(userJSON);

        const officeID = req.params.officeID;
        if (!officeID) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No office ID found in request resource path');
            return;
        }

        officeStore
            .get(officeID)
            .then(office => {
                if (!office) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(400)
                        .send('No such office found');
                    throw breakSignal;
                }

                if (!office.creator || office.creator.id !== user.id) {
                    res
                        .set('Content-Type', 'text/plain')
                        .status(403)
                        .send('Only office creator can delete this office');
                    throw breakSignal;
                }
                return;
            })
            .then(() => {
                visitorStore.deleteAll(officeID);
            })
            .then(() => {
                officeStore.delete(officeID);
            })
            .then(() => {
                res.set('Content-Type', 'text/plain').send('Office deleted');
                const message = {
                    type: messageType.deleteOffice,
                    payload: officeID
                };
                MQ.sendToVisitorQueue(req, message);
            })
            .catch(err => {
                if (err !== breakSignal) {
                    console.log(err);
                }
            });
    });

    // Search visitors in this office.
    router.get('/v1/offices/:officeID/search', (req, res) => {
        const officeID = req.params.officeID;
        if (!officeID) {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No office ID found in request resource path');
            return;
        }

        const q = req.query.q;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        if (q) {
            searchVisitorsByQuery(q);
        } else if (startDate && endDate) {
            searchVisitorsBetweenTwoDates(startDate, endDate);
        } else {
            res
                .set('Content-Type', 'text/plain')
                .status(400)
                .send('No query string named q, date found in request');
        }

        function searchVisitorsByQuery(query) {
            const limit = 25;
            const visitorIDs = visitorTrie.search(limit, q);

            visitorStore
                .convertToVisitors(visitorIDs, officeID)
                .then(visitors => {
                    res.json(visitors);
                });
        }

        function searchVisitorsBetweenTwoDates(startDate, endDate) {
            visitorStore
                .getBetweenDates(officeID, startDate, endDate)
                .then(visitors => {
                    res.json(visitors);
                });
        }
    });

    return router;
};

module.exports = OfficeHandler;
