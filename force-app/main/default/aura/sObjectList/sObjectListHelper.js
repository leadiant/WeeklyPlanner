({
	loadMerchandise : function(component, page) {
        var action = component.get("c.getContactsV1");
        var uniqueId = component.getGlobalId() + 'external-events';
        var searchResultsEvent = $A.get("e.c:SearchResults");

        searchResultsEvent.setParams({
            "componentGlobalId": uniqueId
        });

        action.setStorable();
		var pageSize = component.get("v.pageSize");
		action.setParams({
      		"filters": JSON.stringify(component.get("v.filterObject")),
            "pageSize": pageSize,
            "pageNumber": page || 1
        });
        
        action.setCallback(this, function(res) {
            if (res.getState() === 'SUCCESS') {
                var returnValue = JSON.parse(res.getReturnValue());

                if (returnValue.isSuccess) {
                    var returnedRecords = [];

                    returnValue.results.data.items.forEach(function(record) {
                        returnedRecords.push({
                            label: record.Name,
                            sublabel: record.Account.Name,
                            value: record.Id
                        });
                    });
                    component.set('v.items', returnedRecords);
                    component.set("v.page", returnValue.results.data.page);
                    component.set("v.total", returnValue.results.data.total);
                    component.set("v.pages", Math.ceil(returnValue.results.data.total/pageSize));
                    searchResultsEvent.fire();
                }
            } else {
                //helper.setRecords(component, event, helper, []);
            }
        });

    		/*action.setCallback(this, function(response) {
			var result = response.getReturnValue();
            component.set("v.items", result.items);
            component.set("v.page", result.page);
            component.set("v.total", result.total);
            component.set("v.pages", Math.ceil(result.total/pageSize));
    		});*/
        var startTime = performance.now();
    		$A.enqueueAction(action);
    },

    getParams: function(component) {
        var object = component.get('v.object');
        var searchKey = component.get('v.searchKey');
        var pageNumber = component.get("v.requestedPage") || 1;
        var pageSize = component.get("v.pageSize");

        return {
            object: object,
            searchKey: searchKey,
            pageNumber:pageNumber,
            pageSize: pageSize
        };
    },

})