# Sharyfi

Sharyfi is a secure file-sharing app for files that are too big to be sent as email's attachment. Files are hosted on a given Google Cloud Storage Bucket.

You can upload files up to 2000MB / 2GB. For extra security, each link are signed and are expiring after a while. You can configure the expiry time in the UI (in days). After uploading a file, you can click on the link in the list and it will be directly copied to your clipboard for you to send.

- /api package is written in NodeJs.
- /ui package is written in React

## TODO

* [ ] Proper deployment for the API
* [ ] Better env variable handling in React
