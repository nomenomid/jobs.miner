/* globals MutationObserver setImmediate PromiseKeeper */

(function(global) {
    var PENDING;
    var FULFILLED = true;
    var REJECTED = false;
    
    Function.prototype.once = function(ctx) {
        var func = this, called = false;
        return function() {
            if(!called) (called = true, func.apply(ctx || this, arguments));    
        };
    };
    
    function execute(func) {
        if(typeof MutationObserver !== "undefined") {
            var div = document.createElement("div");
            var mo = new MutationObserver(func);
            mo.observe(div, {attributes: true});
            div.setAttribute("a", 0);
        } else if(typeof process.nextTick === "function") {
            process.nextTick(func);
        } else if(typeof setImmediate === "function") {
            setImmediate(func);
        } else {
            setTimeout(func, 0);
        }
    }
    
    function resolveRequest(request, value) {
        if(typeof request.resolver === "function") {
            try {
                var result = request.resolver.call(undefined, value);
                request.promise.resolve(result);
            } catch(err) {
                request.promise.reject(err);
            }
        } else {
            request.promise.resolve(value);
        }
    }
    
    function rejectRequest(request, reason) {
        if(typeof request.rejecter === "function") {
            try {
                var result = request.rejecter.call(undefined, reason);
                request.promise.resolve(result);
            } catch(err) {
                request.promise.reject(err);
            }
        } else {
            request.promise.reject(reason);
        }
    }
    
    function PromiseKeeper(func) {
        if(func) {
            func(this.resolve.bind(this), this.reject.bind(this));
        }
    }
    
    PromiseKeeper.prototype.resolve = function(value) {
        if(this.state !== PENDING) return;
        if(value === this) 
            return this.reject(new TypeError("resolving promise with itself"));
        
        if(value instanceof PromiseKeeper) {
            try {
                value.then(function(value) {
                    this.resolve(value);
                }.once(this), function(reason) {
                    this.reject(reason);
                }.once(this));
                return;
            } catch(e) {
                this.reject(e);
                return;
            }
        }
        
        this.state = FULFILLED;
        this.value = value;
        
        if(this.requests) {
            execute(function() {
                for(var i = 0, l = this.requests.length; i < l; resolveRequest(this.requests[i++], value));
            }.bind(this));
        }
    };
    
    PromiseKeeper.prototype.reject = function(reason) {
        if(this.state !== PENDING) return;
        
        this.state = REJECTED;
        this.value = reason;
        
        if(this.requests) {
            execute(function() {
                for(var i = 0, l = this.requests.length; i < l; rejectRequest(this.requests[i++], reason));
            }.bind(this));
        } else if(!PromiseKeeper.blockErrors) {
            console.log("A handler for rejection is missing");
        }
    };
    
    PromiseKeeper.prototype.then = function(resolver, rejecter) {
        var promise = new PromiseKeeper();
        
        var request = {
            resolver: resolver,
            rejecter: rejecter,
            promise: promise
        };
        
        if(this.state === PENDING) {
            (this.requests || (this.requests = [])).push(request);
        } else {
            execute(function() {
                this.state === FULFILLED ? resolveRequest(request, this.value) : rejectRequest(request, this.value);
            }.bind(this));
        }
        
        return promise;
    };
    
    PromiseKeeper.prototype.catch = function(errorFunc) {
        this.then(null, errorFunc);
    };
    
    PromiseKeeper.resolve = function(value) {
        var promise = new PromiseKeeper();
        promise.resolve(value);
        return promise;
    };
    
    PromiseKeeper.reject = function(reason) {
        var promise = new PromiseKeeper();
        promise.reject(reason);
        return promise;
    };
    
    PromiseKeeper.race = function() {
        
    };
    
    PromiseKeeper.all = function(promises) {
        var results = [];
        var promiseCounter = 0;
        var supervisor = new PromiseKeeper();
        
        if(typeof promises === "undefined" || !promises.length) {
            supervisor.resolve(results);
        }
        
        function resolvePromise(promise, index) {
            promise.then(function(value) {
                results[index] = value;
                if(promises.length === ++promiseCounter) {
                    supervisor.resolve(results);
                }
            }, supervisor.reject.bind(supervisor));
        }
        
        for(var i = 0, l = promises.length; i < l; resolvePromise(promises[i], i++));
        
        return supervisor;
    };
    
    PromiseKeeper.sequence = function(promiseBodies) {
        var results = [];
        var current;
        var supervisor = new PromiseKeeper();
        
        if(typeof promiseBodies === "undefined" || !promiseBodies.length) {
            supervisor.resolve(results);
            return supervisor;
        } 
        
        function activatePromise(index) {
            current.then(function(value) {
                results[index] = value;
                if(index < promiseBodies.length - 1) {
                    current = new PromiseKeeper(promiseBodies[index + 1]);
                    activatePromise(index + 1);
                } else {
                    supervisor.resolve(results);
                }
            }, supervisor.reject.bind(supervisor));
        }
        
        current = new PromiseKeeper(promiseBodies[0]);
        activatePromise(0);
        
        return supervisor;
    };
    
    global.PromiseKeeper = PromiseKeeper;
})(typeof global !== "undefined" ? global : this);