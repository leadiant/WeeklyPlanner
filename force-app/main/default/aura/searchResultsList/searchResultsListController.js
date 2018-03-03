({
    doInit: function(component, event, helper) {
        helper.getResults(component);
    },
    
    searchResultAvailablesHandler:function(component, event, helper) {
		console.log("component Event Fired");
        
        if (event.getParam("componentGlobalId") !== undefined) {
            var uniqueId = event.getParam("componentGlobalId");
        }
        
        var searchResultsAvailableEvent = $A.get("e.c:searchResultsAvailable");
        searchResultsAvailableEvent.setParams({
            "componentGlobalId": uniqueId
        });
        
        console.log("Firing an application Event");
        searchResultsAvailableEvent.fire();
    },

    onPreviousPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page - 1;
        component.set("v.requestedPage", page);
        
        helper.getResults(component);

	},

	onNextPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page + 1;
        component.set("v.requestedPage", page);
        helper.getResults(component);
	},

    filterChangeHandler: function(component, event, helper) {
        if (event.getParam("searchKey") !== undefined) {
            component.set('v.searchTerm',event.getParam("searchKey"));
        }
        if (event.getParam("category") !== undefined) {
            component.set('v.object',event.getParam("category"));
            component.set("v.requestedPage", 1);
        }
        helper.getResults(component);
    },

    createNewRecord : function(component, event, helper) {
		// Get sObjectType
		var button = event.getSource();
		var sObjectType = button.get('v.name');

		// Launch standard create page in one/one.app container
		var createRecordEvent = $A.get('e.force:createRecord');
		createRecordEvent.setParams({
			"entityApiName": sObjectType
		});
		createRecordEvent.fire();
	},
    
    
})