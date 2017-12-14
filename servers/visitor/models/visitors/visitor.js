'use strict';

class Visitor {
    constructor(officeID, name, company, toSee, date, timeIn) {
        this.officeID = officeID;
        this.name = name;
        this.company = company;
        this.toSee = toSee;
        this.date = date;
        this.timeIn = timeIn;
    }
}

module.exports = Visitor;
