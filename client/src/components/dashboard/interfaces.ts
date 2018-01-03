export interface Visitor {
    id: string;
    officeID: string;
    firstName: string;
    lastName: string;
    company: string;
    toSee: string;
    date: string;
    timeIn: string;
}

export interface Office {
    id: string;
    name: string;
    addr: string;
    creator: any;
    visitors: Visitor[];
}
