'use strict';

class Visitor {
    constructor(officeID, firstName, lastName, company, toSee, date, timeIn) {
        this.officeID = officeID;
        this.firstName = firstName;
        this.lastName = lastName;
        this.company = company;
        this.toSee = toSee;
        this.date = date;
        this.timeIn = timeIn;
    }
}

module.exports = Visitor;
