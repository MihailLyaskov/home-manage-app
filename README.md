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
