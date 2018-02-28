({
    validate  : function(component) {
        var isValid = true;
        var scheduledEvent = component.get("v.scheduledEvent");

        if(!scheduledEvent.title || scheduledJob.title.length === 0){
			component.find("title").addError("This field is required");
            isValid = false;
        }else{
            component.find("title").clearError();            
        }

        component.set("v.isValid", isValid);
    }
})
