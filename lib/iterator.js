function Iterator(conditions) {
    if(conditions) {
        this.setConditions(conditions);
    }
}

Iterator.prototype.setConditions = function(conditions) {
    this.conditions = conditions;
    this.keys = Object.keys(conditions);
};

Iterator.prototype.iterate = function(callback) {
    function iterate(conditions, keys, start, scenario) {
        if(start < keys.length) {
            for(var i = 0, l = conditions[keys[start]].length; i < l; i++) {
                scenario[keys[start]] = conditions[keys[start]][i];
                iterate(conditions, keys, start + 1, scenario);
            }
        } else {
            callback(scenario);
            return;
        }
    }
    
    iterate(this.conditions, this.keys, 0, {});
};

module.exports = Iterator;