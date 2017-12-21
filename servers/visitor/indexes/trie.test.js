'use strict';

const Trie = require('./trie');
const mongodb = require('mongodb');

let trie;

describe('Trie Search', () => {
    const cases = [
        {
            name: 'Keys with shared prefix',
            keys: ['do', 'dog', 'dope', 'door', 'desk', 'cat'],
            prefix: 'do',
            limit: 20,
            expectedResultCount: 4
        },
        {
            name: 'Keys with no shared prefix',
            keys: ['love', 'big', 'small'],
            prefix: 'b',
            limit: 20,
            expectedResultCount: 1
        },
        {
            name: 'Empty prefix',
            keys: ['love', 'big', 'small'],
            prefix: '',
            limit: 20,
            expectedResultCount: 0
        },
        {
            name: 'Empty trie',
            keys: [],
            prefix: '',
            limit: 20,
            expectedResultCount: 0
        },
        {
            name: 'Exceeds results limit',
            keys: ['do', 'dog', 'dope', 'door', 'desk', 'cat'],
            prefix: 'd',
            limit: 3,
            expectedResultCount: 3
        },
        {
            name: 'Duplicated keys',
            keys: ['dog', 'dog', 'dog', 'door', 'desk', 'cat'],
            prefix: 'do',
            limit: 4,
            expectedResultCount: 4
        },
        {
            name: 'Duplicated keys with results limit',
            keys: ['dog', 'dog', 'dog', 'door', 'desk', 'cat'],
            prefix: 'do',
            limit: 2,
            expectedResultCount: 2
        },
        {
            name: 'Different casting',
            keys: ['Dog', 'DOG', 'dog', 'door', 'deSk', 'cat'],
            prefix: 'd',
            limit: 20,
            expectedResultCount: 5
        }
    ];

    beforeEach(() => {
        // Create a new Trie each time.
        trie = new Trie();
    });

    cases.forEach(c => {
        test(c.name, () => {
            c.keys.forEach(key => {
                trie.insert(key, new mongodb.ObjectID());
            });
            const results = trie.search(c.limit, c.prefix);
            expect(results.size).toBe(c.expectedResultCount);
        });
    });

    // A Trie might store identical user ID but with different keys.
    test('Different keys have same values', () => {
        const keys = ['dog', 'do', 'dope'];
        const prefix = 'do';
        const limit = 20;
        const expectedResultCount = 1;
        const userID = new mongodb.ObjectID();
        keys.forEach(key => {
            trie.insert(key, userID);
        });
        const results = trie.search(limit, prefix);
        expect(results.size).toBe(expectedResultCount);
    });
});

const values = [
    new mongodb.ObjectID(),
    new mongodb.ObjectID(),
    new mongodb.ObjectID(),
    new mongodb.ObjectID(),
    new mongodb.ObjectID()
];

const limit = 20;

describe('Trie Remove', () => {
    const cases = [
        {
            name: 'Target node has child nodes',
            keys: ['dog', 'do', 'dope', 'cat'],
            key: 'do',
            value: values[1],
            expectedResultCount: 2
        },
        {
            name: 'Target node has no child nodes',
            keys: ['dog', 'do', 'dope', 'cat'],
            key: 'dog',
            value: values[0],
            expectedResultCount: 0
        },
        {
            name: 'Target node has multiple values',
            keys: ['do', 'do', 'do', 'dog', 'dope'],
            key: 'do',
            value: values[0],
            expectedResultCount: 4
        },
        {
            name: 'Case-insensitive remove',
            keys: ['do', 'do', 'do', 'dog', 'dope'],
            key: 'do',
            value: values[0],
            expectedResultCount: 4
        },
        {
            name: 'Remove empty key',
            keys: ['do', 'dooog'],
            key: '',
            value: values[0],
            expectedResultCount: 0
        },
        {
            name: 'Empty trie',
            keys: [],
            key: 'do',
            value: values[1],
            expectedResultCount: 0
        }
    ];

    beforeEach(() => {
        // Create a new Trie each time.
        trie = new Trie();
    });

    cases.forEach(c => {
        test(c.name, () => {
            c.keys.forEach((key, i) => {
                trie.insert(key, values[i]);
            });
            trie.remove(c.key, c.value);
            const results = trie.search(limit, c.key);
            expect(results.size).toBe(c.expectedResultCount);
        });
    });
});

describe('Trie Remove Dangling Nodes', () => {
    const cases = [
        {
            name: 'Remove the key together with its node',
            keys: ['do', 'dog'],
            keyToBeRemoved: 'dog',
            valueToBeRemoved: values[1],
            testKey: 'do',
            expectedChildrenCount: 0
        },
        {
            name: 'Remove multiple dangling nodes',
            keys: ['do', 'dooog'],
            keyToBeRemoved: 'dooog',
            valueToBeRemoved: values[1],
            testKey: 'do',
            expectedChildrenCount: 0
        },
        {
            name:
                'Remove multiple dangling nodes when parent node has multiple child nodes',
            keys: ['do', 'dooog', 'dot', 'dog'],
            keyToBeRemoved: 'dooog',
            valueToBeRemoved: values[1],
            testKey: 'do',
            expectedChildrenCount: 2
        }
    ];

    beforeEach(() => {
        // Create a new Trie each time.
        trie = new Trie();
    });

    cases.forEach(c => {
        test(c.name, () => {
            c.keys.forEach((key, i) => {
                trie.insert(key, values[i]);
            });
            trie.remove(c.keyToBeRemoved, c.valueToBeRemoved);

            // Find the node pointing to the last character in the test key.
            let curNode = trie.root;
            for (let char of c.testKey) {
                expect(curNode.children.get(char)).not.toBeNull();
                curNode = curNode.children.get(char);
            }
            expect(curNode.children.size).toBe(c.expectedChildrenCount);
        });
    });
});
