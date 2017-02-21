# home-manage-app
## COMMANDS API

### command: connector/subscribe

### Descrtiption:
Subscribe prefered service (database or schedule) for notification identified by name "notification"
from Device with specific "deviceID". If these notifications are for database service the device MUST first
be registered in the database with database/registerDevice command. Notifications for the monitored Device shoul
also be enabled!

```json
parameters:
{ "Device": <String> , "notification": <String> , "service": <String> }

success response:
{ "command": "connector/subscribe", "status": "Ok", "result": "Subscribe Done!" }

error response:
{ "command": "connector/subscribe", "status": "ERROR", "result": "Can't subscribe for device!" }

example
{ "Device": "esp-Device", "notification": "uart/int", "service": "database"  }
```

### command: connector/unsubscribe

### Descrtiption:
Unsubscribe prefered service (database or schedule) for notification from Device with specific "deviceID".

```json
parameters:
{ "Device": <String> , "service": <String> }

success response:
{ "command": "connector/unsubscribe", "status": "Ok", "result": "Unsubscribe Done!" }

error response:
{ "command": "connector/unsubscribe", "status": "ERROR", "result": "Can't unsubscribe for device!" }

example
{ "Device": "esp-Device", "service": "database"  }
```

### command: connector/showSubs

### Descrtiption:
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
### command: database/registerDevice

### Descrtiption:
Register device from DeviceHive network into database service.

```json
parameters:
{ "Device":<String>,"Class":<String>,"ClassVer":<String>,"Network":<String>}

success response:
{ "command": "database/registerDevice", "status": "OK", 
  "ressult": {"result": "Error msg or device already exists","status": "OK"}  }

error response:
{ "command": "database/registerDevice", "status": "ERROR", 
  "ressult": {"result": "Device succesfully registered!","status": "ERROR"}  }

example
{ "Device":"esp-Dev","Class":"esp_class","ClassVer":"1.0","Network":"playground"}

```

### command: database/showDevices

### Descrtiption:
Returns an array containing all the registered devices in database service.

```json
parameters:
{ }

success response:
{ "command": "database/showDevices", "status": "OK", 
  "ressult": {"result": [ {} , {} ]}  }

example
{ }

```
