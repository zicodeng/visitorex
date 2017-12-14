// A signal indicating that the promise should break here.
class BreakSignal {}

module.exports = {
    breakSignal: new BreakSignal()
};
