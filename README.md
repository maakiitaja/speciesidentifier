# insect-identifier

A web application (SPA) for identifying insects, managing personal collection and
browsing observations by place,time and/or insect. Registered users may upload new
insects and add new observations.
<br><br>
The application supports LocalStorage for saving user's personal collection, which may also be viewed in
offline mode. The local and remote collections are synchronized automatically when the user is signed in.
If the user makes changes to the collection when he/she is not logged in, these changes will be synchronized
after the user has signed in with respect to choices (push/pull) made by the the user.

## Installation

Install mongodb: https://docs.mongodb.com/manual/administration/install-community/<br/>

npm install<br/>
mv app/bower_components app/public/bower_components

## Quick start

npm start

http://localhost:3000/#/login

To reset a test database (doesn't create thumb picture by default): http://localhost:3000/populate_db

## Suggestions

In the insect detail page, try to change the language to Finnish.
You should see Finnish translation for the insect name.
As you change the language to English, you should see the description
from Wikipedia.<br/><br>
In the collection page, try to use the view offline option. Now you
should be able to view the collection page and insect detail page offline
as the data is loaded from localstorage. <br/><br>
Search for Aglais io. In the detail page you should see three thumb images.
