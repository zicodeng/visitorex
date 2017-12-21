'use strict';

class Trie {
    constructor() {
        this.root = new Node();
    }

    // Inserts a new key/value pair entry into the trie,
    // where the key is the word to be inserted and value is user ID.
    insert(key, userID) {
        key = key.toLowerCase();
        this.root.insert(key, userID);
    }

    // Retrieves a limited number of values
    // that match a given prefix string from the trie.
    search(limit, prefix) {
        // results is a set that only contains unique user IDs.
        const results = new Set();

        prefix = prefix.toLowerCase().trim();
        if (!prefix) {
            return results;
        }

        let curNode = this.root;

        for (let char of prefix) {
            // If there is no child associated with that character,
            // no keys start with the prefix, so return an empty set.
            if (!curNode.children.has(char)) {
                return results;
            }
            curNode = curNode.children.get(char);
        }

        // Child node now points to the branch containing all keys
        // that start with the prefix.
        // Recurse down the branch,
        // gathering the keys and values, and return them.
        curNode.search(limit, results);
        return results;
    }

    // Removes a key/value pair entry from the trie,
    // where key is a word and value is user ID.
    remove(key, value) {
        key = key.toLowerCase().trim();
        this.root.remove(key, value);
    }
}

module.exports = Trie;

class Node {
    constructor() {
        this.values = new Set(); // stores user IDs
        this.children = new Map(); // key (char) - value (Node)
        this.parent = null; // Node
    }

    insert(key, userID) {
        let curNode = this;
        // Loop through each character in the key.
        for (let char of key) {
            // For each character
            // find the child node of current node associated with that character.
            // If there is no child node associated with that character,
            // create a new node
            // and add it to current node as a child associated with the character.
            if (!curNode.children.has(char)) {
                const node = new Node();
                curNode.children.set(char, node);
                node.parent = curNode;
            }

            // Update current node.
            curNode = curNode.children.get(char);
        }

        // Add this user ID as value to current node.
        curNode.values.add(userID);
    }

    search(limit, results) {
        const curNode = this;

        // Add values to results.
        if (curNode.values.size) {
            for (let userID of curNode.values) {
                if (results.size === limit) {
                    return;
                }
                if (!results.has(userID)) {
                    results.add(userID);
                }
            }
        }

        // Explore all children.
        if (curNode.children.size) {
            const sortedChars = [];
            for (let char of curNode.children.keys()) {
                sortedChars.push(char);
            }
            sortedChars.sort();
            sortedChars.forEach(char => {
                if (results.size === limit) {
                    return;
                }
                curNode.children.get(char).search(limit, results);
            });
        }
    }

    remove(key, value) {
        // Find the node whose value we want to remove for a given key.
        let curNode = this;
        for (let char of key) {
            if (!curNode.children.has(char)) {
                return;
            }
            curNode = curNode.children.get(char);
        }
        // Now our current node is pointing at the node want to remove.
        // Remove the value.
        curNode.values.delete(value);
        curNode.removeDanglingNodes(key, key.length - 1);
    }

    // Trace up and remove dangling nodes.
    removeDanglingNodes(key, i) {
        const curNode = this;
        // Remove the node if no other values found in the same node
        // and no child nodes are attached.
        if (i > 0 && !curNode.values.size && !curNode.children.size) {
            curNode.parent.children.delete(key.charAt(i));
            // Continue tracing up the branch.
            i--;
            curNode.parent.removeDanglingNodes(key, i);
        }
    }
}
