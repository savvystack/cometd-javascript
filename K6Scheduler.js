// Build a fully compliant scheduler on top of k6 websocket's setTimeout()
// K6's websocket 1) doesn't return an ID, and 2) doesn't support clearTimeout()
// Therefore we need to manage our own IDs and whether they are still in-force

export default function(k6Socket) {
    var _ids = 0;
    var _tasks = {};
    var _nextTimerId = 0;
    var _timerEnabled = {};

    this.register = function(funktion) {
        var id = ++_ids;
        _tasks[id] = funktion;
        return id;
    };
    this.unregister = function(id) {
        var funktion = _tasks[id];
        delete _tasks[id];
        return funktion;
    };
    this.setTimeout = function(funktion, delay) {
        var timerId = _nextTimerId ++;        
        k6Socket.setTimeout(function() {
            console.log(`Timer fired: id=${timerId}, state=${_timerEnabled[timerId]}`);
            if (_timerEnabled[timerId])
                funktion();
            delete _timerEnabled[timerId];
            console.log(JSON.stringify(_timerEnabled, 2, null))
        }, delay);
        _timerEnabled[timerId] = true;

        console.log(`setTimeout: id=${timerId}, delay=${delay}`);
        return timerId;
    };
    this.clearTimeout = function(id) {
        _timerEnabled[id] = false;
        console.log(`clearTimeout: id=${id}`);
    };
};