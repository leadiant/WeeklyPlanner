({
    validate  : function(component) {
        var isValid = true;
        var scheduledEvent = component.get("v.scheduledEvent");

        if(!scheduledEvent.title || scheduledEvent.title.length === 0){
			component.find("title").showHelpMessageIfInvalid();
            isValid = false;
        }else{
            component.find("title").set('v.validity', {
                valid: true
            });         
        }

        if (scheduledEvent.assignTo == 'Contact'){
            if(!scheduledEvent.contactId || scheduledEvent.contactId.length === 0){
                component.find("contactLookup").showError("Contact is required!");
                isValid = false;
            }else{
                component.find("contactLookup").hideError();
            }
        }        
        
        if (scheduledEvent.assignTo == 'Account'){
            if(!scheduledEvent.accountId || scheduledEvent.accountId.length === 0){
                component.find("accountLookup").showError("Account is required!");
                isValid = false;
            }else{
                component.find("accountLookup").hideError();
            }
        }

        component.set("v.isValid", isValid);
    }
})
