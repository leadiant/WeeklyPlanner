({

	searchKeyChangeHandler : function(component, event) {
        var filterChangeEvent = $A.get("e.c:searchFilterChange");
        filterChangeEvent.setParams({
            "searchKey": event.getParam("value")
        });
        filterChangeEvent.fire();
	},

    categoryChangeHandler : function(component, event) {
        var filterChangeEvent = $A.get("e.c:searchFilterChange");
        filterChangeEvent.setParams({
            "category": event.getParam("value")
        });
        filterChangeEvent.fire();
	}

})