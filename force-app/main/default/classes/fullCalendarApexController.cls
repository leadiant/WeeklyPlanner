public class fullCalendarApexController {
    
    static String dtFormat = 'EEE, d MMM yyyy HH:mm:ss z'; 
    
    public class ScheduledEvent {
        
        @AuraEnabled
        public Id Id {get; set; }
        @AuraEnabled
        public String title {get; set; }
        @AuraEnabled
        public Boolean allDay {get; set; }
        @AuraEnabled
        public DateTime  startString {get; set; }
        @AuraEnabled
        public DateTime  endString {get; set; }
        @AuraEnabled
        public String contactId {get; set; }
        @AuraEnabled
        public String contactName {get; set; }
        @AuraEnabled
        public String accountId {get; set; }
        @AuraEnabled
        public String accountName {get; set; }
        @AuraEnabled
        public String assignTo {get; set; }
        @AuraEnabled
        public String description {get; set; }
        
        public ScheduledEvent(Event event) {
            Id = event.id; 
            title = event.Subject; 
            allDay = event.IsAllDayEvent; 
            startString = event.StartDateTime; 
            endString = event.EndDateTime; 
            description = event.Description; 
            contactId = event.WhoId; 
            contactName = event.who.Name; 
            accountId = event.WhatId; 
            accountName = event.account.Name; 
            assignTo = event.WhatId == null?'Contact':'Account'; 
        }
        
        public Event toSObject() {
            return new Event(
                Id = this.Id, 
                Subject = this.title, 
                IsAllDayEvent = this.allDay, 
                StartDateTime = this.startString, 
                EndDateTime = this.endString, 
                Description = this.description, 
                WhoId = this.contactId, 
                WhatId = this.accountId
            ); 
        }
    }
    
    @AuraEnabled
    public static string getEvents() {
        
        strike_responseData responseData = new strike_responseData(); 
        try {
            Map < Id, ScheduledEvent > scheduledEvents = new Map < Id, ScheduledEvent > (); 
            for (Event event:[SELECT Id, WhoId, WhatId, who.name, account.Name, Subject, Location, IsAllDayEvent, StartDateTime, EndDateTime, ActivityDateTime, ActivityDate, Description, AccountId, OwnerId, IsDeleted FROM Event
                              where IsDeleted = false]) {
                                  scheduledEvents.put(event.Id, new ScheduledEvent(event)); 
                              }
            responseData.results = new Map < String, Object >  {
                'data' => scheduledEvents.values()
                    }; 
        }
        catch (Exception e) {
            responseData.addError(e.getMessage()); 
        }
        string jsonResponse = responseData.getJsonString(); 
        jsonResponse = jsonResponse.replace('startString', 'start'); //To change back to full Calaendar.
        jsonResponse = jsonResponse.replace('endString', 'end'); 
        return jsonResponse; 
    }
    
    
    @AuraEnabled
    public static string upsertEvent(String jsonString) {
        system.debug(jsonString); 
        string jsonRequest = jsonString; 
        jsonRequest = jsonRequest.replace('start', 'startString'); 
        jsonRequest = jsonRequest.replace('end', 'endString'); 
        
        system.debug(jsonRequest); 
        ScheduledEvent se = (ScheduledEvent)JSON.deserialize(jsonRequest, ScheduledEvent.class); 
        system.debug(se.toSObject()); 
        upsert se.toSObject(); 
        
        return getEvents(); 
        
    }
    
    @AuraEnabled
    public static string deleteEvent(String jsonString) {
        
        string jsonRequest = jsonString; 
        jsonRequest = jsonRequest.replace('start', 'startString'); 
        jsonRequest = jsonRequest.replace('end', 'endString'); 
        
        system.debug(jsonRequest); 
        ScheduledEvent se = (ScheduledEvent)JSON.deserialize(jsonRequest, ScheduledEvent.class); 
        system.debug(se.toSObject()); 
        delete se.toSObject(); 
        
        return getEvents(); 
        
    }
       
    @AuraEnabled
    public static string getRecords(String jsonString) {
        
        strike_responseData responseData = new strike_responseData(); 
        List < Map < String, Object >> data = new List < Map < String, Object >> (); 
        Set < String > queryFields = new Set < String >  {'Id', 'Name'}; 
        List < String > filters = new List < String > (); 
        String query; 
        string recordTotalQuery; 
        
        try {
                Map < String, Object > jsonMap = (Map < String, Object > )JSON.deserializeUntyped(jsonString); 
                String objectName = String.escapeSingleQuotes((String)jsonMap.get('object')); 
                Integer pSize = (Integer)jsonMap.get('pageSize'); 
                Integer offset = ((Integer)jsonMap.get('pageNumber') - 1) * pSize; 
        
                if (fullCalendarApexController.fieldNotEmpty(jsonMap, 'searchTerm')) {
                        String searchTerm = String.escapeSingleQuotes((String)jsonMap.get('searchTerm')); 
                        filters.add(' Name LIKE \'%' + searchTerm + '%\''); 
                }

                query = 'SELECT ' + String.join(new List < String > (queryFields), ', '); 
                query += ' FROM ' + objectName; 
                if (filters.size() > 0) {
                    query += ' WHERE ' + String.join(filters, ' AND '); 
                }
                query += ' ORDER BY Name ';
                query += ' LIMIT ' + pSize + ' OFFSET ' + offset; 
        
        
                recordTotalQuery = 'SELECT count() '; 
                recordTotalQuery += ' FROM ' + objectName; 
                if (filters.size() > 0) {
                    recordTotalQuery += ' WHERE ' + String.join(filters, ' AND '); 
                }
        
                Integer total = Database.countQuery(recordTotalQuery); 

                system.debug(query);

                for (sObject obj:Database.query(query)) {
                data.add(new Map < String, Object >  {
                        'label' => obj.get('Name'), 
                        'value' => obj.get('Id'),
                        'object'=> objectName
                        }); 
                }
        
                responseData.results = new Map < String, Object >  {
                        'data' => data, 
                        'pageSize' => pSize, 
                        'page' => (Integer)jsonMap.get('pageNumber'), 
                        'total' => total
                        }; 

        }
        catch (Exception e) {
            responseData.addError(e.getMessage()); 
        }
        
        return responseData.getJsonString(); 
        
    }
    
    private static Boolean fieldNotEmpty(Map < String, Object > jsonMap, String field) {
        return jsonMap.containsKey(field) &&  ! String.isEmpty((String)jsonMap.get(field)); 
    }
}