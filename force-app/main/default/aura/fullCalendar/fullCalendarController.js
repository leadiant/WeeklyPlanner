({
    doInit: function (component, event, helper) {
        component.set("v.modal", component.find("newEventModal"));
    },

    searchResultsAvailablesHandler:function (component, event, helper) {
        console.log("searchResultsAvailablesHandler");
       // var isScriptLoaded = component.get("v.isScriptLoaded")

        if (event.getParam("componentGlobalId") !== undefined) {
            var uniqueId = event.getParam("componentGlobalId");
            console.log(uniqueId);
            component.set("v.searchResultsComponentId",uniqueId);
            component.set("v.isSearchResultsAvailable",true);
            helper.makeResultsDraggable(component);
        }
        component.makeSearchResultsDraggable = $A.getCallback(function(){
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
        });
        
    /*    if (isScriptLoaded)
            component.makeSearchResultsDraggable();
*/
    },

    handleClickSave: function (component, event, helper) {
        component.get("v.addEventComponent").validate();
        if (component.get("v.addEventComponent").get("v.isValid")) {

            var action = component.get("c.upsertEvent");
            var scheduledEvent = component.get("v.scheduledEvent");

            if (scheduledEvent.assignTo == 'Contact')
                scheduledEvent.accountId = null;

            if (scheduledEvent.assignTo == 'Account')
                scheduledEvent.contactId = null;

            component.set("v.scheduledEvent", scheduledEvent);

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
        }
        
        
    },

    handleClickDeleteModal: function (component, event, helper) {
        var action = component.get("c.deleteEvent");
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
                component.find('toaster').show('Failed!', 'failure', 'There was a problem Deleting your Event. Please contact HelpDesk.');
            }
            component.find("spinner").hide();
        });
        component.find("spinner").show();
        $A.enqueueAction(action);
    },

    handledayClickEvent: function (component, event, helper) {
        component.set("v.showDeleteButton", false);
        var date = event.getParam("data");
        helper.newEventInstance(component, date);
        var newModalBody = [
            ["c:addEvent", {
                scheduledEvent: component.getReference("v.scheduledEvent")
            }]
        ];
        helper.setModalBody(component, newModalBody);
    },

    handleEventClick: function (component, event, helper) {
        var clickedEvent = event.getParam("data");
        component.set("v.showDeleteButton", true);
        var scheduledEvents = component.get("v.scheduledEvents");
        scheduledEvents.forEach(function (ScheduledEvent) {
            if (ScheduledEvent.Id === clickedEvent.Id) {
                component.set("v.scheduledEvent", ScheduledEvent);
                var newModalBody = [
                    ["c:addEvent", {
                        scheduledEvent: component.getReference("v.scheduledEvent"),
                    }]
                ];
                helper.setModalBody(component, newModalBody);
            }
        });
    },
    handleEventDrop: function (component, event, helper) {
        var droppedEvent = event.getParam("data");
        console.log(droppedEvent);
        console.log("handleEventDrop");
        var scheduledEvents = component.get("v.scheduledEvents");
        scheduledEvents.forEach(function (ScheduledEvent) {
            if (ScheduledEvent.Id === droppedEvent.event.Id) {
                ScheduledEvent.start = moment(droppedEvent.event.start._i).format();
                ScheduledEvent.end = moment(droppedEvent.event.end._i).format();
                component.set("v.scheduledEvent", ScheduledEvent);
                helper.saveEvent(component, event, helper);
            }
        });
    },
    handleEventResize: function (component, event, helper) {
        var resizedEvent = event.getParam("data");
        console.log("handleEventResize");
        var scheduledEvents = component.get("v.scheduledEvents");
        scheduledEvents.forEach(function (ScheduledEvent) {
            if (ScheduledEvent.Id === resizedEvent.event.Id) {
                ScheduledEvent.start = moment(resizedEvent.event.start._i).format();
                ScheduledEvent.end = moment(resizedEvent.event.end._i).format();
                component.set("v.scheduledEvent", ScheduledEvent);
                helper.saveEvent(component, event, helper);
            }
        });
    },

    handleDrop: function (component, event, helper) {
        console.log('handleDrop');
        var droppedEvent = event.getParam("data");
        helper.newEventInstance(component, droppedEvent.date);
    },

    handleEventReceive: function (component, event, helper) {
        console.log('handleEventReceive');
        var droppedEvent = event.getParam("data");
        component.set("v.showDeleteButton", false);
        var scheduledEvent = component.get("v.scheduledEvent");
        scheduledEvent.title = droppedEvent.title;
        console.log(droppedEvent.assignTo);
        scheduledEvent.assignTo = droppedEvent.assignTo;

        if (scheduledEvent.assignTo === 'Account'){
            scheduledEvent.accountId = droppedEvent.salesforceId;
        }
        
        if (scheduledEvent.assignTo === 'Contact'){
            scheduledEvent.contactId = droppedEvent.salesforceId;
        }
        

        console.log(scheduledEvent);
        var newModalBody = [
            ["c:addEvent", {
                scheduledEvent: component.getReference("v.scheduledEvent")
            }]
        ];
        helper.setModalBody(component, newModalBody);
    },
    makeResultsDraggable:function (component, event, helper) {
        
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
    jsLoaded: function (component, event, helper) {
        console.log("jsLoaded");
        component.set("v.isScriptLoaded",true);
       // component.makeSearchResultsDraggable();
        helper.getScheduledEvents(component);
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
                allDaySlot:false,
                events: [],
                // Callbacks
                dayClick:
                    function (date, jsEvent, ui, resourceObj) {
                        $A.getCallback(
                            function () {
                                var messageEvent = component.getEvent("dayClickEvent");
                                messageEvent.setParam("data", date);
                                messageEvent.fire()
                            }
                        )();
                    },

                drop: function (date, jsEvent, ui, resourceId) {
                    console.log('drop - an event has been dropped!');
                    $A.getCallback(
                        function () {
                            var messageEvent = component.getEvent("drop");
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
                            var messageEvent = component.getEvent("eventClick");
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
                            var messageEvent = component.getEvent("eventDrop");
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
                            var messageEvent = component.getEvent("eventResize");
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
                            var messageEvent = component.getEvent("eventReceive");
                            messageEvent.setParam("data", event);
                            messageEvent.fire()
                        }
                    )();
                }
            });

        });
    },
    handleClickCancelModal: function (component, event, helper) {
        var scheduledEvents = component.get("v.scheduledEvents");
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', scheduledEvents);
        component.get("v.modal").hide();
    },
    handleClickX: function (component, event, helper) {
        var scheduledEvents = component.get("v.scheduledEvents");
        $('#calendar').fullCalendar('removeEvents');
        $('#calendar').fullCalendar('addEventSource', scheduledEvents);
    }
})