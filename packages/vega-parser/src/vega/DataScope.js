import {ref, fieldRef, transform} from './util';

export default function DataScope(scope, entries) {
  this.scope = scope;
  this.input = ref(entries[0]);
  this.output = ref(entries[entries.length - 1]);
  this.entries = entries; // is this needed? keep for now...
}

var prototype = DataScope.prototype;

function cache(ds, name, op, field) {
  var cache = ds[name] || (ds[name] = {}),
      ref = cache[field];

  if (!ref) {
    cache[field] = ref = ds.scope.add(
      transform('Extent', {
        field: fieldRef(field),
        pulse: ds.output
      })
    );
  }
  return ref;
}

prototype.valuesRef = function(field) {
  var scope = this.scope,
      cache = this.values || (this.values = {}),
      v = cache[field], f, a;

  if (!v) {
    f = fieldRef(field);
    a = scope.add(transform('Aggregate', {groupby:f, pulse:this.output}));
    v = scope.add(transform('Values', {field:f, pulse:ref(a)}));
    cache[field] = v;
  }
  return v;
};

prototype.extentRef = function(field) {
  return cache(this, 'extent', 'Extent', field);
};

prototype.countsRef = function(field) {
  return cache(this, 'counts', 'CountIndex', field);
};

prototype.tuplesRef = function(field) {
  return cache(this, 'tuples', 'TupleIndex', field);
};