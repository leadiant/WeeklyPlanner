({
    doInit: function(component, event, helper) {
        helper.loadRecords(component, event, helper);
    },

    onPreviousPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page - 1;
        component.set("v.requestedPage", page);
        
        helper.loadRecords(component, event, helper);

	},

	onNextPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page + 1;
        component.set("v.requestedPage", page);
        helper.loadRecords(component, event, helper);
	},

    filterChangeHandler: function(component, event, helper) {
        if (event.getParam("searchKey") !== undefined) {
            component.set('v.searchTerm',event.getParam("searchKey"));
        }
        if (event.getParam("category") !== undefined) {
            component.set('v.object',event.getParam("category"));
        }
        helper.loadRecords(component, event, helper);
    },

})