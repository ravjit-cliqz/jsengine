System.register("antitracking/fixed-size-cache", [], function (_export) {
  "use strict";

  /* Fixed length lookup cache. Allows expensive operations to be cached for later lookup. Once
   * the cache limit is exceeded, least recently used values are removed.
   */

  var _default, LRU;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  return {
    setters: [],
    execute: function () {
      _default = (function () {

        /* @param {function} buildValue - used to build a new value from key in case of cache miss.
         * @param {number} size - maximum elements stored in cache.
         * @param {function} buildKey - [Optional] used to extract key from argument.
         */

        function _default(buildValue, size, buildKey) {
          _classCallCheck(this, _default);

          this._buildValue = buildValue;
          this._buildKey = buildKey;
          this._maxKeySize = 1000;

          // Statistics
          this._hitCounter = 0;
          this._missCounter = 0;

          this.lru = new LRU(size);
        }

        /* Try to retrieve the value associated with `key` from the cache. If it's
         * not present, build it using `buildValue` and store it in the cache.
         *
         * This method always returns a value either from the LRU cache, or from a
         * direct call to `buildValue`.
         */

        _createClass(_default, [{
          key: "get",
          value: function get(argument) {
            var key = this._buildKey ? this._buildKey(argument) : argument;
            var value = this.lru.get(key);

            if (value !== undefined) {
              // Cache hit
              this._hitCounter++;
              return value;
            } else {
              // Cache miss
              this._missCounter++;

              // Compute value
              value = this._buildValue(argument);

              // if key is large, don't cache
              if (!key || key.length > this._maxKeySize) {
                return value;
              }

              this.lru.set(key, value);
              return value;
            }
          }
        }]);

        return _default;
      })();

      _export("default", _default);

      LRU = (function () {
        function LRU(size) {
          var _this = this;

          _classCallCheck(this, LRU);

          this.maxSize = size;

          // LRU structure
          this.reset = function () {
            _this.cache = new Map();
            _this.head = null;
            _this.tail = null;
            _this.size = 0;
          };
          this.reset();
        }

        /* Retrieve value associated with `key` from cache. If it doesn't
         * exist, return `undefined`, otherwise, update position of the
         * entry to "most recent seen".
         *
         * @param key - Key of value we want to get.
         */

        _createClass(LRU, [{
          key: "get",
          value: function get(key) {
            var node = this.cache.get(key);

            if (node) {
              this._touch(node);
              return node.value;
            } else {
              return undefined;
            }
          }

          /* Associate a new `value` to `key` in cache. If `key` isn't already
           * present in cache, create a new node at the position "most recent seen".
           * Otherwise, change the value associated with `key` and refresh the
           * position of the entry to "most recent seen".
           *
           * @param key   - Key add to the cache.
           * @param value - Value associated with key.
           */
        }, {
          key: "set",
          value: function set(key, value) {
            var node = this.cache.get(key);

            if (node) {
              // Hit - update value
              node.value = value;
              this._touch(node);
            } else {
              // Miss - Create a new node
              node = this._newNode(key, value);

              // Forget about oldest node
              if (this.size >= this.maxSize) {
                this.cache["delete"](this.tail.key);
                this._remove(this.tail);
              }

              this.cache.set(key, node);
              this._pushFront(node);
            }
          }

          // Private interface (Linked List)

          /* Create a new node (key, value) to store in the cache */
        }, {
          key: "_newNode",
          value: function _newNode(key, value) {
            return {
              "prev": null,
              "next": null,
              "key": key,
              "value": value
            };
          }

          /* Refresh timestamp of `node` by moving it to the front of the list.
           * It the becomes the (key, value) seen most recently.
           */
        }, {
          key: "_touch",
          value: function _touch(node) {
            this._remove(node);
            this._pushFront(node);
          }

          /* Remove `node` from the list. */
        }, {
          key: "_remove",
          value: function _remove(node) {
            if (node) {
              // Update previous node
              if (node.prev === null) {
                this.head = node.next;
              } else {
                node.prev.next = node.next;
              }

              // Update next node
              if (node.next === null) {
                this.tail = node.prev;
              } else {
                node.next.prev = node.prev;
              }

              this.size--;
            }
          }

          /* Add `node` in front of the list (most recent element). */
        }, {
          key: "_pushFront",
          value: function _pushFront(node) {
            if (node) {
              // Replace first node of the list
              node.prev = null;
              node.next = this.head;

              if (this.head !== null) {
                this.head.prev = node;
              }

              this.head = node;

              // Case: List was empty
              if (this.tail === null) {
                this.tail = node;
              }

              this.size++;
            }
          }
        }]);

        return LRU;
      })();
    }
  };
});