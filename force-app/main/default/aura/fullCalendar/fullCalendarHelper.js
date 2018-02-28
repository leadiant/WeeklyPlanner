({
	newEventInstance: function (component,date) {
		var startDateTime;
		var endDateTime;
		var allDayEvent = false;

		var m = $.fullCalendar.moment(date);
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
		}

	/*	if (date._f == "YYYY-MM-DD"){
			startDateTime = moment(date.format()).add(12, 'hours').format();
			endDateTime = moment(date.format()).add(14, 'hours').format();
		} else {
			startDateTime = moment(date.format()).format();
			endDateTime = moment(date.format()).add(2, 'hours').format();
		}
*/
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

})