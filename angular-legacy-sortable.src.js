/* eslint-disable */
/**
 * @author RubaXa <trash@rubaxa.org>
 * @licence MIT
 */


  /**
   * @typedef   {Object}        ngSortEvent
   * @property  {*}             model      List item
   * @property  {Object|Array}  models     List of items
   * @property  {number}        oldIndex   before sort
   * @property  {number}        newIndex   after sort
   * @property  {number}        moved      element was moved from one list to another
   * @property  {number}        received   element was moved to this list
   */

import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js';

Sortable.mount(new AutoScroll());
const expando = 'Sortable:wisboo-sortable';

const wisbooSortable = angular.module('wisboo-sortable', []);
wisbooSortable.constant('wisbooSortableVersion', '1.1');
wisbooSortable.constant('wisbooSortableConfig', {});
wisbooSortable.directive('wisbooSortable', [
  '$parse', 'wisbooSortableConfig',
  function ($parse, config) {
    let removed;
    let nextSibling;

    return {
      restrict: 'A',
      scope: {
        wisbooSortable: '=?',
        collection: '=ngModel'
      },
      link: function (scope, $el) {
        const el = $el[0];
        const options = angular.extend(scope.wisbooSortable || {}, config);
        let watchers = [];
        let offDestroy;
        let sortable;

        el[expando] = scope.collection;

        function _emitEvent(/**Event*/evt, /*Mixed*/item) {
          const name = 'on' + evt.type.charAt(0).toUpperCase() + evt.type.substr(1);
          const source = scope.collection;

          /* jshint expr:true */
          options[name] && options[name]({
            model: item || source[evt.newIndex],
            models: source,
            oldIndex: evt.oldIndex,
            newIndex: evt.newIndex,
            moved: evt.from !== evt.to,
            received: evt.to === el,
            originalEvent: evt
          });
        }

        function _sync(/**Event*/evt) {
          const items = scope.collection;

          if (!items) {
            return;
          }

          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;

          if (el !== evt.from) {
            const prevItems = evt.from[expando];

            removed = prevItems[oldIndex];

            prevItems.splice(oldIndex, 1);
            items.splice(newIndex, 0, removed);

            evt.from.insertBefore(evt.item, nextSibling); // revert element
          }
          else {
            items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);

            // move ng-repeat comment node to right position
            if (nextSibling.nodeType === Node.COMMENT_NODE) {
              evt.from.insertBefore(nextSibling, evt.item.nextSibling);
            }
          }

          scope.$apply();
        }

        function _destroy() {
          offDestroy();

          angular.forEach(watchers, function (/** Function */unwatch) {
            unwatch();
          });

          sortable.destroy();

          el[expando] = null;
          el = null;
          watchers = null;
          sortable = null;
          nextSibling = null;
        }


        // Initialization
        sortable = Sortable.create(el, Object.keys(options).reduce(function (opts, name) {
          opts[name] = opts[name] || options[name];
          return opts;
        }, {
          onStart: function (/**Event*/evt) {
            nextSibling = evt.from === evt.item.parentNode ? evt.item.nextSibling : evt.clone.nextSibling;
            _emitEvent(evt);
            scope.$apply();
          },
          onEnd: function (/**Event*/evt) {
            _emitEvent(evt, removed);
            scope.$apply();
          },
          onAdd: function (/**Event*/evt) {
            _sync(evt);
            _emitEvent(evt, removed);
            scope.$apply();
          },
          onUpdate: function (/**Event*/evt) {
            _sync(evt);
            _emitEvent(evt);
          },
          onRemove: function (/**Event*/evt) {
            _emitEvent(evt, removed);
          },
          onSort: function (/**Event*/evt) {
            _emitEvent(evt);
          }
        }));

        // watch for collection
        watchers.push(scope.$watch('collection', function (newCollection) {
          el[expando] = scope.collection;
        }));

        // Create watchers for `options`
        angular.forEach([
          'sort', 'disabled', 'draggable', 'handle', 'animation', 'group', 'ghostClass', 'filter',
          'onStart', 'onEnd', 'onAdd', 'onUpdate', 'onRemove', 'onSort', 'onMove', 'onClone', 'setData'
        ], function (name) {
          watchers.push(scope.$watch('wisbooSortable.' + name, function (value) {
            if (value !== void 0) {
              options[name] = value;

              if (!/^on[A-Z]/.test(name)) {
                sortable.option(name, value);
              }
            }
          }));
        });

        offDestroy = scope.$on('$destroy', _destroy);
      }
    };
  }
]);
export default wisbooSortable;
