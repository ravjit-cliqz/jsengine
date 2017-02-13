
var webRequest = {
    onBeforeRequest: {
        listeners: [],
        addListener: function(listener, filter, extraInfo) {
          this.listeners.push({fn: listener, filter: filter, extraInfo: extraInfo});
        },
        removeListener: function(listener) {
          const ind = this.listeners.findIndex(function(l) {
            return l.fn === listener;
          });
          if (ind > -1) {
            this.listeners.splice(ind, 1);
          }
        },

        _triggerJson: function(requestInfoJson) {
          const requestInfo = JSON.parse(requestInfoJson);
          try {
              const response = webRequest.onBeforeRequest._trigger(requestInfo) || {};
              return JSON.stringify(response);
          } catch(e) {
            console.error('webrequest trigger error', e);
          }
        },

        _trigger: function(requestInfo) {
          // getter for request headers
          requestInfo.getRequestHeader = function(header) {
            return requestInfo.requestHeaders[header];
          };
          var returnBlockingResponse = {};
          this.listeners.forEach(function(listener) {
            const fn = listener.fn;
            const filter = listener.filter;
            const extraInfo = listener.extraInfo;
            const blockingResponse = fn(requestInfo);
            if (blockingResponse && Object.keys(blockingResponse).length > 0) {
                    returnBlockingResponse = blockingResponse;
                    return;
            }
          });
          return returnBlockingResponse;
        }
      },

      onBeforeSendHeaders: {
        addListener: function(listener, filter, extraInfo) {},
        removeListener: function(listener) {}
      },

      onHeadersReceived: {
        addListener: function(listener, filter, extraInfo) {},
        removeListener: function(listener) {}
      }
}
