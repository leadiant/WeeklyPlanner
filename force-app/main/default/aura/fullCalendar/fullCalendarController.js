({
    doInit: function (cmp, evt, hlp) {
        cmp.set("v.modal", cmp.find("newEventModal"));
    },

    searchResultsHandler:function (component, event, helper) {
        console.log("searchResultsHandler Fired");
        var isScriptLoaded = component.get("v.isScriptLoaded")

        if (event.getParam("componentGlobalId") !== undefined) {
            console.log(event.getParam("componentGlobalId"));
        }
        var uniqueId = event.getParam("componentGlobalId");

        component.makeSearchResultsDraggable = $A.getCallback(function(){
            $(document).ready(function(){
                var parent = $(document.getElementById(uniqueId));
                var events = $('.event');
                var results = $(document.getElementById(uniqueId)).find(events);
                results.each(function() {

                    $(this).data('event', {
//                        title: $.trim($(this).text()), // use the element's text as the event title
                        title: $(this).data('title'),
						stick: true, // maintain when user navigates (see docs on the renderEvent method)
                        contactId: $(this).data('sfid'),
                        relatedTo: $(this).data('objectname')
                    });
                    
                    // make the event draggable using jQuery UI
                        $(this).draggable({
                            zIndex: 999,
                            revert: true,      // will cause the event to go back to its
                            revertDuration: 0  //  original position after the drag
                        });
                });
            });
        });
        
        if (isScriptLoaded)
            component.makeSearchResultsDraggable();

    },

    handleClickSave: function (component, event, helper) {
        var action = component.get("c.upsertEvent");
        var scheduledEvent = component.get("v.scheduledEvent");

        if (scheduledEvent.relatedTo == 'Contact')
            scheduledEvent.accountId = null;

        if (scheduledEvent.relatedTo == 'Account')
            scheduledEvent.contactId = null;

        component.set("v.scheduledEvent", scheduledEvent);

        action.setParam("jsonString", JSON.stringify(component.get("v.scheduledEvent")));
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var returnValue = JSON.parse(response.getReturnValue());
                if (returnValue.isSuccess) {
                    component.set('v.ScheduledEvents', returnValue.results.data);
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

    handleClickDeleteModal: function (component, event, helper) {
        var action = component.get("c.deleteEvent");
        action.setParam("jsonString", JSON.stringify(component.get("v.scheduledEvent")));
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                var returnValue = JSON.parse(response.getReturnValue());
                if (returnValue.isSuccess) {
                    component.set('v.ScheduledEvents', returnValue.results.data);
                    $('#calendar').fullCalendar('removeEvents');
                    $('#calendar').fullCalendar('addEventSource', returnValue.results.data);
                    component.get("v.modal").hide();
                }
            }
            else if (component.isValid() && state === "ERROR") {
                component.find('toaster').show('Failed!', 'failure', 'There was a problem Deleting your Event. Please contact HelpDesk.');
            }
            component.find("spinner").hide();
        });
        component.find("spinner").show();
        $A.enqueueAction(action);
    },

    handledayClickEvent: function (cmp, evt, hlp) {
        cmp.set("v.showDeleteButton", false);
        var date = evt.getParam("data");
        hlp.newEventInstance(cmp, date);
        var newModalBody = [
            ["c:addEvent", {
                scheduledEvent: cmp.getReference("v.scheduledEvent")
            }]
        ];
        hlp.setModalBody(cmp, newModalBody);
    },

    handleEventClick: function (cmp, evt, hlp) {
        var clickedEvent = evt.getParam("data");
        cmp.set("v.showDeleteButton", true);
        var ScheduledEvents = cmp.get("v.ScheduledEvents");
        ScheduledEvents.forEach(function (ScheduledEvent) {
            if (ScheduledEvent.Id === clickedEvent.Id) {
                cmp.set("v.scheduledEvent", ScheduledEvent);
                var newModalBody = [
                    ["c:addEvent", {
                        scheduledEvent: cmp.getReference("v.scheduledEvent"),
                    }]
                ];
                hlp.setModalBody(cmp, newModalBody);
            }
        });
    },
    handleEventDrop: function (cmp, evt, hlp) {
        var droppedEvent = evt.getParam("data");
        console.log("handleEventDrop");
        var ScheduledEvents = cmp.get("v.ScheduledEvents");
        ScheduledEvents.forEach(function (ScheduledEvent) {
            if (ScheduledEvent.Id === droppedEvent.event.Id) {
                ScheduledEvent.start = moment(droppedEvent.event.start._i).format();
                ScheduledEvent.end = moment(droppedEvent.event.end._i).format();
                cmp.set("v.scheduledEvent", ScheduledEvent);
                hlp.saveEvent(cmp, evt, hlp);
            }
        });
    },
    handleEventResize: function (cmp, evt, hlp) {
        var resizedEvent = evt.getParam("data");
        console.log("handleEventResize");
        var ScheduledEvents = cmp.get("v.ScheduledEvents");
        ScheduledEvents.forEach(function (ScheduledEvent) {
            if (ScheduledEvent.Id === resizedEvent.event.Id) {
                ScheduledEvent.start = moment(resizedEvent.event.start._i).format();
                ScheduledEvent.end = moment(resizedEvent.event.end._i).format();
                cmp.set("v.scheduledEvent", ScheduledEvent);
                hlp.saveEvent(cmp, evt, hlp);
            }
        });
    },

    handleDrop: function (cmp, evt, hlp) {
        console.log('handleDrop');
        var droppedEvent = evt.getParam("data");
        hlp.newEventInstance(cmp, droppedEvent.date);
		/*var scheduledEvent = cmp.get("v.scheduledEvent");
		scheduledEvent.contactId = 
		var newModalBody = [
			["c:addEvent", {
				scheduledEvent: cmp.getReference("v.scheduledEvent")
			}]
		];
		hlp.setModalBody(cmp, newModalBody);
*/
    },

    handleEventReceive: function (cmp, evt, hlp) {
        console.log('handleEventReceive');
        var droppedEvent = evt.getParam("data");
        cmp.set("v.showDeleteButton", false);
        var scheduledEvent = cmp.get("v.scheduledEvent");
        scheduledEvent.title = droppedEvent.title;
        console.log(droppedEvent.relatedTo);
        scheduledEvent.relatedTo = droppedEvent.relatedTo;

        if (scheduledEvent.relatedTo === 'Account'){
            scheduledEvent.accountId = droppedEvent.contactId;
        }
        
        if (scheduledEvent.relatedTo === 'Contact'){
            scheduledEvent.contactId = droppedEvent.contactId;
        }
        

        console.log(scheduledEvent);
        var newModalBody = [
            ["c:addEvent", {
                scheduledEvent: cmp.getReference("v.scheduledEvent")
            }]
        ];
        hlp.setModalBody(cmp, newModalBody);
    },
    jsLoaded: function (cmp, evt, hlp) {
        cmp.set("v.isScriptLoaded",true);
        // Fetch events and load in calendar
        cmp.makeSearchResultsDraggable();
        hlp.getScheduledEvents(cmp);
        $(document).ready(function () {
            $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                defaultView: 'month',
                defaultDate: moment().format("YYYY-MM-DD"),
                timezone: 'local',
                navLinks: true, // can click day/week names to navigate views
                editable: true,
                droppable: true, // allows things to be dropped onto the calendar
                selectable: true,
                selectHelper: true,
                eventLimit: true, // allow "more" link when too many events
                events: [],
                // Callbacks
                dayClick:
                    function (date, jsEvent, ui, resourceObj) {
                        $A.getCallback(
                            function () {
                                var messageEvent = cmp.getEvent("dayClickEvent");
                                messageEvent.setParam("data", date);
                                messageEvent.fire()
                            }
                        )();
                    },

                drop: function (date, jsEvent, ui, resourceId) {
                    console.log('drop - an event has been dropped!');
                    $A.getCallback(
                        function () {
                            var messageEvent = cmp.getEvent("drop");
                            messageEvent.setParams({
                                "data": {
                                    "jsEvent": jsEvent,
                                    "date": date
                                }
                            });
                            messageEvent.fire()
                        }
                    )();
                },
                eventClick: function (calEvent, jsEvent, view) {
                    $A.getCallback(
                        function () {
                            var messageEvent = cmp.getEvent("eventClick");
                            messageEvent.setParam("data", calEvent);
                            messageEvent.fire()
                        }
                    )();

                    // change the border color just for fun
                    $(this).css('border-color', 'red');
                },
                eventRender: function (event, element) {
                    if (event.contactName == null)
                        element.find('.fc-title').append("<br/>" + event.accountName);
                    else
                        element.find('.fc-title').append("<br/>" + event.contactName);
                },
                eventDrop: function (event, delta, revertFunc) {
                    $A.getCallback(
                        function () {
                            var messageEvent = cmp.getEvent("eventDrop");
                            messageEvent.setParams({
                                "data": {
                                    "event": event,
                                    "delta": delta
                                }
                            });
                            messageEvent.fire();
                        }
                    )();
                },
                eventResize: function (event, delta, revertFunc) {
                    $A.getCallback(
                        function () {
                            var messageEvent = cmp.getEvent("eventResize");
                            messageEvent.setParams({
                                "data": {
                                    "event": event,
                                    "delta": delta
                                }
                            });
                            messageEvent.fire();
                        }
                    )();
                },
                eventReceive: function (event) {
                    console.log('event received', event);
                    $A.getCallback(
                        function () {
                            var messageEvent = cmp.getEvent("eventReceive");
                            messageEvent.setParam("data", event);
                            messageEvent.fire()
                        }
                    )();
                }
            });

        });
    },
    handleClickCancelModal: function (component, event, helper) {
        var ScheduledEvents = component.get("v.ScheduledEvents");
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', ScheduledEvents);
        component.get("v.modal").hide();
    },
    handleClickX: function (component, event, helper) {
        var ScheduledEvents = component.get("v.ScheduledEvents");
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', ScheduledEvents);
    }
})