'use strict';

class Visitor {
    constructor(officeID, name, company, toSee) {
        this.officeID = officeID;
        this.name = name;
        this.company = company;
        this.toSee = toSee;
    }
}

module.exports = Visitor;
