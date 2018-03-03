({
    newEventInstance: function (component,date) {
        var startDateTime;
        var endDateTime;
        var allDayEvent = false;
        
        /*var m = $.fullCalendar.moment(date);
		console.log(date._f);
		console.log(m.hasTime());

		if (m.hasTime()){
			startDateTime = moment(date.format()).format();
			endDateTime = moment(date.format()).add(2, 'hours').format();
			allDayEvent = false;
		} else {
			alert(date.format('LT'));
			startDateTime = moment(date.format()).add(12, 'hours').format();
			endDateTime = moment(date.format()).add(24, 'hours').format();
			allDayEvent = true;
		}*/
        
        if (date._f == "YYYY-MM-DD"){
            startDateTime = moment(date.format()).add(12, 'hours').format();
            endDateTime = moment(date.format()).add(14, 'hours').format();
        } else {
            startDateTime = moment(date.format()).format();
            endDateTime = moment(date.format()).add(2, 'hours').format();
        }
        
        var scheduledEvent = {
            Id:null,
            contactId: null,
            accountId:null,
            title:null,
            start:startDateTime,
            end:endDateTime,
            allDay: allDayEvent,
            description:null,
            assignTo:'Contact'
        };
        component.set("v.scheduledEvent", scheduledEvent);
    },
    
    setModalBody: function (component, modalBodyComponents) {
        $A.createComponents(modalBodyComponents,
                            function (newComponents, status, statusMessagesList) {
                                component.set("v.addEventComponent", newComponents[0]);
                                component.get("v.modal").set("v.body", newComponents);
                                component.get("v.modal").show();
                            });
    },
    
    saveEvent:function (component, event, helper) {
        var action = component.get("c.upsertEvent");
        action.setParam("jsonString", JSON.stringify(component.get("v.scheduledEvent")));
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var returnValue = JSON.parse(response.getReturnValue());
                if (returnValue.isSuccess) {
                    component.set('v.scheduledEvents', returnValue.results.data);
                    $('#calendar').fullCalendar('removeEvents');
                    $('#calendar').fullCalendar('addEventSource', returnValue.results.data);
                    component.get("v.modal").hide();
                }
            }
            else if (component.isValid() && state === "ERROR") {
                component.find('toaster').show('Failed!', 'failure', 'There was a problem logging your Event. Please contact HelpDesk.');
            }
            component.find("spinner").hide();
        });
        component.find("spinner").show();
        $A.enqueueAction(action);
    },
    getScheduledEvents: function(component,recordIds) {
        var getScheduledEventsAction = component.get("c.getEvents");
        var returnedRecords = [];
        
        getScheduledEventsAction.setCallback(this, function(response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var returnValue = JSON.parse(response.getReturnValue());
                if (returnValue.isSuccess) {
                    component.set('v.scheduledEvents', returnValue.results.data);
                    $('#calendar').fullCalendar('addEventSource',returnValue.results.data);
                }
            }
        });
        $A.enqueueAction(getScheduledEventsAction);
    },
    
    makeSearchResultsDraggable: function(component, uniqueId) {
        $(document).ready(function(){
            var parent = $(document.getElementById(uniqueId));
            var events = $('.event');
            var results = $(document.getElementById(uniqueId)).find(events);
            results.each(function() {
                
                $(this).data('event', {
                    title: $(this).data('title'),
                    stick: true, // maintain when user navigates (see docs on the renderEvent method)
                    salesforceId: $(this).data('sfid'),
                    assignTo: $(this).data('object')
                });
                
                // make the event draggable using jQuery UI
                $(this).draggable({
                    zIndex: 999,
                    revert: true,      // will cause the event to go back to its
                    revertDuration: 0  //  original position after the drag
                });
            });
        });
    },
    
    makeResultsDraggable:function (component) {
        console.log("helper - makeResultsDraggable");
        var helper = this;
    	var isScriptLoaded = component.get('v.isScriptLoaded');
        var isSearchResultsAvailable = component.get('v.isSearchResultsAvailable');
        
        console.log("isScriptLoaded " + isScriptLoaded);
        console.log("isSearchResultsAvailable " + isSearchResultsAvailable);
        
        if (isScriptLoaded && isSearchResultsAvailable) {
            console.log("makeResultsDraggable");
            var uniqueId = component.get("v.searchResultsComponentId");
             helper.makeSearchResultsDraggable(component,uniqueId);
        }
    },
    
})