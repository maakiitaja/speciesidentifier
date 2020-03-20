# insect-identifier
A web application for identifying insects and managing personal collection. 
Registered users may upload new insects.
Supports LocalStorage.
  
## Installation
Install mongodb: https://docs.mongodb.com/manual/administration/install-community/
Install graphicsmagick: http://www.graphicsmagick.org/README.html

npm install<br/>
mv app/bower_components app/public/bower_components
## Quick start

npm start

http://localhost:3000/#/login

To reset a test database (requires GraphicsMagick to work): http://localhost:3000/populate_db

## Suggestions

In the insect detail page, try to change the language to Finnish.
You should see Finnish translation for the insect name.
As you change the language to English, you should see the description 
from Wikipedia.<br/>
In the collection page, try to use the view offline option. Now you 
should be able to view the collection page and insect detail page offline
as the data is loaded from localstorage.  