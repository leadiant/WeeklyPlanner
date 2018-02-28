window._calendar = (function ($) {
    'use strict'; 
    var makeSearchResultsDraggable = function(componentGlobalId) {
        var parent = $(document.getElementById(componentGlobalId)); 
        var events = $('.event'); 
        var results = $(document.getElementById(componentGlobalId)).find(events); 

        results.each(function () {
            $(this).data('event',  {
//              title: $.trim($(this).text()), // use the element's text as the event title
                title: $(this).data('title'),
                stick: true, // maintain when user navigates (see docs on the renderEvent method)
                contactId: $(this).data('sfid'),
                assignTo: $(this).data('objectname')
            });
            // make the event draggable using jQuery UI
                $(this).draggable({
                    zIndex: 999,
                    revert: true,      // will cause the event to go back to its
                    revertDuration: 0  //  original position after the drag
                });
        });
    };

    var init = function(componentId)
    {
        $(componentId).fullCalendar({
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
            eventRender: function (event, element) {
                element.attr('href', 'javascript:void(0);');
                if (event.contactName == null)
                    element.find('.fc-title').append("<br/>" + event.accountName);
                else
                    element.find('.fc-title').append("<br/>" + event.contactName);
            },
        });
    };

    var loadEvents=function(componentId,events){
        console.log(events);
        $(componentId).fullCalendar('addEventSource',events);
    };
    
   
    // Public API
    return {
        makeSearchResultsDraggable: makeSearchResultsDraggable,
        init:init,
        loadEvents:loadEvents
    };
    
}(jQuery));