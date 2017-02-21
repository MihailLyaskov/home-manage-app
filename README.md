# home-manage-app
## COMMANDS API

### command: connector/subscribe

### descrtiption:
Subscribe prefered service (database or schedule) for notification identified by name "notification"
from Device with specific "deviceID". If these notifications are for database service the device MUST first
be registered in the database with database/registerDevice command. Notifications for the monitored Device shoul
also be enabled!

```json
parameters:
{ "deviceID": <String> , "notification": <String> , "service": <String> }

success response:
{ "command": "connector/subscribe", "status": "Ok", "result": "Subscribe Done!" }

error response:
{ "command": "connector/subscribe", "status": "ERROR", "result": "Can't subscribe for device!" }

example
{ "deviceID": "esp-Device", "notification": "uart/int", "service": "database"  }
```

### command: connector/unsubscribe

### descrtiption:
Unsubscribe prefered service (database or schedule) for notification from Device with specific "deviceID".

```json
parameters:
{ "deviceID": <String> , "service": <String> }

success response:
{ "command": "connector/unsubscribe", "status": "Ok", "result": "Unsubscribe Done!" }

error response:
{ "command": "connector/unsubscribe", "status": "ERROR", "result": "Can't unsubscribe for device!" }

example
{ "deviceID": "esp-Device", "service": "database"  }
```

### command: connector/showSubs

### descrtiption:
Show all subscribed devices for all services. Doesn't take any parameters.
The response is an array with subscription elements.

```json
parameters:
{ }

success response:
{ "command": "connector/showSubs", "status": "OK", 
  "result": [ { "Device": <String>,
                "notification": <String>,
                "subID": <String>,
                "subService": <String>}]  }

error response:
{ "command": "connector/showSubs", "status": "ERROR", "result": "Error!" }

example
{ }
```
