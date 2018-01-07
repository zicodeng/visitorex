'use strict';

class Trie {
    constructor() {
        this.root = new Node();
    }

    // Inserts a new key/value pair entry into the trie,
    // where the key is the word to be inserted and value is user ID.
    insert(key, id) {
        key = key.toLowerCase();
        this.root.insert(key, id);
    }

    // Retrieves a limited number of values that match any token from the trie.
    // It may return a Set or Array.
    // Use for...of to loop through them so that both data structures can be iterated.
    search(limit, tokens) {
        // A list of results containing search results for all tokens.
        const resultsList = [];

        tokens = tokens.toLowerCase().trim();
        if (!tokens) {
            return results;
        }

        // Find all prefixes we want to search by splitting the requested tokens.
        // Each token represents a prefix.
        const prefixes = tokens.split(/\s+/);

        // Search each prefix in the list and populate results.
        prefixes.forEach(prefix => {
            let curNode = this.root;
            // results is a Set that only contains unique user IDs.
            const results = new Set();

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

            resultsList.push(results);
        });

        // If results list only contains one result,
        // it implies that this is a single token search,
        // simply return the results Set in the list.
        if (resultsList.length === 1) {
            return resultsList[0];
        }

        return this.findIntersected(resultsList);
    }

    // Removes a key/value pair entry from the trie,
    // where key is a word and value is user ID.
    remove(key, value) {
        key = key.toLowerCase().trim();
        this.root.remove(key, value);
    }

    // Find intersected results in results list.
    findIntersected(resultsList) {
        let intersectedResults = new Set();

        for (let i = 0; i < resultsList.length - 1; i++) {
            if (i === 0) {
                intersectedResults = this.findCommon(
                    resultsList[0],
                    resultsList[1]
                );
                i++;
            }
            intersectedResults = this.findCommon(
                intersectedResults,
                resultsList[i]
            );
        }

        return intersectedResults;
    }

    // Find common items between two lists.
    // list1 and list2 are Set.
    findCommon(list1, list2) {
        const common = new Set();
        let shorterList = list1;
        let longerList = list2;
        if (list1.size > list2.size) {
            shorterList = list2;
            longerList = list1;
        }

        for (let item of shorterList) {
            if (longerList.has(item)) {
                common.add(item);
            }
        }

        return common;
    }
}

module.exports = Trie;

class Node {
    constructor() {
        this.values = new Set(); // stores user IDs
        this.children = new Map(); // key (char) - value (Node)
        this.parent = null; // Node
    }

    insert(key, id) {
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
        curNode.values.add(id);
    }

    search(limit, results) {
        const curNode = this;

        // Add values to results.
        if (curNode.values.size) {
            for (let id of curNode.values) {
                if (results.size === limit) {
                    return;
                }
                // Add this ID to results Set.
                results.add(id);
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
