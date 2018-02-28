({
	loadRecords : function(component) {
        var helper = this;
        var action = component.get("c.getRecords");
        var uniqueId = component.getGlobalId() + 'external-events';
        var searchResultsAvailableEvent = $A.get("e.c:searchResultsAvailable");
        var returnedRecords = [];

        searchResultsAvailableEvent.setParams({
            "componentGlobalId": uniqueId
        });

        action.setParams({
            jsonString: JSON.stringify(helper.getParams(component, event, helper))
        });

        action.setStorable();
		var pageSize = component.get("v.pageSize");

        action.setCallback(this, function(res) {
            if (res.getState() === 'SUCCESS') {
                var returnValue = JSON.parse(res.getReturnValue());
                if (returnValue.isSuccess) {
                    returnValue.results.data.forEach(function(record) {
                        returnedRecords.push({
                            label: record.label,
                            value: record.value,
                            objectName:record.objectName
                        });
                    });
                    component.set('v.records',  returnedRecords);
                    component.set("v.page", returnValue.results.page);
                    component.set("v.total", returnValue.results.total);
                    component.set("v.pages", Math.ceil(returnValue.results.total/pageSize));
                    searchResultsAvailableEvent.fire();
                }
            } else {
                //helper.setRecords(component, event, helper, []);
                //ToDO: Else Logic
            }
        });

   		$A.enqueueAction(action);
    },

    getParams: function(component) {
        var object = component.get('v.object');
        var searchTerm = component.get('v.searchTerm');
        var pageNumber = component.get("v.requestedPage") || 1;
        var pageSize = component.get("v.pageSize");

        return {
            object: object,
            searchTerm: searchTerm,
            pageNumber:pageNumber,
            pageSize: pageSize
        };
    },

})