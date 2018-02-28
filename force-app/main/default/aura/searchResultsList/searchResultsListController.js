({
    doInit: function(component, event, helper) {
        helper.loadRecords(component);
    },

    onPreviousPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page - 1;
        component.set("v.requestedPage", page);
        
        helper.loadRecords(component);

	},

	onNextPage: function(component, event, helper) {
		var page = component.get("v.page") || 1;
        page = page + 1;
        component.set("v.requestedPage", page);
        helper.loadRecords(component);
	},

    filterChangeHandler: function(component, event, helper) {
        if (event.getParam("searchKey") !== undefined) {
            component.set('v.searchTerm',event.getParam("searchKey"));
        }
        if (event.getParam("category") !== undefined) {
            component.set('v.object',event.getParam("category"));
            component.set("v.requestedPage", 1);
        }
        helper.loadRecords(component);
    },

})