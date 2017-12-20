// @ts-check
'use strict';

const mongodb = require('mongodb');
const express = require('express');

const Office = require('./../models/offices/office');
const Visitor = require('./../models/visitors/visitor');

const Utils = require('./utils');
const MQ = require('./message-queue');

const OfficeHandler = (officeStore, visitorStore) => {
    if (!officeStore || !visitorStore) {
        throw new Error('No office and/or visitor store found');
    }

    const breakSignal = Utils.breakSignal

    const messageType = {
        officeNew: 'OfficeNew',
        officeUpdate: 'OfficeUpdate',
        officeDelete: 'OfficeDelete',
        visitorNew: 'VisitorNew'
    };

    const router = express.Router();

    // Respond with the list of all offices.
    router.get('/v1/offices', (req, res) => {
        officeStore.getAll()
            .then(offices => {
                res.json(offices);
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Create a new office.
    router.post('/v1/offices', (req, res) => {
        const name = req.body.name.trim();
        const addr = req.body.addr.trim();
        if (!name || !addr) {
            res.set('Content-Type', 'text/plain');
            res.status(400)
                .send('No office name or address found in the request body');
            return;
        }

        const userJSON = req.get('X-User');
        const user = JSON.parse(userJSON);

        const office = new Office(name, addr, user);

        officeStore
            .insert(office)
            .then(office => {
                res.json(office);
                const message = {
                    type: messageType.officeNew,
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
        const officeID = new mongodb.ObjectID(req.params.officeID);
        visitorStore
            .getAll(officeID)
            .then(visitors => {
                res.json(visitors);
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Create a new visitor in this office.
    router.post('/v1/offices/:officeID', (req, res) => {
        const officeID = new mongodb.ObjectID(req.params.officeID);
        if (!officeID) {
            res.set('Content-Type', 'text/plain');
            res
                .status(400)
                .send('No office ID found in params');
            return;
        }

        const name = req.body.name.trim();
        const company = req.body.company.trim();
        const toSee = req.body.toSee.trim();

        if (!name || !company || !toSee) {
            res.set('Content-Type', 'text/plain');
            res
                .status(400)
                .send('No visitor name, company, or toSee found in the request body');
            return;
        }

        // Automatically assigns current date when a new visitor checks in.
        const date = new Date();
        const visitDate = date.toLocaleDateString();
        const visitTime = date.toLocaleTimeString();

        const visitor = new Visitor(
            officeID,
            name,
            company,
            toSee,
            visitDate,
            visitTime
        );

        visitorStore
            .insert(visitor)
            .then(newVisitor => {
                res.json(newVisitor);
                const message = {
                    type: messageType.visitorNew,
                    visitor: newVisitor
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
        const officeID = new mongodb.ObjectID(req.params.officeID);
        officeStore
            .get(officeID)
            .then(office => {
                if (!office) {
                    res.set('Content-Type', 'text/plain');
                    res
                        .status(400)
                        .send('No such office found');
                    throw breakSignal;
                }
                // If the current user isn't the creator,
                // respond with the status code 403 (Forbidden).
                if (!office.creator || office.creator.id !== user.id) {
                    res.set('Content-Type', 'text/plain');
                    res
                        .status(403)
                        .send('Only office creator can modify this office');
                    throw breakSignal;
                }
                return;
            })
            .then(() => {
                const name = req.body.name.trim();
                const addr = req.body.addr.trim();
                if (!name || !addr) {
                    res.set('Content-Type', 'text/plain');
                    res
                        .status(400)
                        .send('No office name or address found in the request body');
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
                res.json(updatedOffice);
                const message = {
                    type: messageType.officeUpdate,
                    office: updatedOffice
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
        const officeID = new mongodb.ObjectID(req.params.officeID);
        officeStore
            .get(officeID)
            .then(office => {
                if (!office) {
                    res.set('Content-Type', 'text/plain');
                    res.status(400).send('No such office found');
                    throw breakSignal;
                }
                if (!office.creator || office.creator.id !== user.id) {
                    res.set('Content-Type', 'text/plain');
                    res
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
                res.set('Content-Type', 'text/plain');
                res.status(200).send('Office deleted');
                const message = {
                    type: messageType.officeDelete,
                    officeID: officeID
                };
                MQ.sendToVisitorQueue(req, message)
            })
            .catch(err => {
                if (err !== breakSignal) {
                    console.log(err);
                }
            });
    });

    return router;
};

module.exports = OfficeHandler;
